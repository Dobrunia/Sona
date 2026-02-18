<template>
  <div>
    <div v-if="auth.user" class="profile">
      <img
        v-if="auth.user.avatar"
        :src="auth.user.avatar"
        alt="avatar"
        class="avatar"
      />
      <img v-else src="/icon.svg" alt="Sona" class="avatar" />
      <div>
        <div class="email">{{ auth.user.email }}</div>
        <div class="name" v-if="auth.user.name">{{ auth.user.name }}</div>
      </div>
    </div>
    <div v-else class="login">
      <p>Войди через Google, чтобы продолжить.</p>
      <div class="google-button" :id="googleButtonId"></div>
      <p v-if="googleUnavailable" class="warn">
        Google кнопка не загрузилась. Проверь VITE_GOOGLE_CLIENT_ID.
      </p>
    </div>
    <div class="actions" v-if="auth.user">
      <button class="logout-btn" :disabled="loading" @click="logout">Выйти</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { LOGOUT } from "@/graphql/mutations";
import { useAuthStore } from "@/stores/auth";
import { initGoogleLogin } from "@/services/google";

const emit = defineEmits<{ (event: "done"): void }>();

const auth = useAuthStore();
const googleButtonId = "google-signin-button";
const googleUnavailable = ref(false);

const { mutate: logoutMutation, loading } = useMutation(LOGOUT);

async function mountGoogle() {
  await nextTick();
  const ok = await initGoogleLogin(googleButtonId).catch(() => false);
  googleUnavailable.value = !ok;
}

onMounted(() => { mountGoogle(); });

onUnmounted(() => {
  const el = document.getElementById(googleButtonId);
  if (el) el.innerHTML = "";
});

async function logout() {
  try {
    if (auth.refreshToken) {
      await logoutMutation({ refreshToken: auth.refreshToken });
    }
  } finally {
    auth.clear();
    emit("done");
  }
}
</script>

<style scoped>
.profile {
  display: flex;
  gap: var(--s-sm);
  align-items: center;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--c-bg);
}

.email {
  font-weight: 600;
  font-size: 14px;
}

.name {
  font-size: 12px;
  color: var(--c-muted);
}

.login p {
  margin: 0 0 var(--s-sm);
  font-size: 13px;
  color: var(--c-muted);
}

.google-button {
  min-height: 42px;
}

.warn {
  color: var(--c-accent);
  font-size: 12px;
}

.actions {
  margin-top: var(--s-md);
  display: flex;
  justify-content: flex-end;
}

.logout-btn {
  background: none;
  border: 1px solid var(--c-border);
  border-radius: var(--r-sm);
  padding: var(--s-xs) var(--s-sm);
  font-family: var(--font);
  font-size: 13px;
  cursor: pointer;
  color: var(--c-text);
  transition: background 0.15s;
}

.logout-btn:hover {
  background: var(--c-bg);
}
</style>
