import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { MessageTemplatesRepository } from '@/modules/templates/infrastructure/repositories/MessageTemplatesRepository'
import type { MessageTemplate } from '@/modules/templates/domain/MessageTemplate'

export const useMessageTemplatesStore = defineStore('messageTemplates', () => {
  const templates = ref<MessageTemplate[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const templatesByStatus = computed(() => {
    return templates.value.reduce<Record<string, MessageTemplate[]>>((acc, t) => {
      if (!t.status_id) return acc
      if (!acc[t.status_id]) acc[t.status_id] = []
      acc[t.status_id]!.push(t)
      return acc
    }, {})
  })

  const globalTemplates = computed(() => {
    return templates.value
      .filter((t) => !t.status_id)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  })

  function getByStatusId(statusId: string | null): MessageTemplate[] {
    if (!statusId) return globalTemplates.value
    const statusSpecific = [...(templatesByStatus.value[statusId] ?? [])].sort(
      (a, b) => (a.order || 0) - (b.order || 0),
    )
    return [...statusSpecific, ...globalTemplates.value]
  }

  async function fetchTemplates() {
    isLoading.value = true
    error.value = null
    try {
      templates.value = await MessageTemplatesRepository.getAll()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      isLoading.value = false
    }
  }

  async function createTemplate(payload: Omit<MessageTemplate, 'id' | 'created_at' | 'user_id'>) {
    const template = await MessageTemplatesRepository.create(payload)
    templates.value.push(template)
  }

  async function updateTemplate(
    id: string,
    updates: Partial<Pick<MessageTemplate, 'name' | 'content' | 'order'>>,
  ) {
    await MessageTemplatesRepository.update(id, updates)
    const idx = templates.value.findIndex((t) => t.id === id)
    if (idx !== -1) Object.assign(templates.value[idx]!, updates)
  }

  async function deleteTemplate(id: string) {
    await MessageTemplatesRepository.delete(id)
    templates.value = templates.value.filter((t) => t.id !== id)
  }

  return {
    templates,
    isLoading,
    error,
    templatesByStatus,
    globalTemplates,
    getByStatusId,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  }
})
