import { supabase } from '@/shared/infrastructure/supabase/client'
import type { Activity } from '@/modules/activities/domain/Activity'

export const ActivitiesRepository = {
  async getByLeadId(leadId: string): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('lead_id', leadId)
      .is('deleted_at', null)          // Soft delete filter
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Activity[]
  },

  async getAll(): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .is('deleted_at', null)          // Soft delete filter
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Activity[]
  },

  async create(
    activity: Omit<Activity, 'id' | 'created_at' | 'deleted_at' | 'deleted_by'> & {
      created_at?: string
      metadata?: Record<string, unknown> | null
    }
  ): Promise<Activity> {
    const { data, error } = await supabase
      .from('activities')
      .insert(activity)
      .select()
      .single()
    if (error) throw error
    return data as Activity
  },

  /**
   * Soft-delete: only 'note' type activities can be deleted by the user.
   * System events (followup, status_change) are immutable to preserve audit trail.
   */
  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('activities')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: (await supabase.auth.getUser()).data.user?.id ?? null,
      })
      .eq('id', id)
      .eq('type', 'note')              // Safety guard: only notes can be deleted
    if (error) throw error
  },
}
