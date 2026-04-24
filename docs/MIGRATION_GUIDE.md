# 🔄 Migration Guide: JSON to SQLite

## Kenapa Migrate?

### ❌ Masalah JSON File (data.json)
- **Performance**: Harus load & parse seluruh file setiap kali read/write
- **Race Condition**: Kalau banyak user chat bersamaan, bisa corrupt data
- **Scalability**: File makin besar, makin lambat
- **No Query**: Gabisa filter/search efisien
- **Backup Risky**: Kalau file corrupt, semua data hilang

### ✅ Keuntungan SQLite (conversations.db)
- **Atomic Operations**: Aman dari race condition
- **Indexing**: Query cepat meski data banyak (10-100x lebih cepat)
- **Relational**: Bisa join conversations ↔ messages
- **Transaction**: Rollback kalau error
- **Concurrent Access**: Multiple read/write aman
- **Query Power**: Filter, sort, pagination, analytics

---

## Struktur Database Baru

### **Tabel: conversations**
```sql
CREATE TABLE conversations (
  phone TEXT PRIMARY KEY,           -- Nomor telepon (unique)
  name TEXT NOT NULL,               -- Nama user
  status TEXT DEFAULT 'ai',         -- ai | escalated | done
  menuState TEXT DEFAULT 'idle',    -- idle | topic_selected
  selectedTopic TEXT,               -- Topik yang dipilih
  createdAt INTEGER NOT NULL,       -- Timestamp created
  updatedAt INTEGER NOT NULL        -- Timestamp last update
);
```

### **Tabel: messages**
```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL,              -- Foreign key ke conversations
  from_user TEXT NOT NULL,          -- user | ai | staff | system
  text TEXT NOT NULL,               -- Isi pesan
  time INTEGER NOT NULL,            -- Timestamp
  FOREIGN KEY (phone) REFERENCES conversations(phone) ON DELETE CASCADE
);
```

### **Indexes**
```sql
CREATE INDEX idx_messages_phone ON messages(phone);
CREATE INDEX idx_messages_time ON messages(time);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_updated ON conversations(updatedAt);
```

---

## Cara Migration

### **Step 1: Backup Data Lama**
```bash
# Otomatis di-backup saat migration
# Tapi bisa manual juga:
cp data.json data.json.backup
```

### **Step 2: Jalankan Migration**
```bash
npm run migrate
```

**Output:**
```
🔄 Starting migration from JSON to SQLite...

✅ Migration completed successfully!
   - 15 conversations migrated
   - 127 messages migrated

📁 Database saved to: conversations.db
📁 Backup available at: data.json.backup
```

### **Step 3: Restart Server**
```bash
npm start
# atau
npm run dev
```

---

## Perbandingan Performance

### **Query: Get All Conversations**

**JSON (data.json):**
```javascript
// Harus load & parse seluruh file
const data = JSON.parse(fs.readFileSync('data.json'));
const convos = Object.values(data.conversations);
// Time: ~50ms untuk 1000 conversations
```

**SQLite (conversations.db):**
```javascript
// Query langsung dari database
const convos = db.prepare('SELECT * FROM conversations').all();
// Time: ~2ms untuk 1000 conversations (25x lebih cepat!)
```

### **Query: Get Escalated Conversations**

**JSON:**
```javascript
// Harus load semua, lalu filter
const data = JSON.parse(fs.readFileSync('data.json'));
const escalated = Object.values(data.conversations)
  .filter(c => c.status === 'escalated');
// Time: ~50ms
```

**SQLite:**
```javascript
// Query dengan WHERE clause + index
const escalated = db.prepare(
  'SELECT * FROM conversations WHERE status = ?'
).all('escalated');
// Time: ~0.5ms (100x lebih cepat!)
```

### **Concurrent Writes**

**JSON:**
```javascript
// ❌ Race condition!
// User A & B chat bersamaan → data corrupt
```

**SQLite:**
```javascript
// ✅ Atomic operations
// User A & B chat bersamaan → aman!
```

---

## Query Examples

### **Dashboard: Get Recent Conversations**
```javascript
const recent = db.prepare(`
  SELECT * FROM conversations 
  ORDER BY updatedAt DESC 
  LIMIT 20
`).all();
```

### **Analytics: Count by Status**
```javascript
const stats = db.prepare(`
  SELECT status, COUNT(*) as count 
  FROM conversations 
  GROUP BY status
`).all();
// Result: [
//   { status: 'ai', count: 45 },
//   { status: 'escalated', count: 12 },
//   { status: 'done', count: 33 }
// ]
```

### **Search: Find User by Name**
```javascript
const results = db.prepare(`
  SELECT * FROM conversations 
  WHERE name LIKE ? 
  ORDER BY updatedAt DESC
`).all('%John%');
```

### **Messages: Get Last 10 Messages**
```javascript
const messages = db.prepare(`
  SELECT * FROM messages 
  WHERE phone = ? 
  ORDER BY time DESC 
  LIMIT 10
`).all('628xxx');
```

---

## Rollback (Jika Ada Masalah)

### **Kembali ke JSON**

1. **Restore backup:**
```bash
cp data.json.backup data.json
```

2. **Revert db.js:**
```bash
git checkout db.js
# atau download versi lama dari backup
```

3. **Restart server:**
```bash
npm start
```

---

## FAQ

### **Q: Apakah data lama hilang?**
A: Tidak! Data lama tetap ada di `data.json.backup`

### **Q: Apakah harus migrate?**
A: Sangat disarankan untuk production. Untuk testing lokal, opsional.

### **Q: Berapa lama migration?**
A: Sangat cepat! ~1 detik untuk 1000 conversations.

### **Q: Apakah bisa rollback?**
A: Ya, tinggal restore `data.json.backup` dan revert `db.js`

### **Q: Apakah dashboard masih jalan?**
A: Ya! API endpoint sama persis, hanya backend yang berubah.

### **Q: Apakah perlu install library baru?**
A: Tidak! `better-sqlite3` sudah ada di `package.json`

---

## Maintenance

### **Backup Database**
```bash
# Backup conversations.db
cp conversations.db conversations.db.backup

# Atau pakai SQLite backup command
sqlite3 conversations.db ".backup conversations.db.backup"
```

### **View Database**
```bash
# Install SQLite CLI (jika belum)
# Windows: choco install sqlite
# Mac: brew install sqlite
# Linux: apt install sqlite3

# Open database
sqlite3 conversations.db

# Query
sqlite> SELECT COUNT(*) FROM conversations;
sqlite> SELECT * FROM conversations LIMIT 5;
sqlite> .exit
```

### **Optimize Database**
```bash
# Jalankan VACUUM untuk optimize
sqlite3 conversations.db "VACUUM;"
```

---

## Support

Jika ada masalah saat migration:
1. Cek `data.json.backup` masih ada
2. Cek error message di console
3. Cek permission folder (harus bisa write)
4. Hubungi developer

---

**Migration selesai! Database kamu sekarang lebih cepat, aman, dan scalable! 🚀**
