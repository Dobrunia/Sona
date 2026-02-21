<template>
  <section>
    <h2>Upload</h2>
    <p class="subtitle">Add your track to the catalog.</p>
    <hr class="groove" />
    <upload-form />
    <br />
    <my-tracks />
  </section>
</template>

<script setup lang="ts">
import UploadForm from "@/components/UploadForm.vue";
import MyTracks from "@/components/MyTracks.vue";
</script>

<style scoped>
h2 {
  margin: 0;
  font-size: 16px;
}

.subtitle {
  margin: var(--s-xs) 0 0;
  font-size: 12px;
  color: var(--c-muted);
}

.groove {
  border: none;
  border-top: var(--border-groove);
  margin: var(--s-md) 0;
}
</style>
