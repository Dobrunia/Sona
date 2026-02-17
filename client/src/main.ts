import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { vuetify } from "./plugins/vuetify";
import { apolloClients } from "./plugins/apollo";
import "./styles/main.css";

const app = createApp(App);

app.use(createPinia());
app.use(vuetify);
app.provide("apollo", apolloClients);

app.mount("#app");
