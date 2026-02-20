export const LIMITS = {
  maxTrackSizeBytes: 20 * 1024 * 1024,
  maxCoverSizeBytes: 10 * 1024 * 1024,
  maxDurationSeconds: 10 * 60
};

export const ALLOWED_AUDIO_MIME = new Set(["audio/mpeg"]);
export const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp"
]);

export const RATE_LIMIT = {
  uploadWindowMs: 60 * 1000,
  uploadMaxRequests: 10
};

export const WS = {
  heartbeatMs: 30_000,
  snapshotDebounceMs: 250
};

export const STORAGE = {
  presignedExpiresSeconds: 60 * 10
};
