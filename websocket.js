const WebSocket = require("ws");
const jwt = require("jsonwebtoken");

// Map of userId -> Set of active WebSocket connections
const userConnections = new Map();

function createWebSocketServer(server) {
  const wss = new WebSocket.Server({ server, path: "/ws" });

  wss.on("connection", (ws, req) => {
    // Extract token from query string: /ws?token=<jwt>
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get("token");

    if (!token) {
      ws.close(4001, "Unauthorized: No token provided");
      return;
    }

    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (err) {
      ws.close(4001, "Unauthorized: Invalid token");
      return;
    }

    // Register the connection under this user
    if (!userConnections.has(userId)) {
      userConnections.set(userId, new Set());
    }
    userConnections.get(userId).add(ws);

    ws.on("close", () => {
      const connections = userConnections.get(userId);
      if (connections) {
        connections.delete(ws);
        if (connections.size === 0) {
          userConnections.delete(userId);
        }
      }
    });

    ws.on("error", (err) => {
      console.error(`WebSocket error for user ${userId}:`, err.message);
    });

    // Acknowledge successful connection
    ws.send(JSON.stringify({ type: "connected", message: "WebSocket authenticated" }));
  });

  return wss;
}

/**
 * Send a notification to a specific user (all their active connections).
 * Disconnected users are silently skipped.
 */
function notifyUser(userId, payload) {
  const connections = userConnections.get(String(userId));
  if (!connections || connections.size === 0) return;

  const message = JSON.stringify(payload);
  connections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

module.exports = { createWebSocketServer, notifyUser };
