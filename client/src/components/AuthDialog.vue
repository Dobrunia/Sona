<template>
  <v-dialog v-model="open" max-width="420">
    <template #activator="{ props }">
      <v-btn v-bind="props" variant="text" class="icon-button" icon="mdi-account"></v-btn>
    </template>
    <v-card>
      <v-card-title>{{ auth.user ? "Профиль" : "Вход" }}</v-card-title>
      <v-card-text>
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
          <p v-if="!googleEnabled">
            Вставь Google ID Token для входа (dev режим).
          </p>
          <p v-else>
            Войди через Google или вставь ID Token вручную.
          </p>
          <div v-if="googleEnabled" class="google-button" :id="googleButtonId"></div>
          <v-textarea v-model="token" label="Google ID Token" rows="3"></v-textarea>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn v-if="auth.user" variant="text" :loading="loading" @click="logout">Выйти</v-btn>
        <v-btn v-else :disabled="!token" :loading="loading" color="primary" @click="login">
          Войти
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { LOGIN_WITH_GOOGLE, LOGOUT } from "@/graphql/mutations";
import { useAuthStore } from "@/stores/auth";
import { useToastStore } from "@/stores/toast";
import { initGoogleLogin } from "@/services/google";

const open = ref(false);
const token = ref("");
const auth = useAuthStore();
const toast = useToastStore();
const googleButtonId = "google-signin-button";

const googleEnabled = computed(() => Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID));

const { mutate: loginMutation, loading } = useMutation(LOGIN_WITH_GOOGLE);
const { mutate: logoutMutation } = useMutation(LOGOUT);

onMounted(() => {
  if (googleEnabled.value) {
    initGoogleLogin(googleButtonId).catch(() => {
      toast.push("Google auth недоступен", "error");
    });
  }
});

async function login() {
  try {
    const result = await loginMutation({ idToken: token.value });
    const payload = result?.data?.loginWithGoogle;
    if (!payload) throw new Error("login failed");
    auth.setSession(payload.accessToken, payload.refreshToken, payload.user ?? null);
    token.value = "";
    open.value = false;
    toast.push("Вы вошли в аккаунт");
  } catch {
    toast.push("Не удалось войти", "error");
  }
}

async function logout() {
  try {
    if (auth.refreshToken) {
      await logoutMutation({ refreshToken: auth.refreshToken });
    }
  } finally {
    auth.clear();
    open.value = false;
    toast.push("Вы вышли из аккаунта");
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
}
</style>
