<template>
  <section>
    <h2>Feed</h2>
    <p class="subtitle">Latest uploads from the community.</p>
    <hr class="groove" />
    <search-bar @update="setSearch" />
    <br />
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
