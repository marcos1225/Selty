<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Search, User, MessageSquare, Command, X, ArrowRight } from 'lucide-vue-next'
import { useLeadsStore } from '@/modules/leads/application/stores/useLeadsStore'
import { useMessageTemplatesStore } from '@/modules/templates/application/stores/useMessageTemplatesStore'
import { useGlobalSearch } from '@/shared/composables/useGlobalSearch'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const leadsStore = useLeadsStore()
const templatesStore = useMessageTemplatesStore()

const inputRef = ref<HTMLInputElement | null>(null)

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const {
  query,
  selectedIndex,
  results,
  selectableItems,
  handleKeyDown,
  navigateTo,
  handleGlobalKeyDown,
} = useGlobalSearch(isOpen, inputRef)

onMounted(async () => {
  if (!leadsStore.leads.length) leadsStore.fetchLeads()
  if (!templatesStore.templates.length) templatesStore.fetchTemplates()

  window.addEventListener('keydown', handleGlobalKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeyDown)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="isOpen" class="fixed inset-0 z-100 flex items-start justify-center pt-[15vh] px-4">
        <div class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" @click="isOpen = false"></div>

        <div
          class="relative w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border border-white overflow-hidden flex flex-col ring-1 ring-black/5"
        >
          <div class="p-6 border-b border-gray-100 flex items-center gap-4">
            <Search class="w-6 h-6 text-blue-600" />
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              class="flex-1 bg-transparent border-none focus:ring-0 text-xl font-medium text-gray-900 placeholder-gray-400"
              placeholder="Buscar cualquier cosa..."
              @keydown="handleKeyDown"
            />
            <div class="flex items-center gap-2">
              <kbd
                class="h-7 px-2 rounded-lg bg-gray-50 border border-gray-200 text-xs font-bold text-gray-400 flex items-center gap-1"
              >
                ESC
              </kbd>
              <button
                @click="isOpen = false"
                class="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X class="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div class="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
            <div
              v-if="results.length === 0 && query"
              class="py-20 flex flex-col items-center justify-center text-center"
            >
              <div class="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center mb-4">
                <Search class="w-8 h-8 text-gray-300" />
              </div>
              <p class="text-gray-900 font-bold text-lg">No encontramos resultados</p>
              <p class="text-gray-500 text-sm">Intenta con otra búsqueda</p>
            </div>

            <template v-else>
              <div v-for="(item, index) in results" :key="index">
                <div v-if="item.type === 'header'" class="px-4 pt-6 pb-2">
                  <p class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                    {{ item.label }}
                  </p>
                </div>

                <div
                  v-else-if="item.type === 'lead'"
                  @click="navigateTo(item)"
                  @mouseenter="selectedIndex = selectableItems.indexOf(item)"
                  class="flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200"
                  :class="
                    selectedIndex === selectableItems.indexOf(item)
                      ? 'bg-blue-600 text-white translate-x-2'
                      : 'hover:bg-gray-50 text-gray-700'
                  "
                >
                  <div
                    class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    :class="
                      selectedIndex === selectableItems.indexOf(item)
                        ? 'bg-white/20'
                        : 'bg-blue-50 text-blue-600'
                    "
                  >
                    <User class="w-5 h-5" />
                  </div>
                  <div class="flex-1 overflow-hidden">
                    <p class="font-bold text-sm truncate">{{ item.data.name }}</p>
                    <p class="text-[11px] opacity-70 truncate">
                      {{ item.data.phone }} • {{ item.data.email }}
                    </p>
                  </div>
                  <ArrowRight
                    v-if="selectedIndex === selectableItems.indexOf(item)"
                    class="w-4 h-4 mr-2"
                  />
                </div>

                <div
                  v-else-if="item.type === 'template'"
                  @click="navigateTo(item)"
                  @mouseenter="selectedIndex = selectableItems.indexOf(item)"
                  class="flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200"
                  :class="
                    selectedIndex === selectableItems.indexOf(item)
                      ? 'bg-blue-600 text-white translate-x-2'
                      : 'hover:bg-gray-50 text-gray-700'
                  "
                >
                  <div
                    class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    :class="
                      selectedIndex === selectableItems.indexOf(item)
                        ? 'bg-white/20'
                        : 'bg-indigo-50 text-indigo-600'
                    "
                  >
                    <MessageSquare class="w-5 h-5" />
                  </div>
                  <div class="flex-1 overflow-hidden">
                    <p class="font-bold text-sm truncate">{{ item.data.name }}</p>
                    <p class="text-[11px] opacity-70 truncate">{{ item.data.content }}</p>
                  </div>
                  <ArrowRight
                    v-if="selectedIndex === selectableItems.indexOf(item)"
                    class="w-4 h-4 mr-2"
                  />
                </div>

                <div
                  v-else-if="item.type === 'action'"
                  @click="navigateTo(item)"
                  @mouseenter="selectedIndex = selectableItems.indexOf(item)"
                  class="flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200"
                  :class="
                    selectedIndex === selectableItems.indexOf(item)
                      ? 'bg-blue-600 text-white translate-x-2'
                      : 'hover:bg-gray-50 text-gray-700'
                  "
                >
                  <div
                    class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    :class="
                      selectedIndex === selectableItems.indexOf(item)
                        ? 'bg-white/20'
                        : 'bg-gray-100 text-gray-600'
                    "
                  >
                    <component :is="item.icon" class="w-5 h-5" />
                  </div>
                  <div class="flex-1">
                    <p class="font-bold text-sm">{{ item.label }}</p>
                  </div>
                  <ArrowRight
                    v-if="selectedIndex === selectableItems.indexOf(item)"
                    class="w-4 h-4 mr-2"
                  />
                </div>
              </div>
            </template>
          </div>

          <div class="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-6">
              <div class="flex items-center gap-2">
                <kbd
                  class="h-5 px-1.5 rounded bg-white border border-gray-200 text-[10px] font-bold text-gray-400"
                  >↑↓</kbd
                >
                <span class="text-[10px] font-medium text-gray-500 uppercase tracking-wider"
                  >Navegar</span
                >
              </div>
              <div class="flex items-center gap-2">
                <kbd
                  class="h-5 px-1.5 rounded bg-white border border-gray-200 text-[10px] font-bold text-gray-400"
                  >ENTER</kbd
                >
                <span class="text-[10px] font-medium text-gray-500 uppercase tracking-wider"
                  >Seleccionar</span
                >
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Command class="w-3.5 h-3.5 text-gray-400" />
              <span class="text-[10px] font-medium text-gray-400 uppercase tracking-wider"
                >Selty Command</span
              >
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>