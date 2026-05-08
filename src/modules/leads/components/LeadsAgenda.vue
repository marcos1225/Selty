<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLeadsStore } from '@/modules/leads/application/stores/useLeadsStore'
import { useMessageTemplatesStore } from '@/modules/templates/application/stores/useMessageTemplatesStore'
import { useStatusesStore } from '@/modules/statuses/application/stores/useStatusesStore'
import { applyTemplateVariables } from '@/modules/templates/domain/MessageTemplate'
import {
  Phone,
  UserCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  ChevronDown,
} from 'lucide-vue-next'
import { LEAD_PRIORITY } from '@/modules/leads/domain/constants'
import type { Lead } from '@/modules/leads/domain/Lead'
import TemplateBottomSheet from '@/modules/leads/components/TemplateBottomSheet.vue'

const leadsStore = useLeadsStore()
const templatesStore = useMessageTemplatesStore()
const statusesStore = useStatusesStore()

const isUpdating = ref<string | null>(null)
const copiedId = ref<string | null>(null)

const activeSheetLead = ref<Lead | null>(null)
const showSheet = computed(() => activeSheetLead.value !== null)

const PRIORITY_STYLES: Record<string, string> = {
  [LEAD_PRIORITY.HIGH]: 'bg-red-50 text-red-600 border-red-100',
  [LEAD_PRIORITY.MEDIUM]: 'bg-amber-50 text-amber-600 border-amber-100',
  [LEAD_PRIORITY.LOW]: 'bg-blue-50 text-blue-600 border-blue-100',
}

function getPriorityClass(priority?: string) {
  return PRIORITY_STYLES[priority || ''] || 'bg-gray-50 text-gray-500 border-gray-100'
}

const groupedTemplates = computed(() => {
  const groups: {
    key: string
    label: string
    templates: ReturnType<typeof templatesStore.getByStatusId>
  }[] = []

  for (const [statusId, templates] of Object.entries(templatesStore.templatesByStatus)) {
    if (!templates || templates.length === 0) continue
    const label = statusesStore.statuses.find((s) => s.id === statusId)?.name ?? 'Estado'
    const sorted = [...templates].sort((a, b) => (a.order || 0) - (b.order || 0))
    groups.push({ key: statusId, label, templates: sorted })
  }

  if (templatesStore.globalTemplates.length > 0) {
    groups.push({ key: 'global', label: 'Global', templates: templatesStore.globalTemplates })
  }

  return groups
})

const firstTemplate = computed(() => groupedTemplates.value[0]?.templates[0] ?? null)
const totalTemplatesCount = computed(() =>
  groupedTemplates.value.reduce((sum, g) => sum + g.templates.length, 0),
)

function openSheet(lead: Lead, event: Event) {
  event.stopPropagation()
  activeSheetLead.value = lead
}

function closeSheet() {
  activeSheetLead.value = null
}

async function useTemplate(lead: Lead, templateId: string, content: string) {
  closeSheet()
  const text = applyTemplateVariables(content, { nombre: lead.name })

  if (lead.phone) {
    const cleanPhone = lead.phone.replace(/[\s\-()]/g, '')
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank')
  } else {
    navigator.clipboard.writeText(text)
    copiedId.value = templateId
    setTimeout(() => (copiedId.value = null), 2000)
  }

  try {
    isUpdating.value = lead.id
    await leadsStore.followUp(lead.id, templateId)
  } catch (error) {
    console.error('Error al registrar seguimiento:', error)
  } finally {
    isUpdating.value = null
  }
}

async function callLead(lead: Lead) {
  if (lead.phone) {
    window.location.href = `tel:${lead.phone}`
    try {
      isUpdating.value = lead.id
      await leadsStore.followUp(lead.id)
    } catch (error) {
      console.error(error)
    } finally {
      isUpdating.value = null
    }
  }
}

function openLeadDetails(leadId: string) {
  leadsStore.selectedLeadId = leadId
  leadsStore.isDrawerOpen = true
}
</script>

