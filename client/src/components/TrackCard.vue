<template>
  <article class="card">
    <div class="cover" @click="play">
      <img v-if="track.coverUrl" :src="track.coverUrl" :alt="track.title" />
      <div v-else class="fallback">
        <img src="/icon.svg" alt="Sona" />
      </div>
    </div>
    <div class="body">
      <div class="title">{{ track.title }}</div>
      <div class="artist">{{ track.artist || "Unknown" }}</div>
    </div>
    <div class="actions">
      <button class="icon-btn" @click="toggleLike">
        <v-icon
          :icon="liked ? 'mdi-heart' : 'mdi-heart-outline'"
          :color="liked ? '#ff6b4a' : undefined"
          size="20"
        />
      </button>
      <button class="icon-btn" @click="play">
        <v-icon icon="mdi-play" size="20" />
      </button>
    </div>
  </article>
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

const liked = computed(() => {
  if (localLiked.value !== null) return localLiked.value;
  return Boolean(props.track.likedByMe);
});

const { mutate } = useMutation<ToggleLikeMutation, ToggleLikeMutationVariables>(TOGGLE_LIKE);
const { run } = useOptimisticMutation<ToggleLikeMutationVariables, ToggleLikeMutation>(mutate);

async function toggleLike() {
  if (!auth.accessToken) {
    toast.push("Нужен вход в аккаунт", "error");
    return;
  }

  const prev = liked.value;
  const next = !prev;
  localLiked.value = next;

  try {
    await run(
      { trackId: String(props.track.id) },
      {
        optimisticResponse: {
          toggleLike: next
        },
        update(cache) {
          const id = cache.identify({ __typename: "Track", id: props.track.id });
          if (id) {
            cache.modify({
              id,
              fields: {
                likedByMe: () => next
              }
            });
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
    toast.push("Не удалось поставить лайк", "error");
  }
}

function play() {
  player.play(props.track);
}
</script>

<style scoped>
.card {
  display: grid;
  grid-template-columns: 44px 1fr auto;
  align-items: center;
  gap: var(--s-sm);
  padding: var(--s-sm);
  border-radius: var(--r-md);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  transition: box-shadow 0.15s;
}

.card:hover {
  box-shadow: var(--shadow);
}

.cover {
  width: 44px;
  height: 44px;
  border-radius: var(--r-sm);
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #222, var(--c-accent));
}

.fallback img {
  width: 18px;
  height: 18px;
}

.body {
  min-width: 0;
}

.title {
  font-weight: 600;
  font-size: 14px;
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

.actions {
  display: flex;
  gap: var(--s-xs);
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background 0.15s;
}

.icon-btn:hover {
  background: var(--c-bg);
}
</style>
