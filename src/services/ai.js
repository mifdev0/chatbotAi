const axios = require('axios');
const config = require('../config/env');
const { retrieve } = require('./retriever');

// ─── System Prompt yang Sangat Ketat ──────────────────────────────────────────
// AI HANYA boleh menjawab berdasarkan KONTEKS yang diberikan.
// Jika tidak ada konteks → wajib eskalasi, TIDAK BOLEH mengarang.
const BASE_PROMPT = `Kamu adalah asisten AI IT Helpdesk UMS.
Sapaan user: "Sobat IT Helpdesk".
Jawab HANYA dalam Bahasa Indonesia. Jawaban singkat dan to the point.

{CONTEXT}

=== ATURAN MUTLAK (WAJIB DIIKUTI) ===
1. Kamu HANYA BOLEH menjawab berdasarkan KONTEKS KNOWLEDGE BASE yang diberikan di atas.
2. Jika KONTEKS tidak menyediakan informasi yang relevan → JANGAN mengarang, langsung eskalasi.
3. JANGAN tambahkan informasi dari luar konteks yang diberikan.
4. JANGAN meminta password.
5. JANGAN tanya banyak hal sekaligus — maksimal 1 pertanyaan klarifikasi.
6. Selalu akhiri jawaban dengan: "Apakah masalah Sobat IT Helpdesk sudah terselesaikan?"

=== FORMAT JAWABAN ===
- Gunakan langkah bernomor jika berupa panduan
- Maksimal 4 langkah per jawaban
- Jika berupa informasi lokasi/link, tampilkan langsung

=== ALUR PENYELESAIAN ===
- Jika user jawab "sudah" / "selesai" → ucapkan terima kasih + kirim link survei: https://bit.ly/survey-ithelpdesk
- Jika user jawab "belum" → coba bantu sekali lagi, jika tetap tidak bisa → eskalasi

=== FORMAT ESKALASI (gunakan PERSIS ini jika tidak ada solusi) ===
"Sobat IT Helpdesk, saat ini saya belum memiliki informasi yang cukup untuk permasalahan tersebut. Agar dapat ditangani lebih tepat, saya akan menghubungkan Sobat IT Helpdesk dengan tim kami."`;

async function askGroq(messages, topicContext) {
  // Gunakan context dari topik yang dipilih user (dari menu)
  // Jika tidak ada (lanjutan percakapan), retrieve otomatis
  let context = topicContext || null;

  if (!context) {
    const lastUserMsg = [...messages]
      .reverse()
      .find(m => m.from === 'user');

    if (lastUserMsg) {
      context = retrieve(lastUserMsg.text);
    }
  }

  // Jika sama sekali tidak ada context → paksa eskalasi lewat prompt
  const contextBlock = context
    ? `=== KONTEKS KNOWLEDGE BASE ===\n${context}\n=== AKHIR KONTEKS ===\n\nJAWAB HANYA BERDASARKAN KONTEKS DI ATAS.`
    : `=== TIDAK ADA KONTEKS RELEVAN ===\nKamu TIDAK memiliki informasi tentang topik ini. Lakukan ESKALASI sekarang.`;

  const systemPrompt = BASE_PROMPT.replace('{CONTEXT}', contextBlock);

  // Kirim 6 pesan terakhir saja
  const recentMessages = messages
    .filter(m => m.from === 'user' || m.from === 'ai')
    .slice(-6);

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: config.groq.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...recentMessages.map(m => ({
          role: m.from === 'user' ? 'user' : 'assistant',
          content: m.text
        }))
      ],
      temperature: config.groq.temperature,
      max_tokens: config.groq.maxTokens
    },
    {
      headers: {
        Authorization: `Bearer ${config.groq.apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.choices[0].message.content;
}

module.exports = { askGroq };
