<template>
  <div class="player">
    <audio ref="audioEl" preload="metadata"></audio>

    <div class="window">
      <div class="title-bar">
        <span>Now Playing</span>
      </div>
      <div class="body">
        <div class="left">
          <div class="vinyl" :class="{ spinning: player.isPlaying && current }">
            <div class="grooves"></div>
            <div class="label">
              <img v-if="current?.coverUrl" :src="current.coverUrl" :alt="current.title" />
            </div>
            <div class="hole"></div>
          </div>
          <div class="info">
            <b>{{ current?.title ?? "No track selected" }}</b>
            <span class="artist">{{ current?.artist ?? "---" }}</span>
          </div>
        </div>

        <div class="controls">
          <button class="win-btn" @click="player.toggle" :disabled="!current">
            {{ player.isPlaying ? '||' : '>' }}
          </button>
        </div>

        <div class="sliders">
          <div class="slider-row">
            <label>Pos:</label>
            <input
              type="range"
              :value="progress"
              min="0"
              max="100"
              @input="onProgress"
            />
          </div>
          <div class="slider-row">
            <label>Vol:</label>
            <input
              type="range"
              :value="volume"
              min="0"
              max="100"
              @input="onVolume"
            />
          </div>
        </div>
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

const progress = computed(() => Math.round(player.progress * 100));
const volume = computed(() => Math.round(player.volume * 100));

function onProgress(e: Event) {
  player.setProgress(Number((e.target as HTMLInputElement).value) / 100);
}

function onVolume(e: Event) {
  player.setVolume(Number((e.target as HTMLInputElement).value) / 100);
}

watch(
  () => player.streamUrl,
  async (url) => {
    if (!url || !audioEl.value) return;
    audioEl.value.src = url;
    audioEl.value.load();
    if (player.isPlaying) await audioEl.value.play();
  }
);

watch(
  () => player.isPlaying,
  (playing) => {
    if (!audioEl.value) return;
    playing ? audioEl.value.play() : audioEl.value.pause();
  }
);

watch(
  () => player.progress,
  (value) => {
    if (!audioEl.value || !audioEl.value.duration) return;
    const t = value * audioEl.value.duration;
    if (Math.abs(audioEl.value.currentTime - t) > 0.5) audioEl.value.currentTime = t;
  }
);

watch(
  () => player.volume,
  (value) => {
    if (audioEl.value) audioEl.value.volume = value;
  }
);

onMounted(() => {
  if (!audioEl.value) return;
  audioEl.value.volume = player.volume;
  audioEl.value.addEventListener("timeupdate", () => {
    if (!audioEl.value || !audioEl.value.duration) return;
    player.setProgress(audioEl.value.currentTime / audioEl.value.duration);
  });
  audioEl.value.addEventListener("ended", () => { player.toggle(); });
});
</script>

<style scoped>
.player {
  position: fixed;
  left: 0;
  right: 0;
  bottom: var(--nav-h);
  z-index: 15;
  padding: 0 var(--s-sm);
  display: flex;
  justify-content: center;
}

.window {
  width: 100%;
  max-width: var(--col-width);
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
  display: flex;
  align-items: center;
  gap: var(--s-md);
  padding: var(--s-sm);
}

.left {
  display: flex;
  align-items: center;
  gap: var(--s-md);
  min-width: 0;
  flex: 1;
}

.vinyl {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #111;
  flex-shrink: 0;
  animation: spin 2s linear infinite;
  animation-play-state: paused;
}

.vinyl.spinning {
  animation-play-state: running;
}

.grooves {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background:
    repeating-radial-gradient(
      circle at center,
      transparent 0px,
      transparent 1.5px,
      rgba(255, 255, 255, 0.05) 2px,
      transparent 2.5px
    );
}

.label {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  overflow: hidden;
  background: #222;
}

.label img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hole {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 7px;
  height: 7px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: var(--c-surface);
  border: 1px solid #666;
  z-index: 1;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.info {
  min-width: 0;
  font-size: 12px;
  display: flex;
  flex-direction: column;
}

.info b {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.artist {
  color: var(--c-muted);
  font-size: 11px;
}

.controls {
  flex-shrink: 0;
}

.win-btn {
  background: var(--c-surface);
  border: var(--border-raised);
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  width: 32px;
  height: 28px;
  display: grid;
  place-items: center;
}

.win-btn:active {
  border: var(--border-sunken);
}

.win-btn:disabled {
  color: #808080;
  cursor: default;
}

.sliders {
  display: flex;
  flex-direction: column;
  gap: var(--s-xs);
  flex: 1;
  min-width: 80px;
}

.slider-row {
  display: flex;
  align-items: center;
  gap: var(--s-sm);
  font-size: 10px;
  font-family: "Tahoma", sans-serif;
}

.slider-row label {
  width: 24px;
  color: var(--c-muted);
}

.slider-row input[type="range"] {
  flex: 1;
  height: 14px;
  cursor: pointer;
}

@media (max-width: 480px) {
  .sliders {
    display: none;
  }
}
</style>
