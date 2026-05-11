# Product Requirement Document (PRD)
## WhatsApp Bot AI Helpdesk

**Versi:** 2.1.0  
**Tanggal:** 7 Mei 2026  
**Status:** In Progress  
**Product Owner:** Lead Developer

---

## 1. Ringkasan Eksekutif

### 1.1 Latar Belakang

Layanan pelanggan seringkali menghadapi volume pertanyaan pengguna yang tinggi setiap harinya — pertanyaan repetitif, bantuan teknis dasar, dan lainnya. Pertanyaan-pertanyaan ini bersifat repetitif dan membebani staf yang terbatas. Di sisi lain, WhatsApp adalah kanal komunikasi utama yang paling sering digunakan oleh pengguna.

### 1.2 Solusi

WhatsApp Bot AI Helpdesk adalah chatbot berbasis AI yang beroperasi melalui WhatsApp untuk menjawab pertanyaan-pertanyaan IT umum secara otomatis. Bot ini menggunakan kombinasi **TF-IDF knowledge retrieval** (untuk mencocokkan pertanyaan dengan basis pengetahuan) dan **DeepSeek (DeepSeek-v4-pro)** (untuk menghasilkan jawaban natural berbahasa Indonesia). Dilengkapi **dashboard real-time** bagi staf IT untuk memonitor percakapan dan mengambil alih (eskalasi) secara manual jika AI tidak mampu menjawab.

### 1.3 Tujuan Produk

1. **Mengurangi beban staf IT** dengan otomatisasi jawaban pertanyaan repetitif
2. **Meningkatkan waktu respons** — dari hitungan jam menjadi hitungan detik
3. **Menyediakan layanan 24/7** melalui bot AI yang selalu online
4. **Tetap memungkinkan intervensi manusia** melalui mekanisme eskalasi
5. **Memberikan visibilitas penuh** ke staf IT melalui dashboard monitoring real-time

---

## 2. Target Pengguna

### 2.1 Persona Utama

| Persona | Deskripsi | Kebutuhan Utama |
|---|---|---|
| **Mahasiswa** | Pengguna utama yang mengalami kendala IT (password, akun, WiFi, e-learning) | Jawaban cepat, panduan step-by-step, bisa diakses dari mana saja via WhatsApp |
| **Dosen / Staf** | Pengguna yang membutuhkan bantuan teknis terkait sistem akademik | Panduan jelas, bahasa Indonesia formal, opsi bantuan lanjutan |
| **Staf IT (Admin)** | Petugas helpdesk yang memonitor dan menangani eskalasi | Dashboard real-time, notifikasi percakapan baru, kemampuan reply langsung, status tracking |

### 2.2 User Stories Kunci

- Sebagai **mahasiswa**, saya ingin mengetik "lupa password" ke nomor helpdesk dan langsung mendapat panduan reset password tanpa harus menunggu balasan staf.
- Sebagai **staf IT**, saya ingin melihat semua percakapan yang sedang berlangsung di dashboard, agar bisa langsung mengambil alih jika bot tidak bisa menjawab.
- Sebagai **mahasiswa**, saya ingin bot mengenali bahwa pertanyaan saya tidak bisa dijawab dan langsung mengeskalasi ke staf IT (bukan stuck atau memberikan jawaban mengarang).
- Sebagai **admin**, saya ingin menambahkan topik knowledge baru tanpa harus mengubah kode.

---

## 3. Ruang Lingkup (Scope)

### 3.1 Fitur yang Termasuk (In Scope)

