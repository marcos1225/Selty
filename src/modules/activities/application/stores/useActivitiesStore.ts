import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ActivitiesRepository } from '@/modules/activities/infrastructure/repositories/ActivitiesRepository'
import type { Activity } from '@/modules/activities/domain/Activity'

export const useActivitiesStore = defineStore('activities', () => {
  const activitiesByLead = ref<Record<string, Activity[]>>({})
  const loadingLeadId = ref<string | null>(null)

  async function fetchForLead(leadId: string) {
    loadingLeadId.value = leadId
    try {
      activitiesByLead.value[leadId] = await ActivitiesRepository.getByLeadId(leadId)
    } finally {
      loadingLeadId.value = null
    }
  }

  const allActivities = ref<Activity[]>([])
  const isLoadingAll = ref(false)

  async function fetchAll() {
    isLoadingAll.value = true
    try {
      allActivities.value = await ActivitiesRepository.getAll()
    } finally {
      isLoadingAll.value = false
    }
  }

  function getForLead(leadId: string): Activity[] {
    return activitiesByLead.value[leadId] ?? []
  }

  function isLoadingForLead(leadId: string): boolean {
    return loadingLeadId.value === leadId
  }

  function prependActivity(activity: Activity) {
    const existing = activitiesByLead.value[activity.lead_id]
    if (existing) {
      activitiesByLead.value[activity.lead_id] = [activity, ...existing]
    }
  }

  async function deleteActivity(activity: Activity) {
    if (activity.type !== 'note') return

    const leadActivities = activitiesByLead.value[activity.lead_id]
    if (leadActivities) {
      activitiesByLead.value[activity.lead_id] = leadActivities.filter((a) => a.id !== activity.id)
    }

    try {
      await ActivitiesRepository.softDelete(activity.id)
    } catch (e) {
      if (leadActivities) {
        activitiesByLead.value[activity.lead_id] = leadActivities
      }
      throw e
    }
  }

  return {
    activitiesByLead,
    allActivities,
    isLoadingAll,
    fetchForLead,
    fetchAll,
    getForLead,
    isLoadingForLead,
    prependActivity,
    deleteActivity,
  }
})
