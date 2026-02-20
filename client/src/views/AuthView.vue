<template>
  <div class="page">
    <div class="window">
      <div class="title-bar">
        <img src="/icon.svg" alt="Sona" class="icon" />
        <span>Welcome to Sona</span>
      </div>
      <div class="body">
        <p><b>Sona</b></p>
        <hr />
        <p>Please sign in to continue.</p>
        <auth-panel @done="noop" />
        <hr />
        <p class="footer">
          Best viewed with <b>Netscape Navigator 4.0</b> or higher.<br />
          &copy; 2026 Sona Music. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AuthPanel from "@/components/AuthPanel.vue";

function noop() {}
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: var(--s-xl);
  background: #008080;
}

.window {
  width: min(400px, 100%);
  background: var(--c-surface);
  border: var(--border-raised);
}

.title-bar {
  background: var(--c-title-bar);
  color: var(--c-title-text);
  font-family: "Tahoma", "Arial", sans-serif;
  font-size: 12px;
  font-weight: bold;
  padding: 3px var(--s-sm);
  display: flex;
  align-items: center;
  gap: var(--s-sm);
}

.icon {
  width: 16px;
  height: 16px;
  filter: brightness(10);
}

.body {
  padding: var(--s-lg);
  font-size: 13px;
}

.body hr {
  border: none;
  border-top: var(--border-groove);
  margin: var(--s-md) 0;
}

.body p {
  margin: var(--s-sm) 0;
}

.footer {
  font-size: 11px;
  color: var(--c-muted);
  text-align: center;
}
</style>
