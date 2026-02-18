<template>
  <div class="window">
    <div class="title-bar">Online Users</div>
    <div class="body">
      <div v-for="user in users" :key="String(user.id)" class="user">
        <b>{{ user.profile?.name || user.profile?.email || "Guest" }}</b>
        <span class="status">{{ user.trackId ? `listening #${user.trackId}` : "idle" }}</span>
      </div>
      <div v-if="!users.length" class="empty">No users online.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { usePresenceStore } from "@/stores/presence";

const presence = usePresenceStore();
const users = computed(() => presence.users);
</script>

<style scoped>
.window {
  background: var(--c-surface);
  border: var(--border-raised);
}

.title-bar {
  background: var(--c-title-bar);
  color: var(--c-title-text);
  font-family: "Tahoma", "Arial", sans-serif;
  font-size: 11px;
  font-weight: bold;
  padding: 2px var(--s-sm);
}

.body {
  padding: var(--s-sm);
  background: var(--c-window);
  border: var(--border-sunken);
  margin: var(--s-xs);
  max-height: 160px;
  overflow: auto;
  font-size: 12px;
}

.user {
  padding: var(--s-xs) 0;
  border-bottom: 1px dotted #999;
}

.user:last-child {
  border-bottom: none;
}

.status {
  color: var(--c-muted);
  font-size: 11px;
  margin-left: var(--s-sm);
}

.empty {
  color: var(--c-muted);
  font-style: italic;
}
</style>
