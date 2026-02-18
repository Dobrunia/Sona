<template>
  <div>
    <div v-if="auth.user" class="profile">
      <div class="avatar">
        <img v-if="auth.user.avatar" :src="auth.user.avatar" alt="avatar" />
        <img v-else src="/icon.svg" alt="Sona" />
      </div>
      <div>
        <div class="email">{{ auth.user.email }}</div>
        <div class="name">{{ auth.user.name || "" }}</div>
      </div>
    </div>
    <div v-else class="login">
      <p>Войди через Google, чтобы продолжить.</p>
      <div class="google-button" :id="googleButtonId"></div>
      <p v-if="googleUnavailable" class="hint">
        Google кнопка не загрузилась. Проверь `VITE_GOOGLE_CLIENT_ID` и перезапусти dev-сервер.
      </p>
    </div>
    <div class="actions">
      <v-btn v-if="auth.user" variant="text" :loading="loading" @click="logout">Выйти</v-btn>
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

onMounted(() => {
  mountGoogle();
});

onUnmounted(() => {
  const container = document.getElementById(googleButtonId);
  if (container) container.innerHTML = "";
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
  gap: 14px;
  align-items: center;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  overflow: hidden;
  background: #f2f2f2;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.email {
  font-weight: 600;
}

.name {
  font-size: 13px;
  color: #6b6b6b;
}

.login p {
  margin: 0 0 12px;
  font-size: 13px;
  color: #6b6b6b;
}

.google-button {
  margin-bottom: 12px;
  min-height: 42px;
}

.hint {
  margin: 0;
  font-size: 12px;
  color: #ff6b4a;
}

.actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}
</style>
