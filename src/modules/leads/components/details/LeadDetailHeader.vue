<script setup lang="ts">
import { computed } from 'vue'
import { X, Edit2, Phone, MessageCircle } from 'lucide-vue-next'
import type { Lead } from '@/modules/leads/domain/Lead'
import { useStatusesStore } from '@/modules/statuses/application/stores/useStatusesStore'

const props = defineProps<{
  lead: Lead
  isEditing?: boolean
}>()

const emit = defineEmits<{
  close: []
  edit: []
  cancelEdit: []
}>()

const statusesStore = useStatusesStore()

const status = computed(() =>
  statusesStore.statuses.find((s) => s.id === props.lead.status_id),
)

const initials = computed(() => {
  return props.lead.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const handleCall = () => {
  if (props.lead.phone) {
    window.location.href = `tel:${props.lead.phone}`
  }
}

const handleWhatsApp = () => {
  if (props.lead.phone) {
    const phone = props.lead.phone.replace(/\D/g, '')
    window.open(`https://wa.me/${phone}`, '_blank')
  }
}
</script>

<template>
  <div class="px-5 py-6 border-b border-gray-100 bg-white">
    <div class="flex items-start justify-between mb-6">
      <div class="flex items-center gap-4">
        <div class="relative">
          <img
            :src="lead.avatar_url ?? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(lead.name)}`"
            :alt="lead.name"
            class="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm"
          />
          <div 
            class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
            :style="{ backgroundColor: status?.color ?? '#cbd5e1' }"
          />
        </div>
        
        <div>
          <h2 class="text-lg font-bold text-gray-900 leading-tight mb-1">{{ lead.name }}</h2>
          <div class="flex items-center gap-2">
            <span
              v-if="status"
              class="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md"
              :style="{ backgroundColor: status.color + '15', color: status.color }"
            >
              {{ status.name }}
            </span>
            <span class="text-xs text-gray-400 font-medium">• {{ lead.priority || 'Sin prioridad' }}</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="isEditing ? emit('cancelEdit') : emit('edit')"
          class="p-2 rounded-xl transition-all"
          :class="isEditing ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'"
        >
          <Edit2 class="w-5 h-5" />
        </button>
        <button
          @click="emit('close')"
          class="p-2 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all"
        >
          <X class="w-5 h-5" />
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <button
        @click="handleCall"
        :disabled="!lead.phone"
        class="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-100 text-sm font-semibold transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Phone class="w-4 h-4 text-blue-600" />
        Llamar
      </button>
      <button
        @click="handleWhatsApp"
        :disabled="!lead.phone"
        class="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-100 text-sm font-semibold transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <MessageCircle class="w-4 h-4 text-green-600" />
        WhatsApp
      </button>
    </div>
  </div>
</template>
