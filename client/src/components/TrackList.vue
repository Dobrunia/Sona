<template>
  <section class="list">
    <track-skeleton v-if="loading" v-for="n in 4" :key="n" />
    <state-block
      v-else-if="error"
      tone="error"
      title="Ошибка загрузки"
      description="Не удалось получить список треков."
    />
    <state-block
      v-else-if="!tracks.length"
      tone="empty"
      title="Пока пусто"
      description="Здесь появятся треки, когда кто-то загрузит музыку."
    />
    <track-card v-else v-for="track in tracks" :key="track.id" :track="track" />
  </section>
</template>

<script setup lang="ts">
import TrackCard from "@/components/TrackCard.vue";
import TrackSkeleton from "@/components/TrackSkeleton.vue";
import StateBlock from "@/components/StateBlock.vue";
import type { Track } from "@/stores/player";

defineProps<{ tracks: Track[]; loading?: boolean; error?: boolean }>();
</script>

<style scoped>
.list {
  display: grid;
  gap: var(--s-sm);
}
</style>
