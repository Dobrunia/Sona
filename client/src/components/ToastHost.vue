<template>
  <div class="toast-host">
    <transition-group name="toast" tag="div">
      <div v-for="item in items" :key="item.id" class="toast" :class="item.type">
        <span>{{ item.message }}</span>
        <button class="close" @click="remove(item.id)">×</button>
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
.toast-host {
  position: fixed;
  top: 16px;
  right: 16px;
  display: grid;
  gap: 10px;
  z-index: 100;
}

.toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 14px;
  background: #111111;
  color: #ffffff;
  min-width: 240px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.16);
}

.toast.error {
  background: #ff6b4a;
}

.close {
  background: transparent;
  border: none;
  color: inherit;
  font-size: 18px;
  cursor: pointer;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 600px) {
  .toast-host {
    top: auto;
    bottom: 90px;
    left: 16px;
    right: 16px;
  }
  .toast {
    width: 100%;
  }
}
</style>
