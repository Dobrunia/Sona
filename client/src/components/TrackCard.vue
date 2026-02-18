<template>
  <article class="card">
    <div class="cover">
      <img v-if="track.coverUrl" :src="track.coverUrl" :alt="track.title" />
      <div v-else class="fallback">
        <img src="/icon.svg" alt="Sona" />
      </div>
    </div>
    <div class="info">
      <div class="title">{{ track.title }}</div>
      <div class="artist">{{ track.artist || "Unknown" }}</div>
    </div>
    <div class="actions">
      <v-btn
        :icon="liked ? 'mdi-heart' : 'mdi-heart-outline'"
        variant="text"
        @click="toggleLike"
      ></v-btn>
      <v-btn icon="mdi-play" variant="text" @click="play"></v-btn>
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
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.cover {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(145deg, rgba(17, 17, 17, 0.9), rgba(255, 107, 74, 0.7));
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
  background: linear-gradient(145deg, rgba(17, 17, 17, 0.9), rgba(255, 107, 74, 0.7));
}

.fallback img {
  width: 24px;
  height: 24px;
}

.title {
  font-weight: 600;
}

.artist {
  font-size: 13px;
  color: #5f5f5f;
}

.actions {
  display: inline-flex;
  gap: 6px;
}
</style>
