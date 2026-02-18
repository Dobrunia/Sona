<template>
  <nav class="nav">
    <router-link to="/" class="tab" :class="{ active: route.path === '/' }">
      <v-icon icon="mdi-home-variant" size="20" />
      <span>Лента</span>
    </router-link>
    <router-link to="/favorites" class="tab" :class="{ active: route.path === '/favorites' }">
      <v-icon icon="mdi-heart-outline" size="20" />
      <span>Избранное</span>
    </router-link>
    <router-link to="/upload" class="tab" :class="{ active: route.path === '/upload' }">
      <v-icon icon="mdi-cloud-upload-outline" size="20" />
      <span>Загрузить</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();
</script>

<style scoped>
.nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  height: var(--nav-h);
  display: flex;
  align-items: stretch;
  background: var(--c-surface);
  border-top: 1px solid var(--c-border);
}

.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 11px;
  font-weight: 500;
  color: var(--c-muted);
  text-decoration: none;
  transition: color 0.15s;
}

.tab.active {
  color: var(--c-text);
}
</style>
