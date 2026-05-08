<script setup lang="ts">
import { ref } from 'vue'
import type { Lead, LeadPriority } from '@/modules/leads/domain/Lead'
import { LEAD_PRIORITY } from '@/modules/leads/domain/constants'
import { useSectorsStore } from '@/modules/sectors/application/stores/useSectorsStore'
import { useLeadsStore } from '@/modules/leads/application/stores/useLeadsStore'
import { useToast } from '@/shared/composables/useToast'

const props = defineProps<{ lead: Lead }>()
const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'saved'): void
}>()

const sectorsStore = useSectorsStore()
const leadsStore = useLeadsStore()
const { showToast } = useToast()

const isSavingInfo = ref(false)
const editForm = ref({
  name: props.lead.name,
  email: props.lead.email || '',
  phone: props.lead.phone || '',
  estimated_value: props.lead.estimated_value || 0,
  priority: (props.lead.priority || LEAD_PRIORITY.MEDIUM) as LeadPriority,
  sector_id: props.lead.sector_id || '',
  first_contact_at: props.lead.first_contact_at ? props.lead.first_contact_at.slice(0, 10) : '',
})

async function saveInfo() {
  isSavingInfo.value = true
  try {
    await leadsStore.updateLead(props.lead.id, {
      ...editForm.value,
      estimated_value: Number(editForm.value.estimated_value),
      sector_id: editForm.value.sector_id || null,
      first_contact_at: editForm.value.first_contact_at || null,
    })
    emit('saved')
    showToast('Perfil actualizado', 'success')
  } catch (error) {
    showToast('Error al actualizar el perfil', 'error')
  } finally {
    isSavingInfo.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1"
        >Nombre</label
      >
      <input
        v-model="editForm.name"
        type="text"
        class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
      />
    </div>
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1"
          >Teléfono</label
        >
        <input
          v-model="editForm.phone"
          type="text"
          class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
        />
      </div>
      <div>
        <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1"
          >Email</label
        >
        <input
          v-model="editForm.email"
          type="email"
          class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
        />
      </div>
    </div>
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1"
          >Valor Est.</label
        >
        <input
          v-model="editForm.estimated_value"
          type="number"
          class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
        />
      </div>
      <div>
        <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1"
          >Prioridad</label
        >
        <select
          v-model="editForm.priority"
          class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
        >
          <option :value="LEAD_PRIORITY.HIGH">Alta</option>
          <option :value="LEAD_PRIORITY.MEDIUM">Media</option>
          <option :value="LEAD_PRIORITY.LOW">Baja</option>
        </select>
      </div>
    </div>
    <div>
      <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1"
        >Sector</label
      >
      <select
        v-model="editForm.sector_id"
        class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
      >
        <option value="">Sin sector</option>
        <option v-for="s in sectorsStore.sectors" :key="s.id" :value="s.id">
          {{ s.name }}
        </option>
      </select>
    </div>
    <div>
      <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1"
        >Fecha de contacto</label
      >
      <input
        v-model="editForm.first_contact_at"
        type="date"
        class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
      />
    </div>
    <div class="flex gap-2 pt-2">
      <button
        @click="saveInfo"
        :disabled="isSavingInfo"
        class="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {{ isSavingInfo ? 'Guardando...' : 'Guardar Cambios' }}
      </button>
      <button
        @click="emit('cancel')"
        class="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
      >
        Cancelar
      </button>
    </div>
  </div>
</template>
