const express = require('express');
const router = express.Router();
const config = require('../config/env');

// POST /auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === config.admin.user && password === config.admin.pass) {
    req.session.isAdmin = true;
    return res.json({ ok: true });
  }

  res.status(401).json({ error: 'Invalid credentials' });
});

// GET /auth/logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login.html');
});

// Middleware untuk proteksi route
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  
  // Jika request API, kirim 401. Jika request halaman, redirect ke login.
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.redirect('/login.html');
};

module.exports = { authRouter: router, isAuthenticated };
