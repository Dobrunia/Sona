import { createApp } from "vue";
import { createPinia } from "pinia";
import { DefaultApolloClient } from "@vue/apollo-composable";
import App from "./App.vue";
import { vuetify } from "./plugins/vuetify";
import { apolloClient } from "./plugins/apollo";
import { router } from "./router";
import { watch } from "vue";
import { connectPresence, sendNowPlaying } from "@/services/ws";
import { usePresenceStore } from "@/stores/presence";
import { usePlayerStore } from "@/stores/player";
import { useAuthStore } from "@/stores/auth";
import { refreshTokens } from "@/services/auth";
import "./styles/main.css";

const app = createApp(App);

app.use(createPinia());
app.use(vuetify);
app.use(router);
app.provide(DefaultApolloClient, apolloClient);

app.mount("#app");

const auth = useAuthStore();

async function boot() {
  if (auth.refreshToken) {
    await refreshTokens().catch(() => null);
  }

  const presence = usePresenceStore();
  connectPresence(
    (snapshot) => presence.update(snapshot.count, snapshot.users),
    () => presence.update(0, [])
  );

  const player = usePlayerStore();
  watch(
    () => player.current,
    (track) => sendNowPlaying(track ? Number(track.id) : null),
    { immediate: true }
  );
}

boot();
