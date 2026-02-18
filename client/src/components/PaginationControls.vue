<template>
  <div class="pagination" v-if="total > pageSize">
    <button :disabled="page <= 1" @click="change(page - 1)">Назад</button>
    <span class="info">{{ page }} / {{ totalPages }}</span>
    <button :disabled="page >= totalPages" @click="change(page + 1)">Вперед</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ page: number; pageSize: number; total: number }>();
const emit = defineEmits<{ (event: "update", value: number): void }>();

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)));

function change(value: number) {
  emit("update", value);
}
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--s-md);
  padding: var(--s-sm) 0;
}

button {
  background: none;
  border: none;
  font-family: var(--font);
  font-size: 13px;
  font-weight: 500;
  color: var(--c-text);
  cursor: pointer;
  padding: var(--s-xs) var(--s-sm);
  border-radius: var(--r-sm);
  transition: background 0.15s;
}

button:hover:not(:disabled) {
  background: var(--c-border);
}

button:disabled {
  color: var(--c-muted);
  cursor: default;
}

.info {
  font-size: 13px;
  color: var(--c-muted);
}
</style>
