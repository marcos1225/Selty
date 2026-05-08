<script setup lang="ts">
import { ref, computed } from 'vue'
import { Phone, MessageCircle, Check, X } from 'lucide-vue-next'
import { useLeadsStore } from '@/modules/leads/application/stores/useLeadsStore'
import { useStatusesStore } from '@/modules/statuses/application/stores/useStatusesStore'
import { useMessageTemplatesStore } from '@/modules/templates/application/stores/useMessageTemplatesStore'
import { applyTemplateVariables } from '@/modules/templates/domain/MessageTemplate'
import type { Lead } from '@/modules/leads/domain/Lead'

const props = defineProps<{ lead: Lead }>()

const leadsStore = useLeadsStore()
const statusesStore = useStatusesStore()
const templatesStore = useMessageTemplatesStore()

const isTemplatePickerOpen = ref(false)

const statusName = computed(
  () => statusesStore.statuses.find((s) => s.id === props.lead.status_id)?.name ?? '—',
)

const statusColor = computed(
  () => statusesStore.statuses.find((s) => s.id === props.lead.status_id)?.color ?? '#94a3b8',
)

const templatesForLead = computed(() => templatesStore.getByStatusId(props.lead.status_id))

const hasTemplates = computed(() => templatesForLead.value.length > 0)

const attemptsLabel = computed(() => {
  const n = props.lead.attempts
  return n === 0 ? 'Sin intentos' : n === 1 ? '1 intento' : `${n} intentos`
})

function buildWhatsappUrl(text: string): string {
  const clean = (props.lead.phone ?? '').replace(/\D/g, '')
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`
}

function selectTemplate(content: string) {
  const message = applyTemplateVariables(content, { nombre: props.lead.name })
  window.open(buildWhatsappUrl(message), '_blank')
  isTemplatePickerOpen.value = false
}

async function markContacted() {
  await leadsStore.followUp(props.lead.id)
}
</script>

<template>
  <div 
    @click="leadsStore.selectedLeadId = lead.id; leadsStore.isDrawerOpen = true"
    class="bg-white rounded-dashboard border border-gray-100 shadow-dashboard p-5 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group"
  >
    <div class="flex items-center gap-4">
      <div class="relative shrink-0">
        <img
          :src="
            lead.avatar_url ??
            `https://ui-avatars.com/api/?name=${encodeURIComponent(lead.name)}&background=f1f5f9&color=0061ff`
          "
          :alt="lead.name"
          class="w-12 h-12 rounded-2xl object-cover border border-gray-50 group-hover:border-primary/20 transition-colors"
        />
        <div v-if="lead.priority === 'alta'" class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-error border-2 border-white rounded-full"></div>
      </div>

      <div class="flex-1 min-w-0">
        <p class="text-sm font-bold text-text-main truncate group-hover:text-primary transition-colors">{{ lead.name }}</p>
        <div class="flex items-center gap-2 mt-0.5">
          <span
            class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
            :style="{ backgroundColor: `${statusColor}15`, color: statusColor }"
          >
            {{ statusName }}
          </span>
          <span class="text-[10px] font-medium text-text-muted uppercase tracking-tight">{{ attemptsLabel }}</span>
        </div>
      </div>

      <div class="flex items-center gap-1 shrink-0" @click.stop>
        <a
          v-if="lead.phone"
          :href="`tel:${lead.phone}`"
          class="p-2.5 rounded-xl text-text-muted hover:text-primary hover:bg-primary/5 transition-all active:scale-90"
          title="Llamar"
        >
          <Phone class="w-4 h-4" />
        </a>
        
        <div class="relative">
          <button
            v-if="lead.phone"
            @click="isTemplatePickerOpen = !isTemplatePickerOpen"
            class="p-2.5 rounded-xl text-text-muted hover:text-success hover:bg-success/5 transition-all active:scale-90"
            :class="{ 'bg-success/5 text-success': isTemplatePickerOpen }"
            title="WhatsApp"
          >
            <MessageCircle class="w-4 h-4" />
          </button>

          <Transition name="scale">
            <div 
              v-if="isTemplatePickerOpen" 
              class="absolute right-0 top-full mt-2 w-64 bg-white rounded-[20px] shadow-2xl border border-gray-50 overflow-hidden z-20 py-1"
            >
              <div class="px-3 py-2 bg-gray-50/50">
                <p class="text-[9px] font-bold text-text-muted uppercase tracking-widest">Enviar Plantilla</p>
              </div>
              <div class="max-h-48 overflow-y-auto scrollbar-thin">
                <template v-if="templatesForLead.length > 0">
                  <button
                    v-for="template in templatesForLead"
                    :key="template.id"
                    @click="selectTemplate(template.content)"
                    class="w-full text-left px-4 py-3 hover:bg-success/5 transition-colors group/item"
                  >
                    <p class="text-xs font-bold text-text-main group-hover/item:text-success">{{ template.name }}</p>
                    <p class="text-[10px] text-text-muted truncate mt-0.5">
                      {{ applyTemplateVariables(template.content, { nombre: lead.name }) }}
                    </p>
                  </button>
                </template>
                <div v-else class="px-4 py-4 text-center">
                  <p class="text-[10px] text-text-muted italic">Sin plantillas</p>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <button
          @click="markContacted"
          class="p-2.5 rounded-xl text-text-muted hover:text-success hover:bg-success/5 transition-all active:scale-90"
          title="Marcar como contactado"
        >
          <Check class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>