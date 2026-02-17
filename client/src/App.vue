<template>
  <v-app>
    <v-main>
      <div class="app-shell">
        <header class="app-header">
          <div class="brand">Sona</div>
          <div class="status">MVP client scaffold</div>
        </header>
        <section class="hero">
          <h1>Музыкальный сервис</h1>
          <p>Подключим интерфейс после настройки данных и авторизации.</p>
        </section>
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts"></script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 48px;
  padding: 32px 20px 64px;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 16px;
}

.brand {
  font-size: 20px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
}

.status {
  font-size: 14px;
  color: #5f5f5f;
}

.hero h1 {
  font-size: clamp(28px, 3vw, 40px);
  margin-bottom: 12px;
}

.hero p {
  font-size: 16px;
  color: #4a4a4a;
}
</style>
