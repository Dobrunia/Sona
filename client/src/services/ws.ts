import { useAuthStore } from "@/stores/auth";

export type OnlineUser = {
  id: string | number;
  trackId: number | null;
  profile: {
    id: number;
    email: string;
    name?: string | null;
    avatar?: string | null;
  } | null;
};

type OnlineSnapshot = {
  type: "online_snapshot";
  count: number;
  users: OnlineUser[];
};

type WSMessage = OnlineSnapshot;

const WS_URL = import.meta.env.VITE_WS_URL ?? "ws://localhost:4000/ws";

export function connectPresence(
  onSnapshot: (snapshot: OnlineSnapshot) => void,
  onError: () => void
) {
  const auth = useAuthStore();
  const socket = new WebSocket(WS_URL);

  socket.addEventListener("open", () => {
    if (auth.accessToken) {
      socket.send(JSON.stringify({ type: "identify", token: auth.accessToken }));
    }
  });

  socket.addEventListener("message", (event) => {
    try {
      const data = JSON.parse(event.data) as WSMessage;
      if (data.type === "online_snapshot") {
        onSnapshot(data);
      }
    } catch {
      // ignore
    }
  });

  socket.addEventListener("error", () => onError());

  return socket;
}
