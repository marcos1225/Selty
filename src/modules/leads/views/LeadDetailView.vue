<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLeadsStore } from '@/modules/leads/application/stores/useLeadsStore'
import LeadDetailManager from '../components/details/LeadDetailManager.vue'
import { ChevronLeft } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const leadsStore = useLeadsStore()

const leadId = computed(() => route.params.id as string)
const lead = computed(() => leadsStore.leads.find(l => l.id === leadId.value))
const isLoading = ref(true)

onMounted(async () => {
  try {
    if (!lead.value) {
      await leadsStore.fetchLeads()
    }
  } catch (error) {
    console.error('Error fetching lead', error)
  } finally {
    isLoading.value = false
  }
})

const goBack = () => {
  router.push('/leads')
}
</script>

<template>
  <div class="h-full bg-gray-50 flex flex-col">
    <div class="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-4">
        <button 
          @click="goBack"
          class="p-2 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all"
        >
          <ChevronLeft class="w-5 h-5" />
        </button>
        <div>
          <h1 class="text-lg font-bold text-gray-900">Detalle del Lead</h1>
          <p class="text-xs text-gray-400 font-medium">Gestión avanzada de prospecto</p>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-hidden flex justify-center p-6">
      <div class="w-full max-w-5xl bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        <div v-if="isLoading" class="flex-1 flex items-center justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
        
        <template v-else-if="lead">
          <LeadDetailManager 
            :lead="lead" 
            :isFullPage="true"
            class="flex-1"
            @close="goBack"
          />
        </template>

        <div v-else class="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <X class="w-8 h-8 text-red-500" />
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">Lead no encontrado</h3>
          <p class="text-gray-500 mb-6 max-w-xs">El lead que buscas no existe o ha sido eliminado.</p>
          <button @click="goBack" class="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold">
            Volver a la lista
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
