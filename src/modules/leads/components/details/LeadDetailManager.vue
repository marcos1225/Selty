<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Lead } from '@/modules/leads/domain/Lead'
import LeadDetailHeader from '@/modules/leads/components/details/LeadDetailHeader.vue'
import LeadDetailTabs from '@/modules/leads/components/details/LeadDetailTabs.vue'
import LeadDetailBrain from '@/modules/leads/components/details/LeadDetailBrain.vue'
import LeadDetailInfo from '@/modules/leads/components/details/LeadDetailInfo.vue'
import LeadDetailHistory from '@/modules/leads/components/details/LeadDetailHistory.vue'
import ConfirmDeleteModal from '@/shared/components/ui/ConfirmDeleteModal.vue'
import { useLeadsStore } from '@/modules/leads/application/stores/useLeadsStore'
import { useToast } from '@/shared/composables/useToast'

const props = defineProps<{
  lead: Lead
  isFullPage?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const currentTab = ref('brain')
const isEditing = ref(false)
const showConfirmDelete = ref(false)
const isDeleting = ref(false)

const leadsStore = useLeadsStore()
const { showToast } = useToast()

const handleDelete = async () => {
  isDeleting.value = true
  try {
    await leadsStore.deleteLead(props.lead.id)
    showToast('Lead eliminado con éxito', 'success')
    emit('close')
  } catch (error) {
    showToast('Error al eliminar el lead', 'error')
  } finally {
    isDeleting.value = false
    showConfirmDelete.value = false
  }
}

watch(() => props.lead.id, () => {
  currentTab.value = 'brain'
  isEditing.value = false
})
</script>

<template>
  <div class="flex flex-col h-full bg-white overflow-hidden">
    <LeadDetailHeader 
      :lead="lead" 
      :isEditing="isEditing"
      @close="emit('close')"
      @edit="isEditing = true; currentTab = 'info'"
      @cancelEdit="isEditing = false"
    />

    <LeadDetailTabs v-model="currentTab" />

    <div class="flex-1 overflow-y-auto">
      <Transition name="fade" mode="out-in">
        <div :key="currentTab">
          <LeadDetailBrain v-if="currentTab === 'brain'" :lead="lead" />
          <LeadDetailInfo 
            v-if="currentTab === 'info'" 
            :lead="lead" 
            :isEditing="isEditing"
            @cancelEdit="isEditing = false"
            @saved="isEditing = false"
          />
          <LeadDetailHistory v-if="currentTab === 'history'" :lead="lead" />
        </div>
      </Transition>

      <div v-if="currentTab === 'info' && !isEditing" class="p-5 pt-0">
        <button
          @click="showConfirmDelete = true"
          class="w-full py-3 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition-all text-xs font-bold"
        >
          Eliminar Lead
        </button>
      </div>
    </div>

    <ConfirmDeleteModal
      v-model:open="showConfirmDelete"
      title="¿Eliminar Lead?"
      description="Esta acción eliminará todos los datos y el historial de este lead permanentemente."
      :isDeleting="isDeleting"
      @confirm="handleDelete"
    />
  </div>
</template>