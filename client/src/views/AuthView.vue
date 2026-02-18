<template>
  <div class="page">
    <div class="card">
      <div class="brand">
        <img src="/icon.svg" alt="Sona" class="logo" />
        <div>
          <h1>Sona</h1>
          <p>Авторизуйся, чтобы продолжить.</p>
        </div>
      </div>
      <auth-panel @done="noop" />
    </div>
  </div>
</template>

<script setup lang="ts">
import AuthPanel from "@/components/AuthPanel.vue";

function noop() {}
</script>

<style scoped>
.page {
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: var(--s-lg) var(--s-md);
  background: var(--c-bg);
}

.card {
  width: min(420px, 100%);
  background: var(--c-surface);
  border-radius: var(--r-lg);
  border: 1px solid var(--c-border);
  padding: var(--s-lg);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--s-sm);
  margin-bottom: var(--s-lg);
}

.logo {
  width: 40px;
  height: 40px;
}

h1 {
  margin: 0;
  font-size: 20px;
}

p {
  margin: var(--s-xs) 0 0;
  color: var(--c-muted);
  font-size: 13px;
}
</style>
