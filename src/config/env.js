require('dotenv').config();

const config = {
  // Server
  port: process.env.PORT || 3000,

  // Groq API
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama-3.1-8b-instant',
    temperature: 0.2,
    maxTokens: 400,
  },

  // WaAPI
  waapi: {
    token: process.env.WAAPI_TOKEN,
    instanceId: process.env.WAAPI_INSTANCE_ID,
    baseUrl: 'https://waapi.app/api/v1',
    // Trial WaAPI: hanya bisa balas ke nomor terdaftar
    trialChatId: '6281354496995@c.us',
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
    'groq.apiKey',
    'waapi.token',
    'waapi.instanceId',
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
