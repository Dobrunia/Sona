<template>
  <auth-view v-if="!auth.accessToken" />
  <app-layout v-else />
  <toast-host />
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import AppLayout from "@/layouts/AppLayout.vue";
import AuthView from "@/views/AuthView.vue";
import ToastHost from "@/components/ToastHost.vue";

const auth = useAuthStore();
</script>
