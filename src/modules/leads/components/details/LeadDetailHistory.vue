<script setup lang="ts">
import type { Lead } from '@/modules/leads/domain/Lead'
import LeadActivityTimeline from '@/modules/leads/components/LeadActivityTimeline.vue'
import LeadNotesCard from '@/modules/leads/components/LeadNotesCard.vue'
import { computed, onMounted } from 'vue'
import { useActivitiesStore } from '@/modules/activities/application/stores/useActivitiesStore'

const props = defineProps<{
  lead: Lead
}>()

const activitiesStore = useActivitiesStore()

const activities = computed(() => activitiesStore.getForLead(props.lead.id))
const isLoading = computed(() => activitiesStore.isLoadingForLead(props.lead.id))

onMounted(() => {
  activitiesStore.fetchForLead(props.lead.id)
})
</script>

<template>
  <div class="p-5 space-y-8">
    <LeadNotesCard :lead="lead" />
    
    <div class="space-y-4">
      <h4 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Línea de Tiempo</h4>
      <LeadActivityTimeline
        :leadId="lead.id"
        :activities="activities"
        :isLoading="isLoading"
      />
    </div>
  </div>
</template>
