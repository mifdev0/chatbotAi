const Database = require('better-sqlite3');
const path = require('path');

// Path ke database conversations
const DB_PATH = path.resolve(__dirname, '../data/conversations.db');
console.log(`Database path: ${DB_PATH}`);

const db = new Database(DB_PATH);

console.log('\n=== SEBELUM PENGHAPUSAN ===');
const before = db.prepare("SELECT COUNT(*) as count FROM conversations").get();
console.log(`Total conversations: ${before.count}`);

// Hapus semua data conversations
console.log('\n=== MENGHAPUS SEMUA DATA ===');
const result = db.prepare("DELETE FROM conversations").run();
console.log(`✓ Berhasil menghapus ${result.changes} conversations`);

// Reset auto increment counter
console.log('\nMereset ID counter...');
db.exec("DELETE FROM sqlite_sequence WHERE name='conversations'");
console.log('✓ ID counter direset');

// Vacuum database untuk membersihkan ruang
console.log('\nMembersihkan database...');
db.exec('VACUUM');
console.log('✓ Database dibersihkan');

console.log('\n=== SETELAH PENGHAPUSAN ===');
const after = db.prepare("SELECT COUNT(*) as count FROM conversations").get();
console.log(`Total conversations: ${after.count}`);

db.close();
console.log('\n✓ Selesai! Database conversations sudah kosong.');
