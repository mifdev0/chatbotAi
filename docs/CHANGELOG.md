# Changelog

## [2.1.0] - 2026-04-20

### 🚀 Major Changes
- **Migrated from JSON to SQLite** for conversation storage
  - 10-100x faster query performance
  - Safe concurrent access (no more race conditions)
  - Support for complex queries and analytics
  - Automatic indexing for optimal performance

### ✨ Added
- `conversations.db` - SQLite database for conversations
- `migrate-to-sqlite.js` - Migration script from JSON to SQLite
- `MIGRATION_GUIDE.md` - Complete migration documentation
- `.gitignore` - Ignore database files and sensitive data
- Database indexes for faster queries
- Transaction support for data integrity

### 🔧 Changed
- `db.js` - Rewritten to use SQLite instead of JSON
- `package.json` - Added `migrate` script
- `README.md` - Updated with SQLite information
- `nodemon` config - Ignore `conversations.db` changes

### 📊 Database Schema
```sql
-- conversations table
phone (PK), name, status, menuState, selectedTopic, createdAt, updatedAt

-- messages table
id (PK), phone (FK), from_user, text, time
```

### 🔄 Migration
Run `npm run migrate` to migrate existing data from `data.json` to SQLite.

### 📝 Notes
- `data.json` is now deprecated (use `conversations.db`)
- Automatic backup to `data.json.backup` during migration
- All API endpoints remain the same (backward compatible)

---

## [2.0.0] - Previous Version

### Features
- WhatsApp Bot with AI (DeepSeek)
- Menu-based navigation
- Knowledge base with TF-IDF retrieval
- Real-time dashboard
- Auto-escalation to staff
- State management
- JSON-based storage (deprecated in v2.1.0)
