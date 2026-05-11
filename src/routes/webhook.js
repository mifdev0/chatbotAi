const express = require('express');
const router = express.Router();
const config = require('../config/env');
const db = require('../database/conversations');
const { askAI } = require('../services/ai');
const { sendMessage } = require('../services/whatsapp');
const { retrieve } = require('../services/retriever');
const { buildMenuText, getMenuItem, isValidMenuChoice } = require('../utils/menu');
const { broadcast } = require('../utils/broadcast');

// Deduplikasi message IDs
const processedIds = new Set();

router.post('/webhook', async (req, res) => {
  res.sendStatus(200);

  try {
    // Format Fonnte webhook
    const { device, message, pushname } = req.body;
    if (!message || device === 'sender') return; // Skip pesan dari bot sendiri

    // Deduplikasi
    const msgId = req.body.id;
    if (msgId && processedIds.has(msgId)) return;
    if (msgId) {
      processedIds.add(msgId);
      setTimeout(() => processedIds.delete(msgId), 60000);
    }

    const userText = message.trim();
    if (!userText) return;

    // Ambil nomor & nama
    const phone = req.body.sender || '';
    const name = pushname || phone;

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
    const userLower = userText.trim().toLowerCase();

    let replyText = '';

    // LOGIC: Jika user input angka (Pilih Menu)
    if (isValidMenuChoice(userText)) {
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
        await sendMessage(phone, replyText);
        return;
      }

      // Topik valid → Set state & Jawab via AI
      console.log(`[MENU] ${name} pilih: "${chosen.label}"`);
      db.setMenuState(phone, 'topic_selected', chosen.topik);

      const context = retrieve(chosen.topik);
      convo = db.getConversation(phone);
      replyText = await askAI(convo.messages, context);
    } 
    // Jika user minta menu secara eksplisit
    else if (['menu', 'bantuan', 'pilihan', 'help'].includes(userLower)) {
      db.resetMenuState(phone);
      replyText = buildMenuText();
    }
    // Percakapan Natural (Bukan angka, bukan kata kunci menu)
    else {
      // Selalu coba cari context relevan
      const context = retrieve(selectedTopic || userText);
      
      // Jika baru pertama kali (IDLE) DAN tidak ada info relevan di DB -> Kasih Menu
      if (menuState === 'idle' && convo.messages.length <= 1 && !context) {
        console.log(`[MENU] Kirim menu karena pesan pertama dari ${name} dan tidak ada context relevan`);
        replyText = buildMenuText();
      } else {
        // Lanjut percakapan dengan AI (pakai context jika ada)
        console.log(`[AI] Memproses pesan natural dari ${name} (Context: ${context ? 'Found' : 'None'})`);
        replyText = await askAI(convo.messages, context);
      }
    }


    if (!replyText) return;

    console.log(`[AI] Balasan: ${replyText.substring(0, 80)}...`);
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

    await sendMessage(phone, replyText);
    console.log(`[OUT] AI → ${name}: ${replyText.substring(0, 60)}...`);

  } catch (err) {
    console.error('[Webhook Error]', err.message);
  }
});

module.exports = router;
