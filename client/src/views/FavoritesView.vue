<template>
  <section class="view">
    <div class="intro">
      <h1>Избранное</h1>
      <p>Треки, которые тебе нравятся.</p>
    </div>
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
.view {
  display: grid;
  gap: var(--s-md);
}

.intro h1 {
  margin: 0 0 var(--s-xs);
  font-size: 24px;
}

.intro p {
  margin: 0;
  color: var(--c-muted);
  font-size: 14px;
}
</style>
