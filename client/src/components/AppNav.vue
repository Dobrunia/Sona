<template>
  <nav class="nav">
    <div class="bar">
      <router-link to="/" class="nav-link" :class="{ active: route.path === '/' }">
        [Home]
      </router-link>
      <span class="sep">|</span>
      <router-link to="/favorites" class="nav-link" :class="{ active: route.path === '/favorites' }">
        [Favorites]
      </router-link>
      <span class="sep">|</span>
      <router-link to="/upload" class="nav-link" :class="{ active: route.path === '/upload' }">
        [Upload]
      </router-link>
      <span class="sep">|</span>
      <router-link to="/online" class="nav-link" :class="{ active: route.path === '/online' }">
        [Online {{ presence.count }}]
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { usePresenceStore } from "@/stores/presence";

const route = useRoute();
const presence = usePresenceStore();
</script>

<style scoped>
.nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  background: var(--c-surface);
  border-top: var(--border-raised);
}

.bar {
  height: var(--nav-h);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--s-md);
  font-family: "Tahoma", "Arial", sans-serif;
  font-size: 12px;
}

.nav-link {
  color: var(--c-link);
  text-decoration: underline;
}

.nav-link:visited {
  color: var(--c-link);
}

.nav-link.active {
  color: var(--c-text);
  font-weight: bold;
  text-decoration: none;
}

.sep {
  color: var(--c-muted);
}
</style>
