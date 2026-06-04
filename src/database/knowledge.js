const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const config = require('../config/env');

const DB_PATH = path.resolve(config.database.knowledge);
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
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
- Jika Anda lupa password akun, silakan gunakan fitur "Lupa Password" di halaman login aplikasi.
- Ikuti instruksi yang dikirimkan ke email pemulihan Anda.
- Jika masih mengalami kendala, silakan hubungi tim administrasi di kantor pusat.`
    ],
    [
      'Verifikasi 2 Langkah (2FA)',
      `VERIFIKASI 2 LANGKAH (2FA):
- Verifikasi 2 langkah diperlukan untuk keamanan akun Anda.
- Anda dapat mengaktifkannya melalui menu Pengaturan Keamanan.
- Jika kehilangan akses ke perangkat autentikasi, silakan hubungi tim bantuan untuk reset 2FA.`
    ],
    [
      'Login Akun',
      `LOGIN AKUN LAYANAN:
- Pastikan Anda menggunakan username/email yang telah terdaftar.
- Masukkan password dengan benar (perhatikan huruf kapital).
- Jika akun Anda terkunci karena salah password berkali-kali, tunggu 30 menit atau hubungi bantuan.`
    ],
    [
      'Internet',
      `MASALAH KONEKSI INTERNET:
1. Pastikan perangkat Anda terhubung ke jaringan yang benar.
2. Jika menggunakan WiFi kantor/layanan, pastikan Anda telah memasukkan kredensial yang valid.
3. Coba restart koneksi WiFi pada perangkat Anda atau restart perangkat jika diperlukan.`
    ],
    [
      'Layanan Digital',
      `PANDUAN LAYANAN DIGITAL:
- Akses semua layanan melalui portal resmi kami.
- Gunakan peramban (browser) versi terbaru untuk pengalaman terbaik.
- Jika layanan tidak dapat diakses, periksa status pemeliharaan sistem pada halaman pengumuman.`
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
