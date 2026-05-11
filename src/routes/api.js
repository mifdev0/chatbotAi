const express = require('express');
const router = express.Router();
const config = require('../config/env');
const db = require('../database/conversations');
const { sendMessage } = require('../services/whatsapp');
const { broadcast } = require('../utils/broadcast');

// Get all conversations
router.get('/conversations', (req, res) => {
  res.json(db.getAllConversations());
});

// Get single conversation
router.get('/conversations/:phone', (req, res) => {
  const convo = db.getConversation(req.params.phone);
  if (!convo) return res.status(404).json({ error: 'Not found' });
  res.json(convo);
});

// Staff reply to user
router.post('/conversations/:phone/reply', async (req, res) => {
  const { text } = req.body;
  const { phone } = req.params;
  if (!text) return res.status(400).json({ error: 'text required' });

  const convo = db.getConversation(phone);
  if (!convo) return res.status(404).json({ error: 'Not found' });

  db.addMessage(phone, 'staff', text);
  broadcast('message', { phone, from: 'staff', text, time: Date.now() });

  await sendMessage(phone, text);
  res.json({ ok: true });
});

// Update conversation status
router.patch('/conversations/:phone/status', (req, res) => {
  const { status } = req.body;
  const { phone } = req.params;
  if (!['ai', 'escalated', 'done'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  db.updateStatus(phone, status);
  broadcast('status_change', { phone, status });
  res.json({ ok: true });
});

module.exports = router;
