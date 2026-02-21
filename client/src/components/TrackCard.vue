<template>
  <tr class="row" :class="{ active: isThisPlaying }" @click="togglePlay">
    <td class="cell cover-cell">
      <div class="vinyl" :class="{ spinning: isThisPlaying }">
        <div class="grooves"></div>
        <div class="label">
          <img v-if="track.coverUrl" :src="track.coverUrl" :alt="track.title" />
        </div>
        <div class="hole"></div>
      </div>
    </td>
    <td class="cell title-cell">{{ track.title }}</td>
    <td class="cell artist-cell">
      <canvas v-if="isThisCurrent" ref="eqCanvas" class="eq-canvas" />
      {{ track.artist || "Unknown" }}
    </td>
    <td class="cell actions-cell">
      <a href="#" class="link" @click.stop.prevent="toggleLike">
        {{ liked ? '[Unlike]' : '[Like]' }}
      </a>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { computed, ref, watch, inject, onMounted, onBeforeUnmount } from "vue";
import { useMutation } from "@vue/apollo-composable";
import type { Track } from "@/stores/player";
import { usePlayerStore, getFreqBars, isAnalyserSilent } from "@/stores/player";
import { TOGGLE_LIKE } from "@/graphql/mutations";
import { useToastStore } from "@/stores/toast";
import { useAuthStore } from "@/stores/auth";
import { useOptimisticMutation } from "@/hooks/useOptimisticMutation";
import type { ToggleLikeMutation, ToggleLikeMutationVariables } from "@/graphql/generated";

const props = defineProps<{ track: Track }>();
const player = usePlayerStore();
const trackList = inject<{ value: Track[] }>("trackList", { value: [] });
const toast = useToastStore();
const auth = useAuthStore();
const localLiked = ref<boolean | null>(null);
const eqCanvas = ref<HTMLCanvasElement | null>(null);
let rafId = 0;
let drawing = false;

const isThisPlaying = computed(
  () => player.current?.id === props.track.id && player.isPlaying
);

const isThisCurrent = computed(
  () => player.current?.id === props.track.id
);

function drawEq() {
  const canvas = eqCanvas.value;
  if (!canvas) { drawing = false; return; }
  const ctx = canvas.getContext("2d");
  if (!ctx) { drawing = false; return; }

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = rect.height;
  ctx.clearRect(0, 0, w, h);

  const bars = getFreqBars();
  const gap = 1;
  const barW = (w - gap * (bars.length - 1)) / bars.length;

  const style = getComputedStyle(canvas);
  ctx.fillStyle = style.color;

  for (let i = 0; i < bars.length; i++) {
    const v = bars[i];
    if (v < 0.003) continue;
    const barH = v * h;
    const x = i * (barW + gap);
    ctx.fillRect(x, h - barH, barW, barH);
  }

  if (!isThisPlaying.value && isAnalyserSilent()) {
    drawing = false;
    return;
  }

  rafId = requestAnimationFrame(drawEq);
}

function startDrawing() {
  if (drawing) return;
  drawing = true;
  rafId = requestAnimationFrame(drawEq);
}

onMounted(() => {
  if (isThisPlaying.value) startDrawing();
});

watch(isThisPlaying, (active) => {
  if (active) startDrawing();
});

onBeforeUnmount(() => { drawing = false; cancelAnimationFrame(rafId); });

const liked = computed(() => {
  if (localLiked.value !== null) return localLiked.value;
  return Boolean(props.track.likedByMe);
});

const { mutate } = useMutation<ToggleLikeMutation, ToggleLikeMutationVariables>(TOGGLE_LIKE);
const { run } = useOptimisticMutation<ToggleLikeMutationVariables, ToggleLikeMutation>(mutate);

async function toggleLike() {
  if (!auth.accessToken) {
    toast.push("Login required", "error");
    return;
  }

  const prev = liked.value;
  const next = !prev;
  localLiked.value = next;

  try {
    await run(
      { trackId: String(props.track.id) },
      {
        optimisticResponse: { toggleLike: next },
        update(cache) {
          const id = cache.identify({ __typename: "Track", id: props.track.id });
          if (id) {
            cache.modify({ id, fields: { likedByMe: () => next } });
          }
          if (!next) {
            cache.modify({
              fields: {
                favorites(existing) {
                  if (!existing?.items) return existing;
                  const filtered = existing.items.filter(
                    (ref: { __ref: string }) => ref.__ref !== id
                  );
                  return {
                    ...existing,
                    items: filtered,
                    pageInfo: {
                      ...existing.pageInfo,
                      total: Math.max(0, (existing.pageInfo?.total ?? 1) - 1)
                    }
                  };
                }
              }
            });
          }
        },
        refetchKeysOnError: ["tracks", "favorites"]
      }
    );
  } catch {
    localLiked.value = prev;
    toast.push("Action failed", "error");
  }
}

function togglePlay() {
  player.setQueue(trackList.value);
  if (player.current?.id === props.track.id) {
    player.toggle();
  } else {
    player.play(props.track);
  }
}
</script>

<style scoped>
.row {
  position: relative;
  cursor: pointer;
  user-select: none;
}

.row:hover {
  background: var(--c-highlight);
  color: var(--c-white);
}

.row:hover .link {
  color: var(--c-white);
}

.row:hover .artist-cell {
  color: #ccc;
}

.cell {
  padding: var(--s-xs) var(--s-sm);
  font-size: 12px;
  vertical-align: middle;
  white-space: nowrap;
  border-bottom: 1px solid #bbb;
}

.cover-cell {
  width: 36px;
  padding-right: 0;
}

.vinyl {
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #111;
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
      transparent 1px,
      rgba(255, 255, 255, 0.04) 1.5px,
      transparent 2px
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
  width: 5px;
  height: 5px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: var(--c-window);
  border: 1px solid #666;
  z-index: 1;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.title-cell {
  position: static;
  padding-left: var(--s-md);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: bold;
}

.artist-cell {
  position: relative;
  color: var(--c-muted);
}

.eq-canvas {
  position: absolute;
  top: 0;
  right: 0;
  width: 40%;
  height: 100%;
  opacity: 0.15;
  pointer-events: none;
  color: currentColor;
  z-index: 0;
}

.actions-cell {
  text-align: right;
}

.link {
  color: var(--c-link);
  text-decoration: underline;
  cursor: pointer;
  font-size: 11px;
}
</style>
