import { ref, computed, watch, nextTick, type WritableComputedRef } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, User, type LucideIcon } from 'lucide-vue-next'
import { useLeadsStore } from '@/modules/leads/application/stores/useLeadsStore'
import { useMessageTemplatesStore } from '@/modules/templates/application/stores/useMessageTemplatesStore'

type SearchItemType = 'header' | 'lead' | 'template' | 'action'

interface SearchItem {
  type: SearchItemType
  label: string
  id?: string | number
  icon?: LucideIcon
  to?: string
  data?: any
}

export function useGlobalSearch(
  isOpen: WritableComputedRef<boolean>,
  inputRef: { value: HTMLInputElement | null },
) {
  const router = useRouter()
  const leadsStore = useLeadsStore()
  const templatesStore = useMessageTemplatesStore()

  const query = ref('')
  const selectedIndex = ref(0)

  const searchLeads = () => {
    if (!query.value) return []
    const q = query.value.toLowerCase()

    return leadsStore.leads
      .filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.phone?.toLowerCase().includes(q),
      )
      .slice(0, 5)
      .map((l) => ({ type: 'lead' as const, label: l.name, data: l, id: l.id }))
  }

  const searchTemplates = () => {
    if (!query.value) return []
    const q = query.value.toLowerCase()

    return templatesStore.templates
      .filter((t) => t.name.toLowerCase().includes(q) || t.content.toLowerCase().includes(q))
      .slice(0, 5)
      .map((t) => ({ type: 'template' as const, label: t.name, data: t, id: t.id }))
  }

  const getQuickActions = (): SearchItem[] => [
    { type: 'action', label: 'Nuevo Lead', icon: Plus, to: '/leads' },
    { type: 'action', label: 'Ver Historial', icon: User, to: '/historial' },
  ]

  const results = computed(() => {
    const items: SearchItem[] = []

    const leads = searchLeads()
    if (leads.length > 0) {
      items.push({ type: 'header', label: 'Leads' })
      items.push(...leads)
    }

    const templates = searchTemplates()
    if (templates.length > 0) {
      items.push({ type: 'header', label: 'Plantillas' })
      items.push(...templates)
    }

    if (!query.value) {
      items.push({ type: 'header', label: 'Acciones Rápidas' })
      items.push(...getQuickActions())
    }

    return items
  })

  const selectableItems = computed(() => results.value.filter((i) => i.type !== 'header'))

  const navigationHandlers: Record<string, (item: SearchItem) => void> = {
    lead: (item) => {
      leadsStore.selectedLeadId = item.data.id
      leadsStore.isDrawerOpen = true
      router.push('/leads')
    },
    template: () => router.push('/templates'),
    action: (item) => item.to && router.push(item.to),
  }

  function navigateTo(item: SearchItem) {
    isOpen.value = false
    query.value = ''

    const handler = navigationHandlers[item.type]
    if (handler) handler(item)
  }

  function handleKeyDown(e: KeyboardEvent) {
    const handlers: Record<string, () => void> = {
      ArrowDown: () => {
        selectedIndex.value = (selectedIndex.value + 1) % selectableItems.value.length
      },
      ArrowUp: () => {
        selectedIndex.value =
          (selectedIndex.value - 1 + selectableItems.value.length) % selectableItems.value.length
      },
      Enter: () => {
        const item = selectableItems.value[selectedIndex.value]
        if (item) navigateTo(item)
      },
    }

    const handler = handlers[e.key]
    if (handler) {
      e.preventDefault()
      handler()
    }
  }

  function handleGlobalKeyDown(e: KeyboardEvent) {
    const isSearchShortcut = (e.metaKey || e.ctrlKey) && e.key === 'k'

    if (isSearchShortcut) {
      e.preventDefault()
      isOpen.value = !isOpen.value
      return
    }

    if (e.key === 'Escape' && isOpen.value) {
      isOpen.value = false
    }
  }

  watch(isOpen, (newVal) => {
    if (!newVal) return

    selectedIndex.value = 0
    nextTick(() => inputRef.value?.focus())
  })

  watch(query, () => {
    selectedIndex.value = 0
  })

  return {
    query,
    selectedIndex,
    results,
    selectableItems,
    handleKeyDown,
    navigateTo,
    handleGlobalKeyDown,
  }
}