| ID | Fitur | Deskripsi |
|---|---|---|
| F-01 | **Menu Interaktif WhatsApp** | 8 opsi menu topik IT yang bisa dipilih user via nomor |
| F-02 | **AI Auto-Response** | Jawaban otomatis berbasis DeepSeek AI dengan konteks knowledge base |
| F-03 | **TF-IDF Knowledge Retrieval** | Pencocokan semantik pertanyaan user dengan basis pengetahuan TF-IDF |
| F-04 | **Basis Pengetahuan (6 topik)** | Lupa Password, 2FA, Email Kampus, MyAkademik, STAR Parent, WiFi, SPADA |
| F-05 | **Eskalasi Otomatis** | Bot otomatis mengeskalasi ke staf IT jika: tidak ada knowledge cocok (skor < 1.0), AI menyatakan tidak tahu, atau user memilih "Masalah lain" |
| F-06 | **Dashboard Admin Real-Time** | Web dashboard dengan WebSocket: daftar percakapan live, chat view, staff reply, filter/search, statistik |
| F-07 | **Status Manajemen Percakapan** | 3 status: `ai` (bot handle), `escalated` (staff handle), `done` (selesai) |
| F-08 | **State Machine Menu** | Navigasi menu: `idle` → `topic_selected` → kembali ke menu dengan keyword "menu"/"kembali" |
| F-09 | **Conversation History** | Semua percakapan tersimpan di SQLite dengan riwayat pesan lengkap |
| F-10 | **Message Deduplication** | Cegah duplikasi pemrosesan pesan yang sama via Set TTL 60 detik |
| F-11 | **Conversation Lifecycle** | Percakapan selesai (`done`) otomatis reset ke mode AI saat user kembali chat |

### 3.2 Fitur yang Tidak Termasuk (Out of Scope — MVP)

- Multi-agent / multiple staff assignment
- Integrasi sistem tiket (ticketing system)
- Autentikasi user dashboard (login multi-user)
- NLP intent classification selain TF-IDF
- Support attachment/gambar/dokumen via WhatsApp
- Integrasi langsung dengan database internal (SSO, reset password otomatis)
- Multi-bahasa (saat ini hanya Bahasa Indonesia)
- Notifikasi push ke staf IT (email/telegram)

---

## 4. Persyaratan Fungsional (Functional Requirements)

### 4.1 Modul WhatsApp Bot

#### FR-01: Penerimaan Pesan Webhook
- Sistem menerima webhook `POST /webhook` dari Fonnte
- Validasi pesan: bukan dari bot sendiri (`fromMe = false`), tipe `chat`, `notifyName` ada
- Deduplikasi berdasarkan `id.msg` dengan Set TTL 60 detik

#### FR-02: Menu Interaktif
- Saat user pertama kali chat atau mengetik "menu"/"kembali", bot mengirim menu 8 topik:

```
📋 *AI ASSISTANT - MENU UTAMA*
───────────────
1. 🔑 Lupa Password Akun
2. 🔐 Verifikasi 2 Langkah (2FA)
3. 📧 Login Email Instansi
4. 🎓 Login Portal Utama
5. 👨‍👩‍👧 Login Portal Orang Tua
6. 📶 Masalah Koneksi
7. 📚 E-Learning
8. 👨‍💻 Masalah Lain (Eskalasi ke Admin)
───────────────
```

- User memilih dengan mengetik nomor 1-8
- Bot konfirmasi topik terpilih dan masuk mode `topic_selected`
- User bisa kembali ke menu kapan saja dengan mengetik "menu" atau "kembali"

#### FR-03: Knowledge Retrieval & AI Response
- Saat user memilih topik, sistem menjalankan TF-IDF retrieval terhadap basis pengetahuan
- Top-2 entri knowledge dengan skor > 1.0 dikirim sebagai konteks ke DeepSeek AI
- System prompt strict: AI hanya boleh menjawab dari knowledge yang diberikan, tidak boleh mengarang
- Maksimum 6 pesan terakhir dikirim sebagai conversation context
- Jawaban diformat dengan emoji, bold (Markdown WhatsApp), dan maksimal ~400 token
- Jika AI mengindikasikan tidak tahu / tidak dapat menjawab → auto-escalate

#### FR-04: Eskalasi ke Admin
Trigger eskalasi:
- User memilih nomor 8 ("Masalah Lain")
- Tidak ada knowledge cocok (skor TF-IDF < 1.0)
- AI response mengandung frasa eskalasi
- Admin mengubah status secara manual via dashboard

