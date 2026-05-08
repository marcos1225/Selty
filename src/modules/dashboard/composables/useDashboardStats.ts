import { computed } from 'vue'
import { CalendarCheck, Users, TrendingUp, DollarSign, BarChart3 } from 'lucide-vue-next'
import { useLeadsStore } from '@/modules/leads/application/stores/useLeadsStore'
import { useStatusesStore } from '@/modules/statuses/application/stores/useStatusesStore'
import { useActivitiesStore } from '@/modules/activities/application/stores/useActivitiesStore'

export function useDashboardStats() {
  const leadsStore = useLeadsStore()
  const statusesStore = useStatusesStore()
  const activitiesStore = useActivitiesStore()

  const activeLeadsValue = computed(() => {
    const finalStatusIds = new Set(
      statusesStore.statuses.filter((s) => s.is_final).map((s) => s.id),
    )
    return leadsStore.leads
      .filter((l) => !finalStatusIds.has(l.status_id))
      .reduce((sum, l) => sum + (l.estimated_value || 0), 0)
  })

  const wonLeadsValue = computed(() => {
    const wonStatusIds = new Set(
      statusesStore.statuses
        .filter((s) => s.name.toLowerCase().includes('ganado'))
        .map((s) => s.id),
    )
    return leadsStore.leads
      .filter((l) => wonStatusIds.has(l.status_id))
      .reduce((sum, l) => sum + (l.estimated_value || 0), 0)
  })

  const totalActiveLeads = computed(() => {
    const finalStatusIds = new Set(
      statusesStore.statuses.filter((s) => s.is_final).map((s) => s.id),
    )
    return leadsStore.leads.filter((l) => !finalStatusIds.has(l.status_id)).length
  })

  const conversionRate = computed(() => {
    if (leadsStore.leads.length === 0) return 0
    const wonStatus = statusesStore.statuses.find(
      (s) => s.name.toLowerCase().includes('ganado') || s.name.toLowerCase().includes('cerrado'),
    )
    if (!wonStatus) return 0
    const wonCount = leadsStore.leads.filter((l) => l.status_id === wonStatus.id).length
    return Math.round((wonCount / leadsStore.leads.length) * 100)
  })

  const stats = computed(() => {
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    const followUps = activitiesStore.allActivities.filter((a) => a.type === 'followup')
    const followUpsToday = followUps.filter((a) => new Date(a.created_at) >= oneDayAgo).length
    const followUpsYesterday = followUps.filter((a) => {
      const d = new Date(a.created_at)
      return d >= twoDaysAgo && d < oneDayAgo
    }).length

    const followUpTrend =
      followUpsYesterday === 0
        ? followUpsToday > 0
          ? 100
          : 0
        : Math.round(((followUpsToday - followUpsYesterday) / followUpsYesterday) * 100)

    const wonStatusIds = new Set(
      statusesStore.statuses
        .filter((s) => s.name.toLowerCase().includes('ganado'))
        .map((s) => s.id),
    )
    const statusChanges = activitiesStore.allActivities.filter((a) => a.type === 'status_change')

    const wonLast7d = statusChanges.filter(
      (a) =>
        wonStatusIds.has(a.metadata?.to_status_id as string) &&
        new Date(a.created_at) >= sevenDaysAgo,
    ).length
    const wonPrev7d = statusChanges.filter((a) => {
      const d = new Date(a.created_at)
      return (
        wonStatusIds.has(a.metadata?.to_status_id as string) &&
        d >= fourteenDaysAgo &&
        d < sevenDaysAgo
      )
    }).length

    const conversionTrend =
      wonPrev7d === 0
        ? wonLast7d > 0
          ? 100
          : 0
        : Math.round(((wonLast7d - wonPrev7d) / wonPrev7d) * 100)

    const createdLast7d = leadsStore.leads.filter(
      (l) => new Date(l.created_at) >= sevenDaysAgo,
    ).length
    const createdPrev7d = leadsStore.leads.filter((l) => {
      const d = new Date(l.created_at)
      return d >= fourteenDaysAgo && d < sevenDaysAgo
    }).length

    const volumeTrend =
      createdPrev7d === 0
        ? createdLast7d > 0
          ? 100
          : 0
        : Math.round(((createdLast7d - createdPrev7d) / createdPrev7d) * 100)

    return [
      {
        label: 'Ganancia Realizada',
        value: new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR',
          maximumFractionDigits: 0,
        }).format(wonLeadsValue.value),
        icon: DollarSign,
        color: 'bg-primary',
        trend: `${Math.abs(conversionTrend)}%`,
        isUp: conversionTrend >= 0,
      },
      {
        label: 'Leads Activos',
        value: totalActiveLeads.value,
        icon: Users,
        color: 'bg-info',
        trend: '8.1%', 
        isUp: true,
      },
      {
        label: 'Valor Pipeline',
        value: new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR',
          maximumFractionDigits: 0,
        }).format(activeLeadsValue.value),
        icon: TrendingUp,
        color: 'bg-secondary',
        trend: 'Potencial',
        isUp: true,
      },
      {
        label: 'Tasa Conversión',
        value: `${conversionRate.value}%`,
        icon: BarChart3,
        color: 'bg-text-muted',
        trend: `${Math.abs(conversionTrend)}%`,
        isUp: conversionTrend >= 0,
      },
    ]
  })

  const volumeTrend = computed(() => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)

    const createdLast7d = leadsStore.leads.filter(
      (l) => new Date(l.created_at) >= sevenDaysAgo,
    ).length
    const createdPrev7d = leadsStore.leads.filter((l) => {
      const d = new Date(l.created_at)
      return d >= fourteenDaysAgo && d < sevenDaysAgo
    }).length

    if (createdPrev7d === 0) return createdLast7d > 0 ? 100 : 0
    return Math.round(((createdLast7d - createdPrev7d) / createdPrev7d) * 100)
  })

  return {
    activeLeadsValue,
    wonLeadsValue,
    totalActiveLeads,
    conversionRate,
    stats,
    volumeTrend,
  }
}
