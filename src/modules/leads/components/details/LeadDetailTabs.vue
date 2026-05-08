<script setup lang="ts">
import { Brain, User, History } from 'lucide-vue-next'

defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const tabs = [
  { id: 'brain', name: 'Brain', icon: Brain },
  { id: 'info', name: 'Info', icon: User },
  { id: 'history', name: 'Historial', icon: History },
]
</script>

<template>
  <div class="flex items-center gap-1 p-1 bg-gray-50/50 border-b border-gray-100 shrink-0">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      @click="emit('update:modelValue', tab.id)"
      class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all relative"
      :class="modelValue === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'"
    >
      <component :is="tab.icon" class="w-4 h-4" />
      {{ tab.name }}
      
      <div 
        v-if="modelValue === tab.id" 
        class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600"
      />
    </button>
  </div>
</template>
