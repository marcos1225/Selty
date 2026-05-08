<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, SlidersHorizontal, ChevronDown, Check, LayoutGrid, ListTodo } from 'lucide-vue-next'
import AppLayout from '@/shared/components/layout/AppLayout.vue'
import KanbanBoard from '@/modules/leads/components/kanban/KanbanBoard.vue'
import CreateLeadDialog from '@/modules/leads/components/CreateLeadDialog.vue'
import FiltersDrawer from '@/modules/leads/components/FiltersDrawer.vue'
import LeadDetailDrawer from '@/modules/leads/components/LeadDetailDrawer.vue'
import LeadsAgenda from '@/modules/leads/components/LeadsAgenda.vue'
import { useLeadsStore } from '@/modules/leads/application/stores/useLeadsStore'
import { useStatusesStore } from '@/modules/statuses/application/stores/useStatusesStore'
import { useSectorsStore } from '@/modules/sectors/application/stores/useSectorsStore'
import { useMessageTemplatesStore } from '@/modules/templates/application/stores/useMessageTemplatesStore'
import { LEAD_PRIORITY, type LeadPriority } from '@/modules/leads/domain/constants'

const leadsStore = useLeadsStore()
const statusesStore = useStatusesStore()
const sectorsStore = useSectorsStore()
const templatesStore = useMessageTemplatesStore()

const activeTab = ref<'agenda' | 'tablero'>('agenda')
const dialogOpen = ref(false)
const filtersDrawerOpen = ref(false)
const statusDropdownOpen = ref(false)
const priorityDropdownOpen = ref(false)

const priorities: { value: LeadPriority | null; label: string }[] = [
  { value: null, label: 'Todas las prioridades' },
  { value: LEAD_PRIORITY.HIGH, label: 'Alta' },
  { value: LEAD_PRIORITY.MEDIUM, label: 'Media' },
  { value: LEAD_PRIORITY.LOW, label: 'Baja' },
]

const selectedStatusLabel = () => {
  if (!leadsStore.filterStatusId) return 'Todos los estados'
  return (
    statusesStore.statuses.find((s) => s.id === leadsStore.filterStatusId)?.name ??
    'Todos los estados'
  )
}

const selectedPriorityLabel = () => {
  return (
    priorities.find((p) => p.value === leadsStore.filterPriority)?.label ?? 'Todas las prioridades'
  )
}

function selectStatus(id: string | null) {
  leadsStore.filterStatusId = id
  statusDropdownOpen.value = false
}

function selectPriority(value: LeadPriority | null) {
  leadsStore.filterPriority = value
  priorityDropdownOpen.value = false
}

function toggleStatusDropdown() {
  statusDropdownOpen.value = !statusDropdownOpen.value
  priorityDropdownOpen.value = false
}

function togglePriorityDropdown() {
  priorityDropdownOpen.value = !priorityDropdownOpen.value
  statusDropdownOpen.value = false
}

const pageTitle = computed(() => (activeTab.value === 'agenda' ? 'Agenda' : 'Tablero'))
const pageSubtitle = computed(() =>
  activeTab.value === 'agenda'
    ? `Tienes ${leadsStore.todayFollowUps.length} tareas pendientes para hoy.`
    : 'Gestiona el progreso de tus prospectos y ventas.',
)

onMounted(async () => {
  await leadsStore.fetchLeads()
  if (leadsStore.todayFollowUps.length === 0) {
    activeTab.value = 'tablero'
  }
  if (!statusesStore.statuses.length) statusesStore.fetchStatuses()
  if (!sectorsStore.sectors.length) sectorsStore.fetchSectors()
  if (!templatesStore.templates.length) templatesStore.fetchTemplates()
})
</script>

