<template>
  <div class="list">
    <h3>Сейчас онлайн</h3>
    <div class="users">
      <div v-for="user in users" :key="String(user.id)" class="user">
        <img
          v-if="user.profile?.avatar"
          :src="user.profile.avatar"
          alt="avatar"
          class="avatar"
        />
        <img v-else src="/icon.svg" alt="Sona" class="avatar" />
        <div>
          <div class="name">{{ user.profile?.name || user.profile?.email || "Гость" }}</div>
          <div class="track">{{ user.trackId ? `Слушает #${user.trackId}` : "Без трека" }}</div>
        </div>
      </div>
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
.list {
  background: var(--c-surface);
  border-radius: var(--r-md);
  border: 1px solid var(--c-border);
  padding: var(--s-md);
  display: grid;
  gap: var(--s-sm);
}

h3 {
  margin: 0;
  font-size: 14px;
}

.users {
  display: grid;
  gap: var(--s-sm);
  max-height: 200px;
  overflow: auto;
}

.user {
  display: flex;
  align-items: center;
  gap: var(--s-sm);
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--c-bg);
}

.name {
  font-weight: 600;
  font-size: 13px;
}

.track {
  font-size: 11px;
  color: var(--c-muted);
}
</style>
