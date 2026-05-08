<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { TrendingUp, Phone, Mail, Trophy, XCircle, Search } from 'lucide-vue-next'
import AppLayout from '@/shared/components/layout/AppLayout.vue'
import { useLeadsStore } from '@/modules/leads/application/stores/useLeadsStore'
import { useStatusesStore } from '@/modules/statuses/application/stores/useStatusesStore'
import { formatDate } from '@/shared/utils/formatDate'
import type { Lead } from '@/modules/leads/domain/Lead'

const leadsStore = useLeadsStore()
const statusesStore = useStatusesStore()

const searchQuery = ref('')
const filterFinalStatusId = ref<string | null>(null)

const finalStatuses = computed(() => statusesStore.statuses.filter(s => s.is_final))

const statusMap = computed(() =>
  Object.fromEntries(statusesStore.statuses.map(s => [s.id, s]))
)

const filteredLeads = computed(() => {
  let result = leadsStore.historialLeads

  if (filterFinalStatusId.value) {
    result = result.filter(l => l.status_id === filterFinalStatusId.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.phone?.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q)
    )
  }

  return result.slice().sort((a, b) =>
    new Date(b.updated_at ?? b.created_at).getTime() - new Date(a.updated_at ?? a.created_at).getTime()
  )
})

const totalValue = computed(() =>
  filteredLeads.value.reduce((sum, l) => sum + (l.estimated_value ?? 0), 0)
)

function formatValue(value: number | null) {
  if (!value) return null
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
}

function getStatusForLead(lead: Lead) {
  return statusMap.value[lead.status_id] || { name: 'Desconocido', color: '#6b7280' }
}

onMounted(async () => {
  if (!statusesStore.statuses.length) await statusesStore.fetchStatuses()
  if (!leadsStore.leads.length) await leadsStore.fetchLeads()
})
</script>

<template>
  <AppLayout>
    <template #default>
      <div class="flex items-center justify-between mb-4 md:mb-6">
        <h1 class="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Historial</h1>
        <div v-if="totalValue > 0"
          class="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
          <TrendingUp class="w-4 h-4 text-emerald-600" />
          <span class="text-sm font-semibold text-emerald-700">{{ formatValue(totalValue) }}</span>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input v-model="searchQuery" type="text" placeholder="Buscar lead..."
            class="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>

        <div class="flex gap-2 flex-wrap">
          <button @click="filterFinalStatusId = null"
            class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors" :class="filterFinalStatusId === null
              ? 'bg-gray-900 text-white'
              : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-700'">
            Todos
          </button>
          <button v-for="s in finalStatuses" :key="s.id"
            @click="filterFinalStatusId = filterFinalStatusId === s.id ? null : s.id"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border"
            :class="filterFinalStatusId === s.id
              ? 'text-white border-transparent'
              : 'bg-white border-gray-200 text-gray-500 hover:text-gray-700'"
            :style="filterFinalStatusId === s.id ? { backgroundColor: s.color, borderColor: s.color } : {}">
            <span class="w-2 h-2 rounded-full shrink-0"
              :style="{ backgroundColor: filterFinalStatusId === s.id ? 'white' : s.color }" />
            {{ s.name }}
          </button>
        </div>
      </div>

      <div v-if="leadsStore.isLoading" class="flex items-center justify-center h-40 text-gray-400 text-sm">
        Cargando...
      </div>

      <div v-else-if="filteredLeads.length === 0"
        class="flex flex-col items-center justify-center h-40 text-gray-400 gap-3">
        <Trophy class="w-10 h-10 opacity-30" />
        <p class="text-sm">Sin leads en el historial</p>
      </div>

      <div v-else class="flex flex-col gap-3">
        <div v-for="lead in filteredLeads" :key="lead.id"
          class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
          <div class="flex items-start gap-3">
            <img
              :src="lead.avatar_url ?? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(lead.name)}`"
              :alt="lead.name" class="w-10 h-10 rounded-full object-cover border border-gray-100 shrink-0" />

            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <h4 class="text-sm font-semibold text-gray-900">{{ lead.name }}</h4>
                  <span class="text-xs text-gray-400">{{ formatDate(lead.updated_at ?? lead.created_at) }}</span>
                </div>

                <div v-if="getStatusForLead(lead)"
                  class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0" :style="{
                    backgroundColor: getStatusForLead(lead).color + '20',
                    color: getStatusForLead(lead).color
                  }">
                  <Trophy v-if="getStatusForLead(lead).name.toLowerCase().includes('ganad')" class="w-3 h-3" />
                  <XCircle v-else class="w-3 h-3" />
                  {{ getStatusForLead(lead).name }}
                </div>
              </div>

              <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                <div v-if="lead.phone" class="flex items-center gap-1.5 text-gray-500 text-xs">
                  <Phone class="w-3.5 h-3.5" />
                  <span>{{ lead.phone }}</span>
                </div>
                <div v-if="lead.email" class="flex items-center gap-1.5 text-gray-500 text-xs">
                  <Mail class="w-3.5 h-3.5" />
                  <span class="truncate">{{ lead.email }}</span>
                </div>
                <div v-if="formatValue(lead.estimated_value)"
                  class="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
                  <TrendingUp class="w-3.5 h-3.5" />
                  <span>{{ formatValue(lead.estimated_value) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </AppLayout>
</template>
