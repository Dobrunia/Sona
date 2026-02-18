<template>
  <div class="search">
    <v-icon icon="mdi-magnify" size="18" class="icon" />
    <input
      v-model="query"
      type="text"
      placeholder="Поиск по названию или исполнителю"
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
  padding: 10px var(--s-md);
  border-radius: var(--r-md);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  transition: border-color 0.15s;
}

.search:focus-within {
  border-color: var(--c-text);
}

.icon {
  color: var(--c-muted);
  flex-shrink: 0;
}

input {
  border: none;
  outline: none;
  flex: 1;
  font-size: 14px;
  font-family: var(--font);
  color: var(--c-text);
  background: transparent;
}

input::placeholder {
  color: var(--c-muted);
}
</style>
