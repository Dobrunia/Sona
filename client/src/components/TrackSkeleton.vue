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
  grid-template-columns: 44px 1fr;
  align-items: center;
  gap: var(--s-sm);
  padding: var(--s-sm);
  border-radius: var(--r-md);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
}

.cover {
  width: 44px;
  height: 44px;
  border-radius: var(--r-sm);
  background: linear-gradient(120deg, #eee 30%, #f7f7f7 50%, #eee 70%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

.lines {
  display: grid;
  gap: var(--s-sm);
}

.line {
  height: 10px;
  border-radius: 4px;
  background: linear-gradient(120deg, #eee 30%, #f7f7f7 50%, #eee 70%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

.line.short {
  width: 50%;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
