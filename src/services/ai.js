const axios = require('axios');
const config = require('../config/env');
const { retrieve } = require('./retriever');

// ─── System Prompt yang Sangat Ketat ──────────────────────────────────────────
// AI HANYA boleh menjawab berdasarkan KONTEKS yang diberikan.
// Jika tidak ada konteks → wajib eskalasi, TIDAK BOLEH mengarang.
const BASE_PROMPT = `Kamu adalah Asisten AI IT Helpdesk UMS yang cerdas dan ramah.
Sapaan user: "Halo Sobat".
Jawab HANYA dalam Bahasa Indonesia. Jawaban singkat dan to the point.

{CONTEXT}

=== ATURAN MUTLAK (WAJIB DIIKUTI) ===
1. Kamu HANYA BOLEH menjawab berdasarkan KONTEKS KNOWLEDGE BASE yang diberikan di atas.
2. Kamu HANYA menangani layanan dan kendala IT Helpdesk UMS.
3. Jika user bertanya layanan luar UMS (contoh: MBG pemerintah, situs pemerintah, bank, e-commerce, media sosial, layanan pribadi) → JANGAN memberi langkah teknis umum dan JANGAN mengarang.
4. Jika KONTEKS tidak menyediakan informasi yang relevan → JANGAN mengarang, langsung tanyakan apakah user ingin dihubungkan dengan admin.
5. JANGAN tambahkan informasi dari luar konteks yang diberikan.
6. JANGAN meminta password.
7. JANGAN tanya banyak hal sekaligus — maksimal 1 pertanyaan klarifikasi.
8. Jika jawaban berisi solusi, selalu akhiri dengan: "Apakah masalah Sobat sudah terselesaikan?"

=== FORMAT JAWABAN ===
- Gunakan langkah bernomor jika berupa panduan
- Maksimal 4 langkah per jawaban
- Jika berupa informasi lokasi/link, tampilkan langsung

=== ALUR PENYELESAIAN ===
- Jika user jawab "sudah" / "selesai" / "terselesaikan" → ucapkan terima kasih + WAJIB kirim link survei: https://bit.ly/survey-layanan-ai
- Jika user jawab "belum" → coba bantu sekali lagi, jika tetap tidak bisa → eskalasi
- Link survey HARUS ditulis PERSIS: https://bit.ly/survey-layanan-ai (jangan diubah formatnya)

=== FORMAT DI LUAR KONTEKS / BUTUH ADMIN (gunakan PERSIS ini jika tidak ada solusi) ===
"Halo Sobat, saya belum memiliki konteks terkait kendala tersebut di knowledge base IT Helpdesk UMS. Saya hanya bisa membantu berdasarkan informasi IT Helpdesk UMS yang tersedia.

Apakah Sobat ingin saya hubungkan dengan admin?"`;

async function askAI(messages, topicContext) {
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
    `${config.ai.baseUrl}/v1/chat/completions`,
    {
      model: config.ai.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...recentMessages.map(m => ({
          role: m.from === 'user' ? 'user' : 'assistant',
          content: m.text
        }))
      ],
      temperature: config.ai.temperature,
      max_tokens: config.ai.maxTokens
    },
    {
      headers: {
        Authorization: `Bearer ${config.ai.apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.choices[0].message.content;
}

module.exports = { askAI };
