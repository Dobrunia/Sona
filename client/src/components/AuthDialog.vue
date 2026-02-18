<template>
  <v-dialog v-model="open" max-width="420">
    <template #activator="{ props }">
      <v-btn v-bind="props" variant="text" class="icon-button" icon="mdi-account"></v-btn>
    </template>
    <v-card>
      <v-card-title>{{ auth.user ? "Профиль" : "Вход" }}</v-card-title>
      <v-card-text>
        <auth-panel @done="open = false" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import AuthPanel from "@/components/AuthPanel.vue";

const open = ref(false);
const auth = useAuthStore();
</script>