Saat percakapan eskalasi:
- Bot memberitahu user bahwa admin akan membalas
- Semua pesan user berikutnya diteruskan ke dashboard (tidak direspons AI)
- Pesan balasan admin dikirim via Fonnte ke nomor WhatsApp user

#### FR-05: Status & Lifecycle
- Status percakapan: `ai` (default), `escalated`, `done`
- Transisi:
  - `ai` → `escalated`: auto-escalation atau manual oleh staf
  - `escalated` → `done`: staf menandai selesai (resolve)
  - `done` → `ai`: user mengirim chat baru (auto-reset)
  - `escalated` → `ai`: staf mengembalikan ke AI mode

### 4.2 Modul Dashboard Admin

#### FR-06: Daftar Percakapan Real-Time
- Dashboard menampilkan semua percakapan via WebSocket
- Update real-time saat ada pesan baru atau perubahan status
- Diurutkan berdasarkan `updatedAt` (terbaru di atas)
- Fitur filter: berdasarkan status (semua/ai/escalated/done)
- Fitur pencarian: berdasarkan nama, nomor telepon, atau isi pesan
- Indikator percakapan baru / belum dibaca

#### FR-07: Tampilan Chat Detail
- Klik percakapan → tampilkan seluruh riwayat chat
- Bubbles chat: warna berbeda untuk user, AI, staff, system
- Timestamp setiap pesan
- Auto-scroll ke pesan terbaru
- Input box untuk staff reply

#### FR-08: Staff Reply
- Staf mengetik balasan di input box dan mengirim
- Balasan dikirim ke user via Fonnte
- Tersimpan ke database sebagai pesan `staff`
- Status percakapan otomatis berubah ke `escalated` jika sebelumnya `ai`
- Update real-time ke dashboard

#### FR-09: Statistik Live
- Total percakapan
- Total percakapan escalated
- Total percakapan resolved
- Update real-time saat status berubah

### 4.3 Modul REST API

