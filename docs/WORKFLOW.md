# 📋 Dokumentasi Workflow & Tech Stack
## AI WhatsApp Bot

---

## 🎯 Deskripsi Project

Bot WhatsApp otomatis yang menggunakan AI (DeepSeek) untuk menjawab pertanyaan pengguna. Bot ini dilengkapi dengan dashboard web untuk monitoring dan eskalasi manual oleh staf admin.

---

## 🛠️ Tech Stack

### **Backend & Runtime**
- **Node.js** - Runtime JavaScript
- **Express.js** - Web framework untuk REST API dan webhook
- **WebSocket (ws)** - Real-time communication untuk dashboard

### **AI & NLP**
- **DeepSeek API** - LLM (Large Language Model) menggunakan DeepSeek-v4-pro
- **Natural.js** - Library NLP untuk TF-IDF retrieval dan tokenization

### **Database**
- **Better-SQLite3** - Database SQLite untuk knowledge base dan percakapan

### **External APIs**
- **Fonnte** - WhatsApp API untuk mengirim/menerima pesan
- **Axios** - HTTP client untuk API calls

### **Development Tools**
- **dotenv** - Environment variable management
- **nodemon** - Auto-restart saat development

---

## 📁 Struktur File & Fungsinya

```
whatsapp-ai-bot/
│
├── index.js              # Server utama + webhook handler + REST API
├── ai.js                 # Integrasi DeepSeek AI + system prompt
├── whatsapp.js           # Integrasi Fonnte untuk kirim pesan WA
├── retriever.js          # TF-IDF retrieval untuk knowledge base
├── db.js                 # Database handler untuk percakapan (SQLite)
├── knowledge-db.js       # Database handler untuk knowledge base (SQLite)
│
├── conversations.db      # Storage percakapan & state
├── knowledge.db          # SQLite database untuk knowledge base
│
├── dashboard.html        # Dashboard web untuk monitoring
│
├── .env                  # Konfigurasi API keys (JANGAN di-commit!)
├── package.json          # Dependencies & scripts
└── README.md             # Dokumentasi setup
```

---

## 🔄 Workflow Sistem

### **1. Alur Percakapan User**

```
┌─────────────────────────────────────────────────────────────┐
│  USER KIRIM PESAN VIA WHATSAPP                              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Fonnte TERIMA PESAN → KIRIM KE WEBHOOK (/webhook)           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  INDEX.JS: VALIDASI & DEDUPLIKASI PESAN                     │
│  - Cek apakah pesan dari user (bukan bot)                   │
│  - Cek tipe pesan (hanya proses teks)                       │
│  - Cek duplikasi message ID                                 │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  DB.JS: SIMPAN USER & PESAN KE DATABASE                     │
│  - Upsert conversation (buat baru atau update)              │
│  - Tambah pesan user ke history                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  CEK STATUS PERCAKAPAN                                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Status: AI (default)                                 │   │
│  │ → Lanjut ke menu/AI processing                       │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ Status: ESCALATED                                    │   │
│  │ → Pesan diteruskan ke dashboard, AI tidak merespons │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ Status: DONE                                         │   │
│  │ → Reset ke AI, tampilkan menu lagi                   │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  CEK MENU STATE                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ State: IDLE (belum pilih menu)                       │   │
│  │ → Tampilkan menu pilihan topik                       │   │
│  │ → User pilih angka 1-8                               │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ State: TOPIC_SELECTED (sudah pilih topik)           │   │
│  │ → Lanjut percakapan dalam topik tersebut            │   │
│  │ → User bisa ketik "menu" untuk kembali               │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  RETRIEVER.JS: AMBIL KNOWLEDGE YANG RELEVAN                 │
│  - Gunakan TF-IDF untuk cari topik paling cocok             │
│  - Return top 2 knowledge dengan score > 1.0                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  AI.JS: PROSES DENGAN AI                                    │
│  - Inject system prompt + knowledge context                 │
│  - Kirim 6 pesan terakhir ke DeepSeek API                   │
│  - Model: DeepSeek-v4-pro                                   │
│  - Temperature: 0.2 (rendah agar tidak ngelantur)           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  ANALISIS RESPONS AI                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Mengandung kata kunci eskalasi?                     │   │
│  │ → Update status ke ESCALATED                         │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ Mengandung link survei?                             │   │
│  │ → Update status ke DONE, reset menu state           │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ Normal?                                              │   │
│  │ → Tetap di status AI                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  WHATSAPP.JS: KIRIM BALASAN KE USER                          │
│  - Format target dengan benar                               │
│  - POST ke Fonnte endpoint                                  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  BROADCAST KE DASHBOARD (WebSocket)                         │
│  - Kirim update pesan & status ke semua client terhubung    │
└─────────────────────────────────────────────────────────────┘
```

---

### **2. Alur Knowledge Retrieval (TF-IDF)**

```
┌─────────────────────────────────────────────────────────────┐
│  USER MESSAGE: "Saya lupa password email"                   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  RETRIEVER.JS: TOKENISASI                                   │
│  Input: "Saya lupa password email"                          │
│  Output: ["saya", "lupa", "password", "email"]              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  KNOWLEDGE-DB.JS: AMBIL SEMUA KNOWLEDGE                     │
│  - Query SQLite: SELECT topik, konten WHERE aktif = 1       │
│  - Return array of knowledge                                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  TF-IDF SCORING                                              │
│  - Hitung similarity score untuk setiap knowledge           │
│  - Sort berdasarkan score tertinggi                         │
│  - Filter yang score >= 1.0                                 │
│  - Ambil top 2 knowledge                                    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  RETURN CONTEXT                                              │
│  [Lupa Password Akun]                                        │
│  LUPA PASSWORD AKUN:                                         │
│  - Jika pengguna lupa password...                           │
│                                                              │
│  ---                                                         │
│                                                              │
│  [Login Email Instansi]                                        │
│  LOGIN EMAIL INSTANSI:                                         │
│  - Format email pengguna...                                │
└─────────────────────────────────────────────────────────────┘
```

---

### **3. Alur Dashboard (Monitoring & Eskalasi)**

```
┌─────────────────────────────────────────────────────────────┐
│  ADMIN BUKA DASHBOARD (dashboard.html)                    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  WEBSOCKET CONNECTION KE SERVER                             │
│  - Connect ke ws://localhost:3000                           │
│  - Terima event 'init' dengan semua percakapan              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  TAMPILKAN LIST PERCAKAPAN                                   │
│  - Sorted by updatedAt (terbaru di atas)                    │
│  - Badge status: AI / ESCALATED / DONE                      │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  REAL-TIME UPDATES (WebSocket Events)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Event: message                                       │   │
│  │ → Tampilkan pesan baru di chat                       │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ Event: status_change                                 │   │
│  │ → Update badge status percakapan                     │   │
├──────────────────────────────────────────────────────┤   │
│  │ Event: escalated_message                             │   │
│  │ → Highlight percakapan yang butuh perhatian         │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  ADMIN BALAS PESAN (jika status ESCALATED)                   │
│  - Ketik pesan di input box                                 │
│  - POST /api/conversations/:phone/reply                     │
│  - Pesan dikirim via Fonnte ke user                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Cara Menjalankan Project

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

---

## 📄 Lisensi

Project ini dibuat untuk membantu layanan pelanggan otomatis.

---

## 👨‍💻 Developer

Dibuat dengan ❤️ oleh Developer

---

**Selamat menggunakan AI WhatsApp Bot! 🚀**
