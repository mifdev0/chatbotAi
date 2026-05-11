# 📋 Dokumentasi Workflow & Tech Stack
## WhatsApp Bot IT Helpdesk UMS

---

## 🎯 Deskripsi Project

Bot WhatsApp otomatis untuk IT Helpdesk UMS yang menggunakan AI (DeepSeek) untuk menjawab pertanyaan mahasiswa/dosen tentang masalah IT kampus. Bot ini dilengkapi dengan dashboard web untuk monitoring dan eskalasi manual oleh staf IT.

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
- **Better-SQLite3** - Database SQLite untuk knowledge base
- **JSON File (data.json)** - Penyimpanan percakapan dan state

### **External APIs**
- **Fonnte** - WhatsApp API untuk mengirim/menerima pesan
- **Axios** - HTTP client untuk API calls

### **Development Tools**
- **dotenv** - Environment variable management
- **nodemon** - Auto-restart saat development

---

## 📁 Struktur File & Fungsinya

```
wabot-helpdesk-ums/
│
├── index.js              # Server utama + webhook handler + REST API
├── ai.js                 # Integrasi DeepSeek AI + system prompt
├── whatsapp.js           # Integrasi Fonnte untuk kirim pesan WA
├── retriever.js          # TF-IDF retrieval untuk knowledge base
├── db.js                 # Database handler untuk percakapan (JSON)
├── knowledge-db.js       # Database handler untuk knowledge base (SQLite)
│
├── data.json             # Storage percakapan & state (auto-generated)
├── knowledge.db          # SQLite database untuk knowledge base
│
├── dashboard.html        # Dashboard web untuk monitoring (opsional)
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
│  [Login Email Kampus]                                        │
│  LOGIN EMAIL KAMPUS:                                         │
│  - Format email mahasiswa...                                │
└─────────────────────────────────────────────────────────────┘
```

---

### **3. Alur Dashboard (Monitoring & Eskalasi)**

```
┌─────────────────────────────────────────────────────────────┐
│  STAF IT BUKA DASHBOARD (dashboard.html)                    │
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
│  STAF BALAS PESAN (jika status ESCALATED)                   │
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
cd wabot-helpdesk-ums

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

**Cara mendapatkan Fonnte credentials:**
1. Login ke https://fonnte.com
2. Buat instance baru → scan QR dengan WhatsApp Business
3. Buat **API Token** di menu "User API Tokens"

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

---

### **Langkah 5: Set Webhook di Fonnte**

1. Buka dashboard Fonnte → pilih instance Anda
2. Masuk ke menu **Webhooks**
3. Set **Webhook URL**: `https://abc123.ngrok-free.app/webhook`
4. Aktifkan event: **message** atau **message_create**
5. Klik **Save**

---

### **Langkah 6: Testing**

1. Kirim pesan WhatsApp ke nomor yang terhubung dengan Fonnte
2. Bot akan membalas dengan menu pilihan
3. Pilih angka 1-8 untuk memilih topik
4. Bot akan menjawab berdasarkan knowledge base

---

## 📊 Endpoint API

### **Webhook**
```
POST /webhook
```
Menerima webhook dari Fonnte saat ada pesan masuk.

### **Get All Conversations**
```
GET /api/conversations
```
Mengambil semua percakapan (untuk dashboard).

### **Get Single Conversation**
```
GET /api/conversations/:phone
```
Mengambil detail percakapan berdasarkan nomor telepon.

### **Reply to User (Staff)**
```
POST /api/conversations/:phone/reply
Body: { "text": "Pesan dari staf" }
```
Staf IT membalas pesan user yang sudah dieskalasi.

### **Update Conversation Status**
```
PATCH /api/conversations/:phone/status
Body: { "status": "ai" | "escalated" | "done" }
```
Update status percakapan.

### **Health Check**
```
GET /
```
Cek apakah server berjalan.

---

## 🎨 Fitur Utama

### **1. Menu Interaktif**
User memilih topik dengan mengetik angka 1-8:
1. Lupa Password / Reset Akun
2. Verifikasi 2 Langkah (2FA)
3. Login Email Kampus
4. Login MyAkademik / STAR / MBKM
5. Login STAR Parent
6. WiFi Kampus
7. SPADA (E-Learning)
8. Masalah lain / Chat dengan Admin IT Helpdesk

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
- Staf bisa balas manual saat eskalasi
- Update status percakapan

### **6. Auto-Escalation**
Bot otomatis eskalasi ke staf jika:
- Tidak ada knowledge yang relevan
- User pilih menu "Masalah lain"
- AI mendeteksi pertanyaan di luar scope

### **7. Conversation History**
- Menyimpan semua pesan per nomor WA
- Context terjaga dalam percakapan
- Kirim 6 pesan terakhir ke AI

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

Atau tambah via SQL:
```sql
INSERT INTO knowledge (topik, konten) VALUES 
('Topik Baru', 'Konten lengkap...');
```

### **Mengubah System Prompt**

Edit file `ai.js` bagian `BASE_PROMPT`:

```javascript
const BASE_PROMPT = `Kamu adalah asisten AI...
[Ubah instruksi di sini]
`;
```

### **Menambah Menu Item**

Edit file `index.js` bagian `MENU_ITEMS`:

```javascript
const MENU_ITEMS = [
  { label: 'Menu Baru', topik: 'Keyword untuk retrieve' },
  // ... menu lainnya
];
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

#### **3. Fly.io**
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Deploy
fly launch
```

**Jangan lupa:**
- Set environment variables di platform
- Update webhook URL di Fonnte dengan URL production
- Pastikan port sesuai dengan yang disediakan platform

---

## 📝 Troubleshooting

### **Bot tidak merespons**
- Cek webhook URL sudah benar di Fonnte
- Cek server berjalan dan bisa diakses dari internet
- Cek logs di console untuk error

### **AI menjawab tidak relevan**
- Cek knowledge base sudah lengkap
- Turunkan temperature di `ai.js`
- Perbaiki system prompt

### **Webhook error 401/403**
- Cek FONNTE_TOKEN di `.env`
- Regenerate token di dashboard Fonnte

### **Database error**
- Hapus `data.json` dan `knowledge.db`, restart server
- Database akan di-recreate otomatis

---

## 📄 Lisensi

Project ini dibuat untuk IT Helpdesk UMS.

---

## 👨‍💻 Developer

Dibuat dengan ❤️ oleh Tim IT Helpdesk UMS

**Fun Fact:** Pacar admin yang membuat sistem ini bernama Eldina Nurdiana 😄
