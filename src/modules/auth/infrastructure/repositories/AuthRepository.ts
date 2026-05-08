import { supabase } from '@/shared/infrastructure/supabase/client'
import type { User } from '@/modules/auth/domain/User'

export const AuthRepository = {
  async signIn(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return { id: data.user!.id, email: data.user!.email! }
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },
}
