<template>
  <div class="skeleton">
    <div class="cover"></div>
    <div class="lines">
      <div class="line short"></div>
      <div class="line"></div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.skeleton {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.cover {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(120deg, #ededed 30%, #f5f5f5 60%, #ededed 90%);
  background-size: 200% 100%;
  animation: shimmer 1.6s infinite;
}

.lines {
  display: grid;
  gap: 8px;
}

.line {
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(120deg, #ededed 30%, #f5f5f5 60%, #ededed 90%);
  background-size: 200% 100%;
  animation: shimmer 1.6s infinite;
}

.line.short {
  width: 60%;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
