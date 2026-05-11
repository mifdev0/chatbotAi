# 🤖 AI WhatsApp Bot

Bot WhatsApp otomatis berbasis AI menggunakan **Fonnte** + **DeepSeek AI** + **Dashboard Real-time**.

## 📋 Deskripsi Project

Sistem chatbot WhatsApp yang membantu pengguna menyelesaikan masalah secara otomatis. Bot ini dilengkapi dengan:
- ✅ AI-powered responses menggunakan DeepSeek (DeepSeek-v4-pro)
- ✅ Knowledge base dengan TF-IDF retrieval
- ✅ Menu interaktif untuk navigasi topik
- ✅ Dashboard web real-time untuk monitoring
- ✅ Auto-escalation ke admin jika diperlukan
- ✅ State management untuk context percakapan

---

## 🛠️ Tech Stack

- **Backend**: Node.js + Express.js
- **AI**: DeepSeek API (DeepSeek-v4-pro)
- **NLP**: Natural.js (TF-IDF)
- **Database**: SQLite (knowledge base + conversations)
- **Real-time**: WebSocket (ws)
- **WhatsApp API**: Fonnte
- **HTTP Client**: Axios

---

## 📁 Struktur File & Fungsinya

```
whatsapp-ai-bot/
│
├── index.js              # 🚀 Server utama + webhook handler + REST API + WebSocket
├── ai.js                 # 🧠 Integrasi DeepSeek AI + system prompt
├── whatsapp.js           # 📱 Integrasi Fonnte untuk kirim pesan WhatsApp
├── retriever.js          # 🔍 TF-IDF retrieval untuk knowledge base
├── db.js                 # 💾 Database handler untuk percakapan (SQLite)
├── knowledge-db.js       # 📚 Database handler untuk knowledge base (SQLite)
│
├── conversations.db      # 💾 SQLite database untuk percakapan
├── knowledge.db          # 🗄️ SQLite database untuk knowledge base
│
├── dashboard.html        # 📊 Dashboard web untuk monitoring real-time
│
├── .env                  # 🔐 Konfigurasi API keys (JANGAN di-commit!)
├── package.json          # 📦 Dependencies & scripts
├── README.md             # 📖 Dokumentasi ini
└── WORKFLOW.md           # 📋 Dokumentasi workflow lengkap
```

### Penjelasan Detail Setiap File:

#### **index.js** - Server Utama
- Webhook endpoint untuk menerima pesan dari Fonnte
- REST API untuk dashboard (CRUD conversations)
- WebSocket server untuk real-time updates
- Menu interaktif dengan 8 pilihan topik
- State management (idle/topic_selected)
- Auto-escalation logic
- Deduplikasi pesan

#### **ai.js** - AI Engine
- Integrasi dengan DeepSeek API
- System prompt yang ketat (hanya jawab dari knowledge base)
- Context injection dari retriever
- Temperature 0.2 untuk konsistensi
- Kirim 6 pesan terakhir untuk context

#### **whatsapp.js** - WhatsApp Integration
- Kirim pesan ke WhatsApp via Fonnte
- Format chatId otomatis
- Error handling

#### **retriever.js** - Knowledge Retrieval
- TF-IDF similarity scoring
- Cache index untuk performa
- Return top 2 knowledge dengan score > 1.0
- Tokenization dengan Natural.js

#### **db.js** - Conversation Database
- CRUD operations untuk percakapan
- State management (status, menuState, selectedTopic)
- **SQLite database** untuk performa & keamanan
- Indexing untuk query cepat
- Transaction support
- Relational: conversations ↔ messages

#### **knowledge-db.js** - Knowledge Base
- SQLite database untuk knowledge
- Auto-seed data awal
- CRUD operations for knowledge
- Support aktif/nonaktif knowledge

#### **dashboard.html** - Admin Dashboard
- Real-time monitoring via WebSocket
- List semua percakapan
- Filter by status (all/escalated/done)
- Admin bisa balas manual
- Update status percakapan
- Statistik real-time

---

## 🚀 Cara Setup & Menjalankan

