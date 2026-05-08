import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AuthRepository } from '@/modules/auth/infrastructure/repositories/AuthRepository'
import type { User } from '@/modules/auth/domain/User'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)

  async function signIn(email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      user.value = await AuthRepository.signIn(email, password)
    } catch (e) {
      error.value = (e as Error).message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    await AuthRepository.signOut()
    user.value = null
  }

  async function loadSession() {
    const session = await AuthRepository.getSession()
    if (session) {
      user.value = { id: session.user.id, email: session.user.email! }
    }
  }

  return { user, loading, error, isAuthenticated, signIn, signOut, loadSession }
})
