const Database = require('better-sqlite3');
const path = require('path');

// Path ke database knowledge
const DB_PATH = path.resolve(__dirname, '../data/knowledge.db');
console.log(`Database path: ${DB_PATH}`);

const db = new Database(DB_PATH);

console.log('\n=== SEBELUM PEMBERSIHAN ===');
const before = db.prepare("SELECT * FROM knowledge").all();
console.log(`Total data: ${before.length}\n`);
before.forEach(row => {
  console.log(`ID: ${row.id}`);
  console.log(`Topik: ${row.topik}`);
  console.log(`Konten: ${row.konten.substring(0, 100)}...`);
  console.log(`Aktif: ${row.aktif}`);
  console.log('---');
});

// Hapus berdasarkan ID jika ada (Generic keywords)
console.log('\n=== MENGHAPUS DATA SENSITIF ===');
const keywords = ['internal', 'rahasia', 'private'];
const idsToDelete = before
  .filter(row => 
    keywords.some(k => row.topik.toLowerCase().includes(k)) || 
    keywords.some(k => row.konten.toLowerCase().includes(k))
  )
  .map(row => row.id);

if (idsToDelete.length > 0) {
  console.log(`Menghapus ID: ${idsToDelete.join(', ')}`);
  idsToDelete.forEach(id => {
    db.prepare("DELETE FROM knowledge WHERE id = ?").run(id);
    console.log(`✓ Dihapus ID ${id}`);
  });
} else {
  console.log('Tidak ada data sensitif yang perlu dihapus');
}

// Vacuum database untuk membersihkan ruang
console.log('\nMembersihkan database...');
db.exec('VACUUM');

console.log('\n=== SETELAH PEMBERSIHAN ===');
const after = db.prepare("SELECT * FROM knowledge").all();
console.log(`Total data: ${after.length}\n`);
after.forEach(row => {
  console.log(`ID: ${row.id} - Topik: ${row.topik}`);
});

db.close();
console.log('\n✓ Selesai!');
