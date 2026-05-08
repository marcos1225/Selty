export type ActivityType = 'message' | 'followup' | 'note' | 'status_change'

export interface Activity {
  id: string
  lead_id: string
  user_id: string
  type: ActivityType
  description: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}
