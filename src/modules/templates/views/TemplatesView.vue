<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, MessageSquare, Globe } from 'lucide-vue-next'
import AppLayout from '@/shared/components/layout/AppLayout.vue'
import TemplateDialog from '@/modules/templates/components/TemplateDialog.vue'
import TemplateCard from '@/modules/templates/components/TemplateCard.vue'
import ConfirmDeleteModal from '@/shared/components/ui/ConfirmDeleteModal.vue'
import { useMessageTemplatesStore } from '@/modules/templates/application/stores/useMessageTemplatesStore'
import { useStatusesStore } from '@/modules/statuses/application/stores/useStatusesStore'
import type { MessageTemplate } from '@/modules/templates/domain/MessageTemplate'

const templatesStore = useMessageTemplatesStore()
const statusesStore = useStatusesStore()

const selectedStatusId = ref<string | null>(null)
const dialogOpen = ref(false)
const editingTemplate = ref<MessageTemplate | undefined>(undefined)
const confirmDeleteId = ref<string | null>(null)
const templateToDeleteName = ref<string>('')

const selectedStatus = computed(
  () => statusesStore.statuses.find((s) => s.id === selectedStatusId.value) ?? null,
)

const selectedTemplates = computed(() => templatesStore.getByStatusId(selectedStatusId.value))

function selectStatus(id: string | null) {
  selectedStatusId.value = id
}

function openCreateDialog(statusId?: string | null) {
  if (statusId !== undefined) selectedStatusId.value = statusId
  editingTemplate.value = undefined
  dialogOpen.value = true
}

function openEditDialog(template: MessageTemplate) {
  editingTemplate.value = template
  dialogOpen.value = true
}

function confirmDelete(template: MessageTemplate) {
  confirmDeleteId.value = template.id
  templateToDeleteName.value = template.name
}

async function removeTemplate() {
  if (!confirmDeleteId.value) return
  await templatesStore.deleteTemplate(confirmDeleteId.value)
  confirmDeleteId.value = null
  templateToDeleteName.value = ''
}

function cancelDelete() {
  confirmDeleteId.value = null
  templateToDeleteName.value = ''
}

onMounted(async () => {
  if (!statusesStore.statuses.length) await statusesStore.fetchStatuses()
  if (!templatesStore.templates.length) await templatesStore.fetchTemplates()
  selectedStatusId.value = null
})
</script>