<template>
  <div class="space-y-6 pb-20">
    <div
      v-if="leadsStore.todayFollowUps.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 px-2 md:px-0"
    >
      <div
        v-for="lead in leadsStore.todayFollowUps"
        :key="lead.id"
        @click="openLeadDetails(lead.id)"
        class="relative group bg-white border border-gray-100 rounded-3xl p-5 flex flex-col justify-between gap-5 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-300 cursor-pointer"
        :class="{ 'opacity-50 pointer-events-none': isUpdating === lead.id }"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-4 min-w-0">
            <div
              class="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-indigo-50 transition-colors shrink-0"
            >
              <UserCircle class="w-8 h-8 text-gray-300 group-hover:text-indigo-400" />
            </div>
            <div class="min-w-0">
              <h3
                class="text-base font-black text-gray-900 truncate group-hover:text-indigo-600 transition-colors tracking-tight"
              >
                {{ lead.name }}
              </h3>
              <div class="flex items-center gap-2 mt-1">
                <span
                  v-if="lead.attempts > 0"
                  class="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-wider"
                >
                  {{ lead.attempts }}° Intento
                </span>
                <span
                  v-if="lead.priority"
                  class="text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider"
                  :class="getPriorityClass(lead.priority)"
                >
                  {{ lead.priority }}
                </span>
              </div>
            </div>
          </div>
          <p
            class="text-[10px] text-indigo-400 font-black uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-lg shrink-0"
          >
            Hoy
          </p>
        </div>

        <div class="flex items-center justify-between pt-4 border-t border-gray-50 gap-2">
          <button
            v-if="lead.phone"
            @click.stop="callLead(lead)"
            class="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 active:scale-95 transition-all"
          >
            <Phone class="w-3.5 h-3.5" />
            Llamar
          </button>

          <div v-if="totalTemplatesCount > 0" class="flex items-center ml-auto">
            <button
              v-if="totalTemplatesCount === 1"
              @click.stop="useTemplate(lead, firstTemplate!.id, firstTemplate!.content)"
              class="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border shadow-xs"
              :class="
                copiedId === firstTemplate!.id
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : lead.phone
                    ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300'
              "
            >
              <span v-if="copiedId === firstTemplate!.id">✓</span>
              <template v-else>
                <span v-if="lead.phone" class="font-bold">WA</span>
                <span class="max-w-[70px] truncate font-medium inline-block">{{
                  firstTemplate!.name
                }}</span>
              </template>
            </button>

            <div
              v-else
              class="flex items-stretch shadow-xs rounded-full overflow-hidden border border-green-200 h-7"
            >
              <button
                @click.stop="useTemplate(lead, firstTemplate!.id, firstTemplate!.content)"
                class="flex items-center gap-1 px-3 py-1 text-[11px] font-bold transition-all bg-green-50 text-green-700 hover:bg-green-100 border-r border-green-200"
              >
                WA
                <span class="max-w-[70px] truncate font-medium inline-block">{{
                  firstTemplate!.name
                }}</span>
              </button>
              <button
                @click.stop="openSheet(lead, $event)"
                class="flex items-center px-1.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 transition-all"
              >
                <ChevronDown class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <button
            v-if="totalTemplatesCount === 0"
            @click.stop="openLeadDetails(lead.id)"
            class="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
          >
            <ExternalLink class="w-3.5 h-3.5" />
            Ver detalles
          </button>
        </div>

        <div
          v-if="isUpdating === lead.id"
          class="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-3xl z-10"
        >
          <Loader2 class="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-32 text-center">
      <div
        class="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-6 rotate-12 group"
      >
        <CheckCircle2
          class="w-12 h-12 text-emerald-400 group-hover:scale-110 transition-transform"
        />
      </div>
      <h3 class="text-xl font-black text-gray-900 tracking-tight">¡Día completado!</h3>
      <p class="text-gray-400 text-sm mt-2 max-w-[280px]">
        No tienes tareas pendientes. Aprovecha para buscar nuevos leads.
      </p>
    </div>
  </div>

  <TemplateBottomSheet
    :show="showSheet"
    :lead-name="activeSheetLead?.name ?? ''"
    :grouped-templates="groupedTemplates"
    :copied-id="copiedId"
    @close="closeSheet()"
    @use-template="({ templateId, content }) => useTemplate(activeSheetLead!, templateId, content)"
  />
</template>
