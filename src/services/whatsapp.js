const axios = require('axios');
const config = require('../config/env');

async function sendMessage(chatId, message) {
  const { instanceId, token, baseUrl } = config.waapi;

  // Pastikan format chatId benar
  const formattedChatId = chatId.includes('@') ? chatId : `${chatId}@c.us`;

  try {
    const response = await axios.post(
      `${baseUrl}/instances/${instanceId}/client/action/send-message`,
      {
        chatId: formattedChatId,
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (err) {
    console.error('[WaAPI] Gagal kirim pesan:', err.response?.status, JSON.stringify(err.response?.data));
    throw err;
  }
}

module.exports = { sendMessage };
