# 🤖 WhatsApp Bot IT Helpdesk UMS

Bot WhatsApp otomatis berbasis AI untuk IT Helpdesk UMS menggunakan **Fonnte** + **DeepSeek AI** + **Dashboard Real-time**.

## 📋 Quick Start

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env dengan API keys kamu

# Run server
npm start

# Development mode
npm run dev
```

## 📁 Project Structure

```
wabot-helpdesk-ums/
├── src/
│   ├── config/
│   │   └── env.js              # Environment configuration
│   ├── database/
│   │   ├── conversations.js    # Conversation database handler
│   │   ├── knowledge.js        # Knowledge base handler
│   │   └── migrations/
│   │       └── migrate-to-sqlite.js
│   ├── services/
│   │   ├── ai.js               # AI service (DeepSeek)
│   │   ├── whatsapp.js         # WhatsApp service (Fonnte)
│   │   └── retriever.js        # Knowledge retrieval (TF-IDF)
│   ├── routes/
│   │   ├── webhook.js          # Webhook routes
│   │   └── api.js              # REST API routes
│   ├── utils/
│   │   ├── menu.js             # Menu builder
│   │   └── broadcast.js        # WebSocket broadcast
│   └── app.js                  # Express app setup
├── public/
│   └── dashboard.html          # Admin dashboard
├── data/
│   ├── conversations.db        # SQLite database (conversations)
│   └── knowledge.db            # SQLite database (knowledge base)
├── docs/
│   ├── README.md               # Full documentation
│   ├── WORKFLOW.md             # Workflow & tech stack
│   ├── MIGRATION_GUIDE.md      # Migration guide
│   └── CHANGELOG.md            # Version history
├── scripts/
│   └── (future scripts)
├── .env                        # Environment variables
├── .gitignore
├── package.json
└── server.js                   # Entry point
```

## 🛠️ Tech Stack

- **Backend**: Node.js + Express.js
- **AI**: DeepSeek API (v4 Pro)
- **NLP**: Natural.js (TF-IDF)
- **Database**: SQLite (better-sqlite3)
- **Real-time**: WebSocket (ws)
- **WhatsApp API**: Fonnte

## ✨ Features

- ✅ AI-powered responses dengan DeepSeek
- ✅ Knowledge base dengan TF-IDF retrieval
- ✅ Menu interaktif (8 topik)
- ✅ Dashboard real-time monitoring
- ✅ Auto-escalation ke staf IT
- ✅ State management (idle/topic_selected)
- ✅ SQLite database (fast & safe)

## 📚 Documentation

Dokumentasi lengkap ada di folder `docs/`:

- **[docs/README.md](docs/README.md)** - Setup lengkap & troubleshooting
- **[docs/WORKFLOW.md](docs/WORKFLOW.md)** - Workflow & alur sistem
- **[docs/MIGRATION_GUIDE.md](docs/MIGRATION_GUIDE.md)** - Migration JSON → SQLite
- **[docs/CHANGELOG.md](docs/CHANGELOG.md)** - Version history

## 🚀 Deployment

### Railway (Recommended)
```bash
railway login
railway up
```

### Render / Fly.io
Push ke GitHub, connect repository, set environment variables.

## 📞 Support

- Email: ithelpdesk@ums.ac.id
- GitHub Issues: [Create Issue](https://github.com/your-repo/issues)

---

**Made with ❤️ by IT Helpdesk UMS**

*Fun Fact: Pacar admin yang membuat sistem ini bernama Eldina Nurdiana 😄*
