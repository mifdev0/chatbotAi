const Database = require('better-sqlite3');
const path = require('path');

// Path ke database knowledge
const DB_PATH = path.resolve(__dirname, '../data/knowledge.db');
const db = new Database(DB_PATH);

console.log('Memeriksa data di database...');

// Cek data yang ada
const allData = db.prepare("SELECT * FROM knowledge").all();
console.log(`Total data: ${allData.length}`);

// Tampilkan data yang akan dihapus (Generic keywords)
const keywords = ['Internal', 'Rahasia', 'Private'];
const placeholders = keywords.map(() => "(topik LIKE ? OR konten LIKE ?)").join(' OR ');
const params = [];
keywords.forEach(k => {
  params.push(`%${k}%`, `%${k}%`);
});

const toDelete = db.prepare(`SELECT * FROM knowledge WHERE ${placeholders}`).all(...params);
console.log(`\nData sensitif yang ditemukan: ${toDelete.length}`);
toDelete.forEach(row => {
  console.log(`- ID: ${row.id}, Topik: ${row.topik}`);
});

// Hapus data
console.log('\nMenghapus data sensitif...');
let totalChanges = 0;
keywords.forEach(k => {
  const res = db.prepare("DELETE FROM knowledge WHERE topik LIKE ? OR konten LIKE ?").run(`%${k}%`, `%${k}%`);
  totalChanges += res.changes;
});

console.log(`✓ Berhasil menghapus total ${totalChanges} baris`);

db.close();
console.log('\n✓ Selesai!');
