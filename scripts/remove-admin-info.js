const Database = require('better-sqlite3');
const path = require('path');

// Path ke database knowledge
const DB_PATH = path.resolve(__dirname, '../data/knowledge.db');
const db = new Database(DB_PATH);

console.log('Menghapus data internal dari database...');

// Hapus data dengan topik "Info Internal"
const result = db.prepare("DELETE FROM knowledge WHERE topik = 'Info Internal'").run();

console.log(`✓ Berhasil menghapus ${result.changes} baris data`);

db.close();
console.log('✓ Selesai!');
