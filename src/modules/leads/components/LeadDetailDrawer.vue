<script setup lang="ts">
import type { Lead } from '@/modules/leads/domain/Lead'
import LeadDetailManager from '@/modules/leads/components/details/LeadDetailManager.vue'

defineProps<{ lead: Lead | null; open: boolean }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
        @click="emit('update:open', false)"
      />
    </Transition>

    <Transition name="slide-right">
      <div
        v-if="open && lead"
        class="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl overflow-hidden"
      >
        <LeadDetailManager :lead="lead" @close="emit('update:open', false)" />
      </div>
    </Transition>
  </Teleport>
</template>