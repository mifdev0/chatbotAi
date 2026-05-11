# 📁 Project Structure Documentation

## Overview

Project ini menggunakan **modular architecture** dengan separation of concerns yang jelas. Setiap folder punya tanggung jawab spesifik.

---

## 📂 Folder Structure

```
whatsapp-ai-bot/
├── src/                    # Source code
│   ├── config/            # Configuration files
│   ├── database/          # Database handlers
│   ├── services/          # Business logic services
│   ├── routes/            # Express routes
│   ├── utils/             # Utility functions
│   └── app.js             # Express app setup
├── public/                # Static files (dashboard)
├── data/                  # Database files (SQLite)
├── docs/                  # Documentation
├── scripts/               # Utility scripts
├── server.js              # Entry point
├── package.json
└── .env                   # Environment variables
```

---

## 📄 File Descriptions

### **Root Files**

#### `server.js`
- **Purpose**: Entry point aplikasi
- **Responsibilities**:
  - Create HTTP server
  - Setup WebSocket server
  - Start listening on port
- **Dependencies**: `src/app.js`, `src/config/env.js`

#### `package.json`
- **Purpose**: NPM configuration
- **Scripts**:
  - `npm start` - Production mode
  - `npm run dev` - Development mode (nodemon)
  - `npm run migrate` - Migrate JSON to SQLite

---

### **src/config/**

#### `env.js`
- **Purpose**: Centralized configuration
- **Exports**:
  - `config.port` - Server port
  - `config.ai` - AI API settings (DeepSeek)
  - `config.fonnte` - Fonnte API settings
  - `config.database` - Database paths
- **Features**:
  - Load & validate environment variables
  - Exit if required vars missing
  - Default values

---

### **src/database/**

#### `conversations.js`
- **Purpose**: Conversation database handler
- **Database**: SQLite (`data/conversations.db`)
- **Tables**:
  - `conversations` - User conversations
  - `messages` - Chat messages
- **Functions**:
  - `getAllConversations()` - Get all with messages
  - `getConversation(phone)` - Get single conversation
  - `upsertConversation(phone, name, status)` - Create/update
  - `addMessage(phone, from, text)` - Add message
  - `updateStatus(phone, status)` - Update status
  - `setMenuState(phone, state, topic)` - Set menu state
  - `resetMenuState(phone)` - Reset to idle

#### `knowledge.js`
- **Purpose**: Knowledge base handler
- **Database**: SQLite (`data/knowledge.db`)
- **Table**: `knowledge` (topik, konten, aktif)
- **Functions**:
  - `getAllKnowledge()` - Get all active knowledge
  - `getKnowledgeAsString()` - Format for prompt
  - `addKnowledge(topik, konten)` - Add new
  - `updateKnowledge(id, topik, konten)` - Update
  - `deleteKnowledge(id)` - Soft delete
- **Features**:
  - Auto-seed on first run
  - 8 default topics

#### `migrations/migrate-to-sqlite.js`
- **Purpose**: Migrate data from JSON to SQLite
- **Usage**: `npm run migrate`
- **Features**:
  - Read `data.json`
  - Create SQLite tables
  - Import conversations & messages
  - Transaction-based (rollback on error)

---

### **src/services/**

#### `ai.js`
- **Purpose**: DeepSeek AI integration
- **Functions**:
  - `askAI(messages, topicContext)` - Get AI response
- **Features**:
  - System prompt injection
  - Context from knowledge base
  - Temperature 0.2 (consistent)
  - Send last 6 messages
  - Auto-escalation if no context

#### `whatsapp.js`
- **Purpose**: Fonnte integration
- **Functions**:
  - `sendMessage(target, message)` - Send WhatsApp message
- **Features**:
  - Auto-format target
  - Error handling
  - API token auth

#### `retriever.js`
- **Purpose**: Knowledge retrieval (TF-IDF)
- **Functions**:
  - `retrieve(userMessage, topN)` - Get relevant knowledge
  - `invalidateCache()` - Clear cache
- **Features**:
  - TF-IDF similarity scoring
  - Cache index (5 min TTL)
  - Score threshold (1.0)
  - Return top 2 knowledge

---

### **src/routes/**

#### `webhook.js`
- **Purpose**: Handle WhatsApp webhook
- **Route**: `POST /webhook`
- **Flow**:
  1. Validate message (not from bot, type=chat)
  2. Deduplicate message ID
  3. Save to database
  4. Check conversation status
  5. Handle menu state (idle/topic_selected)
  6. Retrieve knowledge
  7. Call AI
  8. Send response
  9. Broadcast to dashboard
- **Features**:
  - Menu navigation
  - Auto-escalation
  - Done detection (survey link)

#### `api.js`
- **Purpose**: REST API for dashboard
- **Routes**:
  - `GET /api/conversations` - List all
  - `GET /api/conversations/:phone` - Get single
  - `POST /api/conversations/:phone/reply` - Staff reply
  - `PATCH /api/conversations/:phone/status` - Update status
- **Features**:
  - CRUD operations
  - WebSocket broadcast on changes

---

### **src/utils/**

