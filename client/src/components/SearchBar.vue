<template>
  <div class="search">
    <v-icon icon="mdi-magnify" class="icon"></v-icon>
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
  gap: 10px;
  padding: 12px 16px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.icon {
  color: #5f5f5f;
}

input {
  border: none;
  outline: none;
  flex: 1;
  font-size: 14px;
  background: transparent;
}
</style>
