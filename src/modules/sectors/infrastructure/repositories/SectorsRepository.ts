import { supabase } from '@/shared/infrastructure/supabase/client'
import type { Sector } from '@/modules/sectors/domain/Sector'

export const SectorsRepository = {
  async getAll(): Promise<Sector[]> {
    const { data, error } = await supabase
      .from('sectors')
      .select('*')
      .is('deleted_at', null)          // Soft delete filter
      .order('name', { ascending: true })
    if (error) throw error
    return data as Sector[]
  },

  async create(sector: Omit<Sector, 'id' | 'created_at' | 'deleted_at' | 'deleted_by'>): Promise<Sector> {
    const { data, error } = await supabase
      .from('sectors')
      .insert(sector)
      .select()
      .single()
    if (error) throw error
    return data as Sector
  },

  async update(id: string, updates: Partial<Pick<Sector, 'name' | 'color'>>): Promise<Sector> {
    const { data, error } = await supabase
      .from('sectors')
      .update(updates)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()
    if (error) throw error
    return data as Sector
  },

  /** Soft delete: preserves the sector for audit and potential restore. */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('sectors')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: (await supabase.auth.getUser()).data.user?.id ?? null,
      })
      .eq('id', id)
    if (error) throw error
  },
}
