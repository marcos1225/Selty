<script setup lang="ts">
import { useRoute } from 'vue-router'
import {
  LayoutDashboard,
  UserSquare2,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Archive,
  Tag,
  Info,
} from 'lucide-vue-next'
import { useSidebar } from '@/shared/composables/useSidebar'

const { isOpen, toggle } = useSidebar()
const route = useRoute()

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
  { label: 'Leads', icon: UserSquare2, to: '/leads' },
  { label: 'Historial', icon: Archive, to: '/historial' },
  { label: 'Plantillas', icon: MessageSquare, to: '/templates' },
]

const settingsItems = [{ label: 'Sectores', icon: Tag, to: '/settings/sectors' }]

function isActive(to: string): boolean {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}
</script>

<template>
  <aside
    :class="[
      'bg-white/80 backdrop-blur-xl border border-gray-200/50 flex-col fixed left-4 top-4 bottom-4 overflow-hidden transition-all duration-500 z-30 rounded-4xl shadow-[0_8px_40px_rgba(0,0,0,0.04)]',
      'hidden md:flex',
      isOpen ? 'w-64' : 'w-20',
    ]"
  >
    <div
      class="h-24 flex items-center px-6 shrink-0 relative"
      :class="isOpen ? 'justify-between' : 'justify-center'"
    >
      <div v-if="isOpen" class="flex items-center gap-3 animate-in fade-in duration-500">
        <div class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0">
          <img src="/SeltyLogo.webp" alt="Logo" class="w-14 h-14 object-contain" />
        </div>
        <div>
          <p class="text-lg font-bold text-gray-900 leading-tight tracking-tight">Selty</p>
          <p class="text-[10px] font-medium text-blue-600 uppercase tracking-widest">CRM App</p>
        </div>
      </div>

      <button
        @click="toggle"
        class="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300 shrink-0"
        :class="!isOpen ? 'mt-2' : ''"
      >
        <PanelLeftClose v-if="isOpen" class="w-5 h-5" />
        <PanelLeftOpen v-else class="w-5 h-5" />
      </button>
    </div>

    <nav class="flex-1 px-4 space-y-2 mt-4">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden"
        :class="[
          isOpen ? 'gap-4' : 'justify-center',
          isActive(item.to)
            ? 'bg-primary text-white shadow-md shadow-primary/20'
            : 'text-text-muted hover:bg-gray-50 hover:text-text-main',
        ]"
      >
        <component
          :is="item.icon"
          class="w-5 h-5 shrink-0 transition-transform group-hover:scale-110"
        />
        <span
          v-if="isOpen"
          class="font-semibold text-sm animate-in slide-in-from-left-2 duration-300"
          >{{ item.label }}</span
        >

        <div
          v-if="!isOpen && isActive(item.to)"
          class="absolute right-1 w-1 h-1 bg-white rounded-full"
        ></div>
      </RouterLink>

      <div class="mx-2 my-6 border-t border-gray-100/80" />

      <div v-if="isOpen" class="px-4 pb-2 animate-in fade-in duration-700">
        <p class="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Configuración</p>
      </div>

      <RouterLink
        v-for="item in settingsItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center px-4 py-3 rounded-2xl transition-all duration-300 group"
        :class="[
          isOpen ? 'gap-4' : 'justify-center',
          isActive(item.to)
            ? 'bg-primary text-white shadow-md shadow-primary/20'
            : 'text-text-muted hover:bg-gray-50 hover:text-text-main',
        ]"
      >
        <component
          :is="item.icon"
          class="w-5 h-5 shrink-0 transition-transform group-hover:scale-110"
        />
        <span
          v-if="isOpen"
          class="font-semibold text-sm animate-in slide-in-from-left-2 duration-300"
          >{{ item.label }}</span
        >
      </RouterLink>
    </nav>

    <div v-if="isOpen" class="p-6 mt-auto border-t border-gray-100/50">
      <div class="bg-gray-50 rounded-2xl p-3 flex items-center gap-3">
        <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
          <Info class="w-5 h-5 shrink-0 text-gray-500" />
        </div>
        <div class="overflow-hidden">
          <p class="text-xs font-bold text-gray-900 truncate">Soporte Activo</p>
          <p class="text-[10px] text-gray-500 truncate">V 1.0.4</p>
        </div>
      </div>
    </div>
  </aside>
</template>
