<template>
  <div class="window">
    <div class="title-bar">Upload Track</div>
    <form class="body" @submit.prevent="handleSubmit">
      <table class="form-table" cellspacing="0">
        <tr>
          <td class="label">Title:</td>
          <td><input v-model.trim="form.title" type="text" class="input full" /></td>
        </tr>
        <tr>
          <td class="label">Artist:</td>
          <td><input v-model.trim="form.artist" type="text" class="input full" /></td>
        </tr>
        <tr>
          <td class="label">MP3 File:</td>
          <td>
            <input type="file" accept="audio/mpeg" @change="onAudioPick" class="file-input" />
            <span v-if="audioFile" class="meta">({{ formatBytes(audioFile.size) }})</span>
          </td>
        </tr>
        <tr>
          <td class="label">Cover:</td>
          <td>
            <input type="file" accept="image/png,image/jpeg,image/webp" @change="onCoverPick" class="file-input" />
            <span v-if="coverFile" class="meta">({{ formatBytes(coverFile.size) }})</span>
          </td>
        </tr>
      </table>

      <div v-if="error" class="error-box">ERROR: {{ error }}</div>

      <div v-if="uploading" class="progress-box">
        <div>Uploading track... {{ audioProgress }}%</div>
        <div class="progress-bar">
          <div class="fill" :style="{ width: audioProgress + '%' }"></div>
        </div>
        <template v-if="coverFile">
          <div>Uploading cover... {{ coverProgress }}%</div>
          <div class="progress-bar">
            <div class="fill" :style="{ width: coverProgress + '%' }"></div>
          </div>
        </template>
      </div>

      <div class="actions">
        <button type="submit" class="win-btn" :disabled="uploading">
          {{ uploading ? 'Uploading...' : 'Upload' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { gql } from "@apollo/client/core";
import { REQUEST_TRACK_UPLOAD, CREATE_TRACK } from "@/graphql/mutations";
import { ALLOWED_AUDIO_MIME, ALLOWED_IMAGE_MIME, LIMITS } from "@/constants";
import { useToastStore } from "@/stores/toast";
import { useOptimisticMutation } from "@/hooks/useOptimisticMutation";
import type {
  CreateTrackMutation,
  CreateTrackMutationVariables,
  RequestTrackUploadMutation,
  RequestTrackUploadMutationVariables
} from "@/graphql/generated";

const form = ref({ title: "", artist: "" });
const audioFile = ref<File | null>(null);
const coverFile = ref<File | null>(null);
const uploading = ref(false);
const audioProgress = ref(0);
const coverProgress = ref(0);
const error = ref("");
const toast = useToastStore();

const { mutate: requestUpload } = useMutation<
  RequestTrackUploadMutation,
  RequestTrackUploadMutationVariables
>(REQUEST_TRACK_UPLOAD);
const { mutate: createTrack } = useMutation<CreateTrackMutation, CreateTrackMutationVariables>(
  CREATE_TRACK
);
const { run: runCreateTrack } = useOptimisticMutation<
  CreateTrackMutationVariables,
  CreateTrackMutation
>(createTrack);

const NEW_TRACK_FRAGMENT = gql`
  fragment NewTrack on Track {
    id
    title
    artist
    duration
    coverUrl
    likedByMe
  }
`;

function formatBytes(value: number) {
  const mb = value / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}

function onAudioPick(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) audioFile.value = file;
}

function onCoverPick(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) coverFile.value = file;
}

function validate() {
  if (!form.value.title) return "Title is required";
  if (!audioFile.value) return "MP3 file is required";
  if (!ALLOWED_AUDIO_MIME.includes(audioFile.value.type)) return "Only MP3 allowed";
  if (audioFile.value.size > LIMITS.maxTrackSizeBytes) return "File too large (max 20MB)";
  if (coverFile.value) {
    if (!ALLOWED_IMAGE_MIME.includes(coverFile.value.type)) return "Cover must be jpg/png/webp";
    if (coverFile.value.size > LIMITS.maxCoverSizeBytes) return "Cover too large (max 10MB)";
  }
  return "";
}

function uploadToUrl(url: string, file: File, onProgress: (v: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Upload failed")));
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });
}