### **Prasyarat**
- Node.js versi 14 atau lebih baru
- npm atau yarn
- Akun DeepSeek API (gratis di https://api.deepseek.com)
- Akun Fonnte (trial/berbayar di https://fonnte.com)

---

### **Langkah 1: Clone & Install Dependencies**

```bash
# Clone repository (jika dari Git)
git clone <repository-url>
cd whatsapp-ai-bot

# Install dependencies
npm install
```

---

### **Langkah 2: Konfigurasi Environment Variables**

Buat file `.env` di root folder:

```env
# DeepSeek API Key (dapatkan dari https://api.deepseek.com)
AI_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxx

# Fonnte Config (dapatkan dari https://fonnte.com)
FONNTE_TOKEN=xxxxxxxxxxxxxxxxxxxxx

# Server Port
PORT=3000
```

**📌 Cara mendapatkan Fonnte credentials:**
1. Login ke https://fonnte.com
2. Buat instance baru → scan QR dengan WhatsApp Business
3. Buat **API Token** di menu "User API Tokens"

**📌 Cara mendapatkan DeepSeek API Key:**
1. Login ke https://api.deepseek.com
2. Buat API Key baru
3. Copy dan paste ke `.env`

---

### **Langkah 3: Jalankan Server**

#### **Development Mode (auto-restart)**
```bash
npm run dev
```

#### **Production Mode**
```bash
npm start
```

Server akan berjalan di `http://localhost:3000`

**Endpoint yang tersedia:**
- `POST /webhook` - Webhook dari Fonnte
- `GET /api/conversations` - List semua percakapan
- `GET /api/conversations/:phone` - Detail percakapan
- `POST /api/conversations/:phone/reply` - Admin balas pesan
- `PATCH /api/conversations/:phone/status` - Update status
- `GET /` - Health check

---

### **Langkah 4: Expose ke Internet (untuk Testing Lokal)**

Gunakan **ngrok** untuk expose localhost:

```bash
# Install ngrok (jika belum)
# Download dari https://ngrok.com/download

# Jalankan ngrok
ngrok http 3000
```

Salin URL ngrok (contoh: `https://abc123.ngrok-free.app`)

**Kenapa perlu ngrok?**
- WhatsApp API perlu URL publik untuk kirim webhook
- Localhost tidak bisa diakses dari internet
- Ngrok membuat tunnel dari internet ke localhost kamu

---

### **Langkah 5: Set Webhook di Fonnte**

1. Buka dashboard Fonnte → pilih instance Anda
2. Masuk ke menu **Webhooks**
3. Set **Webhook URL**: `https://abc123.ngrok-free.app/webhook`
4. Aktifkan event: **message** atau **message_create**
5. Klik **Save**

---

### **Langkah 6: Buka Dashboard (Opsional)**

1. Buka file `dashboard.html` di browser
2. Pastikan Server URL sudah benar: `http://localhost:3000`
3. Klik **Hubungkan**
4. Dashboard akan menampilkan semua percakapan real-time

---

### **Langkah 7: Testing**

1. Kirim pesan WhatsApp ke nomor yang terhubung dengan Fonnte
2. Bot akan membalas dengan menu pilihan (1-8)
3. Pilih angka untuk memilih topik
4. Bot akan menjawab berdasarkan knowledge base
5. Lihat percakapan di dashboard

**Contoh percakapan:**
```
User: Halo
Bot: [Menu 1-8]

User: 1
Bot: [Penjelasan tentang Lupa Password]

User: Sudah
Bot: [Link survei + selesai]
```

---

## 🔄 Alur Kerja Sistem

### **1. User Kirim Pesan**
```
User (WhatsApp) → Fonnte → Webhook (POST /webhook) → index.js
```

### **2. Validasi & Simpan**
```
index.js:
- Cek apakah pesan dari user (bukan bot)
- Cek tipe pesan (hanya proses teks)
- Deduplikasi message ID
- Simpan ke db.js
```

### **3. Cek Status Percakapan**
```
Status AI → Lanjut ke menu/AI
Status ESCALATED → Teruskan ke dashboard, AI diam
Status DONE → Reset ke AI, tampilkan menu lagi
```

### **4. Menu State**
```
State IDLE → Tampilkan menu 1-8
State TOPIC_SELECTED → Lanjut percakapan dalam topik
```

### **5. Retrieve Knowledge**
```
retriever.js:
- Tokenisasi pesan user
- Hitung TF-IDF score untuk semua knowledge
- Return top 2 dengan score > 1.0
```

### **6. AI Processing**
```
ai.js:
- Inject system prompt + knowledge context
- Kirim 6 pesan terakhir
- Temperature 0.2 (konsisten)
- Return jawaban AI
```

### **7. Analisis Respons**
```
Mengandung kata eskalasi? → Status = ESCALATED
Mengandung link survei? → Status = DONE
Normal? → Tetap AI
```

### **8. Kirim Balasan**
```
whatsapp.js → Fonnte API → WhatsApp User
```

### **9. Broadcast ke Dashboard**
```
WebSocket → dashboard.html (real-time update)
```

---

## 🎯 Fitur Utama

### **1. Menu Interaktif**
User memilih topik dengan mengetik angka 1-8:
1. Lupa Password / Reset Akun
2. Verifikasi 2 Langkah (2FA)
3. Login Email Instansi
4. Login Portal Utama
5. Login Portal Orang Tua
6. Masalah Koneksi
7. E-Learning
8. Masalah lain / Chat dengan Admin

### **2. AI-Powered Responses**
- Menggunakan DeepSeek API (DeepSeek-v4-pro)
- Temperature rendah (0.2) untuk jawaban konsisten
- Hanya menjawab berdasarkan knowledge base
- Auto-eskalasi jika tidak ada informasi

### **3. Knowledge Base Retrieval**
- TF-IDF similarity scoring
- Cache index untuk performa
- Top 2 knowledge dengan score > 1.0
- SQLite database untuk knowledge storage

### **4. State Management**
- **Menu State**: `idle` (belum pilih) / `topic_selected` (sudah pilih)
- **Conversation Status**: `ai` / `escalated` / `done`
- **Selected Topic**: Menyimpan topik yang dipilih user

### **5. Dashboard Real-time**
- WebSocket untuk update real-time
- Monitoring semua percakapan
- Admin bisa balas manual saat eskalasi
- Update status percakapan
- Filter by status
- Statistik (total, eskalasi, selesai)

### **6. Auto-Escalation**
Bot otomatis eskalasi ke admin jika:
- Tidak ada knowledge yang relevan (score < 1.0)
- User pilih menu "Masalah lain"
- AI mendeteksi pertanyaan di luar scope

### **7. Conversation History**
- Menyimpan semua pesan per nomor WA
- Context terjaga dalam percakapan
- Kirim 6 pesan terakhir ke AI untuk context

---

## 🔧 Kustomisasi

### **Menambah Knowledge Base**

Edit file `knowledge-db.js` bagian `seedData`:

```javascript
const seedData = [
  [
    'Topik Baru',
    `KONTEN TOPIK BARU:
- Poin 1
- Poin 2
- Poin 3`
  ],
  // ... knowledge lainnya
];
```

### **Mengubah System Prompt**

Edit file `ai.js` bagian `BASE_PROMPT`:

```javascript
const BASE_PROMPT = `Kamu adalah asisten AI...
[Ubah instruksi di sini]
`;
```

---
## 🚀 Deploy ke Production

### **Rekomendasi Platform**

#### **1. Railway (Paling Mudah)**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

#### **2. Render**
1. Push code ke GitHub
2. Connect repository di Render
3. Set environment variables
4. Deploy otomatis

---

## 📊 API Endpoints

### **Health Check**
```
GET /
```
Cek apakah server berjalan.

**Response:**
```json
{
  "status": "🤖 AI WhatsApp Bot running",
  "port": 3000
}
```

---

## 🐛 Troubleshooting

### **Bot tidak merespons**
- ✅ Cek webhook URL sudah benar di Fonnte
- ✅ Cek server berjalan dan bisa diakses dari internet
- ✅ Cek logs di console untuk error

### **AI menjawab tidak relevan**
- ✅ Cek knowledge base sudah lengkap
- ✅ Turunkan temperature di `ai.js`
- ✅ Perbaiki system prompt

---

## 👨‍💻 Developer

Dibuat dengan ❤️ oleh Developer

---

## 📄 Lisensi

Project ini dibuat untuk membantu layanan pelanggan otomatis.

---

## 📞 Support

Jika ada pertanyaan atau masalah:
- Buka issue di GitHub
- Hubungi Admin
- Email: admin@example.com

---

**Selamat menggunakan AI WhatsApp Bot! 🚀**
