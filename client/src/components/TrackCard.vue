<template>
  <tr class="row" @dblclick="play">
    <td class="cell cover-cell">
      <div class="vinyl" :class="{ spinning: isThisPlaying }">
        <div class="grooves"></div>
        <div class="label">
          <img v-if="track.coverUrl" :src="track.coverUrl" :alt="track.title" />
        </div>
        <div class="hole"></div>
      </div>
    </td>
    <td class="cell title-cell">
      <a href="#" class="track-link" @click.prevent="play">{{ track.title }}</a>
    </td>
    <td class="cell artist-cell">{{ track.artist || "Unknown" }}</td>
    <td class="cell actions-cell">
      <a href="#" class="link" @click.prevent="toggleLike">
        {{ liked ? '[Unlike]' : '[Like]' }}
      </a>
      &nbsp;
      <a href="#" class="link" @click.prevent="play">[Play]</a>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import type { Track } from "@/stores/player";
import { usePlayerStore } from "@/stores/player";
import { TOGGLE_LIKE } from "@/graphql/mutations";
import { useToastStore } from "@/stores/toast";
import { useAuthStore } from "@/stores/auth";
import { useOptimisticMutation } from "@/hooks/useOptimisticMutation";
import type { ToggleLikeMutation, ToggleLikeMutationVariables } from "@/graphql/generated";

const props = defineProps<{ track: Track }>();
const player = usePlayerStore();
const toast = useToastStore();
const auth = useAuthStore();
const localLiked = ref<boolean | null>(null);

const isThisPlaying = computed(
  () => player.current?.id === props.track.id && player.isPlaying
);

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

function play() {
  player.play(props.track);
}
</script>

<style scoped>
.row:hover {
  background: var(--c-highlight);
  color: var(--c-white);
}

.row:hover .link,
.row:hover .track-link {
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
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-link {
  color: var(--c-link);
  text-decoration: underline;
  cursor: pointer;
}

.artist-cell {
  color: var(--c-muted);
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
