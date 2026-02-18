<template>
  <div class="state" :class="tone">
    <b>{{ title }}</b>
    <p v-if="description">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    description?: string;
    tone?: "neutral" | "error" | "empty";
  }>(),
  {
    description: "",
    tone: "neutral"
  }
);
</script>

<style scoped>
.state {
  padding: var(--s-md);
  font-size: 12px;
  border: var(--border-sunken);
  background: var(--c-input-bg);
}

.state b {
  display: block;
  margin-bottom: var(--s-xs);
}

.state p {
  margin: 0;
  color: var(--c-muted);
}

.state.error {
  background: #fff0f0;
  color: #cc0000;
}

.state.error p {
  color: #cc0000;
}
</style>
