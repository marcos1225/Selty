<script setup lang="ts">
import { ref, computed } from 'vue'
import { X } from 'lucide-vue-next'
import { useLeadsStore } from '@/modules/leads/application/stores/useLeadsStore'
import { useStatusesStore } from '@/modules/statuses/application/stores/useStatusesStore'
import { useSectorsStore } from '@/modules/sectors/application/stores/useSectorsStore'
import { LEAD_PRIORITY, type LeadPriority } from '@/modules/leads/domain/constants'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const leadsStore = useLeadsStore()
const statusesStore = useStatusesStore()
const sectorsStore = useSectorsStore()

const activeStatuses = computed(() => statusesStore.statuses.filter((s) => !s.is_final))
const defaultStatusId = computed(() => activeStatuses.value[0]?.id ?? '')

const LAST_SECTOR_KEY = 'selty_last_sector_id'

function getTodayString() {
  return new Date().toISOString().slice(0, 10)
}

function buildDefaultForm() {
  return {
    name: '',
    phone: '',
    email: '',
    status_id: defaultStatusId.value,
    priority: LEAD_PRIORITY.LOW as LeadPriority | '',
    sector_id: localStorage.getItem(LAST_SECTOR_KEY) ?? '',
    notes: '',
    estimated_value: '',
    contactDate: getTodayString(),
  }
}

const form = ref(buildDefaultForm())
const submitting = ref(false)
const formError = ref<string | null>(null)

function close() {
  emit('update:open', false)
  resetForm()
}

function resetForm() {
  form.value = buildDefaultForm()
  formError.value = null
}

async function submit() {
  if (!form.value.name.trim() || !form.value.status_id) {
    formError.value = 'Nombre y estado son obligatorios'
    return
  }
  submitting.value = true
  formError.value = null
  try {
    if (form.value.sector_id) {
      localStorage.setItem(LAST_SECTOR_KEY, form.value.sector_id)
    }
    await leadsStore.createLead({
      name: form.value.name.trim(),
      phone: form.value.phone.trim() || null,
      email: form.value.email.trim() || null,
      status_id: form.value.status_id,
      priority: (form.value.priority as LeadPriority) || null,
      sector_id: form.value.sector_id || null,
      notes: form.value.notes.trim() || null,
      estimated_value: form.value.estimated_value ? Number(form.value.estimated_value) : null,
      contactDate: form.value.contactDate || null,
    })
    close()
  } catch (e) {
    formError.value = (e as Error).message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="close" />

        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 class="text-base font-semibold text-gray-900">Nuevo Lead</h2>
            <button
              @click="close"
              class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <form @submit.prevent="submit" class="px-6 py-5 space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">
                Nombre <span class="text-red-400">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Ej. Juan Pérez"
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  v-model="form.phone"
                  type="tel"
                  placeholder="+34 600..."
                  class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="correo@..."
                  class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Estado <span class="text-red-400">*</span>
                </label>
                <select
                  v-model="form.status_id"
                  class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition bg-white"
                >
                  <option value="" disabled>Seleccionar</option>
                  <option v-for="s in activeStatuses" :key="s.id" :value="s.id">
                    {{ s.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-2">Prioridad</label>
                <div class="flex gap-1.5">
                  <button
                    v-for="opt in [
                      {
                        value: LEAD_PRIORITY.HIGH,
                        label: 'Alta',
                        activeClass: 'bg-red-500 border-red-500 text-white shadow-sm',
                      },
                      {
                        value: LEAD_PRIORITY.MEDIUM,
                        label: 'Media',
                        activeClass: 'bg-amber-500 border-amber-500 text-white shadow-sm',
                      },
                      {
                        value: LEAD_PRIORITY.LOW,
                        label: 'Baja',
                        activeClass: 'bg-blue-500 border-blue-500 text-white shadow-sm',
                      },
                    ]"
                    :key="opt.value"
                    type="button"
                    @click="form.priority = opt.value"
                    class="flex-1 text-xs font-bold py-1.5 rounded-lg border transition-all"
                    :class="
                      form.priority === opt.value
                        ? opt.activeClass
                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                    "
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </div>
            </div>

            <div v-if="sectorsStore.sectors.length">
              <label class="block text-xs font-medium text-gray-700 mb-1">Sector</label>
              <select
                v-model="form.sector_id"
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition bg-white"
              >
                <option value="">Sin sector</option>
                <option v-for="s in sectorsStore.sectors" :key="s.id" :value="s.id">
                  {{ s.name }}
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1"
                  >Valor estimado (€)</label
                >
                <input
                  v-model="form.estimated_value"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1"
                  >Fecha de contacto</label
                >
                <input
                  v-model="form.contactDate"
                  type="date"
                  class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition bg-white"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Notas</label>
              <textarea
                v-model="form.notes"
                rows="3"
                placeholder="Información adicional..."
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition resize-none"
              />
            </div>

            <p v-if="formError" class="text-xs text-red-500">{{ formError }}</p>

            <div class="flex gap-3 pt-1">
              <button
                type="button"
                @click="close"
                class="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {{ submitting ? 'Creando...' : 'Crear Lead' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>