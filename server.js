const http = require('http');
const { WebSocketServer } = require('ws');
const app = require('./src/app');
const config = require('./src/config/env');
const db = require('./src/database/conversations');
const { setWebSocketServer, broadcast } = require('./src/utils/broadcast');

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Set WebSocket server untuk broadcast
setWebSocketServer(wss);

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('[WS] Dashboard terhubung');
  ws.send(JSON.stringify({ event: 'init', data: db.getAllConversations() }));
  ws.on('close', () => console.log('[WS] Dashboard terputus'));
});

// Start server
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`🤖 AI WhatsApp Bot berjalan di port ${PORT}`);
  console.log(`📡 Webhook : http://localhost:${PORT}/webhook`);
  console.log(`🖥️  API     : http://localhost:${PORT}/api/conversations`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard.html`);
});
