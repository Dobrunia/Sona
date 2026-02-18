<template>
  <div class="state" :class="tone">
    <strong>{{ title }}</strong>
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
  border-radius: var(--r-md);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
}

.state strong {
  display: block;
  font-size: 14px;
  margin-bottom: var(--s-xs);
}

.state p {
  margin: 0;
  color: var(--c-muted);
  font-size: 13px;
}

.state.error {
  border-color: var(--c-accent);
}

.state.empty {
  border-style: dashed;
}
</style>
