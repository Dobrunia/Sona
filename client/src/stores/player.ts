import { defineStore } from "pinia";
import { apolloClient } from "@/plugins/apollo";
import { STREAM_URL_QUERY } from "@/graphql/queries";
import type { StreamUrlQuery, StreamUrlQueryVariables } from "@/graphql/generated";

export type Track = {
  id: number;
  title: string;
  artist?: string | null;
  duration?: number | null;
  coverUrl?: string | null;
  likedByMe?: boolean | null;
};

export const usePlayerStore = defineStore("player", {
  state: () => ({
    current: null as Track | null,
    isPlaying: false,
    progress: 0,
    volume: 0.8,
    streamUrl: null as string | null
  }),
  actions: {
    async play(track: Track) {
      this.current = track;
      const { data } = await apolloClient.query<StreamUrlQuery, StreamUrlQueryVariables>({
        query: STREAM_URL_QUERY,
        variables: { trackId: String(track.id) },
        fetchPolicy: "no-cache"
      });
      this.streamUrl = data?.streamUrl ?? null;
      this.isPlaying = true;
    },
    toggle() {
      this.isPlaying = !this.isPlaying;
    },
    setProgress(value: number) {
      this.progress = Math.min(Math.max(value, 0), 1);
    },
    setVolume(value: number) {
      this.volume = Math.min(Math.max(value, 0), 1);
    }
  }
});
