<template>
  <div class="online-list">
    <h3>Сейчас онлайн</h3>
    <div class="users">
      <div v-for="user in users" :key="String(user.id)" class="user">
        <div class="avatar">
          <img v-if="user.profile?.avatar" :src="user.profile.avatar" alt="avatar" />
          <img v-else src="/icon.svg" alt="Sona" />
        </div>
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
.online-list {
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 16px;
  display: grid;
  gap: 12px;
}

.users {
  display: grid;
  gap: 12px;
  max-height: 240px;
  overflow: auto;
}

.user {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  overflow: hidden;
  background: #f3f3f3;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.name {
  font-weight: 600;
  font-size: 14px;
}

.track {
  font-size: 12px;
  color: #6f6f6f;
}
</style>