#### FR-10: API Endpoints

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/` | Health check |
| POST | `/webhook` | Webhook Fonnte |
| GET | `/api/conversations` | List semua percakapan |
| GET | `/api/conversations/:phone` | Detail satu percakapan |
| POST | `/api/conversations/:phone/reply` | Staff kirim balasan |
| PATCH | `/api/conversations/:phone/status` | Update status percakapan |

### 4.4 Modul Basis Pengetahuan (Knowledge Base)

#### FR-11: Enam Topik Default
Topik yang sudah di-seed saat inisialisasi database:

| # | Topik | Konten |
|---|---|---|
| 1 | Lupa Password Akun | Panduan reset password akun |
| 2 | Verifikasi 2 Langkah (2FA) | Setup dan troubleshooting 2FA |
| 3 | Login Email Instansi | Panduan akses email instansi (@student.example.com) |
| 4 | Login Portal Akademik | KRS, Transkrip, MBKM, Wisuda |
| 5 | Login Portal Orang Tua | Panduan untuk orang tua pengguna |
| 6 | WiFi Kampus | Cara koneksi, SSID, troubleshooting |
| 7 | E-Learning | Akses, upload tugas, masalah umum |

#### FR-12: CRUD Knowledge
- Menambah topik baru via dashboard (future) atau script
- Mengedit konten topik
- Soft-delete (mark `aktif = 0`) untuk menyembunyikan topik
- Semua data tersimpan di SQLite (`data/knowledge.db`)

---

## 5. Persyaratan Non-Fungsional (Non-Functional Requirements)

### 5.1 Performa

| Metrik | Target |
|---|---|
| Waktu respons AI (dari pesan user sampai jawaban diterima) | < 5 detik |
| Waktu TF-IDF retrieval | < 100ms |
| Database query latency | < 10ms |
| WebSocket latency (dashboard update) | < 500ms |
| Concurrent conversations handled | 50+ |

### 5.2 Availability & Reliability

- Sistem harus berjalan 24/7
- Graceful error handling: jika DeepSeek API down, fallback ke pesan error informatif
- Database migrations harus non-destructive
- WebSocket auto-reconnect di sisi client dashboard

### 5.3 Keamanan

- API keys (AI_API_KEY, FONNTE_TOKEN) disimpan di `.env` (tidak di-commit)
- CORS diaktifkan untuk membatasi origin dashboard
- Tidak ada data sensitif user (password, token) yang disimpan
- Validasi input di semua endpoint
- Rate limiting tidak diperlukan untuk MVP (single tenant)

### 5.4 Maintainability

- Modular architecture dengan separation of concerns yang jelas
- NPM scripts standar: `npm start` (production), `npm run dev` (development), `npm run migrate`
- Database migration scripts terisolasi
- Dokumentasi lengkap di folder `docs/`

### 5.5 Kompatibilitas

- Node.js v18+
- WhatsApp Business API (Fonnte) — perlu akun aktif dan nomor terverifikasi
- Browser modern (Chrome/Firefox/Edge) untuk dashboard
- Windows/Linux/MacOS untuk deployment server

---

## 6. Arsitektur Sistem

### 6.1 Diagram Arsitektur Level Tinggi

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────────┐
│   Pengguna    │────▶│   Fonnte     │────▶│   Express Server     │
│  (WhatsApp)   │◀────│  (External)  │◀────│   (Node.js)          │
└──────────────┘     └──────────────┘     │                       │
                                          │  ┌─────────────────┐  │
                                          │  │ Routes           │  │
                                          │  │ - /webhook       │  │
                                          │  │ - /api/*         │  │
                                          │  ├─────────────────┤  │
                                          │  │ Services         │  │
                                          │  │ - AI (DeepSeek)  │  │
                                          │  │ - Retriever      │  │
                                          │  │ - WhatsApp       │  │
                                          │  ├─────────────────┤  │
                                          │  │ Database         │  │
                                          │  │ - Conversations  │  │
                                          │  │ - Knowledge      │  │
                                          │  └─────────────────┘  │
                                          │         ▲             │
                                          │     WebSocket         │
                                          │         │             │
┌──────────────┐                          │  ┌──────▼──────────┐  │
│ DeepSeek API │◀─────────────────────────┘  │  Dashboard      │  │
│(DeepSeek-v4) │                             │  (HTML/WS)      │  │
└──────────────┘                             └─────────────────┘  │
                                                                  │
┌──────────────┐                                                  │
│  Staf IT     │◀──────────────── WebSocket ◀─────────────────────┘
│  (Browser)   │────────────────▶ REST API ──────────────────────▶│
└──────────────┘
```

### 6.2 Tech Stack

| Layer | Teknologi |
|---|---|
| Runtime | Node.js 18+ |
| Framework HTTP | Express.js 4 |
| Real-Time | WebSocket (`ws`) |
| AI / LLM | DeepSeek API — DeepSeek-v4-pro |
| NLP | Natural.js (TF-IDF + WordTokenizer) |
| Database | SQLite via `better-sqlite3` |
| WhatsApp Gateway | Fonnte (fonnte.com) |
| HTTP Client | Axios |
| Config | dotenv |
| Dashboard | HTML5 + CSS + Vanilla JS (single file) |

### 6.3 Struktur Proyek

