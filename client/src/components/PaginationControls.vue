<template>
  <div class="pagination" v-if="total > pageSize">
    <v-btn variant="text" :disabled="page <= 1" @click="change(page - 1)">
      Назад
    </v-btn>
    <div class="info">{{ page }} / {{ totalPages }}</div>
    <v-btn variant="text" :disabled="page >= totalPages" @click="change(page + 1)">
      Вперед
    </v-btn>
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
  gap: 12px;
  padding: 12px 0;
}

.info {
  font-size: 14px;
  color: #5f5f5f;
}
</style>
