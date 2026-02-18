<template>
  <header class="header">
    <div class="brand">
      <img src="/icon.svg" alt="Sona" class="logo" />
      <span class="name">Sona</span>
    </div>
    <div class="meta">
      <div class="online">
        <span class="pulse"></span>
        <span>Online: {{ presence.count }}</span>
      </div>
      <div class="profile">
        <div class="avatar">
          <img v-if="auth.user?.avatar" :src="auth.user.avatar" alt="avatar" />
          <img v-else src="/icon.svg" alt="Sona" />
        </div>
        <div class="who">
          <div class="label">{{ auth.user?.name || "Гость" }}</div>
          <div class="email" v-if="auth.user?.email">{{ auth.user.email }}</div>
        </div>
      </div>
      <auth-dialog />
    </div>
  </header>
</template>

<script setup lang="ts">
import AuthDialog from "@/components/AuthDialog.vue";
import { usePresenceStore } from "@/stores/presence";
import { useAuthStore } from "@/stores/auth";

const presence = usePresenceStore();
const auth = useAuthStore();
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(12px);
  background: rgba(246, 246, 244, 0.9);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.logo {
  width: 28px;
  height: 28px;
}

.meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.online {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #3f3f3f;
}

.pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #111111;
  box-shadow: 0 0 0 4px rgba(17, 17, 17, 0.1);
}

.profile {
  display: none;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.04);
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  overflow: hidden;
  background: #f2f2f2;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.who {
  display: grid;
  gap: 2px;
}

.label {
  font-size: 13px;
  font-weight: 600;
}

.email {
  font-size: 11px;
  color: #6b6b6b;
}

@media (min-width: 960px) {
  .header {
    padding: 22px 64px;
  }
  .profile {
    display: flex;
  }
}
</style>
