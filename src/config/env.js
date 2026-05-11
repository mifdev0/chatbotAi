require('dotenv').config();

const config = {
  // Server
  port: process.env.PORT || 3000,

  // AI API (DeepSeek)
  ai: {
    apiKey: process.env.AI_API_KEY,
    baseUrl: process.env.AI_BASE_URL || 'https://api.deepseek.com',
    model: process.env.AI_MODEL || 'deepseek-v4-pro',
    temperature: 0.2,
    maxTokens: 400,
  },

  // Fonnte
  fonnte: {
    token: process.env.FONNTE_TOKEN,
    baseUrl: 'https://api.fonnte.com',
  },

  // Admin Auth
  admin: {
    user: process.env.ADMIN_USER || 'admin',
    pass: process.env.ADMIN_PASS || 'admin123',
    sessionSecret: process.env.SESSION_SECRET || 'super-secret-key-ai-bot',
  },

  // Database
  database: {
    conversations: './data/conversations.db',
    knowledge: './data/knowledge.db',
  },
};

// Validasi required env vars
function validateConfig() {
  const required = [
    'ai.apiKey',
    'fonnte.token',
  ];

  const missing = [];
  required.forEach(key => {
    const keys = key.split('.');
    let value = config;
    for (const k of keys) {
      value = value[k];
    }
    if (!value) missing.push(key);
  });

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }
}

validateConfig();

module.exports = config;
