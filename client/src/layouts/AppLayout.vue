<template>
  <v-app>
    <div class="layout">
      <app-header />
      <main class="content">
        <router-view />
      </main>
      <aside class="side-panel">
        <online-list />
      </aside>
      <player-bar />
      <app-nav />
    </div>
  </v-app>
</template>

<script setup lang="ts">
import AppHeader from "@/components/AppHeader.vue";
import AppNav from "@/components/AppNav.vue";
import PlayerBar from "@/components/PlayerBar.vue";
import OnlineList from "@/components/OnlineList.vue";
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  background: radial-gradient(circle at top, #ffffff 0%, #f6f6f4 55%, #f2efe9 100%);
}

.content {
  padding: 24px 20px 120px;
}

.side-panel {
  display: none;
  padding: 0 20px 24px;
}

@media (min-width: 960px) {
  .layout {
    grid-template-columns: 1fr 320px;
    grid-template-rows: auto 1fr auto;
  }
  .content {
    grid-column: 1 / 2;
    padding: 32px 40px 140px 64px;
  }
  .side-panel {
    display: block;
    grid-column: 2 / 3;
    padding: 32px 64px 140px 0;
  }
  .layout > :global(.player) {
    grid-column: 1 / -1;
  }
}
</style>
