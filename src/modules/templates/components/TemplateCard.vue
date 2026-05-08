<script setup lang="ts">
import { Pencil, Trash2 } from 'lucide-vue-next'
import type { MessageTemplate } from '@/modules/templates/domain/MessageTemplate'
import { applyTemplateVariables } from '@/modules/templates/domain/MessageTemplate'

withDefaults(defineProps<{
  template: MessageTemplate
  viewMode?: 'card' | 'list'
}>(), {
  viewMode: 'card'
})

defineEmits<{
  (e: 'edit', template: MessageTemplate): void
  (e: 'delete', template: MessageTemplate): void
}>()

const PREVIEW_NAME = 'Juan'
</script>

<template>
  <div v-if="viewMode === 'card'" class="group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
    <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
      <p class="text-sm font-semibold text-gray-800 truncate">{{ template.name }}</p>
      <div class="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0 ml-2">
        <button @click="$emit('edit', template)" class="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Editar">
          <Pencil class="w-3.5 h-3.5" />
        </button>
        <button @click="$emit('delete', template)" class="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Eliminar">
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <div class="px-5 py-4">
      <p class="text-sm text-gray-600 whitespace-pre-line line-clamp-4 leading-relaxed">
        {{ applyTemplateVariables(template.content, { nombre: PREVIEW_NAME }) }}
      </p>
    </div>

    <div v-if="template.content.includes('{{nombre}}')" class="px-5 pb-3.5">
      <span class="text-xs bg-blue-50 text-blue-600 font-mono px-2 py-0.5 rounded">{{ PREVIEW_NAME }}</span>
    </div>
  </div>

  <div v-else class="px-4 py-3.5">
    <div class="flex items-start justify-between gap-3">
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-gray-800">{{ template.name }}</p>
        <p class="text-sm text-gray-500 mt-1 line-clamp-2">{{ template.content }}</p>
      </div>
      <div class="flex items-center gap-1 shrink-0">
        <button @click="$emit('edit', template)" class="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
          <Pencil class="w-3.5 h-3.5" />
        </button>
        <button @click="$emit('delete', template)" class="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>
