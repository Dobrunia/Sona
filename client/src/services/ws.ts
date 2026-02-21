import { watch } from "vue";
import { useAuthStore } from "@/stores/auth";

export type OnlineTrack = {
  id: number;
  title: string;
  artist?: string | null;
};

export type OnlineUser = {
  id: string | number;
  trackId: number | null;
  profile: {
    id: number;
    email: string;
    name?: string | null;
    avatar?: string | null;
  } | null;
  track: OnlineTrack | null;
};

type OnlineSnapshot = {
  type: "online_snapshot";
  count: number;
  users: OnlineUser[];
};

type WSMessage = OnlineSnapshot;

const WS_URL = import.meta.env.VITE_WS_URL ?? "ws://localhost:4000/ws";

let socket: WebSocket | null = null;

function send(data: unknown) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  }
}

export function sendNowPlaying(trackId: number | null) {
  send({ type: "now_playing", trackId });
}

function identify() {
  const auth = useAuthStore();
  if (auth.accessToken) {
    send({ type: "identify", token: auth.accessToken });
  }
}

export function connectPresence(
  onSnapshot: (snapshot: OnlineSnapshot) => void,
  onError: () => void
) {
  socket = new WebSocket(WS_URL);

  socket.addEventListener("open", () => identify());

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

  watch(() => useAuthStore().accessToken, (token) => {
    if (token) identify();
  });

  return socket;
}
