import { supabase } from '@/shared/infrastructure/supabase/client'
import type { MessageTemplate } from '@/modules/templates/domain/MessageTemplate'

export const MessageTemplatesRepository = {
  async getAll(): Promise<MessageTemplate[]> {
    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .is('deleted_at', null)          // Soft delete filter
      .order('order', { ascending: true })
    if (error) throw error
    return data as MessageTemplate[]
  },

  async create(template: Omit<MessageTemplate, 'id' | 'created_at' | 'user_id' | 'deleted_at' | 'deleted_by'>): Promise<MessageTemplate> {
    const { data, error } = await supabase
      .from('message_templates')
      .insert(template)
      .select()
      .single()
    if (error) throw error
    return data as MessageTemplate
  },

  async update(id: string, updates: Partial<Pick<MessageTemplate, 'name' | 'content' | 'order'>>): Promise<MessageTemplate> {
    const { data, error } = await supabase
      .from('message_templates')
      .update(updates)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()
    if (error) throw error
    return data as MessageTemplate
  },

  /** Soft delete: preserves the template for audit and potential restore. */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('message_templates')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: (await supabase.auth.getUser()).data.user?.id ?? null,
      })
      .eq('id', id)
    if (error) throw error
  },
}
