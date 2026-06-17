const express = require('express');
const path = require('path');
const session = require('express-session');
const config = require('./config/env');
const webhookRoutes = require('./routes/webhook');
const apiRoutes = require('./routes/api');
const { authRouter, isAuthenticated } = require('./routes/auth');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session management
app.use(session({
  secret: config.admin.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 jam
  }
}));

// CORS untuk dashboard HTML
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Public routes (Auth & Login Page)
app.use('/auth', authRouter);
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Protected static files (dashboard.html)
app.get('/dashboard.html', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// Static files (accessible for images/css if needed)
app.use(express.static(path.join(__dirname, '../public')));

// Protected Routes
app.use('/api', isAuthenticated, apiRoutes);

// Public Webhook (untuk WhatsApp)
app.use('/', webhookRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: '🤖 AI WhatsApp Bot running', 
    version: '2.2.0',
    port: process.env.PORT || 3000 
  });
});
module.exports = app;
