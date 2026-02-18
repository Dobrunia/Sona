<template>
  <div class="host">
    <transition-group name="toast" tag="div">
      <div v-for="item in items" :key="item.id" class="toast" :class="item.type">
        <span>{{ item.message }}</span>
        <button @click="remove(item.id)">&times;</button>
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
  top: var(--s-md);
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
  gap: var(--s-sm);
  padding: 10px var(--s-md);
  border-radius: var(--r-sm);
  background: var(--c-text);
  color: var(--c-surface);
  font-size: 13px;
  min-width: 200px;
  box-shadow: var(--shadow-lg);
}

.toast.error {
  background: var(--c-accent);
}

.toast button {
  background: none;
  border: none;
  color: inherit;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  margin-left: auto;
  line-height: 1;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 480px) {
  .host {
    top: auto;
    bottom: calc(var(--player-h) + var(--nav-h) + var(--s-sm));
    left: var(--s-md);
    right: var(--s-md);
  }
}
</style>
