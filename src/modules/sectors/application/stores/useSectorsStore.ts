import { defineStore } from 'pinia'
import { ref } from 'vue'
import { SectorsRepository } from '@/modules/sectors/infrastructure/repositories/SectorsRepository'
import { useAuthStore } from '@/modules/auth/application/stores/useAuthStore'
import type { Sector } from '@/modules/sectors/domain/Sector'

export const useSectorsStore = defineStore('sectors', () => {
  const authStore = useAuthStore()
  const sectors = ref<Sector[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchSectors() {
    loading.value = true
    error.value = null
    try {
      sectors.value = await SectorsRepository.getAll()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function createSector(payload: Pick<Sector, 'name' | 'color'>) {
    if (!authStore.user) throw new Error('No authenticated user')
    const created = await SectorsRepository.create({ ...payload, user_id: authStore.user.id })
    sectors.value.push(created)
    sectors.value.sort((a, b) => a.name.localeCompare(b.name))
  }

  async function updateSector(id: string, updates: Partial<Pick<Sector, 'name' | 'color'>>) {
    const updated = await SectorsRepository.update(id, updates)
    const idx = sectors.value.findIndex(s => s.id === id)
    if (idx !== -1) sectors.value[idx] = updated
  }

  async function deleteSector(id: string) {
    await SectorsRepository.delete(id)
    sectors.value = sectors.value.filter(s => s.id !== id)
  }

  return { sectors, loading, error, fetchSectors, createSector, updateSector, deleteSector }
})
