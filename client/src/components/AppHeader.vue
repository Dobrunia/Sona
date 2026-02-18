<template>
  <header class="header">
    <div class="col">
      <div class="brand">
        <img src="/icon.svg" alt="Sona" class="logo" />
        <span>Sona</span>
      </div>

      <div class="right">
        <span class="online">{{ presence.count }} online</span>

        <v-menu>
          <template #activator="{ props }">
            <button v-bind="props" class="avatar-btn">
              <img
                v-if="auth.user?.avatar"
                :src="auth.user.avatar"
                alt="avatar"
                class="avatar"
              />
              <img v-else src="/icon.svg" alt="Sona" class="avatar" />
            </button>
          </template>
          <v-list class="menu" width="220">
            <v-list-item>
              <v-list-item-title class="menu-name">
                {{ auth.user?.name || "Пользователь" }}
              </v-list-item-title>
              <v-list-item-subtitle>{{ auth.user?.email || "" }}</v-list-item-subtitle>
            </v-list-item>
            <v-divider />
            <v-list-item @click="logout" :disabled="loading">
              <template #prepend>
                <v-icon icon="mdi-logout" size="18" />
              </template>
              <v-list-item-title>Выйти</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useMutation } from "@vue/apollo-composable";
import { LOGOUT } from "@/graphql/mutations";
import { useAuthStore } from "@/stores/auth";
import { usePresenceStore } from "@/stores/presence";

const auth = useAuthStore();
const presence = usePresenceStore();
const { mutate: logoutMutation, loading } = useMutation(LOGOUT);

async function logout() {
  try {
    if (auth.refreshToken) {
      await logoutMutation({ refreshToken: auth.refreshToken });
    }
  } finally {
    auth.clear();
  }
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  height: var(--header-h);
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--c-border);
  background: rgba(244, 244, 242, 0.8);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.col {
  width: 100%;
  max-width: var(--col-width);
  margin: 0 auto;
  padding: 0 var(--s-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--s-sm);
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.logo {
  width: 28px;
  height: 28px;
}

.right {
  display: flex;
  align-items: center;
  gap: var(--s-md);
}

.online {
  font-size: 12px;
  color: var(--c-muted);
  font-weight: 500;
}

.avatar-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  line-height: 0;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--c-border);
}

.menu {
  border-radius: var(--r-md) !important;
  box-shadow: var(--shadow-lg) !important;
}

.menu-name {
  font-weight: 600;
}
</style>
