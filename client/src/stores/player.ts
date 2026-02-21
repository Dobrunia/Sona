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

const BAR_COUNT = 24;

let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let source: MediaElementAudioSourceNode | null = null;
let connectedEl: HTMLAudioElement | null = null;
const freqData = new Uint8Array(64);

export function connectAnalyser(el: HTMLAudioElement) {
  if (connectedEl === el) return;
  if (!audioCtx) audioCtx = new AudioContext();
  if (source) source.disconnect();
  source = audioCtx.createMediaElementSource(el);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 128;
  analyser.smoothingTimeConstant = 0.7;
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
  connectedEl = el;
}

export function getFreqBars(): number[] {
  if (!analyser) return Array(BAR_COUNT).fill(0);
  analyser.getByteFrequencyData(freqData);
  const bars: number[] = [];
  const step = Math.floor(freqData.length / BAR_COUNT);
  for (let i = 0; i < BAR_COUNT; i++) {
    bars.push(freqData[i * step] / 255);
  }
  return bars;
}

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
      if (audioCtx?.state === "suspended") audioCtx.resume();
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
      if (audioCtx?.state === "suspended") audioCtx.resume();
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
