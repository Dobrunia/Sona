<template>
  <form class="form" @submit.prevent="handleSubmit">
    <div class="field">
      <label>Название</label>
      <input v-model.trim="form.title" type="text" placeholder="Название трека" />
    </div>
    <div class="field">
      <label>Исполнитель</label>
      <input v-model.trim="form.artist" type="text" placeholder="Имя исполнителя" />
    </div>

    <div class="field">
      <label>MP3 файл</label>
      <div
        class="drop"
        :class="{ active: dragActive }"
        @dragover.prevent="dragActive = true"
        @dragleave.prevent="dragActive = false"
        @drop.prevent="onDropAudio"
      >
        <strong>{{ audioFile?.name ?? "Перетащи mp3 сюда" }}</strong>
        <span class="hint">или нажми, чтобы выбрать файл</span>
        <input type="file" accept="audio/mpeg" @change="onAudioPick" />
      </div>
      <span class="meta" v-if="audioFile">{{ formatBytes(audioFile.size) }}</span>
    </div>

    <div class="field">
      <label>Обложка (опционально)</label>
      <div class="drop compact">
        <strong>{{ coverFile?.name ?? "Выбрать обложку" }}</strong>
        <span class="hint">jpg / png / webp</span>
        <input type="file" accept="image/png,image/jpeg,image/webp" @change="onCoverPick" />
      </div>
      <span class="meta" v-if="coverFile">{{ formatBytes(coverFile.size) }}</span>
    </div>

    <v-alert v-if="error" type="error" variant="tonal">{{ error }}</v-alert>

    <div class="progress-block" v-if="uploading">
      <div class="row"><span>Трек</span><span>{{ audioProgress }}%</span></div>
      <v-progress-linear :model-value="audioProgress" color="primary" height="6" rounded />
      <template v-if="coverFile">
        <div class="row"><span>Обложка</span><span>{{ coverProgress }}%</span></div>
        <v-progress-linear :model-value="coverProgress" color="secondary" height="6" rounded />
      </template>
    </div>

    <button class="submit" :disabled="uploading" type="submit">
      {{ uploading ? "Загрузка..." : "Загрузить" }}
    </button>
  </form>
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
const dragActive = ref(false);
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

function onDropAudio(event: DragEvent) {
  dragActive.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (file) audioFile.value = file;
}

function validate() {
  if (!form.value.title) return "Введите название трека";
  if (!audioFile.value) return "Выберите mp3 файл";
  if (!ALLOWED_AUDIO_MIME.includes(audioFile.value.type)) return "Разрешен только mp3";
  if (audioFile.value.size > LIMITS.maxTrackSizeBytes) return "Файл слишком большой (макс 20MB)";
  if (coverFile.value) {
    if (!ALLOWED_IMAGE_MIME.includes(coverFile.value.type)) return "Обложка должна быть jpg/png/webp";
    if (coverFile.value.size > LIMITS.maxCoverSizeBytes) return "Обложка слишком большая (макс 2MB)";
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

    toast.push("Трек загружен");
    form.value = { title: "", artist: "" };
    audioFile.value = null;
    coverFile.value = null;
  } catch {
    error.value = "Не удалось загрузить трек";
    toast.push("Не удалось загрузить трек", "error");
  } finally {
    uploading.value = false;
  }
}
</script>

<style scoped>
.form {
  display: grid;
  gap: var(--s-md);
  background: var(--c-surface);
  padding: var(--s-lg);
  border-radius: var(--r-lg);
  border: 1px solid var(--c-border);
}

.field {
  display: grid;
  gap: var(--s-xs);
}

label {
  font-size: 12px;
  font-weight: 500;
  color: var(--c-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

input[type="text"] {
  padding: 10px var(--s-sm);
  border-radius: var(--r-sm);
  border: 1px solid var(--c-border);
  font-family: var(--font);
  font-size: 14px;
  color: var(--c-text);
  background: transparent;
  transition: border-color 0.15s;
}

input[type="text"]:focus {
  outline: none;
  border-color: var(--c-text);
}

input[type="text"]::placeholder {
  color: var(--c-muted);
}

.drop {
  position: relative;
  border: 1px dashed var(--c-border);
  border-radius: var(--r-md);
  padding: var(--s-lg) var(--s-md);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.drop.compact {
  padding: var(--s-md);
}

.drop.active,
.drop:hover {
  border-color: var(--c-text);
  background: rgba(0, 0, 0, 0.01);
}

.drop input[type="file"] {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.drop .hint {
  display: block;
  font-size: 12px;
  color: var(--c-muted);
  margin-top: var(--s-xs);
}

.meta {
  font-size: 12px;
  color: var(--c-muted);
}

.progress-block {
  display: grid;
  gap: var(--s-sm);
}

.row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--c-muted);
}

.submit {
  width: 100%;
  padding: 12px;
  border-radius: var(--r-sm);
  border: none;
  background: var(--c-text);
  color: var(--c-surface);
  font-family: var(--font);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.submit:hover:not(:disabled) {
  opacity: 0.85;
}

.submit:disabled {
  opacity: 0.4;
  cursor: default;
}
</style>
