<template>
  <v-app>
    <app-header />
    <v-main>
      <v-container class="app-container" fluid>
        <router-view />
      </v-container>
    </v-main>
    <player-bar />
    <app-nav />
  </v-app>
</template>

<script setup lang="ts">
import AppHeader from "@/components/AppHeader.vue";
import AppNav from "@/components/AppNav.vue";
import PlayerBar from "@/components/PlayerBar.vue";
</script>

<style scoped>
.app-container {
  max-width: 1200px;
  padding: 24px 20px 140px;
}

@media (min-width: 960px) {
  .app-container {
    padding: 32px 48px 160px;
  }
}
</style>
