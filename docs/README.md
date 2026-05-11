# 🤖 WhatsApp Bot IT Helpdesk UMS

Bot WhatsApp otomatis berbasis AI untuk IT Helpdesk UMS menggunakan **Fonnte** + **DeepSeek AI** + **Dashboard Real-time**.

## 📋 Deskripsi Project

Sistem chatbot WhatsApp yang membantu mahasiswa dan dosen UMS menyelesaikan masalah IT kampus secara otomatis. Bot ini dilengkapi dengan:
- ✅ AI-powered responses menggunakan DeepSeek (DeepSeek-v4-pro)
- ✅ Knowledge base dengan TF-IDF retrieval
- ✅ Menu interaktif untuk navigasi topik
- ✅ Dashboard web real-time untuk monitoring
- ✅ Auto-escalation ke staf IT jika diperlukan
- ✅ State management untuk context percakapan

---

## 🛠️ Tech Stack

- **Backend**: Node.js + Express.js
- **AI**: DeepSeek API (DeepSeek-v4-pro)
- **NLP**: Natural.js (TF-IDF)
- **Database**: SQLite (knowledge base) + JSON (conversations)
- **Real-time**: WebSocket (ws)
- **WhatsApp API**: Fonnte
- **HTTP Client**: Axios

---

## 📁 Struktur File & Fungsinya

```
wabot-helpdesk-ums/
│
├── index.js              # 🚀 Server utama + webhook handler + REST API + WebSocket
├── ai.js                 # 🧠 Integrasi DeepSeek AI + system prompt
├── whatsapp.js           # 📱 Integrasi Fonnte untuk kirim pesan WhatsApp
├── retriever.js          # 🔍 TF-IDF retrieval untuk knowledge base
├── db.js                 # 💾 Database handler untuk percakapan (JSON)
├── knowledge-db.js       # 📚 Database handler untuk knowledge base (SQLite)
│
├── data.json             # 📝 [DEPRECATED] Old JSON storage (use conversations.db)
├── conversations.db      # 💾 SQLite database untuk percakapan (NEW!)
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
- Staf bisa balas manual
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
- `POST /api/conversations/:phone/reply` - Staf balas pesan
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

Salin URL ngrok (contoh: `https://dallying-lumping-ribbon.ngrok-free.app`)

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
- Filter by status
- Statistik (total, eskalasi, selesai)

### **6. Auto-Escalation**
Bot otomatis eskalasi ke staf jika:
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

**Setelah deploy:**
- Set environment variables di Railway dashboard
- Copy URL production
- Update webhook URL di Fonnte

#### **2. Render**
1. Push code ke GitHub
2. Connect repository di Render
3. Set environment variables
4. Deploy otomatis
5. Copy URL production
6. Update webhook URL di Fonnte

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
- Update webhook URL di Fonnte with URL production
- Pastikan port sesuai dengan yang disediakan platform (biasanya dari `process.env.PORT`)

---

## 📊 API Endpoints

### **Webhook**
```
POST /webhook
```
Menerima webhook dari Fonnte saat ada pesan masuk.

**Request Body:**
```json
{
  "event": "message",
  "data": {
    "message": {
      "id": "...",
      "from": "628xxx@c.us",
      "body": "Halo",
      "type": "chat",
      "fromMe": false,
      "notifyName": "John Doe"
    }
  }
}
```

### **Get All Conversations**
```
GET /api/conversations
```
Mengambil semua percakapan (untuk dashboard).

**Response:**
```json
[
  {
    "phone": "628xxx",
    "name": "John Doe",
    "status": "ai",
    "menuState": "topic_selected",
    "selectedTopic": "Lupa Password Akun",
    "messages": [...],
    "createdAt": 1234567890,
    "updatedAt": 1234567890
  }
]
```

### **Get Single Conversation**
```
GET /api/conversations/:phone
```
Mengambil detail percakapan berdasarkan nomor telepon.

### **Reply to User (Staff)**
```
POST /api/conversations/:phone/reply
```
Staf IT membalas pesan user yang sudah dieskalasi.

**Request Body:**
```json
{
  "text": "Pesan dari staf IT"
}
```

### **Update Conversation Status**
```
PATCH /api/conversations/:phone/status
```
Update status percakapan.

