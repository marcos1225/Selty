<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'

defineProps<{
  open: boolean
  title?: string
  description?: string
  isDeleting?: boolean
  confirmText?: string
  cancelText?: string
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 flex items-center justify-center p-4"
      >
        <div class="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl space-y-4 text-center">
          <div
            class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto"
          >
            <Trash2 class="w-8 h-8" />
          </div>
          <div>
            <h3 class="text-lg font-black text-gray-900">{{ title || '¿Estás seguro?' }}</h3>
            <p class="text-sm text-gray-500 mt-1">
              {{ description || 'Esta acción no se puede deshacer.' }}
            </p>
          </div>
          <div class="flex flex-col gap-2 pt-2">
            <button
              @click="emit('confirm')"
              :disabled="isDeleting"
              class="w-full py-3 bg-red-500 text-white rounded-2xl font-bold text-sm hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50"
            >
              {{ isDeleting ? 'Eliminando...' : confirmText || 'Sí, eliminar' }}
            </button>
            <button
              @click="emit('update:open', false)"
              :disabled="isDeleting"
              class="w-full py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-200 active:scale-95 transition-all"
            >
              {{ cancelText || 'Cancelar' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>