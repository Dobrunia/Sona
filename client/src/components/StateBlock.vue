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
  padding: 18px 20px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.state strong {
  display: block;
  font-size: 15px;
  margin-bottom: 6px;
}

.state p {
  margin: 0;
  color: #5f5f5f;
  font-size: 14px;
}

.state.error {
  border-color: rgba(255, 107, 74, 0.4);
}

.state.empty {
  border-style: dashed;
}
</style>