<template>
  <AppLayout>
    <template #default>
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 md:mb-12">
        <div>
          <h1 class="text-3xl md:text-4xl font-black text-gray-900 tracking-tight transition-all">
            {{ pageTitle }}
          </h1>
          <p class="text-gray-400 text-sm font-medium mt-1">
            {{ pageSubtitle }}
          </p>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <div
            class="bg-gray-100 p-1 rounded-2xl flex items-center shadow-inner border border-gray-200/50"
          >
            <button
              @click="activeTab = 'agenda'"
              class="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all"
              :class="
                activeTab === 'agenda'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              "
            >
              <ListTodo class="w-4 h-4" />
              <span>Agenda</span>
              <span
                v-if="leadsStore.todayFollowUps.length > 0"
                class="flex-none w-2 h-2 rounded-full bg-orange-500"
              />
            </button>
            <button
              @click="activeTab = 'tablero'"
              class="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all"
              :class="
                activeTab === 'tablero'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              "
            >
              <LayoutGrid class="w-4 h-4" />
              <span>Tablero</span>
            </button>
          </div>

          <button
            @click="dialogOpen = true"
            class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl text-sm font-black transition-all shadow-lg shadow-indigo-200 active:scale-95"
          >
            <Plus class="w-5 h-5" />
            <span class="hidden sm:inline">Nuevo Lead</span>
          </button>
        </div>
      </div>

      <div v-if="activeTab === 'agenda'" class="w-full">
        <div class="mb-4">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Próximas Tareas</p>
        </div>
        <LeadsAgenda />
      </div>

      <div v-else class="flex flex-col h-full">
        <div class="hidden md:flex items-center justify-between mb-6">
          <div class="flex gap-3">
            <div class="relative">
              <button
                @click="toggleStatusDropdown"
                class="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
                :class="{ 'border-indigo-400 text-indigo-600': leadsStore.filterStatusId }"
              >
                <span>{{ selectedStatusLabel() }}</span>
                <ChevronDown class="w-4 h-4 opacity-70" />
              </button>
              <div
                v-if="statusDropdownOpen"
                class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-[180px] py-1"
              >
                <button
                  @click="selectStatus(null)"
                  class="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <span>Todos los estados</span>
                  <Check v-if="!leadsStore.filterStatusId" class="w-3.5 h-3.5 text-indigo-500" />
                </button>
                <button
                  v-for="s in statusesStore.statuses.filter((s) => !s.is_final)"
                  :key="s.id"
                  @click="selectStatus(s.id)"
                  class="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: s.color }" />
                    <span>{{ s.name }}</span>
                  </div>
                  <Check
                    v-if="leadsStore.filterStatusId === s.id"
                    class="w-3.5 h-3.5 text-indigo-500"
                  />
                </button>
              </div>
            </div>

            <div class="relative">
              <button
                @click="togglePriorityDropdown"
                class="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
                :class="{ 'border-indigo-400 text-indigo-600': leadsStore.filterPriority }"
              >
                <span>{{ selectedPriorityLabel() }}</span>
                <ChevronDown class="w-4 h-4 opacity-70" />
              </button>
              <div
                v-if="priorityDropdownOpen"
                class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-[180px] py-1"
              >
                <button
                  v-for="p in priorities"
                  :key="p.value ?? 'all'"
                  @click="selectPriority(p.value)"
                  class="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <span>{{ p.label }}</span>
                  <Check
                    v-if="leadsStore.filterPriority === p.value"
                    class="w-3.5 h-3.5 text-indigo-500"
                  />
                </button>
              </div>
            </div>
          </div>

          <button
            @click="filtersDrawerOpen = true"
            class="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
          >
            <SlidersHorizontal class="w-4 h-4" />
            <span>Filtros Avanzados</span>
          </button>
        </div>

        <div class="flex-1 overflow-hidden">
          <KanbanBoard />
        </div>
      </div>
    </template>
  </AppLayout>

  <CreateLeadDialog v-model:open="dialogOpen" />
  <FiltersDrawer v-model:open="filtersDrawerOpen" />
  <LeadDetailDrawer :lead="leadsStore.selectedLead" v-model:open="leadsStore.isDrawerOpen" />
</template>
