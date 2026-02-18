import { defineStore } from "pinia";

export const useRefreshStore = defineStore("refresh", {
  state: () => ({
    tracksKey: 0,
    favoritesKey: 0
  }),
  actions: {
    bumpTracks() {
      this.tracksKey += 1;
    },
    bumpFavorites() {
      this.favoritesKey += 1;
    }
  }
});
