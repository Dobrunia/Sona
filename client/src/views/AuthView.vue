<template>
  <v-container class="auth-page" fluid>
    <v-card class="auth-card" elevation="0">
      <v-card-text>
        <div class="brand">
          <v-avatar size="48">
            <img src="/icon.svg" alt="Sona" />
          </v-avatar>
          <div>
            <h1>Sona</h1>
            <p>Авторизуйся, чтобы продолжить.</p>
          </div>
        </div>
        <auth-panel @done="noop" />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import AuthPanel from "@/components/AuthPanel.vue";

function noop() {}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px 20px;
  background: radial-gradient(circle at top, #ffffff 0%, #f6f6f4 55%, #f2efe9 100%);
}

.auth-card {
  width: min(480px, 100%);
  border-radius: 24px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 12px;
}

.brand {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  align-items: center;
  margin-bottom: 16px;
}

h1 {
  margin: 0;
  font-size: 24px;
}

p {
  margin: 4px 0 0;
  color: #6b6b6b;
  font-size: 14px;
}
</style>
