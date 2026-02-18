<template>
  <section>
    <h2>:: Favorites</h2>
    <p class="subtitle">Tracks you liked.</p>
    <hr class="groove" />
    <track-list :tracks="items" :loading="loading" :error="Boolean(error)" />
    <pagination-controls
      v-if="pageInfo"
      :page="pageInfo.page"
      :page-size="pageInfo.pageSize"
      :total="pageInfo.total"
      @update="setPage"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useQuery } from "@vue/apollo-composable";
import TrackList from "@/components/TrackList.vue";
import PaginationControls from "@/components/PaginationControls.vue";
import { FAVORITES_QUERY } from "@/graphql/queries";
import { useRefreshStore } from "@/stores/refresh";
import type { FavoritesQuery, FavoritesQueryVariables } from "@/graphql/generated";

const page = ref(1);
const refresh = useRefreshStore();
const { result, loading, error, refetch } = useQuery<FavoritesQuery, FavoritesQueryVariables>(
  FAVORITES_QUERY,
  { page: page.value, pageSize: 20 }
);

const items = computed(() => result.value?.favorites?.items ?? []);
const pageInfo = computed(() => result.value?.favorites?.pageInfo ?? null);

watch(() => refresh.favoritesKey, () => refetch({ page: page.value, pageSize: 20 }));

function setPage(value: number) {
  page.value = value;
  refetch({ page: page.value, pageSize: 20 });
}
</script>

<style scoped>
h2 {
  margin: 0;
  font-size: 16px;
}

.subtitle {
  margin: var(--s-xs) 0 0;
  font-size: 12px;
  color: var(--c-muted);
}

.groove {
  border: none;
  border-top: var(--border-groove);
  margin: var(--s-md) 0;
}
</style>
