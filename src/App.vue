<script setup lang="ts">
import { RouterView } from 'vue-router'
import GlobalToast from '@/shared/components/ui/GlobalToast.vue'
</script>

<template>
  <RouterView />
  <GlobalToast />
</template>