```
whatsapp-ai-bot/
├── server.js                    # Entry point (HTTP + WebSocket server)
├── src/
│   ├── app.js                   # Express app setup
│   ├── config/
│   │   └── env.js               # Env vars validation
│   ├── database/
│   │   ├── conversations.js     # SQLite - conversations & messages
│   │   ├── knowledge.js         # SQLite - knowledge base
│   │   └── migrations/
│   │       └── migrate-to-sqlite.js
│   ├── routes/
│   │   ├── webhook.js           # POST /webhook handler
│   │   └── api.js               # REST API for dashboard
│   ├── services/
│   │   ├── ai.js                # DeepSeek AI integration
│   │   ├── retriever.js         # TF-IDF knowledge retrieval
│   │   └── whatsapp.js          # Fonnte integration
│   └── utils/
│       ├── broadcast.js         # WebSocket broadcast helper
│       └── menu.js              # Menu builder (8 topics)
├── public/
│   └── dashboard.html           # Admin dashboard (WebSocket client)
├── data/
│   ├── conversations.db         # SQLite database
│   └── knowledge.db             # SQLite database
├── docs/
│   ├── PRD.md                   # Dokumen ini
│   ├── ARCHITECTURE.md
│   ├── WORKFLOW.md
│   ├── STRUCTURE.md
│   ├── README.md
│   ├── MIGRATION_GUIDE.md
│   └── CHANGELOG.md
└── scripts/                     # Utility scripts
```

### 6.4 Desain Database

#### Tabel: `conversations` (conversations.db)

| Kolom | Tipe | Keterangan |
|---|---|---|
| phone | TEXT PK | Nomor WhatsApp user |
| name | TEXT NOT NULL | Nama display user |
| status | TEXT DEFAULT 'ai' | `ai` \| `escalated` \| `done` |
| menuState | TEXT DEFAULT 'idle' | `idle` \| `topic_selected` |
| selectedTopic | TEXT NULLABLE | Topik knowledge yang dipilih |
| createdAt | INTEGER NOT NULL | Timestamp (ms) |
| updatedAt | INTEGER NOT NULL | Timestamp (ms) |

#### Tabel: `messages` (conversations.db)

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | INTEGER PK AUTOINCREMENT | ID unik pesan |
| phone | TEXT NOT NULL FK | References conversations.phone |
| from_user | TEXT NOT NULL | `user` \| `ai` \| `staff` \| `system` |
| text | TEXT NOT NULL | Isi pesan |
| time | INTEGER NOT NULL | Timestamp (ms) |

#### Tabel: `knowledge` (knowledge.db)

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | INTEGER PK AUTOINCREMENT | ID unik |
| topik | TEXT NOT NULL | Nama topik |
| konten | TEXT NOT NULL | Isi knowledge |
| aktif | INTEGER DEFAULT 1 | 1 = aktif, 0 = nonaktif |
| created_at | DATETIME DEFAULT CURRENT_TIMESTAMP | Waktu dibuat |

---

## 7. Alur Kerja (Workflow)

### 7.1 Alur Percakapan Utama

```
User kirim pesan WhatsApp
    │
    ▼
Fonnte → POST /webhook
    │
    ▼
Validasi + Deduplikasi
    │
    ▼
Simpan ke database (conversation + message)
    │
    ▼
Cek status percakapan
    │
    ├── done → Reset ke AI, tampilkan menu
    ├── escalated → Forward ke dashboard (tidak respons AI)
    └── ai → Lanjut
            │
            ▼
        Cek menuState
            │
            ├── idle + pesan = "menu" → Tampilkan menu
            ├── idle + pesan = nomor (1-8) → Pilih topik
            │       │
            │       ▼
            │   TF-IDF knowledge retrieval
            │       │
            │       ▼
            │   DeepSeek AI response generation
            │       │
            │       ▼
            │   Kirim jawaban via Fonnte
            │       │
            │       ▼
            │   Broadcast ke dashboard (WebSocket)
            │
            └── topic_selected → Lanjutkan dalam topik
                    ├── "menu"/"kembali" → Kembali ke idle, tampilkan menu
                    └── lainnya → Query knowledge → AI → Kirim jawaban
```

### 7.2 Alur Eskalasi

