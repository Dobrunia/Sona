<template>
  <v-bottom-navigation class="bottom-nav" grow>
    <v-btn to="/" value="home">
      <v-icon icon="mdi-home-variant"></v-icon>
      <span>Лента</span>
    </v-btn>
    <v-btn to="/favorites" value="favorites">
      <v-icon icon="mdi-heart-outline"></v-icon>
      <span>Избранное</span>
    </v-btn>
    <v-btn to="/upload" value="upload">
      <v-icon icon="mdi-cloud-upload-outline"></v-icon>
      <span>Загрузить</span>
    </v-btn>
  </v-bottom-navigation>
</template>

<script setup lang="ts"></script>

<style scoped>
.bottom-nav {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: #ffffff;
}
</style>
