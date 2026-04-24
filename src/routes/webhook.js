const express = require('express');
const router = express.Router();
const config = require('../config/env');
const db = require('../database/conversations');
const { askGroq } = require('../services/ai');
const { sendMessage } = require('../services/whatsapp');
const { retrieve } = require('../services/retriever');
const { buildMenuText, getMenuItem, isValidMenuChoice } = require('../utils/menu');
const { broadcast } = require('../utils/broadcast');

// Deduplikasi message IDs
const processedIds = new Set();

router.post('/webhook', async (req, res) => {
  res.sendStatus(200);

  try {
    const { event, data } = req.body;
    if (event !== 'message' && event !== 'message_create') return;

    const message = data?.message;
    if (!message || message.fromMe) return;

    // Deduplikasi
    const msgId = message.id?._serialized || message.id;
    if (msgId && processedIds.has(msgId)) return;
    if (msgId) {
      processedIds.add(msgId);
      setTimeout(() => processedIds.delete(msgId), 60000);
    }

    // Hanya proses teks
    if (message.type !== 'chat') return;
    const userText = message.body?.trim();
    if (!userText) return;

    // Ambil nomor & nama
    const rawFrom = message.from || '';
    const phone = rawFrom.replace('@c.us', '').replace('@lid', '');
    const chatId = config.waapi.trialChatId; // Trial WaAPI
    const name = message.notifyName || phone;

    console.log(`[IN] ${name} (${phone}): ${userText}`);

    // Simpan user & pesan ke DB
    db.upsertConversation(phone, name);
    db.addMessage(phone, 'user', userText);

    let convo = db.getConversation(phone);

    // Kalau status done & user chat lagi → reset ke awal
    if (convo.status === 'done') {
      db.updateStatus(phone, 'ai');
      db.resetMenuState(phone);
      broadcast('status_change', { phone, status: 'ai' });
      convo = db.getConversation(phone);
    }

    // Broadcast pesan user ke dashboard
    broadcast('message', { phone, from: 'user', text: userText, name, time: Date.now() });

    // Jika sudah eskalasi → staf yang handle
    if (convo.status === 'escalated') {
      broadcast('escalated_message', { phone, from: 'user', text: userText });
      return;
    }

    // Tentukan state percakapan
    const menuState = convo.menuState || 'idle';
    const selectedTopic = convo.selectedTopic || null;

    let replyText = '';

    // STATE: IDLE — belum pilih menu
    if (menuState === 'idle') {
      if (!isValidMenuChoice(userText)) {
        replyText = buildMenuText();
      } else {
        const num = parseInt(userText.trim(), 10);
        const chosen = getMenuItem(num);

        // Pilihan terakhir = eskalasi manual
        if (chosen.topik === null) {
          replyText =
            `Baik Sobat IT Helpdesk! Saya akan menghubungkan Anda dengan tim IT Helpdesk kami.\n` +
            `Mohon tunggu sebentar, staf kami akan segera merespons. 🙏`;
          db.addMessage(phone, 'ai', replyText);
          db.updateStatus(phone, 'escalated');
          broadcast('message', { phone, from: 'ai', text: replyText, time: Date.now() });
          broadcast('status_change', { phone, status: 'escalated' });
          console.log(`[ESKALASI MANUAL] ${name} (${phone})`);
          await sendMessage(chatId, replyText);
          return;
        }

        // Topik valid → retrieve & AI
        console.log(`[MENU] ${name} pilih: "${chosen.label}"`);
        db.setMenuState(phone, 'topic_selected', chosen.topik);

        const context = retrieve(chosen.topik);
        console.log(`[GROQ] Memanggil Groq untuk topik: ${chosen.topik}`);

        replyText = await askGroq(convo.messages, context);
      }
    }

    // STATE: TOPIC_SELECTED — dalam percakapan topik
    else if (menuState === 'topic_selected') {
      const userLower = userText.trim().toLowerCase();

      // User ganti topik
      if (isValidMenuChoice(userText)) {
        const num = parseInt(userText.trim(), 10);
        const chosen = getMenuItem(num);

        if (chosen.topik === null) {
          replyText =
            `Baik Sobat IT Helpdesk! Saya akan menghubungkan Anda dengan tim IT Helpdesk kami.\n` +
            `Mohon tunggu sebentar, staf kami akan segera merespons. 🙏`;
          db.addMessage(phone, 'ai', replyText);
          db.updateStatus(phone, 'escalated');
          broadcast('message', { phone, from: 'ai', text: replyText, time: Date.now() });
          broadcast('status_change', { phone, status: 'escalated' });
          console.log(`[ESKALASI MANUAL] ${name} (${phone})`);
          await sendMessage(chatId, replyText);
          return;
        }

        db.setMenuState(phone, 'topic_selected', chosen.topik);
        const context = retrieve(chosen.topik);
        convo = db.getConversation(phone);
        replyText = await askGroq(convo.messages, context);

      } else if (['menu', 'kembali', 'back', 'pilih lagi', 'ganti'].includes(userLower)) {
        // Kembali ke menu
        db.resetMenuState(phone);
        replyText = buildMenuText();

      } else {
        // Lanjut percakapan
        const context = retrieve(selectedTopic || userText);
        convo = db.getConversation(phone);
        replyText = await askGroq(convo.messages, context);
      }
    }

    if (!replyText) return;

    console.log(`[GROQ] Balasan: ${replyText.substring(0, 80)}...`);
    db.addMessage(phone, 'ai', replyText);
    broadcast('message', { phone, from: 'ai', text: replyText, time: Date.now() });

    // Cek eskalasi dari AI
    const isEscalated = replyText.includes('menghubungkan Sobat IT Helpdesk dengan tim kami');
    if (isEscalated) {
      db.updateStatus(phone, 'escalated');
      broadcast('status_change', { phone, status: 'escalated' });
      console.log(`[ESKALASI AI] ${name} (${phone})`);
    }

    // Cek selesai
    const isDone = replyText.includes('bit.ly/survey-ithelpdesk');
    if (isDone && !isEscalated) {
      db.updateStatus(phone, 'done');
      db.resetMenuState(phone);
      broadcast('status_change', { phone, status: 'done' });
      console.log(`[SELESAI] ${name} (${phone})`);
    }

    await sendMessage(chatId, replyText);
    console.log(`[OUT] AI → ${name}: ${replyText.substring(0, 60)}...`);

  } catch (err) {
    console.error('[Webhook Error]', err.message);
  }
});

module.exports = router;