#### `menu.js`
- **Purpose**: Menu builder & validator
- **Exports**:
  - `MENU_ITEMS` - Array of menu items
  - `buildMenuText()` - Generate menu text
  - `getMenuItem(index)` - Get item by number
  - `isValidMenuChoice(input)` - Validate input
- **Menu Items**: 8 topics + 1 escalation

#### `broadcast.js`
- **Purpose**: WebSocket broadcast helper
- **Functions**:
  - `setWebSocketServer(wss)` - Set WS server
  - `broadcast(event, data)` - Send to all clients
- **Events**:
  - `init` - Initial data
  - `message` - New message
  - `status_change` - Status update
  - `escalated_message` - Escalated message

---

### **src/app.js**

- **Purpose**: Express app configuration
- **Middleware**:
  - `express.json()` - Parse JSON body
  - CORS headers
  - Static files (`public/`)
- **Routes**:
  - `/webhook` - Webhook routes
  - `/api/*` - API routes
  - `/` - Health check
- **Features**:
  - Modular route mounting
  - Error handling
  - Static file serving

---

## 🔄 Data Flow

### **Incoming Message Flow**

```
WhatsApp → Fonnte → POST /webhook
  ↓
webhook.js (validate, deduplicate)
  ↓
conversations.js (save to DB)
  ↓
menu.js (check menu state)
  ↓
retriever.js (get knowledge)
  ↓
ai.js (call DeepSeek API)
  ↓
whatsapp.js (send response)
  ↓
broadcast.js (update dashboard)
```

### **Dashboard Flow**

```
Dashboard (browser) → WebSocket connection
  ↓
server.js (WebSocket handler)
  ↓
broadcast.js (send updates)
  ↓
Dashboard (real-time update)
```

### **API Flow**

```
Dashboard → POST /api/conversations/:phone/reply
  ↓
api.js (validate, save)
  ↓
conversations.js (add message)
  ↓
whatsapp.js (send to user)
  ↓
broadcast.js (update all clients)
```

---

## 🎯 Design Principles

### **1. Separation of Concerns**
- Database logic → `database/`
- Business logic → `services/`
- HTTP routes → `routes/`
- Utilities → `utils/`

### **2. Single Responsibility**
- Each file has ONE clear purpose
- Easy to test & maintain

### **3. Dependency Injection**
- Config centralized in `config/env.js`
- Easy to mock for testing

### **4. Modularity**
- Each module can be replaced independently
- Example: Swap DeepSeek with OpenAI → only edit `services/ai.js`

### **5. Scalability**
- Easy to add new routes
- Easy to add new services
- Easy to add new database tables

---

## 🔧 Adding New Features

### **Add New Menu Item**
1. Edit `src/utils/menu.js` → add to `MENU_ITEMS`
2. Add knowledge to `src/database/knowledge.js` → `seedData`

### **Add New API Endpoint**
1. Edit `src/routes/api.js` → add route
2. Use `db` functions from `src/database/conversations.js`

### **Add New Service**
1. Create `src/services/new-service.js`
2. Export functions
3. Import in routes/webhook

### **Add New Database Table**
1. Edit `src/database/conversations.js` or create new file
2. Add CREATE TABLE in `db.exec()`
3. Add CRUD functions

---

## 📊 Database Schema

### **conversations**
```sql
phone TEXT PRIMARY KEY
name TEXT NOT NULL
status TEXT DEFAULT 'ai'          -- ai | escalated | done
menuState TEXT DEFAULT 'idle'     -- idle | topic_selected
selectedTopic TEXT
createdAt INTEGER NOT NULL
updatedAt INTEGER NOT NULL
```

### **messages**
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
phone TEXT NOT NULL               -- FK to conversations
from_user TEXT NOT NULL           -- user | ai | staff | system
text TEXT NOT NULL
time INTEGER NOT NULL
```

### **knowledge**
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
topik TEXT NOT NULL
konten TEXT NOT NULL
aktif INTEGER DEFAULT 1
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
```

---

## 🚀 Performance Optimizations

### **Database**
- ✅ Indexes on frequently queried columns
- ✅ SQLite for fast local queries
- ✅ Prepared statements (prevent SQL injection)

### **Caching**
- ✅ TF-IDF index cached (5 min TTL)
- ✅ Knowledge base cached in memory

### **Concurrency**
- ✅ SQLite handles concurrent reads/writes
- ✅ Message deduplication (Set with TTL)

---

## 🔒 Security

### **Environment Variables**
- ✅ API keys in `.env` (not committed)
- ✅ Validation on startup

### **Input Validation**
- ✅ Message type check (only text)
- ✅ Deduplicate message IDs
- ✅ Sanitize user input

### **Database**
- ✅ Prepared statements (no SQL injection)
- ✅ Foreign key constraints

---

## 📝 Maintenance

### **Backup Database**
```bash
cp data/conversations.db data/conversations.db.backup
cp data/knowledge.db data/knowledge.db.backup
```

### **View Database**
```bash
sqlite3 data/conversations.db
sqlite> SELECT * FROM conversations LIMIT 5;
```

### **Clear Cache**
```bash
# Restart server to clear TF-IDF cache
npm start
```

---

**This structure is production-ready, scalable, and maintainable! 🚀**
