<template>
  <section class="view">
    <div class="intro">
      <h1>Загрузка</h1>
      <p>Добавь свой трек в каталог.</p>
    </div>
    <upload-form />
  </section>
</template>

<script setup lang="ts">
import UploadForm from "@/components/UploadForm.vue";
</script>

<style scoped>
.view {
  display: grid;
  gap: var(--s-md);
}

.intro h1 {
  margin: 0 0 var(--s-xs);
  font-size: 24px;
}

.intro p {
  margin: 0;
  color: var(--c-muted);
  font-size: 14px;
}
</style>
