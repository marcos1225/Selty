<script setup lang="ts">
import type { Lead } from '@/modules/leads/domain/Lead'
import LeadProfileCard from '../LeadProfileCard.vue'
import LeadEditForm from '../LeadEditForm.vue'
import { formatLocalDate } from '@/shared/utils/formatDate'
import { useStatusesStore } from '@/modules/statuses/application/stores/useStatusesStore'
import { useLeadsStore } from '@/modules/leads/application/stores/useLeadsStore'
import { useActivitiesStore } from '@/modules/activities/application/stores/useActivitiesStore'
import { useToast } from '@/shared/composables/useToast'
import { ref } from 'vue'

const props = defineProps<{
  lead: Lead
  isEditing?: boolean
}>()

const emit = defineEmits<{
  cancelEdit: []
  saved: []
}>()

const statusesStore = useStatusesStore()
const leadsStore = useLeadsStore()
const activitiesStore = useActivitiesStore()
const { showToast } = useToast()

const isMoving = ref(false)

async function moveToStatus(statusId: string) {
  if (!props.lead || isMoving.value || statusId === props.lead.status_id) return
  isMoving.value = true
  try {
    await leadsStore.moveLead(props.lead.id, statusId)
    await activitiesStore.fetchForLead(props.lead.id)
    showToast('Lead movido de estado', 'success')
  } catch (error) {
    showToast('Error al mover lead', 'error')
  } finally {
    isMoving.value = false
  }
}
</script>

<template>
  <div class="p-5 space-y-6">
    <div v-if="isEditing">
      <LeadEditForm
        :lead="lead"
        @cancel="emit('cancelEdit')"
        @saved="emit('saved')"
      />
    </div>
    
    <template v-else>
      <LeadProfileCard :lead="lead" />
      
      <div class="space-y-3">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estado del Proceso</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="s in statusesStore.statuses"
            :key="s.id"
            @click="moveToStatus(s.id)"
            :disabled="s.id === lead.status_id || isMoving"
            class="text-xs font-bold px-3 py-2 rounded-xl border transition-all disabled:cursor-default"
            :style="
              s.id === lead.status_id
                ? { backgroundColor: s.color + '15', color: s.color, borderColor: s.color + '40' }
                : {
                    backgroundColor: 'transparent',
                    color: '#94a3b8',
                    borderColor: '#f1f5f9',
                  }
            "
          >
            {{ s.name }}
          </button>
        </div>
      </div>

      <div class="pt-6 border-t border-gray-100">
        <h4 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Metadatos</h4>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-[10px] text-gray-400 mb-0.5">Fecha de Ingreso</p>
            <p class="text-xs font-semibold text-gray-700">{{ formatLocalDate(lead.created_at) }}</p>
          </div>
          <div>
            <p class="text-[10px] text-gray-400 mb-0.5">Última Actividad</p>
            <p class="text-xs font-semibold text-gray-700">{{ formatLocalDate(lead.updated_at) }}</p>
          </div>
          <div>
            <p class="text-[10px] text-gray-400 mb-0.5">Primer Contacto</p>
            <p class="text-xs font-semibold text-gray-700">{{ formatLocalDate(lead.first_contact_at) }}</p>
          </div>
          <div v-if="lead.next_follow_up_at">
            <p class="text-[10px] text-gray-400 mb-0.5">Próximo Seguimiento</p>
            <p class="text-xs font-semibold text-gray-700">{{ formatLocalDate(lead.next_follow_up_at) }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>