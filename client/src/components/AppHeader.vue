<template>
  <header class="header">
    <div class="title-bar">
      <div class="title">
        <img src="/icon.svg" alt="Sona" class="icon" />
        <span>Sona</span>
      </div>
      <div class="controls">
        <v-menu>
          <template #activator="{ props }">
            <button v-bind="props" class="win-btn sm">
              {{ auth.user?.name?.charAt(0)?.toUpperCase() || '?' }}
            </button>
          </template>
          <div class="dropdown">
            <div class="dropdown-header">User Profile</div>
            <div class="dropdown-body">
              <div v-if="auth.user">
                <b>{{ auth.user.name || "User" }}</b><br />
                <span class="muted">{{ auth.user.email }}</span>
              </div>
              <hr />
              <a href="#" class="link" @click.prevent="logout">[ Log Out ]</a>
            </div>
          </div>
        </v-menu>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useMutation } from "@vue/apollo-composable";
import { LOGOUT } from "@/graphql/mutations";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
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
}

.title-bar {
  height: var(--header-h);
  background: var(--c-title-bar);
  color: var(--c-title-text);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--s-sm);
  font-size: 12px;
  font-weight: bold;
  font-family: "Tahoma", "Arial", sans-serif;
}

.title {
  display: flex;
  align-items: center;
  gap: var(--s-sm);
}

.icon {
  width: 16px;
  height: 16px;
  filter: brightness(10);
}

.controls {
  display: flex;
  align-items: center;
  gap: var(--s-md);
}

.win-btn {
  background: var(--c-surface);
  border: var(--border-raised);
  color: var(--c-text);
  font-family: "Tahoma", "Arial", sans-serif;
  font-size: 11px;
  cursor: pointer;
  padding: 1px 6px;
}

.win-btn:active {
  border: var(--border-sunken);
}

.win-btn.sm {
  width: 20px;
  height: 20px;
  padding: 0;
  display: grid;
  place-items: center;
  font-weight: bold;
  font-size: 10px;
}

.dropdown {
  background: var(--c-window);
  border: var(--border-raised);
  min-width: 200px;
  font-family: var(--font);
  font-size: 13px;
}

.dropdown-header {
  background: var(--c-title-bar);
  color: var(--c-title-text);
  padding: 2px var(--s-sm);
  font-family: "Tahoma", "Arial", sans-serif;
  font-size: 11px;
  font-weight: bold;
}

.dropdown-body {
  padding: var(--s-md);
}

.dropdown-body hr {
  border: none;
  border-top: var(--border-groove);
  margin: var(--s-md) 0;
}

.link {
  color: var(--c-link);
  text-decoration: underline;
  cursor: pointer;
  font-size: 12px;
}

.link:visited {
  color: var(--c-link-visited);
}

.muted {
  color: var(--c-muted);
  font-size: 12px;
}
</style>
