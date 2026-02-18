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
  gap: 20px;
}

.intro h1 {
  margin-bottom: 6px;
  font-size: clamp(26px, 3vw, 38px);
}

.intro p {
  margin: 0;
  color: #5f5f5f;
}
</style>
