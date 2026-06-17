const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const config = require('../config/env');

const DB_PATH = path.resolve(config.database.conversations);
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');

// Buat tabel jika belum ada
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

console.log('[DB] Conversations database initialized');

function deleteCompletedConversations() {
  const doneRows = db.prepare("SELECT phone FROM conversations WHERE status = 'done'").all();
  const deleteMessages = db.prepare('DELETE FROM messages WHERE phone = ?');
  const deleteConversation = db.prepare('DELETE FROM conversations WHERE phone = ?');

  for (const row of doneRows) {
    deleteMessages.run(row.phone);
    deleteConversation.run(row.phone);
  }

  if (doneRows.length) {
    console.log(`[DB] ${doneRows.length} completed conversations cleaned`);
  }
}

deleteCompletedConversations();

// Ambil semua percakapan (untuk dashboard)
function getAllConversations() {
  const conversations = db.prepare(`
    SELECT * FROM conversations 
    ORDER BY updatedAt DESC
  `).all();

  // Attach messages ke setiap conversation
  return conversations.map(convo => {
    const messages = db.prepare(`
      SELECT from_user as "from", text, time 
      FROM messages 
      WHERE phone = ? 
      ORDER BY time ASC
    `).all(convo.phone);

    return {
      ...convo,
      messages,
    };
  });
}

// Ambil satu percakapan by phone
function getConversation(phone) {
  const convo = db.prepare('SELECT * FROM conversations WHERE phone = ?').get(phone);
  if (!convo) return null;

  const messages = db.prepare(`
    SELECT from_user as "from", text, time 
    FROM messages 
    WHERE phone = ? 
    ORDER BY time ASC
  `).all(phone);

  return {
    ...convo,
    messages,
  };
}

// Tambah atau update percakapan
function upsertConversation(phone, name, status = 'ai') {
  const existing = db.prepare('SELECT * FROM conversations WHERE phone = ?').get(phone);
  const now = Date.now();

  if (!existing) {
    db.prepare(`
      INSERT INTO conversations (phone, name, status, menuState, selectedTopic, createdAt, updatedAt)
      VALUES (?, ?, ?, 'idle', NULL, ?, ?)
    `).run(phone, name || phone, status, now, now);
  } else {
    db.prepare(`
      UPDATE conversations 
      SET name = ?, updatedAt = ? 
      WHERE phone = ?
    `).run(name || existing.name, now, phone);
  }

  return getConversation(phone);
}

// Tambah pesan ke percakapan
function addMessage(phone, from, text) {
  const now = Date.now();
  
  db.prepare(`
    INSERT INTO messages (phone, from_user, text, time)
    VALUES (?, ?, ?, ?)
  `).run(phone, from, text, now);

  // Update updatedAt di conversations
  db.prepare(`
    UPDATE conversations 
    SET updatedAt = ? 
    WHERE phone = ?
  `).run(now, phone);
}

// Update status percakapan
function updateStatus(phone, status) {
  const now = Date.now();
  db.prepare(`
    UPDATE conversations 
    SET status = ?, updatedAt = ? 
    WHERE phone = ?
  `).run(status, now, phone);
}

// Set state menu (setelah user pilih nomor menu)
function setMenuState(phone, menuState, selectedTopic = null) {
  const now = Date.now();
  db.prepare(`
    UPDATE conversations 
    SET menuState = ?, selectedTopic = ?, updatedAt = ? 
    WHERE phone = ?
  `).run(menuState, selectedTopic, now, phone);
}

// Reset state menu ke idle (saat selesai / mulai baru)
function resetMenuState(phone) {
  const now = Date.now();
  db.prepare(`
    UPDATE conversations 
    SET menuState = 'idle', selectedTopic = NULL, updatedAt = ? 
    WHERE phone = ?
  `).run(now, phone);
}

function deleteConversation(phone) {
  db.prepare('DELETE FROM messages WHERE phone = ?').run(phone);
  return db.prepare('DELETE FROM conversations WHERE phone = ?').run(phone);
}

module.exports = {
  getAllConversations,
  getConversation,
  upsertConversation,
  addMessage,
  updateStatus,
  setMenuState,
  resetMenuState,
  deleteConversation,
};