<template>
  <AppLayout>
    <template #default>
      <!-- ═══════════════════════════════════ DESKTOP ══════════════════════════════════ -->
      <div class="hidden md:flex flex-col h-full">
        <div class="flex items-center justify-between mb-6 shrink-0">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Plantillas</h1>
            <p class="text-sm text-gray-500 mt-0.5">
              Mensajes predefinidos por estado para agilizar el seguimiento
            </p>
          </div>
          <button
            @click="openCreateDialog()"
            class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus class="w-4 h-4" />
            Nueva plantilla
          </button>
        </div>

        <div
          v-if="templatesStore.isLoading"
          class="flex items-center justify-center py-20 text-gray-400 text-sm"
        >
          Cargando...
        </div>

        <div v-else class="flex gap-6 flex-1 overflow-hidden">
          <aside class="w-56 shrink-0 flex flex-col gap-1">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
              Biblioteca
            </p>
            <button
              @click="selectStatus(null)"
              class="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left"
              :class="
                selectedStatusId === null
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
              "
            >
              <div class="flex items-center gap-2.5">
                <Globe class="w-4 h-4 shrink-0" />
                <span>Globales / FAQ</span>
              </div>
              <span
                class="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                :class="
                  selectedStatusId === null
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-500'
                "
              >
                {{ templatesStore.globalTemplates.length }}
              </span>
            </button>

            <div class="h-4" />

            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
              Flujo de Venta
            </p>
            <button
              v-for="status in statusesStore.statuses"
              :key="status.id"
              @click="selectStatus(status.id)"
              class="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left"
              :class="
                selectedStatusId === status.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
              "
            >
              <div class="flex items-center gap-2.5">
                <span
                  class="w-2 h-2 rounded-full shrink-0"
                  :style="{
                    backgroundColor:
                      selectedStatusId === status.id ? 'rgba(255,255,255,0.7)' : status.color,
                  }"
                />
                <span>{{ status.name }}</span>
              </div>
              <span
                class="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                :class="
                  selectedStatusId === status.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-500'
                "
              >
                {{ templatesStore.getByStatusId(status.id).length }}
              </span>
            </button>
          </aside>

          <div class="flex-1 overflow-y-auto">
            <div
              v-if="selectedStatus === null && selectedStatusId !== null"
              class="flex flex-col items-center justify-center h-full text-center"
            >
              <MessageSquare class="w-10 h-10 text-gray-200 mb-3" />
              <p class="text-sm text-gray-400">Selecciona un estado para ver sus plantillas</p>
            </div>

            <template v-else>
              <div class="flex items-center gap-3 mb-5">
                <span
                  v-if="selectedStatus"
                  class="w-3 h-3 rounded-full shrink-0"
                  :style="{ backgroundColor: selectedStatus.color }"
                />
                <Globe v-else class="w-4 h-4 text-indigo-500 shrink-0" />
                <h2 class="text-base font-semibold text-gray-800">
                  {{ selectedStatus?.name ?? 'Globales / FAQ' }}
                </h2>
                <span class="text-xs text-gray-400">{{ selectedTemplates.length }} plantillas</span>
              </div>

              <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <TemplateCard
                  v-for="template in selectedTemplates"
                  :key="template.id"
                  :template="template"
                  viewMode="card"
                  @edit="openEditDialog"
                  @delete="confirmDelete"
                />

                <div
                  v-if="selectedTemplates.length === 0"
                  class="xl:col-span-2 flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-100 border-dashed text-center"
                >
                  <MessageSquare class="w-8 h-8 text-gray-200 mb-3" />
                  <p class="text-sm font-medium text-gray-500 mb-1">
                    Sin plantillas para este estado
                  </p>
                  <p class="text-xs text-gray-400 mb-4">
                    Crea una plantilla para agilizar el contacto
                  </p>
                  <button
                    @click="openCreateDialog()"
                    class="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus class="w-3.5 h-3.5" /> Añadir plantilla
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════ MOBILE ═══════════════════════════════════ -->
      <div class="md:hidden">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h1 class="text-xl font-bold text-gray-900 tracking-tight">Plantillas</h1>
            <p class="text-xs text-gray-500 mt-0.5">Mensajes predefinidos por estado</p>
          </div>
        </div>

        <div
          v-if="templatesStore.isLoading"
          class="flex items-center justify-center py-20 text-gray-400 text-sm"
        >
          Cargando...
        </div>

        <div v-else class="space-y-4">
          <div class="bg-indigo-50 rounded-xl border border-indigo-100 shadow-sm overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3.5 border-b border-indigo-100">
              <div class="flex items-center gap-2.5">
                <Globe class="w-4 h-4 text-indigo-600 shrink-0" />
                <h2 class="text-sm font-semibold text-gray-800">Globales / FAQ</h2>
                <span class="text-xs text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                  {{ templatesStore.globalTemplates.length }}
                </span>
              </div>
              <button
                @click="openCreateDialog(null)"
                class="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <Plus class="w-3.5 h-3.5" /> Añadir
              </button>
            </div>
            <div class="divide-y divide-indigo-50">
              <div
                v-if="templatesStore.globalTemplates.length === 0"
                class="px-4 py-3 text-sm text-gray-400 italic"
              >
                Sin plantillas globales
              </div>
              <TemplateCard
                v-for="template in templatesStore.globalTemplates"
                :key="template.id"
                :template="template"
                viewMode="list"
                @edit="openEditDialog"
                @delete="confirmDelete"
              />
            </div>
          </div>

          <div
            v-for="status in statusesStore.statuses"
            :key="status.id"
            class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div class="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
              <div class="flex items-center gap-2.5">
                <span
                  class="w-2.5 h-2.5 rounded-full shrink-0"
                  :style="{ backgroundColor: status.color }"
                />
                <h2 class="text-sm font-semibold text-gray-800">{{ status.name }}</h2>
                <span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {{ templatesStore.getByStatusId(status.id).length }}
                </span>
              </div>
              <button
                @click="openCreateDialog(status.id)"
                class="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Plus class="w-3.5 h-3.5" /> Añadir
              </button>
            </div>

            <div class="divide-y divide-gray-50">
              <div
                v-if="templatesStore.getByStatusId(status.id).length === 0"
                class="px-4 py-3 text-sm text-gray-400 italic"
              >
                Sin plantillas para este estado
              </div>

              <TemplateCard
                v-for="template in templatesStore.getByStatusId(status.id)"
                :key="template.id"
                :template="template"
                viewMode="list"
                @edit="openEditDialog"
                @delete="confirmDelete"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </AppLayout>

  <ConfirmDeleteModal
    :open="!!confirmDeleteId"
    title="Eliminar plantilla"
    :description="`¿Estás seguro de que deseas eliminar &quot;${templateToDeleteName}&quot;?`"
    @update:open="(v) => !v && cancelDelete()"
    @confirm="removeTemplate"
  />

  <TemplateDialog
    v-model:open="dialogOpen"
    :status-id="selectedStatusId"
    :template="editingTemplate"
  />
</template>
