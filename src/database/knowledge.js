const Database = require('better-sqlite3');
const path = require('path');
const config = require('../config/env');

const DB_PATH = path.resolve(config.database.knowledge);
const db = new Database(DB_PATH);

// Buat tabel jika belum ada
db.exec(`
  CREATE TABLE IF NOT EXISTS knowledge (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topik TEXT NOT NULL,
    konten TEXT NOT NULL,
    aktif INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Seed data awal jika tabel kosong
const count = db.prepare('SELECT COUNT(*) as c FROM knowledge').get();
if (count.c === 0) {
  const insert = db.prepare('INSERT INTO knowledge (topik, konten) VALUES (?, ?)');

  const seedData = [
    [
      'Lupa Password Akun',
      `LUPA PASSWORD AKUN:
- Jika pengguna lupa password akun (email/SSO), silakan datang langsung ke:
  Gedung Induk Siti Walidah Lantai 5
- Wajib membawa KTM/Kartu Identitas
- Password tidak dapat direset melalui chatbot`
    ],
    [
      'Verifikasi 2 Langkah (2FA)',
      `VERIFIKASI 2 LANGKAH (2FA):
- Jika mengalami kendala verifikasi 2 langkah, silakan mengisi form berikut:
  https://docs.google.com/forms/d/e/1FAIpQLSequkIeXRtnA6M9p2L6Rh5cPKeUVG0IpvQkNvpSRY637NFipw/viewform
- Tim IT akan membantu proses penautan nomor HP`
    ],
    [
      'Login Email Kampus',
      `LOGIN EMAIL KAMPUS:
- Format email mahasiswa: nim@student.ums.ac.id
- Format email dosen/staf: nama@ums.ac.id
- Akses melalui Gmail atau mail.ums.ac.id
- Password email sama dengan password SSO kampus
- Jika lupa password, silakan datang ke Gedung Induk Siti Walidah Lt. 5`
    ],
    [
      'Login MyAkademik',
      `LOGIN MYAKADEMIK (STAR, MySkripsi, MBKM, Wisuda):
1. Buka myakademik.ums.ac.id
2. Pilih menu "Login SSO"
3. Masukkan NIM
4. Masukkan password akun
5. Klik login
6. Setelah masuk, pilih menu sesuai kebutuhan:
   - STAR → pilih menu STAR
   - MySkripsi → pilih menu MySkripsi
   - MBKM → pilih menu MyMBKM
   - Wisuda → pilih menu Wisuda`
    ],
    [
      'Login STAR Parent',
      `LOGIN STAR PARENT:
1. Buka star-parent.ums.ac.id
2. Masukkan username: NIM
3. Masukkan password: NIM
4. Klik login`
    ],
    [
      'WiFi Kampus',
      `WIFI KAMPUS:
1. Aktifkan WiFi pada perangkat Anda
2. Pastikan berada di area jangkauan jaringan kampus
3. Pilih jaringan: UMS WIFI
4. Masukkan password: ums.wifi`
    ],
    [
      'SPADA',
      `SPADA (Sistem Pembelajaran Daring):
Cara akses:
1. Buka spada12.ums.ac.id
2. Klik "Login CAS"
3. Masukkan akun SSO kampus
4. Klik login

Kendala di SPADA:
- Mahasiswa tidak bisa akses kelas/materi → hubungi dosen mata kuliah terkait
- Dosen tidak bisa memasukkan/mengelola konten → datang ke LPPIP UMS di Gedung Siti Walidah Lantai 4`
    ]
  ];

  for (const [topik, konten] of seedData) {
    insert.run(topik, konten);
  }

  console.log('[DB] Knowledge base berhasil di-seed');
}

// Ambil semua knowledge yang aktif
function getAllKnowledge() {
  return db.prepare('SELECT topik, konten FROM knowledge WHERE aktif = 1').all();
}

// Ambil sebagai string untuk system prompt
function getKnowledgeAsString() {
  const rows = getAllKnowledge();
  return rows.map(r => r.konten).join('\n\n');
}

// CRUD untuk dashboard (opsional nanti)
function addKnowledge(topik, konten) {
  return db.prepare('INSERT INTO knowledge (topik, konten) VALUES (?, ?)').run(topik, konten);
}

function updateKnowledge(id, topik, konten) {
  return db.prepare('UPDATE knowledge SET topik = ?, konten = ? WHERE id = ?').run(topik, konten, id);
}

function deleteKnowledge(id) {
  return db.prepare('UPDATE knowledge SET aktif = 0 WHERE id = ?').run(id);
}

module.exports = { 
  getAllKnowledge, 
  getKnowledgeAsString, 
  addKnowledge, 
  updateKnowledge, 
  deleteKnowledge 
};
