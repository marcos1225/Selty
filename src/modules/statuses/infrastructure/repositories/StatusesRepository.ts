import { supabase } from '@/shared/infrastructure/supabase/client'
import type { Status } from '@/modules/statuses/domain/Status'

export const StatusesRepository = {
  async getAll(): Promise<Status[]> {
    const { data, error } = await supabase
      .from('statuses')
      .select('*')
      .is('deleted_at', null)          // Soft delete filter
      .order('order', { ascending: true })
    if (error) throw error
    return data as Status[]
  },

  async create(status: Omit<Status, 'id' | 'deleted_at' | 'deleted_by'>): Promise<Status> {
    const { data, error } = await supabase
      .from('statuses')
      .insert(status)
      .select()
      .single()
    if (error) throw error
    return data as Status
  },

  async update(id: string, updates: Partial<Omit<Status, 'id'>>): Promise<Status> {
    const { data, error } = await supabase
      .from('statuses')
      .update(updates)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()
    if (error) throw error
    return data as Status
  },

  /** Soft delete: preserves the status for audit and potential restore. */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('statuses')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: (await supabase.auth.getUser()).data.user?.id ?? null,
      })
      .eq('id', id)
    if (error) throw error
  },
}
