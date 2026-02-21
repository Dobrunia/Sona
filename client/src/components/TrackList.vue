<template>
  <div class="window">
    <div class="title-bar">Track List</div>
    <div class="body">
      <state-block
        v-if="!loading && error"
        tone="error"
        title="Error"
        description="Could not load tracks."
      />
      <state-block
        v-else-if="!loading && !tracks.length"
        tone="empty"
        title="Empty"
        description="No tracks yet. Upload some music!"
      />
      <table v-else class="table" cellspacing="0">
        <thead>
          <tr>
            <th class="th-cover"></th>
            <th class="th-title">Title</th>
            <th class="th-artist">Artist</th>
            <th class="th-actions"></th>
          </tr>
        </thead>
        <tbody>
          <track-skeleton v-if="loading" v-for="n in 4" :key="n" />
          <track-card v-else v-for="track in tracks" :key="track.id" :track="track" />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import TrackCard from "@/components/TrackCard.vue";
import TrackSkeleton from "@/components/TrackSkeleton.vue";
import StateBlock from "@/components/StateBlock.vue";
import type { Track } from "@/stores/player";

defineProps<{ tracks: Track[]; loading?: boolean; error?: boolean }>();
</script>

<style scoped>
.window {
  background: var(--c-surface);
  border: var(--border-raised);
}

.title-bar {
  background: var(--c-title-bar);
  color: var(--c-title-text);
  font-family: "Tahoma", "Arial", sans-serif;
  font-size: 11px;
  font-weight: bold;
  padding: 2px var(--s-sm);
}

.body {
  padding: var(--s-xs);
  background: var(--c-window);
  border: var(--border-sunken);
  margin: var(--s-xs);
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.table th {
  text-align: left;
  padding: var(--s-xs) var(--s-sm);
  border-bottom: 2px solid #808080;
  font-family: "Tahoma", "Arial", sans-serif;
  font-size: 11px;
  font-weight: bold;
  background: var(--c-surface);
  color: var(--c-text);
}

.th-cover {
  width: 36px;
  padding-right: 0;
}

.th-actions {
  width: 1%;
}
</style>
