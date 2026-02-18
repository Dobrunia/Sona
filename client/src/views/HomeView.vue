<template>
  <section class="view">
    <div class="intro">
      <h1>Лента</h1>
      <p>Свежие загрузки от сообщества.</p>
    </div>
    <search-bar @update="setSearch" />
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
import SearchBar from "@/components/SearchBar.vue";
import TrackList from "@/components/TrackList.vue";
import PaginationControls from "@/components/PaginationControls.vue";
import { TRACKS_QUERY } from "@/graphql/queries";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useRefreshStore } from "@/stores/refresh";
import type { TracksQuery, TracksQueryVariables } from "@/graphql/generated";

const search = ref("");
const page = ref(1);
const refresh = useRefreshStore();
const debouncedSearch = useDebouncedValue(() => search.value, 350);

const variables = computed<TracksQueryVariables>(() => ({
  search: debouncedSearch.value || null,
  page: page.value,
  pageSize: 10
}));

const { result, loading, error, refetch } = useQuery<TracksQuery, TracksQueryVariables>(
  TRACKS_QUERY,
  variables
);

const items = computed(() => result.value?.tracks?.items ?? []);
const pageInfo = computed(() => result.value?.tracks?.pageInfo ?? null);

watch(debouncedSearch, () => { page.value = 1; });
watch(() => refresh.tracksKey, () => refetch());

function setSearch(value: string) { search.value = value; }
function setPage(value: number) { page.value = value; refetch(); }
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
