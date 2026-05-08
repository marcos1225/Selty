<script setup lang="ts">
import { useRoute } from 'vue-router'
import { LayoutDashboard, UserSquare2, MessageSquare, Archive, Building2 } from 'lucide-vue-next'

const route = useRoute()

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
  { label: 'Leads', icon: UserSquare2, to: '/leads' },
  { label: 'Historial', icon: Archive, to: '/historial' },
  { label: 'Plantillas', icon: MessageSquare, to: '/templates' },
  { label: 'Sectores', icon: Building2, to: '/settings/sectors' },
]

function isActive(to: string): boolean {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}
</script>

<template>
  <nav class="fixed bottom-6 left-4 right-4 h-16 bg-white/80 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl flex items-center justify-around z-40 md:hidden overflow-hidden px-2">
    <RouterLink
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      class="flex flex-col items-center justify-center gap-1.5 py-1 px-1.5 transition-all duration-300 relative group min-w-0"
      :class="isActive(item.to) ? 'text-primary scale-110' : 'text-gray-400 hover:text-gray-600'"
    >
      <div v-if="isActive(item.to)" class="absolute -top-1 w-8 h-1 bg-primary rounded-full animate-in fade-in zoom-in duration-300"></div>
      <component :is="item.icon" class="w-5 h-5" />
      <span class="text-[9px] font-bold uppercase tracking-wider">{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>
