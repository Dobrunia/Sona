<template>
  <div class="window">
    <div class="title-bar">My Uploads</div>
    <div class="body">
      <div v-if="loading" class="status">Loading...</div>
      <div v-else-if="!items.length" class="status empty">You haven't uploaded any tracks yet.</div>
      <table v-else class="table" cellspacing="0">
        <thead>
          <tr>
            <th>Title</th>
            <th>Artist</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="track in items" :key="track.id" class="row">
            <td class="cell">{{ track.title }}</td>
            <td class="cell artist">{{ track.artist || "—" }}</td>
            <td class="cell action">
              <a
                href="#"
                class="link danger"
                @click.prevent="confirmDelete(track)"
              >[Delete]</a>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="pageInfo && pageInfo.total > pageInfo.pageSize" class="pager">
        <a
          href="#"
          class="link"
          :class="{ disabled: page <= 1 }"
          @click.prevent="page > 1 && (page--)"
        >Prev</a>
        <span class="muted">{{ page }} / {{ Math.ceil(pageInfo.total / pageInfo.pageSize) }}</span>
        <a
          href="#"
          class="link"
          :class="{ disabled: !pageInfo.hasNextPage }"
          @click.prevent="pageInfo.hasNextPage && page++"
        >Next</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { MY_TRACKS_QUERY } from "@/graphql/queries";
import { DELETE_TRACK } from "@/graphql/mutations";
import { useToastStore } from "@/stores/toast";
import type { MyTracksQuery, MyTracksQueryVariables } from "@/graphql/generated";

const toast = useToastStore();
const page = ref(1);

const variables = computed<MyTracksQueryVariables>(() => ({
  page: page.value,
  pageSize: 10
}));

const { result, loading, refetch } = useQuery<MyTracksQuery, MyTracksQueryVariables>(
  MY_TRACKS_QUERY,
  variables
);

const items = computed(() => result.value?.myTracks?.items ?? []);
const pageInfo = computed(() => result.value?.myTracks?.pageInfo ?? null);

const { mutate: deleteTrackMutation } = useMutation(DELETE_TRACK);

async function confirmDelete(track: { id: string; title: string }) {
  if (!confirm(`Delete "${track.title}"? This cannot be undone.`)) return;
  try {
    await deleteTrackMutation({ trackId: track.id });
    toast.push("Track deleted");
    refetch();
  } catch {
    toast.push("Delete failed", "error");
  }
}

watch(page, () => refetch());
</script>

<style scoped>
.window {
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
  padding: var(--s-xs);
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  font-family: var(--font);
  background: var(--c-window);
  border: var(--border-sunken);
}

.table th {
  text-align: left;
  padding: var(--s-xs) var(--s-sm);
  font-family: "Tahoma", "Arial", sans-serif;
  font-size: 11px;
  font-weight: bold;
  background: var(--c-surface);
  border-bottom: 2px solid #808080;
}

.row {
  border-bottom: 1px dotted #999;
}

.row:last-child {
  border-bottom: none;
}

.cell {
  padding: var(--s-xs) var(--s-sm);
  vertical-align: middle;
}

.artist {
  color: var(--c-muted);
}

.action {
  text-align: right;
  white-space: nowrap;
}

.link {
  color: var(--c-link);
  text-decoration: underline;
  cursor: pointer;
  font-size: 11px;
}

.link.danger {
  color: #cc0000;
}

.link.disabled {
  color: #808080;
  pointer-events: none;
}

.pager {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--s-md);
  padding: var(--s-sm);
  font-size: 11px;
  font-family: "Tahoma", "Arial", sans-serif;
}

.muted {
  color: var(--c-muted);
}

.status {
  padding: var(--s-md);
  text-align: center;
  font-size: 12px;
}

.empty {
  color: var(--c-muted);
  font-style: italic;
}
</style>
