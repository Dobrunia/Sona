<template>
  <v-app-bar flat height="72" class="app-bar">
    <v-container class="bar-container" fluid>
      <div class="bar-content">
        <div class="brand">
          <v-avatar size="36" color="white">
            <img src="/icon.svg" alt="Sona" />
          </v-avatar>
          <span class="name">Sona</span>
        </div>

        <div class="actions">
          <v-chip size="small" variant="tonal" color="primary">
            Online: {{ presence.count }}
          </v-chip>
          <v-menu>
            <template #activator="{ props }">
              <v-btn v-bind="props" variant="text" class="profile-btn">
                <v-avatar size="32">
                  <img v-if="auth.user?.avatar" :src="auth.user.avatar" alt="avatar" />
                  <img v-else src="/icon.svg" alt="Sona" />
                </v-avatar>
                <span class="profile-name">{{ auth.user?.name || "Профиль" }}</span>
                <v-icon icon="mdi-chevron-down"></v-icon>
              </v-btn>
            </template>
            <v-list width="240">
              <v-list-item>
                <template #prepend>
                  <v-avatar size="40">
                    <img v-if="auth.user?.avatar" :src="auth.user.avatar" alt="avatar" />
                    <img v-else src="/icon.svg" alt="Sona" />
                  </v-avatar>
                </template>
                <v-list-item-title>{{ auth.user?.name || "Пользователь" }}</v-list-item-title>
                <v-list-item-subtitle>{{ auth.user?.email || "" }}</v-list-item-subtitle>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item @click="logout" :disabled="loading">
                <template #prepend>
                  <v-icon icon="mdi-logout"></v-icon>
                </template>
                <v-list-item-title>Выйти</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>
    </v-container>
  </v-app-bar>
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
.app-bar {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(246, 246, 244, 0.9);
  backdrop-filter: blur(12px);
}

.bar-container {
  max-width: 1200px;
}

.bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.name {
  font-size: 14px;
}

.actions {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.profile-btn {
  text-transform: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.profile-name {
  font-size: 13px;
  font-weight: 500;
}

@media (max-width: 600px) {
  .profile-name {
    display: none;
  }
}
</style>
