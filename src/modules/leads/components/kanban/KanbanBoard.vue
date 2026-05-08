<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLeadsStore } from '@/modules/leads/application/stores/useLeadsStore'
import { useStatusesStore } from '@/modules/statuses/application/stores/useStatusesStore'
import { useMobile } from '@/shared/composables/useMobile'
import { ChevronDown } from 'lucide-vue-next'
import KanbanCard from './KanbanCard.vue'
import type { Lead } from '@/modules/leads/domain/Lead'

const leadsStore = useLeadsStore()
const statusesStore = useStatusesStore()
const { isMobile } = useMobile()

const activeColIndex = ref(0)
const statusSelectorOpen = ref(false)

function selectMobileColumn(index: number) {
  activeColIndex.value = index
  statusSelectorOpen.value = false
}

const draggedLeadId = ref<string | null>(null)
const dragOverColId = ref<string | null>(null)
const dragOverFinalId = ref<string | null>(null)

const confirmDialog = ref<{ show: boolean; leadId: string; statusId: string; statusName: string }>({
  show: false,
  leadId: '',
  statusId: '',
  statusName: '',
})

const finalStatuses = computed(() => statusesStore.statuses.filter((s) => s.is_final))

function isLostStatus(name: string) {
  return /perdid|lost/i.test(name)
}

const activeColumn = computed(() => {
  if (activeColIndex.value >= leadsStore.columns.length) activeColIndex.value = 0
  return leadsStore.columns[activeColIndex.value] ?? null
})

function openDetail(lead: Lead) {
  leadsStore.selectedLeadId = lead.id
  leadsStore.isDrawerOpen = true
}

function onDragStart(e: DragEvent, leadId: string) {
  draggedLeadId.value = leadId
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}

function onDragEnd() {
  draggedLeadId.value = null
  dragOverColId.value = null
  dragOverFinalId.value = null
}

function onDragOver(colId: string) {
  dragOverColId.value = colId
}

function onDragLeave(e: DragEvent) {
  const related = e.relatedTarget as HTMLElement | null
  if (!related || !(e.currentTarget as HTMLElement).contains(related)) {
    dragOverColId.value = null
  }
}

async function onDrop(colId: string) {
  if (draggedLeadId.value) {
    const lead = leadsStore.leads.find((l) => l.id === draggedLeadId.value)
    if (lead && lead.status_id !== colId) {
      await leadsStore.moveLead(draggedLeadId.value, colId)
    }
  }
  draggedLeadId.value = null
  dragOverColId.value = null
}

function onFinalDragOver(statusId: string) {
  dragOverFinalId.value = statusId
}

function onFinalDragLeave(e: DragEvent) {
  const related = e.relatedTarget as HTMLElement | null
  if (!related || !(e.currentTarget as HTMLElement).contains(related)) {
    dragOverFinalId.value = null
  }
}

async function onFinalDrop(statusId: string) {
  if (!draggedLeadId.value) return
  const lead = leadsStore.leads.find((l) => l.id === draggedLeadId.value)
  if (!lead || lead.status_id === statusId) {
    draggedLeadId.value = null
    dragOverFinalId.value = null
    return
  }
  const status = finalStatuses.value.find((s) => s.id === statusId)
  if (status && isLostStatus(status.name)) {
    confirmDialog.value = {
      show: true,
      leadId: draggedLeadId.value,
      statusId,
      statusName: status.name,
    }
    draggedLeadId.value = null
    dragOverFinalId.value = null
  } else {
    await leadsStore.moveLead(draggedLeadId.value, statusId)
    draggedLeadId.value = null
    dragOverFinalId.value = null
  }
}

async function confirmMove() {
  await leadsStore.moveLead(confirmDialog.value.leadId, confirmDialog.value.statusId)
  confirmDialog.value = { show: false, leadId: '', statusId: '', statusName: '' }
}

function cancelMove() {
  confirmDialog.value = { show: false, leadId: '', statusId: '', statusName: '' }
}

onMounted(() => leadsStore.fetchLeads())
</script>

