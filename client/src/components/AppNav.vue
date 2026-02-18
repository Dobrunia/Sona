<template>
  <nav class="nav">
    <router-link class="nav-item" to="/">
      <v-icon icon="mdi-home-variant"></v-icon>
      <span>Лента</span>
    </router-link>
    <router-link class="nav-item" to="/favorites">
      <v-icon icon="mdi-heart-outline"></v-icon>
      <span>Избранное</span>
    </router-link>
    <router-link class="nav-item" to="/upload">
      <v-icon icon="mdi-cloud-upload-outline"></v-icon>
      <span>Загрузить</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts"></script>

<style scoped>
.nav {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 16px;
  padding: 12px 20px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: #ffffff;
  position: sticky;
  bottom: 0;
  z-index: 15;
}

.nav-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #3f3f3f;
  text-decoration: none;
}

.nav-item.router-link-active {
  color: #111111;
}

@media (min-width: 960px) {
  .nav {
    position: static;
    justify-content: flex-end;
    padding: 12px 64px 24px;
    background: transparent;
    border-top: none;
  }
  .nav-item {
    flex-direction: row;
    font-size: 14px;
    gap: 8px;
    padding: 8px 14px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.04);
  }
  .nav-item.router-link-active {
    background: #111111;
    color: #ffffff;
  }
}
</style>
