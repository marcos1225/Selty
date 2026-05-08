import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { LeadsRepository } from '@/modules/leads/infrastructure/repositories/LeadsRepository'
import { useStatusesStore } from '@/modules/statuses/application/stores/useStatusesStore'
import { useAuthStore } from '@/modules/auth/application/stores/useAuthStore'
import {
  calculateNextFollowUp,
  isDueToday,
  isUpcoming,
  getTodayString,
} from '@/modules/leads/domain/followUp'
import { ActivitiesRepository } from '@/modules/activities/infrastructure/repositories/ActivitiesRepository'
import { useActivitiesStore } from '@/modules/activities/application/stores/useActivitiesStore'
import { supabase } from '@/shared/infrastructure/supabase/client'
import type { Lead } from '@/modules/leads/domain/Lead'
import { LEAD_STATUS, type LeadPriority } from '@/modules/leads/domain/constants'

export const useLeadsStore = defineStore('leads', () => {
  const statusesStore = useStatusesStore()
  const authStore = useAuthStore()
  const activitiesStore = useActivitiesStore()

  const leads = ref<Lead[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const subscription = ref<any>(null)

  const selectedLeadId = ref<string | null>(null)
  const isDrawerOpen = ref(false)

  const selectedLead = computed(
    () => leads.value.find((l) => l.id === selectedLeadId.value) || null,
  )

  const filterStatusId = ref<string | null>(null)
  const filterPriority = ref<LeadPriority | null>(null)
  const filterSectorId = ref<string | null>(null)

  const columns = computed(() => {
    const baseStatuses = statusesStore.statuses.filter((s) => !s.is_final)
    const activeStatuses = filterStatusId.value
      ? baseStatuses.filter((s) => s.id === filterStatusId.value)
      : baseStatuses

    return activeStatuses.map((status) => ({
      ...status,
      leads: leads.value
        .filter((l) => l.status_id === status.id)
        .filter((l) => !filterPriority.value || l.priority === filterPriority.value)
        .filter((l) => !filterSectorId.value || l.sector_id === filterSectorId.value),
    }))
  })

  const finalStatusIds = computed(
    () => new Set(statusesStore.statuses.filter((s) => s.is_final).map((s) => s.id)),
  )

  const historialLeads = computed(() => {
    return leads.value.filter((l) => finalStatusIds.value.has(l.status_id))
  })

  const todayFollowUps = computed(() =>
    leads.value.filter((l) => !finalStatusIds.value.has(l.status_id) && isDueToday(l)),
  )

  const upcomingFollowUps = computed(() =>
    leads.value.filter((l) => !finalStatusIds.value.has(l.status_id) && isUpcoming(l)),
  )

  async function fetchLeads() {
    isLoading.value = true
    error.value = null
    try {
      if (!statusesStore.statuses.length) await statusesStore.fetchStatuses()
      leads.value = await LeadsRepository.getAll()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      isLoading.value = false
    }
  }

  async function createLead(
    payload: Pick<
      Lead,
      | 'name'
      | 'phone'
      | 'email'
      | 'status_id'
      | 'priority'
      | 'notes'
      | 'estimated_value'
      | 'sector_id'
    > & { contactDate?: string | null },
  ) {
    if (!authStore.user) throw new Error('No authenticated user')

    const { contactDate, ...leadData } = payload

    const lead = await LeadsRepository.create({
      ...leadData,
      user_id: authStore.user.id,
      attempts: 0,
      first_contact_at: contactDate || null,
      last_contact_at: null,
      next_follow_up_at: null,
      updated_at: new Date().toISOString(),
    })

    if (contactDate) {
      const activity = await ActivitiesRepository.create({
        lead_id: lead.id,
        user_id: authStore.user.id,
        type: 'followup',
        description: 'Contacto inicial registrado al crear lead',
        created_at: contactDate,
        metadata: { is_initial: true },
      })
      activitiesStore.prependActivity(activity)

      lead.attempts = 1
      lead.last_contact_at = contactDate
      lead.next_follow_up_at = calculateNextFollowUp(1, contactDate)

      await LeadsRepository.update(lead.id, {
        attempts: lead.attempts,
        last_contact_at: lead.last_contact_at,
        next_follow_up_at: lead.next_follow_up_at,
      })
    }

    leads.value.unshift(lead)
  }

  async function followUp(leadId: string, templateId?: string) {
    const lead = leads.value.find((l) => l.id === leadId)
    if (!lead || !authStore.user) return

    const now = new Date().toISOString()
    const today = getTodayString()

    const activity = await ActivitiesRepository.create({
      lead_id: leadId,
      user_id: authStore.user.id,
      type: 'followup',
      description: null,
      metadata: {
        template_id: templateId || null,
      },
    })

    activitiesStore.prependActivity(activity)

    const newAttempts = lead.attempts + 1
    lead.attempts = newAttempts
    lead.last_contact_at = now
    lead.next_follow_up_at = calculateNextFollowUp(newAttempts, today)

    await LeadsRepository.update(leadId, {
      attempts: newAttempts,
      last_contact_at: now,
      next_follow_up_at: lead.next_follow_up_at,
    })

    const currentStatus = statusesStore.statuses.find((s) => s.id === lead.status_id)
    if (currentStatus?.name === LEAD_STATUS.NEW) {
      const contactedStatus = statusesStore.statuses.find((s) => s.name === LEAD_STATUS.CONTACTED)
      if (contactedStatus) {
        await moveLead(leadId, contactedStatus.id)
      }
    }
  }

  async function moveLead(leadId: string, newStatusId: string) {
    const lead = leads.value.find((l) => l.id === leadId)
    if (!lead) return

    const fromStatus = statusesStore.statuses.find((s) => s.id === lead.status_id)
    const toStatus = statusesStore.statuses.find((s) => s.id === newStatusId)

    lead.status_id = newStatusId

    if (toStatus?.is_final) {
      lead.next_follow_up_at = null
    }

    await LeadsRepository.update(leadId, {
      status_id: newStatusId,
      next_follow_up_at: toStatus?.is_final ? null : lead.next_follow_up_at,
    })

    if (authStore.user) {
      const activity = await ActivitiesRepository.create({
        lead_id: leadId,
        user_id: authStore.user.id,
        type: 'status_change',
        description: null,
        metadata: {
          from_status_id: fromStatus?.id ?? null,
          from_status_name: fromStatus?.name ?? null,
          to_status_id: toStatus?.id ?? null,
          to_status_name: toStatus?.name ?? null,
        },
      })
      activitiesStore.prependActivity(activity)
    }
  }

  async function updateNotes(leadId: string, notes: string | null) {
    await updateLead(leadId, { notes })
  }

  async function updateLead(leadId: string, updates: Partial<Lead>) {
    const leadIndex = leads.value.findIndex((l) => l.id === leadId)
    if (leadIndex === -1) return

    const lead = leads.value[leadIndex]
    if (!lead) return
    const oldLead = { ...lead }
    Object.assign(lead, updates)

    try {
      await LeadsRepository.update(leadId, updates)
    } catch (e) {
      leads.value[leadIndex] = oldLead
      throw e
    }
  }

  async function deleteLead(leadId: string) {
    const oldLeads = [...leads.value]
    leads.value = leads.value.filter((l) => l.id !== leadId)

    try {
      await LeadsRepository.delete(leadId)
      if (selectedLeadId.value === leadId) {
        isDrawerOpen.value = false
        selectedLeadId.value = null
      }
    } catch (e) {
      leads.value = oldLeads
      throw e
    }
  }

  const realtimeHandlers: Record<string, (payload: any) => void> = {
    INSERT: ({ new: newRecord }) => {
      const exists = leads.value.find((l) => l.id === (newRecord as Lead).id)
      if (!exists) leads.value.unshift(newRecord as Lead)
    },
    UPDATE: ({ new: newRecord }) => {
      const targetLead = leads.value.find((l) => l.id === (newRecord as Lead).id)
      if (targetLead) Object.assign(targetLead, newRecord)
    },
    DELETE: ({ old: oldRecord }) => {
      leads.value = leads.value.filter((l) => l.id !== oldRecord.id)
    },
  }

  function subscribeToLeads() {
    if (subscription.value) return

    subscription.value = supabase
      .channel('leads-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => {
        realtimeHandlers[payload.eventType]?.(payload)
      })
      .subscribe()
  }

  function unsubscribeLeads() {
    if (subscription.value) {
      supabase.removeChannel(subscription.value)
      subscription.value = null
    }
  }

  return {
    leads,
    isLoading,
    error,
    columns,
    historialLeads,
    todayFollowUps,
    upcomingFollowUps,
    filterStatusId,
    filterPriority,
    filterSectorId,
    fetchLeads,
    createLead,
    followUp,
    moveLead,
    updateNotes,
    updateLead,
    deleteLead,
    subscribeToLeads,
    unsubscribeLeads,
    selectedLeadId,
    isDrawerOpen,
    selectedLead,
  }
})
