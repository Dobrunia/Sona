import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import FavoritesView from "@/views/FavoritesView.vue";
import UploadView from "@/views/UploadView.vue";
import OnlineView from "@/views/OnlineView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView
  },
  {
    path: "/favorites",
    name: "favorites",
    component: FavoritesView
  },
  {
    path: "/upload",
    name: "upload",
    component: UploadView
  },
  {
    path: "/online",
    name: "online",
    component: OnlineView
  }
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});
