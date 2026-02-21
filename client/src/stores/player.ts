import { defineStore } from "pinia";
import { apolloClient } from "@/plugins/apollo";
import { STREAM_URL_QUERY } from "@/graphql/queries";
import type { StreamUrlQuery, StreamUrlQueryVariables } from "@/graphql/generated";

export type Track = {
  id: number | string;
  title: string;
  artist?: string | null;
  duration?: number | null;
  coverUrl?: string | null;
  likedByMe?: boolean | null;
};

const BAR_COUNT = 32;
const DECAY = 0.92;

let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let source: MediaElementAudioSourceNode | null = null;
let connectedEl: HTMLAudioElement | null = null;
let rawFreq: Uint8Array<ArrayBuffer>;
const smoothBars = new Float32Array(BAR_COUNT);

export function connectAnalyser(el: HTMLAudioElement) {
  if (connectedEl === el) return;
  if (!audioCtx) audioCtx = new AudioContext();
  if (source) source.disconnect();
  source = audioCtx.createMediaElementSource(el);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = 0.75;
  analyser.minDecibels = -90;
  analyser.maxDecibels = -10;
  rawFreq = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
  connectedEl = el;
}

export function getFreqBars(): Float32Array {
  if (!analyser) {
    for (let i = 0; i < BAR_COUNT; i++) smoothBars[i] *= DECAY;
    return smoothBars;
  }

  analyser.getByteFrequencyData(rawFreq);
  const bins = rawFreq.length;

  for (let i = 0; i < BAR_COUNT; i++) {
    const lo = Math.floor((i / BAR_COUNT) ** 1.5 * bins);
    const hi = Math.max(lo + 1, Math.floor(((i + 1) / BAR_COUNT) ** 1.5 * bins));
    let sum = 0;
    for (let j = lo; j < hi; j++) sum += rawFreq[j];
    const raw = (sum / (hi - lo)) / 255;
    smoothBars[i] = Math.max(raw, smoothBars[i] * DECAY);
  }

  return smoothBars;
}

export function isAnalyserSilent(): boolean {
  for (let i = 0; i < BAR_COUNT; i++) {
    if (smoothBars[i] > 0.005) return false;
  }
  return true;
}

export const usePlayerStore = defineStore("player", {
  state: () => ({
    current: null as Track | null,
    queue: [] as Track[],
    isPlaying: false,
    repeat: false,
    progress: 0,
    volume: 0.8,
    streamUrl: null as string | null
  }),
  getters: {
    currentIndex(): number {
      if (!this.current) return -1;
      return this.queue.findIndex((t) => t.id === this.current!.id);
    },
    hasNext(): boolean {
      return this.currentIndex < this.queue.length - 1;
    },
    hasPrev(): boolean {
      return this.currentIndex > 0;
    }
  },
  actions: {
    setQueue(tracks: Track[]) {
      this.queue = tracks;
    },
    async play(track: Track, tracks?: Track[]) {
      if (tracks) this.queue = tracks;
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
    async next() {
      if (!this.hasNext) return;
      await this.play(this.queue[this.currentIndex + 1]);
    },
    async prev() {
      if (!this.hasPrev) return;
      await this.play(this.queue[this.currentIndex - 1]);
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
    },
    toggleRepeat() {
      this.repeat = !this.repeat;
    }
  }
});
