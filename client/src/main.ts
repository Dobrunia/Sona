import { createApp } from "vue";
import { createPinia } from "pinia";
import { DefaultApolloClient } from "@vue/apollo-composable";
import App from "./App.vue";
import { vuetify } from "./plugins/vuetify";
import { apolloClient } from "./plugins/apollo";
import { router } from "./router";
import { connectPresence } from "@/services/ws";
import { usePresenceStore } from "@/stores/presence";
import "./styles/main.css";

const app = createApp(App);

app.use(createPinia());
app.use(vuetify);
app.use(router);
app.provide(DefaultApolloClient, apolloClient);

app.mount("#app");

const presence = usePresenceStore();
connectPresence(
  (snapshot) => presence.update(snapshot.count, snapshot.users),
  () => presence.update(0, [])
);
