import { defineStore } from 'pinia'
import { ref } from 'vue'
import { StatusesRepository } from '@/modules/statuses/infrastructure/repositories/StatusesRepository'
import type { Status } from '@/modules/statuses/domain/Status'

export const useStatusesStore = defineStore('statuses', () => {
  const statuses = ref<Status[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchStatuses() {
    loading.value = true
    error.value = null
    try {
      statuses.value = await StatusesRepository.getAll()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function createStatus(status: Omit<Status, 'id'>) {
    const created = await StatusesRepository.create(status)
    statuses.value.push(created)
    statuses.value.sort((a, b) => a.order - b.order)
  }

  async function updateStatus(id: string, updates: Partial<Omit<Status, 'id'>>) {
    const updated = await StatusesRepository.update(id, updates)
    const idx = statuses.value.findIndex(s => s.id === id)
    if (idx !== -1) statuses.value[idx] = updated
    statuses.value.sort((a, b) => a.order - b.order)
  }

  async function deleteStatus(id: string) {
    await StatusesRepository.delete(id)
    statuses.value = statuses.value.filter(s => s.id !== id)
  }

  return { statuses, loading, error, fetchStatuses, createStatus, updateStatus, deleteStatus }
})
