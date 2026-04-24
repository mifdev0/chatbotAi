const fs = require('fs');
const Database = require('better-sqlite3');
const path = require('path');

const JSON_FILE = path.join(__dirname, '../../../data.json');
const DB_PATH = path.join(__dirname, '../../../data/conversations.db');

console.log('🔄 Starting migration from JSON to SQLite...\n');

// Cek apakah data.json ada
if (!fs.existsSync(JSON_FILE)) {
  console.log('❌ data.json not found. Nothing to migrate.');
  process.exit(0);
}

// Load data dari JSON
const jsonData = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));
const conversations = jsonData.conversations || {};

if (Object.keys(conversations).length === 0) {
  console.log('✅ data.json is empty. Nothing to migrate.');
  process.exit(0);
}

// Connect ke SQLite
const db = new Database(DB_PATH);

// Buat tabel (jika belum ada)
db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    phone TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'ai',
    menuState TEXT DEFAULT 'idle',
    selectedTopic TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT NOT NULL,
    from_user TEXT NOT NULL,
    text TEXT NOT NULL,
    time INTEGER NOT NULL,
    FOREIGN KEY (phone) REFERENCES conversations(phone) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_messages_phone ON messages(phone);
  CREATE INDEX IF NOT EXISTS idx_messages_time ON messages(time);
  CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
  CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updatedAt);
`);

// Prepare statements
const insertConvo = db.prepare(`
  INSERT OR REPLACE INTO conversations (phone, name, status, menuState, selectedTopic, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const insertMsg = db.prepare(`
  INSERT INTO messages (phone, from_user, text, time)
  VALUES (?, ?, ?, ?)
`);

// Migrate dalam transaction
const migrate = db.transaction(() => {
  let convoCount = 0;
  let msgCount = 0;

  for (const phone in conversations) {
    const convo = conversations[phone];

    // Insert conversation
    insertConvo.run(
      convo.phone,
      convo.name || phone,
      convo.status || 'ai',
      convo.menuState || 'idle',
      convo.selectedTopic || null,
      convo.createdAt || Date.now(),
      convo.updatedAt || Date.now()
    );
    convoCount++;

    // Insert messages
    if (convo.messages && Array.isArray(convo.messages)) {
      for (const msg of convo.messages) {
        insertMsg.run(
          phone,
          msg.from,
          msg.text,
          msg.time || Date.now()
        );
        msgCount++;
      }
    }
  }

  return { convoCount, msgCount };
});

// Run migration
try {
  const result = migrate();
  console.log(`✅ Migration completed successfully!`);
  console.log(`   - ${result.convoCount} conversations migrated`);
  console.log(`   - ${result.msgCount} messages migrated`);
  console.log(`\n📁 Database saved to: ${DB_PATH}`);
  console.log(`📁 Backup available at: data.json.backup`);
} catch (err) {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
}

db.close();
