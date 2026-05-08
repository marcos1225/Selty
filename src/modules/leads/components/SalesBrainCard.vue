<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Sparkles, Loader2, ArrowRight, MessageCircle, X } from 'lucide-vue-next'
import type { Lead } from '@/modules/leads/domain/Lead'
import { useActivitiesStore } from '@/modules/activities/application/stores/useActivitiesStore'
import { useStatusesStore } from '@/modules/statuses/application/stores/useStatusesStore'
import { useSectorsStore } from '@/modules/sectors/application/stores/useSectorsStore'
import { useLeadsStore } from '@/modules/leads/application/stores/useLeadsStore'
import { useAuthStore } from '@/modules/auth/application/stores/useAuthStore'
import { ActivitiesRepository } from '@/modules/activities/infrastructure/repositories/ActivitiesRepository'
import { AIService } from '@/shared/infrastructure/ai/AIService'
import { useToast } from '@/shared/composables/useToast'
import { AI_SYSTEM_DEFAULTS } from '@/modules/leads/domain/constants'

const props = defineProps<{ lead: Lead }>()

const activitiesStore = useActivitiesStore()
const statusesStore = useStatusesStore()
const sectorsStore = useSectorsStore()
const leadsStore = useLeadsStore()
const authStore = useAuthStore()
const { showToast } = useToast()
const aiService = new AIService()

const leadResponse = ref('')
const isGeneratingSuggestion = ref(false)
const generatedMessage = ref('')

const activities = computed(() => activitiesStore.getForLead(props.lead.id))
const status = computed(() => statusesStore.statuses.find((s) => s.id === props.lead.status_id))
const sector = computed(() =>
  props.lead.sector_id ? sectorsStore.sectors.find((s) => s.id === props.lead.sector_id) : null,
)

watch(
  () => props.lead.id,
  () => {
    generatedMessage.value = ''
    leadResponse.value = ''
  },
)

async function suggestAI() {
  isGeneratingSuggestion.value = true

  try {
    const noteText = leadResponse.value.trim()

    if (noteText && authStore.user) {
      const activity = await ActivitiesRepository.create({
        lead_id: props.lead.id,
        user_id: authStore.user.id,
        type: 'note',
        description: noteText,
        metadata: null,
      })
      activitiesStore.prependActivity(activity)
    }

    const history = activities.value.map((a) => ({
      type: a.type,
      description: a.description || '',
      created_at: a.created_at,
    }))

    const message = await aiService.generateResponse({
      leadName: props.lead.name,
      leadStatus: status.value?.name || 'Nuevo',
      leadSector: sector.value?.name,
      attempts: props.lead.attempts ?? 0,
      history: history,
      userContext: leadResponse.value,
      firstContactAt: props.lead.first_contact_at ?? null,
      sellerName: authStore.user?.email || AI_SYSTEM_DEFAULTS.SELLER_NAME,
    })

    generatedMessage.value = message
    leadResponse.value = ''
  } catch (error: unknown) {
    showToast(
      (error instanceof Error ? error.message : null) ||
        'Error al conectar con la IA. Revisa tu API Key.',
      'error',
    )
  } finally {
    isGeneratingSuggestion.value = false
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
  showToast('¡Copiado al portapapeles!', 'success')
}

function sendWhatsApp() {
  if (!generatedMessage.value) return

  leadsStore.followUp(props.lead.id)

  const cleanPhone = props.lead.phone?.replace(/\D/g, '')
  if (!cleanPhone) {
    showToast('El lead no tiene un número de teléfono válido.', 'error')
    return
  }

  const text = encodeURIComponent(generatedMessage.value)
  window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank')
}
</script>

<template>
  <div class="space-y-4 p-4 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm">
    <div class="flex items-center gap-2 mb-1">
      <div class="p-1.5 bg-indigo-100 rounded-lg">
        <Sparkles class="w-4 h-4 text-indigo-600" />
      </div>
      <h3 class="text-xs font-black uppercase tracking-wider text-slate-700">Sales Brain</h3>
    </div>

    <div class="space-y-2">
      <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1"
        >Contexto adicional (Opcional)</label
      >
      <textarea
        v-model="leadResponse"
        rows="3"
        placeholder="Ej: Dice que es muy caro / Que le llame el lunes..."
        class="w-full px-4 py-3 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition resize-none bg-white placeholder:text-slate-300"
      />
    </div>

    <button
      @click="suggestAI"
      :disabled="isGeneratingSuggestion"
      class="w-full p-3.5 rounded-2xl bg-linear-to-br from-indigo-600 via-blue-600 to-indigo-700 text-white flex items-center justify-center gap-3 group overflow-hidden relative shadow-lg shadow-indigo-200 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
    >
      <div class="flex items-center gap-3 z-10">
        <Loader2 v-if="isGeneratingSuggestion" class="w-5 h-5 animate-spin" />
        <span class="text-sm font-bold">{{
          isGeneratingSuggestion ? 'Analizando historial...' : 'Generar Estrategia'
        }}</span>
      </div>
      <ArrowRight
        v-if="!isGeneratingSuggestion"
        class="w-4 h-4 group-hover:translate-x-1 transition-transform z-10"
      />
      <div
        class="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
      />
    </button>

    <div
      v-if="generatedMessage"
      class="bg-white border border-indigo-100 rounded-2xl p-4 space-y-4 shadow-sm animate-in fade-in slide-in-from-top-2"
    >
      <div class="flex items-center gap-2 text-indigo-600">
        <MessageCircle class="w-4 h-4" />
        <span class="text-[10px] font-black uppercase tracking-widest">Respuesta Sugerida</span>
      </div>
      <p class="text-sm text-slate-700 leading-relaxed italic">"{{ generatedMessage }}"</p>
      <div class="flex flex-col gap-2">
        <button
          @click="sendWhatsApp"
          class="w-full py-3 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-md shadow-green-100"
        >
          <MessageCircle class="w-4 h-4" />
          Enviar WhatsApp
        </button>
        <div class="flex gap-2">
          <button
            @click="copyToClipboard(generatedMessage)"
            class="flex-1 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            Copiar
          </button>
          <button
            @click="generatedMessage = ''"
            class="px-3 py-2.5 bg-slate-50 border border-slate-200 text-slate-400 rounded-xl hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
