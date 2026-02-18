<template>
  <div>
    <div v-if="auth.user" class="profile">
      <p>Logged in as: <b>{{ auth.user.email }}</b></p>
      <p v-if="auth.user.name">Name: {{ auth.user.name }}</p>
    </div>
    <div v-else class="login">
      <p>Sign in with your Google account:</p>
      <div class="google-button" :id="googleButtonId"></div>
      <p v-if="googleUnavailable" class="warn">
        [!] Google button failed to load. Check VITE_GOOGLE_CLIENT_ID.
      </p>
    </div>
    <div class="actions" v-if="auth.user">
      <button class="win-btn" :disabled="loading" @click="logout">Log Out</button>
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
.profile p,
.login p {
  margin: var(--s-sm) 0;
  font-size: 12px;
}

.google-button {
  min-height: 42px;
}

.warn {
  color: #cc0000;
  font-size: 11px;
  font-weight: bold;
}

.actions {
  margin-top: var(--s-md);
}

.win-btn {
  background: var(--c-surface);
  border: var(--border-raised);
  font-family: "Tahoma", "Arial", sans-serif;
  font-size: 12px;
  padding: 2px 16px;
  cursor: pointer;
}

.win-btn:active {
  border: var(--border-sunken);
}

.win-btn:disabled {
  color: #808080;
}
</style>
