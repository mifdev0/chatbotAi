const express = require('express');
const router = express.Router();
const config = require('../config/env');
const db = require('../database/conversations');
const knowledgeDb = require('../database/knowledge');
const { invalidateCache } = require('../services/retriever');
const { sendMessage } = require('../services/whatsapp');
const { broadcast } = require('../utils/broadcast');

function buildAnalytics(conversations) {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const weekAgo = now - (7 * dayMs);
  const statusCounts = conversations.reduce((acc, convo) => {
    acc[convo.status] = (acc[convo.status] || 0) + 1;
    return acc;
  }, { ai: 0, escalated: 0, done: 0 });

  const allMessages = conversations.flatMap(convo =>
    (convo.messages || []).map(message => ({ ...message, phone: convo.phone, name: convo.name }))
  );
  const recentMessages = allMessages.filter(message => message.time >= weekAgo);
  const userMessages = allMessages.filter(message => message.from === 'user');
  const aiMessages = allMessages.filter(message => message.from === 'ai');
  const staffMessages = allMessages.filter(message => message.from === 'staff');
  const resolved = statusCounts.done || 0;
  const total = conversations.length;

  const daily = Array.from({ length: 7 }).map((_, index) => {
    const start = new Date(now - ((6 - index) * dayMs));
    start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime() + dayMs);
    return {
      label: start.toLocaleDateString('id-ID', { weekday: 'short' }),
      date: start.toISOString().slice(0, 10),
      conversations: conversations.filter(convo => convo.createdAt >= start.getTime() && convo.createdAt < end.getTime()).length,
      messages: allMessages.filter(message => message.time >= start.getTime() && message.time < end.getTime()).length,
    };
  });

  const topicCounts = conversations.reduce((acc, convo) => {
    const key = convo.selectedTopic || (convo.menuState === 'idle' ? 'Belum memilih topik' : 'Topik umum');
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const topTopics = Object.entries(topicCounts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalConversations: total,
    activeConversations: statusCounts.ai || 0,
    escalatedConversations: statusCounts.escalated || 0,
    doneConversations: resolved,
    resolutionRate: total ? Math.round((resolved / total) * 100) : 0,
    escalationRate: total ? Math.round(((statusCounts.escalated || 0) / total) * 100) : 0,
    totalMessages: allMessages.length,
    recentMessages: recentMessages.length,
    userMessages: userMessages.length,
    aiMessages: aiMessages.length,
    staffMessages: staffMessages.length,
    averageMessagesPerConversation: total ? Math.round((allMessages.length / total) * 10) / 10 : 0,
    daily,
    topTopics,
  };
}

// Get all conversations
router.get('/conversations', (req, res) => {
  res.json(db.getAllConversations());
});

// Dashboard analytics
router.get('/analytics', (req, res) => {
  res.json(buildAnalytics(db.getAllConversations()));
});

// Safe settings snapshot for dashboard
router.get('/settings', (req, res) => {
  res.json({
    server: {
      port: config.port,
      environment: process.env.NODE_ENV || 'development',
      webhookPath: '/webhook',
    },
    ai: {
      providerUrl: config.ai.baseUrl,
      model: config.ai.model,
      temperature: config.ai.temperature,
      maxTokens: config.ai.maxTokens,
      apiKeyConfigured: Boolean(config.ai.apiKey),
    },
    whatsapp: {
      providerUrl: config.fonnte.baseUrl,
      tokenConfigured: Boolean(config.fonnte.token),
    },
    admin: {
      username: config.admin.user,
      sessionHours: 24,
    },
  });
});

// Knowledge base management
router.get('/knowledge', (req, res) => {
  res.json(knowledgeDb.getAllKnowledge());
});

router.post('/knowledge', (req, res) => {
  const { topik, konten } = req.body;
  if (!topik || !konten) return res.status(400).json({ error: 'topik and konten required' });
  const result = knowledgeDb.addKnowledge(topik.trim(), konten.trim());
  invalidateCache();
  res.status(201).json({ ok: true, id: result.lastInsertRowid });
});

router.patch('/knowledge/:id', (req, res) => {
  const { topik, konten } = req.body;
  if (!topik || !konten) return res.status(400).json({ error: 'topik and konten required' });
  knowledgeDb.updateKnowledge(req.params.id, topik.trim(), konten.trim());
  invalidateCache();
  res.json({ ok: true });
});

router.delete('/knowledge/:id', (req, res) => {
  knowledgeDb.deleteKnowledge(req.params.id);
  invalidateCache();
  res.json({ ok: true });
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
  if (status === 'done') {
    db.deleteConversation(phone);
    broadcast('conversation_deleted', { phone });
    return res.json({ ok: true, deleted: true });
  }

  db.updateStatus(phone, status);
  broadcast('status_change', { phone, status });
  res.json({ ok: true });
});

module.exports = router;
