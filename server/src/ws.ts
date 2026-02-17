import type { Server as HttpServer } from "http";
import { randomUUID } from "crypto";
import { WebSocketServer } from "ws";

const HEARTBEAT_MS = 30000;

export function attachPresenceServer(server: HttpServer) {
  const wss = new WebSocketServer({ server, path: "/ws" });
  const online = new Map<string, { trackId?: number | null }>();

  function broadcast(payload: unknown) {
    const message = JSON.stringify(payload);
    for (const client of wss.clients) {
      if (client.readyState === client.OPEN) {
        client.send(message);
      }
    }
  }

  function sendOnlineSnapshot() {
    broadcast({
      type: "online_snapshot",
      count: online.size,
      users: Array.from(online.entries()).map(([id, data]) => ({
        id,
        trackId: data.trackId ?? null
      }))
    });
  }

  wss.on("connection", (socket) => {
    const clientId = randomUUID();
    online.set(clientId, { trackId: null });

    socket.on("message", (raw) => {
      try {
        const data = JSON.parse(raw.toString());
        if (data?.type === "now_playing") {
          const entry = online.get(clientId);
          if (entry) {
            entry.trackId = Number(data.trackId) || null;
            sendOnlineSnapshot();
          }
        }
      } catch {
        // ignore malformed payloads
      }
    });

    socket.on("close", () => {
      online.delete(clientId);
      sendOnlineSnapshot();
    });

    socket.on("pong", () => {
      // heartbeat ok
    });

    sendOnlineSnapshot();
  });

  const interval = setInterval(() => {
    for (const socket of wss.clients) {
      if (socket.readyState === socket.OPEN) {
        socket.ping();
      }
    }
  }, HEARTBEAT_MS);

  wss.on("close", () => clearInterval(interval));

  return {
    onlineCount: () => online.size,
    snapshot: () => Array.from(online.entries())
  };
}
