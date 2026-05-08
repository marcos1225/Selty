<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  MoreVertical,
  Phone,
  Mail,
  TrendingUp,
  UserCircle,
  Loader2,
  ChevronDown,
} from 'lucide-vue-next'
import type { Lead } from '@/modules/leads/domain/Lead'
import { useLeadsStore } from '@/modules/leads/application/stores/useLeadsStore'
import { useMessageTemplatesStore } from '@/modules/templates/application/stores/useMessageTemplatesStore'
import { useStatusesStore } from '@/modules/statuses/application/stores/useStatusesStore'
import { applyTemplateVariables } from '@/modules/templates/domain/MessageTemplate'
import { formatDate } from '@/shared/utils/formatDate'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { isDueToday, getTodayString } from '@/modules/leads/domain/followUp'
import { LEAD_PRIORITY } from '@/modules/leads/domain/constants'
import TemplateBottomSheet from '@/modules/leads/components/TemplateBottomSheet.vue'

const props = defineProps<{ lead: Lead }>()
const emit = defineEmits<{ detail: [lead: Lead] }>()

const leadsStore = useLeadsStore()
const templatesStore = useMessageTemplatesStore()
const statusesStore = useStatusesStore()
const copiedId = ref<string | null>(null)
const isUpdating = ref(false)
const showSheet = ref(false)

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

const isOverdue = computed(() => {
  if (!props.lead.next_follow_up_at) return false
  return props.lead.next_follow_up_at < getTodayString()
})

const PRIORITY_STYLES: Record<string, string> = {
  [LEAD_PRIORITY.HIGH]: 'bg-red-50 text-red-700 border-red-100',
  [LEAD_PRIORITY.MEDIUM]: 'bg-amber-50 text-amber-700 border-amber-100',
  [LEAD_PRIORITY.LOW]: 'bg-blue-50 text-blue-700 border-blue-100',
}

const priorityClass = computed(() => {
  return PRIORITY_STYLES[props.lead.priority || ''] || 'bg-gray-50 text-gray-600 border-gray-100'
})

function openSheet() {
  showSheet.value = true
}

function closeSheet() {
  showSheet.value = false
}

async function useTemplate(templateId: string, content: string) {
  if (isUpdating.value) return

  const text = applyTemplateVariables(content, { nombre: props.lead.name })

  if (props.lead.phone) {
    const cleanPhone = props.lead.phone.replace(/[\s\-()]/g, '')
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank')
  } else {
    navigator.clipboard.writeText(text)
    copiedId.value = templateId
    setTimeout(() => {
      copiedId.value = null
    }, 2000)
  }

  closeSheet()

  try {
    isUpdating.value = true
    await leadsStore.followUp(props.lead.id, templateId)
  } catch (error) {
    console.error('Error al registrar seguimiento:', error)
  } finally {
    isUpdating.value = false
  }
}
</script>

<template>
  <div
    class="relative bg-white p-4 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-gray-100/50 hover:shadow-md transition-all cursor-grab active:cursor-grabbing group min-w-0 w-full"
    :class="{ 'opacity-70 pointer-events-none': isUpdating }"
  >
    <div
      v-if="isUpdating"
      class="absolute inset-0 flex items-center justify-center bg-white/40 z-10 rounded-xl"
    >
      <Loader2 class="w-5 h-5 text-indigo-500 animate-spin" />
    </div>

    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-3">
        <div class="relative">
          <div
            class="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center"
          >
            <UserCircle class="w-6 h-6 text-gray-400" />
          </div>
          <div
            v-if="lead.attempts > 0"
            class="absolute -bottom-1 -right-1 w-5 h-5 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-xs"
          >
            <span class="text-[10px] font-bold text-gray-600">{{ lead.attempts }}</span>
          </div>
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <h4
              class="text-sm font-bold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors truncate max-w-[140px] sm:max-w-none"
            >
              {{ lead.name }}
            </h4>
            <div
              v-if="isDueToday(lead)"
              class="flex items-center gap-1 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md animate-pulse shadow-sm"
              :class="isOverdue ? 'bg-red-500' : 'bg-orange-500'"
            >
              {{ isOverdue ? 'ATRASADO' : 'HOY' }}
            </div>
          </div>
          <div class="flex items-center gap-2 mt-0.5">
            <span
              v-if="lead.priority"
              class="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border"
              :class="priorityClass"
            >
              {{ lead.priority }}
            </span>
            <span class="text-[10px] text-gray-400">
              {{
                lead.last_contact_at
                  ? `Contacto: ${formatDate(lead.last_contact_at)}`
                  : `Creado: ${formatDate(lead.created_at)}`
              }}
            </span>
          </div>
        </div>
      </div>
      <button
        @click.stop="emit('detail', lead)"
        class="text-gray-400 hover:text-gray-600 transition-colors p-1"
      >
        <MoreVertical class="w-4 h-4" />
      </button>
    </div>

    <div class="space-y-2 mb-3">
      <div v-if="lead.phone" class="flex items-center gap-2 text-gray-500 text-xs">
        <Phone class="w-3.5 h-3.5 text-gray-400" />
        <span>{{ lead.phone }}</span>
      </div>
      <div v-if="lead.email" class="flex items-center gap-2 text-gray-500 text-xs">
        <Mail class="w-3.5 h-3.5 text-gray-400" />
        <span class="truncate">{{ lead.email }}</span>
      </div>
    </div>

    <div
      v-if="lead.estimated_value || totalTemplatesCount > 0"
      class="pt-3 border-t border-gray-100 flex items-center gap-2 flex-wrap"
    >
      <div
        v-if="lead.estimated_value"
        class="flex items-center gap-1 mr-auto bg-emerald-50 px-2 py-0.5 rounded-md"
      >
        <TrendingUp class="w-3 h-3 text-emerald-500" />
        <span class="text-[11px] font-bold text-emerald-700">{{
          formatCurrency(lead.estimated_value)
        }}</span>
      </div>

      <div v-if="totalTemplatesCount > 0" class="flex items-center ml-auto">
        <button
          v-if="totalTemplatesCount === 1"
          @click.stop="useTemplate(firstTemplate!.id, firstTemplate!.content)"
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
            @click.stop="useTemplate(firstTemplate!.id, firstTemplate!.content)"
            class="flex items-center gap-1 px-3 py-1 text-[11px] font-bold transition-all bg-green-50 text-green-700 hover:bg-green-100 border-r border-green-200"
          >
            WA
            <span class="max-w-[70px] truncate font-medium inline-block">{{
              firstTemplate!.name
            }}</span>
          </button>
          <button
            @click.stop="openSheet()"
            class="flex items-center px-1.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 transition-all"
          >
            <ChevronDown class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>

  <TemplateBottomSheet
    :show="showSheet"
    :lead-name="lead.name"
    :grouped-templates="groupedTemplates"
    :copied-id="copiedId"
    @close="closeSheet()"
    @use-template="({ templateId, content }) => useTemplate(templateId, content)"
  />
</template>
