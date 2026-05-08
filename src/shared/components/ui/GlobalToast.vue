<script setup lang="ts">
import { useToast } from '@/shared/composables/useToast'
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-vue-next'

const { toast } = useToast()
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="toast"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-100 px-4 py-3 rounded-2xl text-sm font-semibold shadow-xl flex items-center gap-2.5 max-w-sm w-max"
        :class="{
          'bg-emerald-600 text-white': toast.type === 'success',
          'bg-rose-600 text-white': toast.type === 'error',
          'bg-slate-800 text-white': toast.type === 'info',
          'bg-amber-500 text-white': toast.type === 'warning',
        }"
      >
        <CheckCircle v-if="toast.type === 'success'" class="w-4 h-4 shrink-0" />
        <XCircle v-else-if="toast.type === 'error'" class="w-4 h-4 shrink-0" />
        <AlertTriangle v-else-if="toast.type === 'warning'" class="w-4 h-4 shrink-0" />
        <Info v-else class="w-4 h-4 shrink-0" />
        <span>{{ toast.message }}</span>
      </div>
    </Transition>
  </Teleport>
</template>
