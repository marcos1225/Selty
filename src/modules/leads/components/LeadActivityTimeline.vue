<script setup lang="ts">
import { ref, computed } from 'vue'
import { CheckCircle, ArrowRight, FileText, Trash2 } from 'lucide-vue-next'
import type { Activity } from '@/modules/activities/domain/Activity'
import { useActivitiesStore } from '@/modules/activities/application/stores/useActivitiesStore'
import { formatDate } from '@/shared/utils/formatDate'
import { useToast } from '@/shared/composables/useToast'
import ConfirmDeleteModal from '@/shared/components/ui/ConfirmDeleteModal.vue'

const props = defineProps<{
  leadId: string
  activities: Activity[]
  isLoading: boolean
}>()

const activitiesStore = useActivitiesStore()
const { showToast } = useToast()

type Tab = 'all' | 'notes' | 'system'
const selectedTab = ref<Tab>('all')

const tabs = [
  { id: 'all', label: 'Todo' },
  { id: 'notes', label: 'Notas' },
  { id: 'system', label: 'Actividad' },
] as const

const filteredActivities = computed(() => {
  if (selectedTab.value === 'all') return props.activities
  if (selectedTab.value === 'notes') return props.activities.filter((a) => a.type === 'note')
  if (selectedTab.value === 'system') return props.activities.filter((a) => a.type !== 'note')
  return props.activities
})

function activityLabel(type: string, metadata: Record<string, unknown> | null): string {
  if (type === 'followup') {
    const attempts = metadata?.attempts as number | undefined
    return attempts ? `Seguimiento #${attempts}` : 'Seguimiento registrado'
  }
  if (type === 'status_change') {
    const to = metadata?.to_status_name as string | undefined
    return to ? `Estado → ${to}` : 'Estado actualizado'
  }
  if (type === 'note') return 'Nota'
  return 'Actividad'
}

const showConfirmDeleteNote = ref(false)
const isDeletingNote = ref(false)
const noteToDelete = ref<Activity | null>(null)

function confirmDeleteActivity(activity: Activity) {
  noteToDelete.value = activity
  showConfirmDeleteNote.value = true
}

async function executeDeleteNote() {
  if (!noteToDelete.value) return
  isDeletingNote.value = true
  try {
    await activitiesStore.deleteActivity(noteToDelete.value)
    showToast('Nota eliminada', 'success')
    showConfirmDeleteNote.value = false
    noteToDelete.value = null
  } catch (error) {
    console.error('Error al eliminar nota:', error)
    showToast('Error al eliminar la nota. Inténtalo de nuevo.', 'error')
  } finally {
    isDeletingNote.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between border-b border-gray-100">
      <div class="flex gap-4">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="selectedTab = tab.id"
          class="pb-2 text-xs font-bold transition-all relative"
          :class="selectedTab === tab.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'"
        >
          {{ tab.label }}
          <div
            v-if="selectedTab === tab.id"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
          />
        </button>
      </div>

      <span v-if="!isLoading" class="text-[10px] font-bold text-gray-300 uppercase">
        {{ filteredActivities.length }} eventos
      </span>
    </div>

    <div v-if="isLoading" class="text-sm text-gray-400 text-center py-8">
      <div class="animate-pulse flex flex-col items-center gap-2">
        <div class="w-8 h-8 bg-gray-100 rounded-full" />
        <span>Cargando historial...</span>
      </div>
    </div>

    <div
      v-else-if="filteredActivities.length === 0"
      class="text-sm text-gray-400 text-center py-8 bg-gray-50/50 rounded-2xl border border-dashed border-gray-100"
    >
      <p v-if="selectedTab === 'notes'">No hay notas registradas</p>
      <p v-else-if="selectedTab === 'system'">No hay actividad de sistema</p>
      <p v-else>Sin actividad registrada</p>
    </div>

    <div v-else class="relative pl-2">
      <div class="absolute left-5 top-2 bottom-2 w-px bg-gray-100" />
      <div class="space-y-5">
        <div
          v-for="activity in filteredActivities"
          :key="activity.id"
          class="flex items-start gap-4 relative group"
        >
          <div
            class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 mt-0.5 shadow-sm"
            :class="{
              'bg-blue-50 text-blue-600': activity.type === 'followup',
              'bg-violet-50 text-violet-600': activity.type === 'status_change',
              'bg-amber-50 text-amber-600': activity.type === 'note',
            }"
          >
            <CheckCircle v-if="activity.type === 'followup'" class="w-3.5 h-3.5" />
            <ArrowRight v-else-if="activity.type === 'status_change'" class="w-3.5 h-3.5" />
            <FileText v-else class="w-3.5 h-3.5" />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2 mb-0.5">
              <span
                class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                :class="{
                  'text-blue-500 bg-blue-50': activity.type === 'followup',
                  'text-violet-500 bg-violet-50': activity.type === 'status_change',
                  'text-amber-500 bg-amber-50': activity.type === 'note',
                }"
              >
                {{ activityLabel(activity.type, activity.metadata) }}
              </span>

              <div class="flex items-center gap-2">
                <span class="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                  {{ formatDate(activity.created_at) }}
                </span>
                <button
                  v-if="activity.type === 'note'"
                  @click="confirmDeleteActivity(activity)"
                  class="p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  title="Eliminar nota"
                >
                  <Trash2 class="w-3 h-3" />
                </button>
              </div>
            </div>

            <p
              v-if="activity.description"
              class="text-sm leading-relaxed"
              :class="activity.type === 'note' ? 'text-gray-900 font-medium' : 'text-gray-500'"
            >
              {{ activity.description }}
            </p>
            <p v-else-if="activity.type === 'status_change'" class="text-xs text-gray-400 italic">
              Cambio automático de estado
            </p>
          </div>
        </div>
      </div>
    </div>

    <ConfirmDeleteModal
      v-model:open="showConfirmDeleteNote"
      title="¿Eliminar Nota?"
      description="Esta acción no se puede deshacer de ninguna forma."
      :isDeleting="isDeletingNote"
      @confirm="executeDeleteNote"
    />
  </div>
</template>
