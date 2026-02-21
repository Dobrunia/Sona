<template>
  <section>
    <h2>:: Online Users</h2>
    <p class="subtitle">{{ presence.count }} user(s) connected right now.</p>
    <hr class="groove" />

    <div class="window">
      <div class="title-bar">Who's Listening</div>
      <div class="body">
        <table v-if="presence.users.length" class="table" cellspacing="0">
          <thead>
            <tr>
              <th class="th-user">User</th>
              <th class="th-track">Now Playing</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in presence.users" :key="String(user.id)" class="row">
              <td class="cell user-cell">
                <b>{{ user.profile?.name || user.profile?.email || "Guest" }}</b>
              </td>
              <td class="cell track-cell">
                <template v-if="user.track">
                  <span class="note">♪</span>
                  {{ user.track.title }}
                  <span v-if="user.track.artist" class="artist">— {{ user.track.artist }}</span>
                </template>
                <span v-else class="idle">idle</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty">No users online.</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { usePresenceStore } from "@/stores/presence";

const presence = usePresenceStore();
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
  background: var(--c-surface);
  border-bottom: var(--border-groove);
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

.user-cell {
  white-space: nowrap;
}

.track-cell {
  color: var(--c-text);
}

.note {
  color: var(--c-accent);
  margin-right: 2px;
}

.artist {
  color: var(--c-muted);
}

.idle {
  color: var(--c-muted);
  font-style: italic;
}

.empty {
  padding: var(--s-md);
  text-align: center;
  color: var(--c-muted);
  font-style: italic;
  font-size: 12px;
}
</style>