```
Kondisi Trigger:
- User pilih nomor 8 ("Masalah lain")
- TF-IDF score < 1.0 (tidak ada knowledge cocok)
- AI merespons dengan frasa tidak tahu

    │
    ▼
Ubah status percakapan → escalated
    │
    ▼
Kirim pesan: "Masalah Anda akan diteruskan ke staf IT..."
    │
    ▼
Broadcast `escalated_message` event ke dashboard
    │
    ▼
Semua pesan user selanjutnya → hanya diteruskan ke dashboard
    │
    ▼
Staf IT membalas via dashboard → dikirim ke user via Fonnte
    │
    ▼
Staff menandai resolved → status berubah jadi `done`
```

### 7.3 State Machine

```
Status Percakapan:
    ┌────┐     auto-escalate      ┌────────────┐     staff resolve     ┌──────┐
    │ AI │ ──────────────────────▶ │ ESCALATED  │ ──────────────────▶ │ DONE │
    └────┘ ◀────────────────────── └────────────┘                     └──────┘
        ▲     staff → ai mode           ▲                        user chat lagi │
        └───────────────────────────────┘──────────────────────────────────────┘

Menu State:
    ┌──────┐     user pilih nomor     ┌────────────────┐
    │ IDLE │ ───────────────────────▶ │ TOPIC_SELECTED │
    └──────┘ ◀─────────────────────── └────────────────┘
                 user ketik "menu"
```

### 7.4 WebSocket Events

| Event | Payload | Arah |
|---|---|---|
| `init` | `Array<Conversation>` | Server → Dashboard (saat koneksi) |
| `message` | `{ phone, from, text, time }` | Server → Dashboard |
| `status_change` | `{ phone, status }` | Server → Dashboard |
| `escalated_message` | `{ phone, from, text }` | Server → Dashboard |

---

## 8. Desain UI/UX

### 8.1 Antarmuka WhatsApp User

- **First-time experience:** User chat pertama kali → bot langsung kirim menu 8 opsi
- **Navigasi:** Ketik nomor untuk pilih, ketik "menu" untuk kembali
- **Loading state:** Tidak ada indikator typing (Fonnte keterbatasan), respons instant
- **Error state:** Jika terjadi error, bot mengirim pesan: "Maaf, terjadi kesalahan. Silakan coba lagi atau ketik 'menu'."
- **Eskalasi:** Bot memberitahu: "Pertanyaan Anda telah diteruskan ke staf IT. Mohon tunggu sebentar."

### 8.2 Dashboard Admin

- **Tema:** Dark mode ("AI Command Center")
- **Layout 2 panel:**
  - Panel kiri (~35%): Daftar percakapan, search bar, filter status, statistik
  - Panel kanan (~65%): Chat view percakapan terpilih, input reply, tombol status
- **Indikator koneksi:** Status WebSocket (connected/disconnected)
- **Real-time:** Update otomatis tanpa refresh
- **Bubbles chat:**
  - User: abu-abu gelap, rata kiri
  - AI/bot: biru gelap, rata kiri
  - Staff: hijau gelap, rata kanan
  - System: kuning gelap, rata tengah
- **Filter status:** All | AI | Escalated | Done
- **Search:** Cari berdasarkan nama, nomor HP, atau isi pesan
- **Status actions:** Tombol Resolve (hijau), Escalate (oranye), AI Mode (biru)

---

## 9. Integrasi Eksternal

### 9.1 Fonnte (WhatsApp API)

- **Provider:** `fonnte.com`
- **Autentikasi:** Token di header
- **Mengirim pesan:** `POST /send`
  ```json
  { "target": "6281354496995", "message": "..." }
  ```
- **Menerima webhook:** Payload Fonnte diforward ke `POST /webhook`
- **Batasan:** Tidak mendukung attachment (MVP), hanya teks

### 9.2 DeepSeek API (AI / LLM)

- **Model:** `DeepSeek-v4-pro`
- **Konfigurasi:** `temperature: 0.2`, `max_tokens: 400`
- **System Prompt:** Strict — hanya jawab dari knowledge context, berbahasa Indonesia, format WhatsApp-friendly, langsung ke inti tanpa basa-basi
- **Context Window:** 6 pesan terakhir dari conversation history
- **Fallback:** Jika DeepSeek API error → kirim pesan error informatif ke user

