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
        <div>
          <strong>{{ audioFile?.name ?? "Перетащи mp3 сюда" }}</strong>
          <p>или нажми, чтобы выбрать файл</p>
        </div>
        <input type="file" accept="audio/mpeg" @change="onAudioPick" />
      </div>
      <div class="hint" v-if="audioFile">
        {{ formatBytes(audioFile.size) }}
      </div>
    </div>

    <div class="field">
      <label>Обложка (опционально)</label>
      <div class="drop small">
        <div>
          <strong>{{ coverFile?.name ?? "Выбрать обложку" }}</strong>
          <p>jpg / png / webp</p>
        </div>
        <input type="file" accept="image/png,image/jpeg,image/webp" @change="onCoverPick" />
      </div>
      <div class="hint" v-if="coverFile">
        {{ formatBytes(coverFile.size) }}
      </div>
    </div>

    <v-alert v-if="error" type="error" variant="tonal">{{ error }}</v-alert>

    <div class="progress" v-if="uploading">
      <div>
        <span>Загрузка трека</span>
        <span>{{ audioProgress }}%</span>
      </div>
      <v-progress-linear :model-value="audioProgress" color="primary" height="8" rounded></v-progress-linear>
      <div v-if="coverFile">
        <span>Обложка</span>
        <span>{{ coverProgress }}%</span>
      </div>
      <v-progress-linear
        v-if="coverFile"
        :model-value="coverProgress"
        color="secondary"
        height="6"
        rounded
      ></v-progress-linear>
    </div>

    <v-btn :disabled="uploading" color="primary" size="large" type="submit">
      {{ uploading ? "Загрузка..." : "Загрузить" }}
    </v-btn>
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

const form = ref({
  title: "",
  artist: ""
});

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
const { run: runCreateTrack } = useOptimisticMutation<CreateTrackMutationVariables, CreateTrackMutation>(
  createTrack
);

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
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  audioFile.value = file;
}

function onCoverPick(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  coverFile.value = file;
}

function onDropAudio(event: DragEvent) {
  dragActive.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (!file) return;
  audioFile.value = file;
}

function validate() {
  if (!form.value.title) {
    return "Введите название трека";
  }
  if (!audioFile.value) {
    return "Выберите mp3 файл";
  }
  if (!ALLOWED_AUDIO_MIME.includes(audioFile.value.type)) {
    return "Разрешен только mp3";
  }
  if (audioFile.value.size > LIMITS.maxTrackSizeBytes) {
    return "Файл слишком большой (макс 20MB)";
  }
  if (coverFile.value) {
    if (!ALLOWED_IMAGE_MIME.includes(coverFile.value.type)) {
      return "Обложка должна быть jpg/png/webp";
    }
    if (coverFile.value.size > LIMITS.maxCoverSizeBytes) {
      return "Обложка слишком большая (макс 2MB)";
    }
  }
  return "";
}

function uploadToUrl(url: string, file: File, onProgress: (value: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const percent = Math.round((event.loaded / event.total) * 100);
      onProgress(percent);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error("Upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed"));

    xhr.send(file);
  });
}

async function handleSubmit() {
  error.value = "";
  const validationError = validate();
  if (validationError) {
    error.value = validationError;
    return;
  }

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
    if (!payload) {
      throw new Error("Upload request failed");
    }

    await uploadToUrl(payload.uploadUrl, audioFile.value, (value) => {
      audioProgress.value = value;
    });

    if (coverFile.value && payload.coverUploadUrl) {
      await uploadToUrl(payload.coverUploadUrl, coverFile.value, (value) => {
        coverProgress.value = value;
      });
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
                  pageInfo: {
                    ...existing.pageInfo,
                    total: (existing.pageInfo?.total ?? 0) + 1
                  }
                };
              }
            }
          });
        },
        refetchKeysOnError: ["tracks"]
      }
    );

    toast.push("Трек загружен");
    form.value.title = "";
    form.value.artist = "";
    audioFile.value = null;
    coverFile.value = null;
  } catch (err) {
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
  gap: 16px;
  background: #ffffff;
  padding: 20px;
  border-radius: 18px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.field {
  display: grid;
  gap: 8px;
  font-size: 14px;
}

input[type="text"] {
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.drop {
  position: relative;
  border: 1px dashed rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  padding: 16px;
  display: grid;
  gap: 6px;
  background: #fafafa;
  cursor: pointer;
}

.drop.small {
  padding: 12px;
}

.drop.active {
  border-color: #111111;
  background: #f2f2f2;
}

.drop input[type="file"] {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.drop p {
  margin: 0;
  font-size: 12px;
  color: #6f6f6f;
}

.hint {
  font-size: 12px;
  color: #5f5f5f;
}

.progress {
  display: grid;
  gap: 8px;
}

.progress div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #5f5f5f;
}
</style>
