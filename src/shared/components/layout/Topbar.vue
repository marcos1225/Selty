<script setup lang="ts">
import { ref } from 'vue'
import { Search, Bell, ChevronDown, Sparkles } from 'lucide-vue-next'
import SearchCommand from '../search/SearchCommand.vue'

const isSearchOpen = ref(false)
</script>

<template>
  <header
    class="h-20 bg-[#f8fafc]/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 border-b border-gray-100/50"
  >
    <div class="hidden md:flex items-center">
      <div class="relative group cursor-pointer" @click="isSearchOpen = true">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search class="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </div>
        <div
          class="w-96 pl-11 pr-12 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm text-gray-400 flex items-center transition-all shadow-sm hover:border-blue-400 hover:ring-4 hover:ring-blue-500/5"
        >
          Buscar leads, plantillas...
        </div>
        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <kbd
            class="hidden md:inline-flex items-center gap-1 h-6 px-2 rounded-lg bg-gray-50 border border-gray-200 text-[10px] font-medium text-gray-400"
          >
            <span class="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>
    </div>

    <div class="flex md:hidden items-center">
      <div class="w-12 h-12 rounded-xl flex items-center justify-center">
        <img src="/SeltyLogo.webp" alt="Logo" class="w-14 h-14 object-contain" />
      </div>
      <span class="text-xl font-bold text-gray-900 tracking-tight">Selty</span>
    </div>

    <div class="flex items-center gap-4 md:gap-8">
      <div
        class="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20"
      >
        <Sparkles class="w-3.5 h-3.5 text-primary" />
        <span class="text-[11px] font-bold text-primary uppercase tracking-wider">AI Ready</span>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="p-2.5 rounded-xl text-text-muted hover:text-text-main hover:bg-white hover:shadow-soft transition-all relative group"
        >
          <Bell class="w-5 h-5 transition-transform group-hover:rotate-12" />
          <span
            class="absolute top-2.5 right-2.5 w-2 h-2 bg-error border-2 border-background rounded-full"
          ></span>
        </button>
      </div>

      <div class="flex items-center">
        <div class="h-8 w-px bg-gray-100 mx-2 hidden md:block"></div>
        <button class="flex items-center gap-3 pl-2 md:pl-6 group">
          <div class="hidden flex-col items-end md:flex">
            <span
              class="text-sm font-bold text-text-main group-hover:text-primary transition-colors"
              >Marco Selty</span
            >
            <span class="text-[10px] font-medium text-text-muted uppercase tracking-widest"
              >Admin</span
            >
          </div>
          <div class="relative">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Marco"
              alt="User"
              class="w-10 h-10 rounded-2xl border-2 border-white shadow-soft object-cover group-hover:scale-105 transition-transform"
            />
            <div
              class="absolute -bottom-1 -right-1 w-4 h-4 bg-success border-2 border-white rounded-full"
            ></div>
          </div>
          <ChevronDown
            class="w-4 h-4 text-text-muted group-hover:text-text-main transition-colors hidden md:block"
          />
        </button>
      </div>
    </div>

    <SearchCommand v-model="isSearchOpen" />
  </header>
</template>
