<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Check } from 'lucide-vue-next'
import { useMessageTemplatesStore } from '@/modules/templates/application/stores/useMessageTemplatesStore'
import type { MessageTemplate } from '@/modules/templates/domain/MessageTemplate'

const props = defineProps<{
  open: boolean
  statusId: string | null
  template?: MessageTemplate
}>()

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const templatesStore = useMessageTemplatesStore()

const isSaving = ref(false)
const form = ref({ name: '', content: '' })

const isEditMode = computed(() => !!props.template)

const PREVIEW_NAME = 'Juan'

import { computed } from 'vue'

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    form.value = {
      name: props.template?.name ?? '',
      content: props.template?.content ?? '',
    }
  },
  { immediate: true },
)

function close() {
  emit('update:open', false)
}

async function save() {
  if (!form.value.name.trim() || !form.value.content.trim()) return
  isSaving.value = true
  try {
    if (isEditMode.value && props.template) {
      await templatesStore.updateTemplate(props.template.id, form.value)
    } else {
      const order = templatesStore.getByStatusId(props.statusId).length
      await templatesStore.createTemplate({ ...form.value, status_id: props.statusId, order })
    }
    close()
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 bg-black/40 z-40" @click="close" />
    </Transition>

    <Transition name="scale-up">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="close"
      >
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 class="text-base font-semibold text-gray-900">
              {{ isEditMode ? 'Editar plantilla' : 'Nueva plantilla' }}
            </h2>
            <button
              @click="close"
              class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="px-6 py-5 space-y-4">
            <div>
              <label
                class="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5"
              >
                Nombre
              </label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Ej: Primer contacto, Seguimiento cálido..."
                class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                autofocus
              />
            </div>

            <div>
              <label
                class="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5"
              >
                Mensaje
              </label>
              <textarea
                v-model="form.content"
                rows="5"
                placeholder="Hola {{nombre}}, te contacto porque..."
                class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
              />
              <p class="mt-1.5 text-xs text-gray-400">
                Usa
                <code class="font-mono bg-gray-100 px-1 py-0.5 rounded text-blue-600">{{
                  PREVIEW_NAME
                }}</code>
                para insertar el nombre del lead automáticamente.
              </p>
            </div>
          </div>

          <div class="flex gap-3 px-6 py-4 border-t border-gray-100">
            <button
              @click="close"
              class="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="save"
              :disabled="isSaving || !form.name.trim() || !form.content.trim()"
              class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check class="w-4 h-4" />
              {{ isSaving ? 'Guardando...' : isEditMode ? 'Guardar cambios' : 'Crear plantilla' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>