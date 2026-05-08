<script setup lang="ts">
import { ref, watch } from 'vue'
import { FileText } from 'lucide-vue-next'
import type { Lead } from '@/modules/leads/domain/Lead'
import { useLeadsStore } from '@/modules/leads/application/stores/useLeadsStore'
import { useToast } from '@/shared/composables/useToast'

const props = defineProps<{ lead: Lead }>()
const leadsStore = useLeadsStore()
const { showToast } = useToast()

const isEditingNotes = ref(false)
const notesInput = ref('')
const isSavingNotes = ref(false)

// Reset edit state when lead changes
watch(
  () => props.lead.id,
  () => {
    isEditingNotes.value = false
  },
)

function startEditNotes() {
  notesInput.value = props.lead.notes ?? ''
  isEditingNotes.value = true
}

function cancelEditNotes() {
  isEditingNotes.value = false
}

async function saveNotes() {
  isSavingNotes.value = true
  try {
    await leadsStore.updateNotes(props.lead.id, notesInput.value.trim() || null)
    isEditingNotes.value = false
    showToast('Notas guardadas', 'success')
  } catch (error) {
    showToast('Error al guardar notas', 'error')
  } finally {
    isSavingNotes.value = false
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-1.5">
      <div
        class="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide"
      >
        <FileText class="w-3.5 h-3.5" />
        Notas
      </div>
      <button
        v-if="!isEditingNotes"
        @click="startEditNotes"
        class="text-xs text-blue-500 hover:text-blue-700 transition-colors"
      >
        {{ lead.notes ? 'Editar' : 'Añadir' }}
      </button>
    </div>

    <div v-if="isEditingNotes" class="space-y-2">
      <textarea
        v-model="notesInput"
        rows="4"
        placeholder="¿Qué te dijo el cliente?"
        class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition resize-none"
      />
      <div class="flex gap-2">
        <button
          @click="saveNotes"
          :disabled="isSavingNotes"
          class="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
        >
          {{ isSavingNotes ? 'Guardando...' : 'Guardar' }}
        </button>
        <button
          @click="cancelEditNotes"
          class="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>

    <p
      v-else-if="lead.notes"
      class="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2.5 leading-relaxed"
    >
      {{ lead.notes }}
    </p>
    <p v-else class="text-sm text-gray-400 italic">Sin notas</p>
  </div>
</template>
