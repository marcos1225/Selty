import type { LeadPriority } from '@/modules/leads/domain/constants'
export type { LeadPriority }

export interface Lead {
  id: string
  name: string
  phone: string | null
  email: string | null
  avatar_url?: string | null
  sector_id: string | null
  status_id: string
  priority: LeadPriority | null
  attempts: number
  estimated_value: number | null
  notes: string | null
  first_contact_at: string | null
  last_contact_at: string | null
  next_follow_up_at: string | null
  created_at: string
  updated_at: string | null
  user_id: string
}
