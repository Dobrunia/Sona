import { ALLOWED_AUDIO_MIME, ALLOWED_IMAGE_MIME, LIMITS } from "@core/constants.js";
import { badInput } from "@core/errors.js";

export function assertAudio({ mimeType, sizeBytes }: { mimeType: string; sizeBytes: number }) {
  if (!ALLOWED_AUDIO_MIME.has(mimeType)) {
    throw badInput("Only mp3 is allowed");
  }
  if (sizeBytes > LIMITS.maxTrackSizeBytes) {
    throw badInput("Track file too large");
  }
}

export function assertCover({ mimeType, sizeBytes }: { mimeType: string; sizeBytes: number }) {
  if (!ALLOWED_IMAGE_MIME.has(mimeType)) {
    throw badInput("Unsupported cover format");
  }
  if (sizeBytes > LIMITS.maxCoverSizeBytes) {
    throw badInput("Cover file too large");
  }
}

export function assertDuration(durationSeconds: number) {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    throw badInput("Invalid duration");
  }
  if (durationSeconds > LIMITS.maxDurationSeconds) {
    throw badInput("Track too long");
  }
}

export function assertNumberMatch(name: string, expected: number, actual: number) {
  if (expected !== actual) {
    throw badInput(`${name} does not match uploaded file`);
  }
}
