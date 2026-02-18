<template>
  <v-sheet class="player" elevation="0">
    <audio ref="audioEl" preload="metadata"></audio>
    <div class="track">
      <v-avatar size="56" class="cover">
        <img v-if="current?.coverUrl" :src="current.coverUrl" :alt="current.title" />
        <img v-else src="/icon.svg" alt="Sona" />
      </v-avatar>
      <div>
        <div class="title">{{ current?.title ?? "Не выбрано" }}</div>
        <div class="artist">{{ current?.artist ?? "Добавьте трек" }}</div>
      </div>
    </div>
    <div class="controls">
      <v-btn icon="mdi-skip-previous" variant="text"></v-btn>
      <v-btn
        :icon="player.isPlaying ? 'mdi-pause' : 'mdi-play'"
        variant="flat"
        color="primary"
        class="play"
        :disabled="!current"
        @click="player.toggle"
      ></v-btn>
      <v-btn icon="mdi-skip-next" variant="text"></v-btn>
    </div>
    <div class="meta">
      <v-slider v-model="progress" hide-details :min="0" :max="100" class="progress"></v-slider>
      <div class="volume">
        <v-icon icon="mdi-volume-high"></v-icon>
        <v-slider v-model="volume" hide-details :min="0" :max="100"></v-slider>
      </div>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { usePlayerStore } from "@/stores/player";

const player = usePlayerStore();
const current = computed(() => player.current);
const audioEl = ref<HTMLAudioElement | null>(null);

const progress = computed({
  get: () => Math.round(player.progress * 100),
  set: (value: number) => player.setProgress(value / 100)
});

const volume = computed({
  get: () => Math.round(player.volume * 100),
  set: (value: number) => player.setVolume(value / 100)
});

watch(
  () => player.streamUrl,
  async (url) => {
    if (!url || !audioEl.value) return;
    audioEl.value.src = url;
    audioEl.value.load();
    if (player.isPlaying) {
      await audioEl.value.play();
    }
  }
);

watch(
  () => player.isPlaying,
  (playing) => {
    if (!audioEl.value) return;
    if (playing) {
      audioEl.value.play();
    } else {
      audioEl.value.pause();
    }
  }
);

watch(
  () => player.progress,
  (value) => {
    if (!audioEl.value || !audioEl.value.duration) return;
    const nextTime = value * audioEl.value.duration;
    if (Math.abs(audioEl.value.currentTime - nextTime) > 0.5) {
      audioEl.value.currentTime = nextTime;
    }
  }
);

watch(
  () => player.volume,
  (value) => {
    if (!audioEl.value) return;
    audioEl.value.volume = value;
  }
);

onMounted(() => {
  if (!audioEl.value) return;
  audioEl.value.volume = player.volume;
  audioEl.value.addEventListener("timeupdate", () => {
    if (!audioEl.value || !audioEl.value.duration) return;
    player.setProgress(audioEl.value.currentTime / audioEl.value.duration);
  });
  audioEl.value.addEventListener("ended", () => {
    player.toggle();
  });
});
</script>

<style scoped>
.player {
  position: sticky;
  bottom: 56px;
  z-index: 10;
  display: grid;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: #ffffff;
}

.track {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title {
  font-weight: 600;
}

.artist {
  font-size: 13px;
  color: #5f5f5f;
}

.controls {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.play {
  width: 48px;
  height: 48px;
  border-radius: 16px;
}

.meta {
  display: grid;
  gap: 8px;
}

.volume {
  display: none;
  align-items: center;
  gap: 12px;
}

@media (min-width: 960px) {
  .player {
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    bottom: 0;
    padding: 12px 32px;
  }

  .volume {
    display: flex;
  }
}
</style>
