import type { Server as HttpServer } from "http";
import { randomUUID } from "crypto";
import { WebSocketServer } from "ws";
import type { PrismaClient } from "@prisma/client";
import { verifyAccessToken } from "@auth/auth.js";

const HEARTBEAT_MS = 30000;
const SNAPSHOT_DEBOUNCE_MS = 250;

export function attachPresenceServer(server: HttpServer, prisma: PrismaClient) {
  const wss = new WebSocketServer({ server, path: "/ws" });
  const online = new Map<string, { userId?: number | null; trackId?: number | null }>();
  let snapshotTimer: NodeJS.Timeout | null = null;

  function broadcast(payload: unknown) {
    const message = JSON.stringify(payload);
    for (const client of wss.clients) {
      if (client.readyState === client.OPEN) {
        client.send(message);
      }
    }
  }

  async function sendOnlineSnapshot() {
    const userIds = Array.from(online.values())
      .map((entry) => entry.userId)
      .filter((id): id is number => typeof id === "number" && Number.isFinite(id));

    const uniqueIds = Array.from(new Set(userIds));
    const users = uniqueIds.length
      ? await prisma.user.findMany({
          where: { id: { in: uniqueIds } },
          select: { id: true, email: true, name: true, avatar: true }
        })
      : [];

    const userMap = new Map(users.map((user) => [user.id, user]));

    broadcast({
      type: "online_snapshot",
      count: online.size,
      users: Array.from(online.entries()).map(([id, data]) => ({
        id: data.userId ?? id,
        trackId: data.trackId ?? null,
        profile: data.userId ? userMap.get(data.userId) ?? null : null
      }))
    });
  }

  function scheduleSnapshot() {
    if (snapshotTimer) return;
    snapshotTimer = setTimeout(async () => {
      snapshotTimer = null;
      try {
        await sendOnlineSnapshot();
      } catch {
        // ignore snapshot errors
      }
    }, SNAPSHOT_DEBOUNCE_MS);
  }

  wss.on("connection", (socket) => {
    const clientId = randomUUID();
    online.set(clientId, { userId: null, trackId: null });

    socket.on("message", (raw) => {
      try {
        const data = JSON.parse(raw.toString());
        if (data?.type === "identify" && typeof data?.token === "string") {
          const payload = verifyAccessToken(data.token);
          const entry = online.get(clientId);
          if (payload?.sub && entry) {
            const userId = Number(payload.sub);
            entry.userId = Number.isFinite(userId) ? userId : null;
            scheduleSnapshot();
          }
        }
        if (data?.type === "now_playing") {
          const entry = online.get(clientId);
          if (entry) {
            entry.trackId = Number(data.trackId) || null;
            scheduleSnapshot();
          }
        }
      } catch {
        // ignore malformed payloads
      }
    });

    socket.on("close", () => {
      online.delete(clientId);
      scheduleSnapshot();
    });

    socket.on("pong", () => {
      // heartbeat ok
    });

    scheduleSnapshot();
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
