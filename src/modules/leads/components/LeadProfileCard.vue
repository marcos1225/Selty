<script setup lang="ts">
import { computed } from 'vue'
import { Phone, Mail, TrendingUp, Tag } from 'lucide-vue-next'
import type { Lead } from '@/modules/leads/domain/Lead'
import { useSectorsStore } from '@/modules/sectors/application/stores/useSectorsStore'
import { LEAD_PRIORITY } from '@/modules/leads/domain/constants'
import { formatCurrency } from '@/shared/utils/formatCurrency'

const props = defineProps<{ lead: Lead }>()
const sectorsStore = useSectorsStore()

const sector = computed(() =>
  props.lead.sector_id ? sectorsStore.sectors.find((s) => s.id === props.lead.sector_id) : null,
)

const priorityColors: Record<string, string> = {
  [LEAD_PRIORITY.HIGH]: 'bg-red-100 text-red-700',
  [LEAD_PRIORITY.MEDIUM]: 'bg-amber-100 text-amber-700',
  [LEAD_PRIORITY.LOW]: 'bg-gray-100 text-gray-600',
}
</script>

<template>
  <div class="space-y-4">
    <div class="space-y-2">
      <div v-if="lead.phone" class="flex items-center gap-2.5 text-sm text-gray-600">
        <Phone class="w-4 h-4 text-gray-400 shrink-0" />
        <a :href="`tel:${lead.phone}`" class="hover:text-blue-600 transition-colors">{{
          lead.phone
        }}</a>
      </div>
      <div v-if="lead.email" class="flex items-center gap-2.5 text-sm text-gray-600">
        <Mail class="w-4 h-4 text-gray-400 shrink-0" />
        <span class="truncate">{{ lead.email }}</span>
      </div>
      <div
        v-if="formatCurrency(lead.estimated_value)"
        class="flex items-center gap-2.5 text-sm font-semibold text-emerald-600"
      >
        <TrendingUp class="w-4 h-4 shrink-0" />
        <span>{{ formatCurrency(lead.estimated_value) }}</span>
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <span
        v-if="lead.priority"
        class="text-xs font-medium px-2.5 py-1 rounded-full capitalize"
        :class="priorityColors[lead.priority] ?? 'bg-gray-100 text-gray-600'"
      >
        Prioridad {{ lead.priority }}
      </span>
      <span
        v-if="sector"
        class="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
        :style="{ backgroundColor: sector.color + '20', color: sector.color }"
      >
        <Tag class="w-3 h-3" />
        {{ sector.name }}
      </span>
      <span class="text-xs text-gray-400 px-2.5 py-1 bg-gray-50 rounded-full">
        {{ lead.attempts }} {{ lead.attempts === 1 ? 'intento' : 'intentos' }}
      </span>
    </div>
  </div>
</template>
