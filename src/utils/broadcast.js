let wss = null;

function setWebSocketServer(webSocketServer) {
  wss = webSocketServer;
}

function broadcast(event, data) {
  if (!wss) return;
  
  const payload = JSON.stringify({ event, data });
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(payload);
    }
  });
}

module.exports = {
  setWebSocketServer,
  broadcast,
};