async function handleSubmit() {
  error.value = "";
  const msg = validate();
  if (msg) { error.value = msg; return; }
  if (!audioFile.value) return;

  uploading.value = true;
  audioProgress.value = 0;
  coverProgress.value = 0;

  try {
    const result = await requestUpload({
      input: {
        title: form.value.title,
        artist: form.value.artist || null,
        fileName: audioFile.value.name,
        fileSize: audioFile.value.size,
        fileMimeType: audioFile.value.type,
        coverFileName: coverFile.value?.name ?? null,
        coverSize: coverFile.value?.size ?? null,
        coverMimeType: coverFile.value?.type ?? null
      }
    });

    const payload = result?.data?.requestTrackUpload;
    if (!payload) throw new Error("Upload request failed");

    await uploadToUrl(payload.uploadUrl, audioFile.value, (v) => { audioProgress.value = v; });

    if (coverFile.value && payload.coverUploadUrl) {
      await uploadToUrl(payload.coverUploadUrl, coverFile.value, (v) => { coverProgress.value = v; });
    }

    await runCreateTrack(
      {
        input: {
          title: form.value.title,
          artist: form.value.artist || null,
          fileKey: payload.fileKey,
          fileSize: audioFile.value.size,
          coverKey: payload.coverKey ?? null,
          coverSize: coverFile.value?.size ?? null
        }
      },
      {
        update(cache, result) {
          const created = result?.createTrack;
          if (!created) return;
          const ref = cache.writeFragment({
            data: {
              __typename: "Track",
              id: created.id,
              title: created.title,
              artist: created.artist,
              duration: created.duration,
              coverUrl: created.coverUrl,
              likedByMe: false
            },
            fragment: NEW_TRACK_FRAGMENT
          });
          cache.modify({
            fields: {
              tracks(existing) {
                if (!existing?.items) return existing;
                return {
                  ...existing,
                  items: [ref, ...existing.items],
                  pageInfo: { ...existing.pageInfo, total: (existing.pageInfo?.total ?? 0) + 1 }
                };
              }
            }
          });
        },
        refetchKeysOnError: ["tracks"]
      }
    );

    toast.push("Track uploaded!");
    form.value = { title: "", artist: "" };
    audioFile.value = null;
    coverFile.value = null;
  } catch (err) {
    console.error("[UploadForm]", err);
    error.value = "Upload failed";
    toast.push("Upload failed", "error");
  } finally {
    uploading.value = false;
  }
}
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
  padding: var(--s-md);
}

.form-table {
  width: 100%;
  font-size: 12px;
  font-family: "Tahoma", "Arial", sans-serif;
}

.form-table td {
  padding: var(--s-xs) var(--s-sm);
  vertical-align: middle;
}

.label {
  font-weight: bold;
  white-space: nowrap;
  width: 70px;
}

.input {
  border: var(--border-sunken);
  background: var(--c-input-bg);
  padding: 2px var(--s-sm);
  font-family: var(--font);
  font-size: 13px;
}

.input.full {
  width: 100%;
}

.input:focus {
  outline: 1px dotted var(--c-text);
}

.file-input {
  font-size: 11px;
  font-family: "Tahoma", "Arial", sans-serif;
}

.meta {
  font-size: 11px;
  color: var(--c-muted);
}

.error-box {
  margin-top: var(--s-md);
  padding: var(--s-sm);
  border: var(--border-sunken);
  background: #fff0f0;
  color: #cc0000;
  font-size: 12px;
  font-weight: bold;
}

.progress-box {
  margin-top: var(--s-md);
  font-size: 11px;
  display: grid;
  gap: var(--s-xs);
}

.progress-bar {
  height: 14px;
  border: var(--border-sunken);
  background: var(--c-input-bg);
}

.fill {
  height: 100%;
  background: var(--c-accent);
  transition: width 0.2s;
}

.actions {
  margin-top: var(--s-md);
}

.win-btn {
  background: var(--c-surface);
  border: var(--border-raised);
  font-family: "Tahoma", "Arial", sans-serif;
  font-size: 12px;
  padding: 2px 16px;
  cursor: pointer;
}

.win-btn:active {
  border: var(--border-sunken);
}

.win-btn:disabled {
  color: #808080;
  cursor: default;
}
</style>
