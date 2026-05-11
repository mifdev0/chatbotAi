const express = require('express');
const path = require('path');
const webhookRoutes = require('./routes/webhook');
const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(express.json());

// CORS untuk dashboard HTML
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Static files (dashboard)
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/', webhookRoutes);
app.use('/api', apiRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: '🤖 AI WhatsApp Bot running', 
    version: '2.1.0',
    port: process.env.PORT || 3000 
  });
});

module.exports = app;
