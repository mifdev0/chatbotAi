const Database = require('better-sqlite3');
const path = require('path');

// Path ke database knowledge
const DB_PATH = path.resolve(__dirname, '../data/knowledge.db');
const db = new Database(DB_PATH);

console.log('Memeriksa data di database...');

// Cek data yang ada
const allData = db.prepare("SELECT * FROM knowledge").all();
console.log(`Total data: ${allData.length}`);

// Tampilkan data yang akan dihapus
const toDelete = db.prepare("SELECT * FROM knowledge WHERE topik LIKE '%Admin%' OR konten LIKE '%Eldina%' OR konten LIKE '%pacar%'").all();
console.log(`\nData yang akan dihapus: ${toDelete.length}`);
toDelete.forEach(row => {
  console.log(`- ID: ${row.id}, Topik: ${row.topik}`);
});

// Hapus data
console.log('\nMenghapus data...');
const result1 = db.prepare("DELETE FROM knowledge WHERE topik LIKE '%Admin%'").run();
const result2 = db.prepare("DELETE FROM knowledge WHERE konten LIKE '%Eldina%'").run();
const result3 = db.prepare("DELETE FROM knowledge WHERE konten LIKE '%pacar%'").run();

console.log(`✓ Berhasil menghapus total ${result1.changes + result2.changes + result3.changes} baris`);

// Verifikasi
const remaining = db.prepare("SELECT * FROM knowledge WHERE topik LIKE '%Admin%' OR konten LIKE '%Eldina%' OR konten LIKE '%pacar%'").all();
console.log(`\nData tersisa yang mengandung kata kunci: ${remaining.length}`);

db.close();
console.log('\n✓ Selesai!');
