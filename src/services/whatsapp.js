const axios = require('axios');
const config = require('../config/env');

async function sendMessage(phone, message) {
  const { token, baseUrl } = config.fonnte;

  // Fonnte pakai nomor tanpa @c.us
  const target = phone.replace('@c.us', '').replace('@lid', '');

  const payload = {
    target,
    message,
    countryCode: '62',
  };

  console.log(`[Fonnte] Kirim ke ${target}...`);

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await axios.post(
        `${baseUrl}/send`,
        payload,
        {
          headers: {
            Authorization: token,
          },
          timeout: 10000,
        }
      );
      console.log(`[Fonnte] Berhasil: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      console.error(`[Fonnte] Attempt ${attempt} gagal:`, status, JSON.stringify(data), err.code);
      
      if (attempt === 3) throw err;
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}

module.exports = { sendMessage };
