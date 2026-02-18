<template>
  <v-app>
    <app-header />
    <v-main class="main">
      <div class="col">
        <router-view />
      </div>
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
.main {
  padding-top: var(--header-h) !important;
  padding-bottom: calc(var(--player-h) + var(--nav-h) + var(--s-xl));
  background: var(--c-bg);
}

.col {
  max-width: var(--col-width);
  margin: 0 auto;
  padding: var(--s-md);
}
</style>
