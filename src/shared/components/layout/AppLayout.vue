<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import Sidebar from './Sidebar.vue'
import Topbar from './Topbar.vue'
import BottomNav from './BottomNav.vue'
import { useLeadsStore } from '@/modules/leads/application/stores/useLeadsStore'
import { useSidebar } from '@/shared/composables/useSidebar'

const leadsStore = useLeadsStore()
const { isOpen } = useSidebar()

onMounted(() => {
  leadsStore.subscribeToLeads()
})

onUnmounted(() => {
  leadsStore.unsubscribeLeads()
})
</script>

<template>
  <div class="min-h-screen bg-[#f8fafc] font-sans flex overflow-x-hidden">
    <!-- Sidebar: desktop only (self-hides on mobile) -->
    <Sidebar />

    <div
      class="flex-1 flex flex-col min-h-screen transition-all duration-500 ease-in-out"
      :class="[isOpen ? 'md:pl-72' : 'md:pl-28']"
    >
      <Topbar />

      <main class="flex-1 p-4 md:p-8 pb-24 md:pb-8">
        <div class="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <slot />
        </div>
      </main>
    </div>

    <!-- BottomNav: mobile only -->
    <BottomNav />
  </div>
</template>
