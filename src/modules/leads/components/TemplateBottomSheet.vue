<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { X } from 'lucide-vue-next'

export interface TemplateGroup {
  key: string
  label: string
  templates: { id: string; name: string; content: string; order?: number }[]
}

const props = defineProps<{
  show: boolean
  leadName: string
  groupedTemplates: TemplateGroup[]
  copiedId: string | null
}>()

const emit = defineEmits<{
  close: []
  'use-template': [{ templateId: string; content: string }]
}>()

const activeGroup = ref<string | null>(null)

const activeGroupTemplates = computed(
  () => props.groupedTemplates.find((g) => g.key === activeGroup.value)?.templates ?? [],
)

watch(
  () => props.show,
  (val) => {
    if (val) activeGroup.value = props.groupedTemplates[0]?.key ?? null
  },
)

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.show) emit('close')
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex flex-col justify-end"
        @click.self="emit('close')"
      >
        <div class="absolute inset-0 bg-black/40" @click="emit('close')" />

        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="translate-y-full"
          enter-to-class="translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="translate-y-0"
          leave-to-class="translate-y-full"
        >
          <div
            v-if="show"
            class="relative bg-white rounded-t-2xl flex flex-col max-h-[65vh] shadow-2xl"
            @click.stop
          >
            <div class="flex justify-center pt-3 pb-1 shrink-0">
              <div class="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            <div
              class="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0"
            >
              <div>
                <p class="text-sm font-bold text-gray-900">Plantillas</p>
                <p class="text-xs text-gray-400">{{ leadName }}</p>
              </div>
              <button
                @click="emit('close')"
                class="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <div
              class="flex gap-2 px-4 py-3 overflow-x-auto shrink-0 border-b border-gray-100 scrollbar-hide"
            >
              <button
                v-for="group in groupedTemplates"
                :key="group.key"
                @click.stop="activeGroup = group.key"
                class="shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all border"
                :class="
                  activeGroup === group.key
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                "
              >
                {{ group.label }}
                <span
                  class="ml-1 text-[10px] opacity-70"
                  :class="activeGroup === group.key ? 'text-indigo-200' : 'text-gray-400'"
                  >{{ group.templates.length }}</span
                >
              </button>
            </div>

            <div class="overflow-y-auto flex-1">
              <button
                v-for="tmpl in activeGroupTemplates"
                :key="tmpl.id"
                @click.stop="emit('use-template', { templateId: tmpl.id, content: tmpl.content })"
                class="w-full text-left px-5 py-4 flex items-center justify-between border-b border-gray-50 last:border-0 hover:bg-indigo-50 active:bg-indigo-100 transition-colors group/tmpl"
              >
                <div class="flex flex-col gap-1 min-w-0 pr-3">
                  <span
                    class="text-sm font-semibold text-gray-800 group-hover/tmpl:text-indigo-600 transition-colors"
                  >
                    {{ tmpl.name }}
                  </span>
                  <span class="text-xs text-gray-400 truncate">{{ tmpl.content }}</span>
                </div>
                <span v-if="copiedId === tmpl.id" class="text-emerald-500 font-bold shrink-0"
                  >✓</span
                >
                <span
                  v-else
                  class="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full shrink-0"
                >
                  WA
                </span>
              </button>

              <div
                v-if="activeGroupTemplates.length === 0"
                class="px-5 py-8 text-center text-sm text-gray-400"
              >
                Sin plantillas en este grupo
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