---

## 10. Success Metrics (KPI)

| Metrik | Target | Cara Ukur |
|---|---|---|
| Jumlah pertanyaan terjawab otomatis | > 60% dari total | Hitung percakapan status `done` tanpa eskalasi vs total |
| Eskalasi rate | < 40% dari total | Hitung percakapan status `escalated` vs total |
| Waktu respons AI (p50) | < 3 detik | Log timestamp pesan masuk → balasan terkirim |
| Uptime server | > 99% | Uptime monitoring |
| Kepuasan user (survey) | TBD — future | Link survey di akhir percakapan |
| Staff time saved | TBD — future | Estimasi waktu rata-rata per tiket × jumlah tiket terjawab |

---

## 11. Constraints & Assumptions

### 11.1 Constraints

- Fonnte berbayar — biaya per pesan
- DeepSeek API berbayar — biaya per token
- WhatsApp hanya mendukung teks (tidak ada gambar/dokumen via Fonnte MVP)
- Nomor WhatsApp harus terverifikasi Meta Business
- SQLite tidak cocok untuk high-concurrency production (cukup untuk skala instansi)

### 11.2 Assumptions

- Pengguna (mahasiswa/dosen) familiar menggunakan WhatsApp
- Knowledge base sudah mencakup > 80% pertanyaan umum
- Staf IT akan rutin memonitor dashboard saat jam kerja
- Koneksi internet server stabil untuk integrasi API eksternal

---

## 12. Risiko & Mitigasi

| Risiko | Dampak | Probabilitas | Mitigasi |
|---|---|---|---|
| DeepSeek API down / rate limit | Bot tidak bisa jawab | Low | Fallback ke pesan error + auto-escalate |
| Fonnte delay / webhook loss | Pesan user tidak diproses | Medium | Deduplication + log monitoring |
| AI halusinasi (jawab ngawur) | User dapat info salah, reputasi buruk | Medium | Strict system prompt + score threshold TF-IDF + escalate jika tidak yakin |
| Knowledge base tidak lengkap | Terlalu banyak eskalasi | Medium | Iterasi perbaruan knowledge berdasarkan data eskalasi |
| Database corruption | Data percakapan hilang | Low | Backup rutin + migration scripts |
| Nomor WA di-banned Meta | Bot offline total | Low | Patuhi WhatsApp Business Policy |

---

## 13. Rencana Rilis

### 13.1 Versi Saat Ini — v2.1.0 (In Progress)

- [x] v1.0: Bot dasar dengan AI + JSON storage
- [x] v2.0: Dashboard WebSocket + TF-IDF retrieval + 6 topik knowledge
- [x] v2.1: Migrasi JSON → SQLite (+25-100x performa database)

### 13.2 Versi Mendatang (Future Roadmap)

| Versi | Fitur |
|---|---|
| v2.2 | CRUD knowledge via dashboard (tidak perlu edit kode) |
| v2.3 | Multi-agent / multiple staff dengan assignment round-robin |
| v2.4 | Autentikasi dashboard (login admin) |
| v2.5 | Laporan & analitik (chart percakapan per hari, top topic, dll.) |
| v3.0 | Integrasi SSO (cek status akun langsung, reset password otomatis) |
| v3.1 | Intent classification multi-label untuk deteksi topik campuran |
| v3.2 | Support attachment (gambar/dokumen) via WhatsApp |

---

## 14. Lampiran

- **A. Dokumentasi Teknis:** `/docs/ARCHITECTURE.md`, `/docs/WORKFLOW.md`, `/docs/STRUCTURE.md`
- **B. Panduan Setup:** `/docs/README.md`
- **C. Panduan Migrasi:** `/docs/MIGRATION_GUIDE.md`
- **D. Changelog:** `/docs/CHANGELOG.md`

---

*Dokumen PRD ini disusun berdasarkan state project per 7 Mei 2026. Untuk pertanyaan atau revisi, hubungi Product Owner.*
