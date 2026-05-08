<script setup lang="ts">
import { X, Check } from 'lucide-vue-next'
import { useLeadsStore } from '@/modules/leads/application/stores/useLeadsStore'
import { useStatusesStore } from '@/modules/statuses/application/stores/useStatusesStore'
import { useSectorsStore } from '@/modules/sectors/application/stores/useSectorsStore'
import { LEAD_PRIORITY, type LeadPriority } from '@/modules/leads/domain/constants'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const leadsStore = useLeadsStore()
const statusesStore = useStatusesStore()
const sectorsStore = useSectorsStore()

const priorities: { value: LeadPriority | null; label: string }[] = [
  { value: null, label: 'Todas las prioridades' },
  { value: LEAD_PRIORITY.HIGH, label: 'Alta' },
  { value: LEAD_PRIORITY.MEDIUM, label: 'Media' },
  { value: LEAD_PRIORITY.LOW, label: 'Baja' },
]

function close() {
  emit('update:open', false)
}

function resetFilters() {
  leadsStore.filterStatusId = null
  leadsStore.filterPriority = null
  leadsStore.filterSectorId = null
  close()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 bg-black/40 z-40" @click="close" />
    </Transition>

    <Transition name="slide-up">
      <div v-if="open" class="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 pb-safe">
        <div class="flex justify-center pt-3 pb-1">
          <div class="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        <div class="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 class="text-base font-semibold text-gray-900">Filtros</h2>
          <button
            @click="close"
            class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="px-5 py-4 space-y-5 max-h-[60vh] overflow-y-auto">
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Estado</p>
            <div class="space-y-1">
              <button
                @click="leadsStore.filterStatusId = null"
                class="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm transition-colors"
                :class="
                  !leadsStore.filterStatusId
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                "
              >
                <span>Todos los estados</span>
                <Check v-if="!leadsStore.filterStatusId" class="w-4 h-4 text-blue-600" />
              </button>
              <button
                v-for="s in statusesStore.statuses.filter((s) => !s.is_final)"
                :key="s.id"
                @click="leadsStore.filterStatusId = s.id"
                class="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm transition-colors"
                :class="
                  leadsStore.filterStatusId === s.id
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                "
              >
                <div class="flex items-center gap-2.5">
                  <span
                    class="w-2.5 h-2.5 rounded-full shrink-0"
                    :style="{ backgroundColor: s.color }"
                  />
                  <span>{{ s.name }}</span>
                </div>
                <Check v-if="leadsStore.filterStatusId === s.id" class="w-4 h-4 text-blue-600" />
              </button>
            </div>
          </div>

          <div v-if="sectorsStore.sectors.length">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Sector</p>
            <div class="space-y-1">
              <button
                @click="leadsStore.filterSectorId = null"
                class="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm transition-colors"
                :class="
                  !leadsStore.filterSectorId
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                "
              >
                <span>Todos los sectores</span>
                <Check v-if="!leadsStore.filterSectorId" class="w-4 h-4 text-blue-600" />
              </button>
              <button
                v-for="s in sectorsStore.sectors"
                :key="s.id"
                @click="leadsStore.filterSectorId = s.id"
                class="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm transition-colors"
                :class="
                  leadsStore.filterSectorId === s.id
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                "
              >
                <div class="flex items-center gap-2.5">
                  <span
                    class="w-2.5 h-2.5 rounded-full shrink-0"
                    :style="{ backgroundColor: s.color }"
                  />
                  <span>{{ s.name }}</span>
                </div>
                <Check v-if="leadsStore.filterSectorId === s.id" class="w-4 h-4 text-blue-600" />
              </button>
            </div>
          </div>

          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Prioridad
            </p>
            <div class="space-y-1">
              <button
                v-for="p in priorities"
                :key="p.value ?? 'all'"
                @click="leadsStore.filterPriority = p.value"
                class="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm transition-colors"
                :class="
                  leadsStore.filterPriority === p.value
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                "
              >
                <span>{{ p.label }}</span>
                <Check v-if="leadsStore.filterPriority === p.value" class="w-4 h-4 text-blue-600" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex gap-3 px-5 py-4 border-t border-gray-100">
          <button
            @click="resetFilters"
            class="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Limpiar
          </button>
          <button
            @click="close"
            class="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Aplicar
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>