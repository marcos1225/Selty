<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Pencil, Trash2, Tag, X, Check } from 'lucide-vue-next'
import AppLayout from '@/shared/components/layout/AppLayout.vue'
import { useSectorsStore } from '@/modules/sectors/application/stores/useSectorsStore'
import type { Sector } from '@/modules/sectors/domain/Sector'

const store = useSectorsStore()

const showDialog = ref(false)
const editingId = ref<string | null>(null)
const submitting = ref(false)
const formError = ref<string | null>(null)
const deletingId = ref<string | null>(null)

const form = ref({ name: '', color: '#6366f1' })

const PRESET_COLORS = [
  '#6366f1', '#3b82f6', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6',
  '#f97316', '#84cc16', '#94a3b8',
]

function openCreate() {
  editingId.value = null
  form.value = { name: '', color: '#6366f1' }
  formError.value = null
  showDialog.value = true
}

function openEdit(sector: Sector) {
  editingId.value = sector.id
  form.value = { name: sector.name, color: sector.color }
  formError.value = null
  showDialog.value = true
}

function closeDialog() {
  showDialog.value = false
  formError.value = null
}

async function save() {
  if (!form.value.name.trim()) {
    formError.value = 'El nombre es obligatorio'
    return
  }
  submitting.value = true
  formError.value = null
  try {
    if (editingId.value) {
      await store.updateSector(editingId.value, { name: form.value.name.trim(), color: form.value.color })
    } else {
      await store.createSector({ name: form.value.name.trim(), color: form.value.color })
    }
    closeDialog()
  } catch (e) {
    formError.value = (e as Error).message
  } finally {
    submitting.value = false
  }
}

async function remove(id: string) {
  deletingId.value = id
  try {
    await store.deleteSector(id)
  } finally {
    deletingId.value = null
  }
}

onMounted(() => {
  if (!store.sectors.length) store.fetchSectors()
})
</script>

<template>
  <AppLayout>
    <template #default>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Sectores</h1>
          <p class="text-sm text-gray-500 mt-0.5">Clasifica tus leads por industria</p>
        </div>
        <button
          @click="openCreate"
          class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 md:px-4 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus class="w-4 h-4" />
          <span class="hidden md:inline">Nuevo Sector</span>
        </button>
      </div>

      <div v-if="store.loading" class="flex items-center justify-center py-16 text-gray-400 text-sm">
        Cargando...
      </div>

      <div
        v-else-if="store.sectors.length === 0"
        class="flex flex-col items-center justify-center py-16 gap-4"
      >
        <div class="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
          <Tag class="w-7 h-7 text-gray-400" />
        </div>
        <div class="text-center">
          <p class="text-sm font-medium text-gray-700">Sin sectores</p>
          <p class="text-xs text-gray-400 mt-0.5">Crea tu primer sector para clasificar leads</p>
        </div>
        <button
          @click="openCreate"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Crear sector
        </button>
      </div>

      <div v-else class="flex flex-col gap-2">
        <div
          v-for="sector in store.sectors"
          :key="sector.id"
          class="flex items-center gap-4 bg-white border border-gray-100 rounded-xl px-4 py-3.5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div
            class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            :style="{ backgroundColor: sector.color + '20' }"
          >
            <Tag class="w-4 h-4" :style="{ color: sector.color }" />
          </div>
          <span class="flex-1 text-sm font-medium text-gray-800">{{ sector.name }}</span>

          <div class="w-4 h-4 rounded-full shrink-0" :style="{ backgroundColor: sector.color }" />

          <div class="flex items-center gap-1 shrink-0">
            <button
              @click="openEdit(sector)"
              class="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Editar"
            >
              <Pencil class="w-4 h-4" />
            </button>
            <button
              @click="remove(sector.id)"
              :disabled="deletingId === sector.id"
              class="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
              title="Eliminar"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </template>
  </AppLayout>

  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="showDialog" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeDialog" />

        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-sm">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 class="text-base font-semibold text-gray-900">
              {{ editingId ? 'Editar sector' : 'Nuevo sector' }}
            </h2>
            <button @click="closeDialog" class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <X class="w-4 h-4" />
            </button>
          </div>

          <form @submit.prevent="save" class="px-5 py-5 space-y-5">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1.5">
                Nombre <span class="text-red-400">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Ej. Turismo, Dental, Tecnología..."
                autofocus
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-700 mb-2">Color</label>

              <div class="flex flex-wrap gap-2 mb-3">
                <button
                  v-for="color in PRESET_COLORS"
                  :key="color"
                  type="button"
                  @click="form.color = color"
                  class="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center"
                  :style="{ backgroundColor: color, borderColor: form.color === color ? '#1e40af' : 'transparent' }"
                >
                  <Check v-if="form.color === color" class="w-3.5 h-3.5 text-white" />
                </button>
              </div>

              <div class="flex items-center gap-3">
                <input
                  v-model="form.color"
                  type="color"
                  class="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white"
                />
                <span class="text-xs text-gray-500 font-mono">{{ form.color }}</span>
                <div
                  class="flex-1 h-8 rounded-lg"
                  :style="{ backgroundColor: form.color + '30', borderLeft: `3px solid ${form.color}` }"
                />
              </div>
            </div>

            <p v-if="formError" class="text-xs text-red-500">{{ formError }}</p>

            <div class="flex gap-3 pt-1">
              <button
                type="button"
                @click="closeDialog"
                class="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {{ submitting ? 'Guardando...' : editingId ? 'Guardar' : 'Crear' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>