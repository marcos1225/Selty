import { supabase } from '@/shared/infrastructure/supabase/client'
import type { Lead } from '@/modules/leads/domain/Lead'

export const LeadsRepository = {
  async getAll(): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .is('deleted_at', null)          // Soft delete filter
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Lead[]
  },

  async create(lead: Omit<Lead, 'id' | 'created_at' | 'deleted_at' | 'deleted_by'>): Promise<Lead> {
    const { data, error } = await supabase.from('leads').insert(lead).select().single()
    if (error) throw error
    return data as Lead
  },

  async update(id: string, updates: Partial<Lead>): Promise<Lead> {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .is('deleted_at', null)          // Don't update already-deleted records
      .select()
      .single()
    if (error) throw error
    return data as Lead
  },

  /** Soft delete: marks the lead as deleted without removing it from the DB. */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('leads')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: (await supabase.auth.getUser()).data.user?.id ?? null,
      })
      .eq('id', id)
    if (error) throw error
  },
}
