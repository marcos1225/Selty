import type { Lead } from '@/modules/leads/domain/Lead'
import { FOLLOW_UP_CONFIG, CADENCE_STRATEGIES } from './constants'
import { parseLocalDate } from '@/shared/utils/formatDate'

const activeCadence = CADENCE_STRATEGIES.PROGRESSIVE

const normalizeDate = (date: Date | string): Date => {
  const d = typeof date === 'string' ? parseLocalDate(date) : new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getTodayString(): string {
  return new Date().toLocaleDateString('en-CA')
}

export function calculateNextFollowUp(attempts: number, baseDate?: string | Date): string {
  const days =
    attempts === 0
      ? FOLLOW_UP_CONFIG.INITIAL_CONTACT_DAYS
      : (activeCadence[attempts - 1] ?? FOLLOW_UP_CONFIG.DEFAULT_MAX_DAYS)

  const date = baseDate ? normalizeDate(baseDate) : normalizeDate(new Date())
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)

  const dayOfWeek = nextDate.getDay()
  if (dayOfWeek === 6) nextDate.setDate(nextDate.getDate() + 2)
  else if (dayOfWeek === 0) nextDate.setDate(nextDate.getDate() + 1)

  return nextDate.toLocaleDateString('en-CA')
}

export function isDueToday(lead: Lead): boolean {
  if (!lead.next_follow_up_at) return lead.attempts === 0

  const today = normalizeDate(new Date())
  const followUpDate = normalizeDate(lead.next_follow_up_at)

  return followUpDate <= today
}

export function isUpcoming(lead: Lead): boolean {
  if (!lead.next_follow_up_at) return false

  const today = normalizeDate(new Date())
  const followUpDate = normalizeDate(lead.next_follow_up_at)

  const limit = new Date(today)
  limit.setDate(limit.getDate() + FOLLOW_UP_CONFIG.UPCOMING_WINDOW_DAYS)

  return followUpDate > today && followUpDate <= limit
}
