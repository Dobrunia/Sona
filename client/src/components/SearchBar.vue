<template>
  <div class="search">
    <label for="search">Search:</label>
    <input
      id="search"
      v-model="query"
      type="text"
      @input="emitSearch"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits<{ (event: "update", value: string): void }>();
const query = ref("");

function emitSearch() {
  emit("update", query.value.trim());
}
</script>

<style scoped>
.search {
  display: flex;
  align-items: center;
  gap: var(--s-sm);
  font-family: "Tahoma", "Arial", sans-serif;
  font-size: 12px;
}

label {
  font-weight: bold;
  white-space: nowrap;
}

input {
  flex: 1;
  border: var(--border-sunken);
  background: var(--c-input-bg);
  padding: 2px var(--s-sm);
  font-family: var(--font);
  font-size: 13px;
  color: var(--c-text);
}

input:focus {
  outline: 1px dotted var(--c-text);
}
</style>
