<template>
  <div class="player">
    <audio ref="audioEl" preload="metadata"></audio>

    <div class="left">
      <div class="cover">
        <img v-if="current?.coverUrl" :src="current.coverUrl" :alt="current.title" />
        <img v-else src="/icon.svg" alt="Sona" />
      </div>
      <div class="info">
        <span class="title">{{ current?.title ?? "Не выбрано" }}</span>
        <span class="artist">{{ current?.artist ?? "" }}</span>
      </div>
    </div>

    <div class="center">
      <button class="ctrl" @click="player.toggle" :disabled="!current">
        <v-icon :icon="player.isPlaying ? 'mdi-pause' : 'mdi-play'" size="22" />
      </button>
    </div>

    <div class="right">
      <v-slider
        v-model="progress"
        hide-details
        :min="0"
        :max="100"
        class="slider"
        color="primary"
        track-color="rgba(0,0,0,0.08)"
      />
      <div class="vol">
        <v-icon icon="mdi-volume-high" size="16" />
        <v-slider
          v-model="volume"
          hide-details
          :min="0"
          :max="100"
          class="slider"
          color="primary"
          track-color="rgba(0,0,0,0.08)"
        />
      </div>
    </div>
  </div>
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
  position: fixed;
  left: 0;
  right: 0;
  bottom: var(--nav-h);
  z-index: 15;
  height: var(--player-h);
  display: grid;
  grid-template-columns: 1fr auto 2fr;
  align-items: center;
  gap: var(--s-md);
  padding: 0 var(--s-md);
  background: var(--c-surface);
  border-top: 1px solid var(--c-border);
}

.left {
  display: flex;
  align-items: center;
  gap: var(--s-sm);
  min-width: 0;
}

.cover {
  width: 44px;
  height: 44px;
  border-radius: var(--r-sm);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--c-bg);
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.title {
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.artist {
  font-size: 12px;
  color: var(--c-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.ctrl {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--c-text);
  color: var(--c-surface);
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: opacity 0.15s;
}

.ctrl:disabled {
  opacity: 0.3;
  cursor: default;
}

.ctrl:not(:disabled):hover {
  opacity: 0.8;
}

.right {
  display: flex;
  align-items: center;
  gap: var(--s-sm);
}

.slider {
  flex: 1;
}

.vol {
  display: none;
  align-items: center;
  gap: var(--s-xs);
  color: var(--c-muted);
  width: 120px;
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .vol {
    display: flex;
  }
}

@media (max-width: 480px) {
  .player {
    grid-template-columns: 1fr auto;
    gap: var(--s-sm);
  }

  .right {
    display: none;
  }
}
</style>
