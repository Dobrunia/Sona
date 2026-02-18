<template>
  <div class="host">
    <transition-group name="toast" tag="div">
      <div v-for="item in items" :key="item.id" class="toast" :class="item.type">
        <span>{{ item.type === 'error' ? '[ERROR] ' : '[OK] ' }}{{ item.message }}</span>
        <button @click="remove(item.id)">X</button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useToastStore } from "@/stores/toast";

const toast = useToastStore();
const items = computed(() => toast.items);

function remove(id: string) {
  toast.remove(id);
}
</script>

<style scoped>
.host {
  position: fixed;
  top: calc(var(--header-h) + var(--s-sm));
  right: var(--s-md);
  display: grid;
  gap: var(--s-sm);
  z-index: 100;
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: var(--s-md);
  padding: var(--s-sm) var(--s-md);
  background: #ffffcc;
  border: var(--border-raised);
  font-size: 12px;
  font-family: "Tahoma", "Arial", sans-serif;
  min-width: 200px;
}

.toast.error {
  background: #ffcccc;
}

.toast button {
  background: var(--c-surface);
  border: var(--border-raised);
  font-size: 10px;
  font-weight: bold;
  cursor: pointer;
  padding: 0 4px;
  margin-left: auto;
  font-family: "Tahoma", sans-serif;
}

.toast button:active {
  border: var(--border-sunken);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.15s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
}
</style>