<template>
  <div
    v-if="leadsStore.isLoading"
    class="flex items-center justify-center h-full text-gray-400 text-sm"
  >
    Loading...
  </div>

  <div
    v-else-if="leadsStore.error"
    class="flex items-center justify-center h-full text-red-400 text-sm"
  >
    {{ leadsStore.error }}
  </div>

  <div v-else-if="isMobile" class="flex flex-col h-full w-full max-w-full overflow-hidden">
    <div class="mb-4 relative z-20">
      <button
        @click="statusSelectorOpen = !statusSelectorOpen"
        class="w-full flex items-center justify-between bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm active:scale-[0.98] transition-all"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-3 h-3 rounded-full shadow-sm"
            :style="{ backgroundColor: activeColumn?.color }"
          />
          <span class="font-bold text-gray-800 text-sm">{{ activeColumn?.name }}</span>
          <span class="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            {{ activeColumn?.leads.length }}
          </span>
        </div>
        <ChevronDown
          class="w-4 h-4 text-gray-400 transition-transform"
          :class="{ 'rotate-180': statusSelectorOpen }"
        />
      </button>

      <div
        v-if="statusSelectorOpen"
        class="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-30 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
      >
        <button
          v-for="(col, i) in leadsStore.columns"
          :key="col.id"
          @click="selectMobileColumn(i)"
          class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
          :class="{ 'bg-blue-50/50': activeColIndex === i }"
        >
          <div class="flex items-center gap-3">
            <div class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: col.color }" />
            <span
              class="text-sm font-medium"
              :class="activeColIndex === i ? 'text-blue-600 font-bold' : 'text-gray-600'"
            >
              {{ col.name }}
            </span>
          </div>
          <span
            v-if="col.leads.length > 0"
            class="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
            :class="
              activeColIndex === i ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
            "
          >
            {{ col.leads.length }}
          </span>
        </button>
      </div>
    </div>

    <div v-if="activeColumn" class="flex-1 overflow-y-auto flex flex-col gap-3 pt-1 w-full min-w-0">
      <div
        v-if="activeColumn.leads.length === 0"
        class="flex flex-col items-center justify-center h-48 text-gray-400 gap-2"
      >
        <div class="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-xl">
          Empty
        </div>
        <span class="text-xs font-medium">Sin leads en esta columna</span>
      </div>
      <div v-for="lead in activeColumn.leads" :key="lead.id" class="w-full min-w-0">
        <KanbanCard :lead="lead" class="animate-fade-in-up" @detail="openDetail" />
      </div>
    </div>
  </div>

  <div v-else class="flex flex-col h-full gap-3 py-4">
    <div class="flex gap-6 overflow-x-auto pb-2 flex-1 min-h-0">
      <div
        v-for="col in leadsStore.columns"
        :key="col.id"
        class="flex-1 min-w-[240px] flex flex-col rounded-xl transition-all"
        :class="dragOverColId === col.id ? 'ring-2 ring-offset-2' : ''"
        :style="dragOverColId === col.id ? { '--tw-ring-color': col.color } : {}"
        @dragover.prevent="onDragOver(col.id)"
        @dragleave="onDragLeave"
        @drop.prevent="onDrop(col.id)"
      >
        <div
          class="flex items-center justify-between mb-4 bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm transition-colors"
          :style="
            dragOverColId === col.id
              ? { borderColor: col.color + '60', backgroundColor: col.color + '08' }
              : {}
          "
        >
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: col.color }"></div>
            <h3 class="font-medium text-gray-700 text-sm">{{ col.name }}</h3>
          </div>
          <span class="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            {{ col.leads.length }} Leads
          </span>
        </div>

        <div
          class="flex flex-col gap-4 overflow-y-auto pr-1 pb-4 custom-scrollbar flex-1 rounded-xl transition-colors min-h-[80px]"
          :style="dragOverColId === col.id ? { backgroundColor: col.color + '08' } : {}"
        >
          <div
            v-if="col.leads.length === 0 && dragOverColId === col.id"
            class="flex items-center justify-center h-20 rounded-xl border-2 border-dashed"
            :style="{ borderColor: col.color + '60' }"
          />
          <div
            v-for="lead in col.leads"
            :key="lead.id"
            draggable="true"
            class="animate-fade-in-up"
            :class="draggedLeadId === lead.id ? 'opacity-40' : ''"
            @dragstart="onDragStart($event, lead.id)"
            @dragend="onDragEnd"
          >
            <KanbanCard :lead="lead" @detail="openDetail" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="draggedLeadId && finalStatuses.length" class="flex gap-3 pb-2 shrink-0">
      <div
        v-for="status in finalStatuses"
        :key="status.id"
        class="flex-1 flex items-center justify-center gap-2 h-14 rounded-xl border-2 border-dashed text-sm font-medium transition-all cursor-copy"
        :class="dragOverFinalId === status.id ? 'scale-[1.02]' : 'opacity-70'"
        :style="{
          borderColor: dragOverFinalId === status.id ? status.color : status.color + '80',
          backgroundColor:
            dragOverFinalId === status.id ? status.color + '18' : status.color + '08',
          color: status.color,
        }"
        @dragover.prevent="onFinalDragOver(status.id)"
        @dragleave="onFinalDragLeave"
        @drop.prevent="onFinalDrop(status.id)"
      >
        <span class="text-base">{{ isLostStatus(status.name) ? '✕' : '✓' }}</span>
        <span>{{ status.name }}</span>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div
      v-if="confirmDialog.show"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      @click.self="cancelMove"
    >
      <div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl mx-4">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <span class="text-red-500 text-lg">✕</span>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 text-sm">
              Marcar como {{ confirmDialog.statusName }}
            </h3>
            <p class="text-xs text-gray-500 mt-0.5">Esta acción moverá el lead al historial</p>
          </div>
        </div>
        <p class="text-sm text-gray-600 mb-5">¿Confirmas que este lead se ha perdido?</p>
        <div class="flex gap-3">
          <button
            @click="cancelMove"
            class="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="confirmMove"
            class="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>