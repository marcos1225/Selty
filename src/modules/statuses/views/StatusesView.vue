<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStatusesStore } from '@/modules/statuses/application/stores/useStatusesStore'
import type { Status } from '@/modules/statuses/domain/Status'

const store = useStatusesStore()

const showForm = ref(false)
const editingId = ref<string | null>(null)

const form = ref({ name: '', color: '#3b82f6', order: 0, is_final: false })

function openCreate() {
  editingId.value = null
  form.value = {
    name: '',
    color: '#3b82f6',
    order: store.statuses.length + 1,
    is_final: false,
  }
  showForm.value = true
}

function openEdit(status: Status) {
  editingId.value = status.id
  form.value = { name: status.name, color: status.color, order: status.order, is_final: status.is_final }
  showForm.value = true
}

async function save() {
  if (editingId.value) {
    await store.updateStatus(editingId.value, form.value)
  } else {
    await store.createStatus(form.value)
  }
  showForm.value = false
}

async function remove(id: string) {
  await store.deleteStatus(id)
}

onMounted(() => store.fetchStatuses())
</script>

<template>
  <div class="p-8 max-w-2xl">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Pipeline Statuses</h1>
      <button
        @click="openCreate"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        + New Status
      </button>
    </div>

    <div v-if="store.loading" class="text-gray-400 text-sm">Loading...</div>

    <div v-else class="flex flex-col gap-3">
      <div
        v-for="status in store.statuses"
        :key="status.id"
        class="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm"
      >
        <div class="flex items-center gap-3">
          <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: status.color }"></div>
          <span class="text-sm font-medium text-gray-800">{{ status.name }}</span>
          <span v-if="status.is_final" class="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Final</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-400">#{{ status.order }}</span>
          <button @click="openEdit(status)" class="text-xs text-blue-500 hover:text-blue-700">Edit</button>
          <button @click="remove(status.id)" class="text-xs text-red-400 hover:text-red-600">Delete</button>
        </div>
      </div>
    </div>

    <div v-if="showForm" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          {{ editingId ? 'Edit Status' : 'New Status' }}
        </h2>

        <div class="flex flex-col gap-4">
          <div>
            <label class="text-xs font-medium text-gray-500 mb-1 block">Name</label>
            <input
              v-model="form.name"
              type="text"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="text-xs font-medium text-gray-500 mb-1 block">Color</label>
            <div class="flex items-center gap-3">
              <input v-model="form.color" type="color" class="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
              <span class="text-sm text-gray-500">{{ form.color }}</span>
            </div>
          </div>

          <div>
            <label class="text-xs font-medium text-gray-500 mb-1 block">Order</label>
            <input
              v-model.number="form.order"
              type="number"
              min="1"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.is_final" type="checkbox" class="rounded" />
            <span class="text-sm text-gray-600">Final state (Won/Lost)</span>
          </label>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            @click="showForm = false"
            class="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="save"
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