**Request Body:**
```json
{
  "status": "ai" | "escalated" | "done"
}
```

### **Health Check**
```
GET /
```
Cek apakah server berjalan.

**Response:**
```json
{
  "status": "🤖 IT Helpdesk UMS Bot running",
  "port": 3000
}
```

---

## 🔄 Migration dari JSON ke SQLite

Jika kamu punya data lama di `data.json`, jalankan migration:

```bash
npm run migrate
```

**Apa yang dilakukan migration:**
- ✅ Membaca semua data dari `data.json`
- ✅ Membuat database `conversations.db`
- ✅ Import semua conversations & messages
- ✅ Backup otomatis ke `data.json.backup`

**Keuntungan SQLite vs JSON:**
- ⚡ **Performance**: 10-100x lebih cepat untuk query
- 🔒 **Concurrency**: Aman dari race condition
- 📊 **Query**: Bisa filter, sort, pagination
- 🔍 **Indexing**: Query cepat meski data banyak
- 💪 **Transaction**: Rollback kalau error
- 📈 **Scalability**: Bisa handle ribuan percakapan

---

## 🐛 Troubleshooting

### **Bot tidak merespons**
- ✅ Cek webhook URL sudah benar di Fonnte
- ✅ Cek server berjalan dan bisa diakses dari internet
- ✅ Cek logs di console untuk error
- ✅ Cek ngrok masih running (jika pakai ngrok)

### **AI menjawab tidak relevan**
- ✅ Cek knowledge base sudah lengkap
- ✅ Turunkan temperature di `ai.js`
- ✅ Perbaiki system prompt
- ✅ Tambah lebih banyak keyword di knowledge

### **Webhook error 401/403**
- ✅ Cek FONNTE_TOKEN di `.env`
- ✅ Regenerate token di dashboard Fonnte
- ✅ Pastikan instance masih aktif

### **Database error**
- ✅ Hapus `conversations.db` and `knowledge.db`, restart server
- ✅ Database akan di-recreate otomatis
- ✅ Cek permission folder (harus bisa write)
- ✅ Jika punya data lama di `data.json`, jalankan: `npm run migrate`

### **Dashboard tidak terhubung**
- ✅ Cek Server URL di dashboard sudah benar
- ✅ Cek server berjalan di port yang benar
- ✅ Cek CORS settings di `index.js`
- ✅ Buka console browser untuk lihat error

### **Pesan duplikat**
- ✅ Sistem sudah ada deduplikasi otomatis
- ✅ Jika masih duplikat, cek webhook settings di Fonnte
- ✅ Pastikan hanya 1 webhook aktif

---

## 📝 Catatan Penting

### **DeepSeek API Limits**
- Free tier: check https://api.deepseek.com for limits
- Jika limit tercapai, tunggu 1 menit
- Untuk production, pertimbangkan upgrade

### **Knowledge Base**
- Semakin lengkap knowledge, semakin akurat bot
- Update knowledge secara berkala
- Gunakan keyword yang jelas dan spesifik

### **Security**
- Jangan commit file `.env` ke Git
- Tambahkan `.env` ke `.gitignore`
- Gunakan environment variables di production

---

## 📚 Dokumentasi Tambahan

- **WORKFLOW.md** - Dokumentasi workflow lengkap dengan diagram
- **dashboard.html** - Dashboard admin untuk monitoring
- **knowledge.db** - Database knowledge base (SQLite)
- **data.json** - Storage percakapan (auto-generated)

---

## 👨‍💻 Developer

Dibuat dengan ❤️ oleh Tim IT Helpdesk UMS

**Fun Fact:** Pacar admin yang membuat sistem ini bernama **Eldina Nurdiana** 😄

---

## 📄 Lisensi

Project ini dibuat untuk IT Helpdesk UMS.

---

## 🙏 Kontribusi

Jika ingin berkontribusi:
1. Fork repository ini
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

---

## 📞 Support

Jika ada pertanyaan atau masalah:
- Buka issue di GitHub
- Hubungi IT Helpdesk UMS
- Email: ithelpdesk@ums.ac.id

---

**Selamat menggunakan WhatsApp Bot IT Helpdesk UMS! 🚀**
