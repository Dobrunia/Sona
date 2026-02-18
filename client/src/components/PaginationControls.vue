<template>
  <div class="pagination" v-if="total > pageSize">
    <a href="#" class="link" :class="{ disabled: page <= 1 }" @click.prevent="page > 1 && change(page - 1)">
      &lt;&lt; Prev
    </a>
    <span class="info">Page {{ page }} of {{ totalPages }}</span>
    <a href="#" class="link" :class="{ disabled: page >= totalPages }" @click.prevent="page < totalPages && change(page + 1)">
      Next &gt;&gt;
    </a>
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
  gap: var(--s-lg);
  padding: var(--s-md) 0;
  font-size: 12px;
  font-family: "Tahoma", "Arial", sans-serif;
}

.link {
  color: var(--c-link);
  text-decoration: underline;
  cursor: pointer;
}

.link.disabled {
  color: #808080;
  text-decoration: none;
  cursor: default;
}

.info {
  color: var(--c-muted);
}
</style>
