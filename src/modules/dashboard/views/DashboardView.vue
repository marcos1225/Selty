<script setup lang="ts">
import { computed, onMounted } from 'vue'
import {
  CalendarCheck,
  Users,
  ChevronRight,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  BarChart3,
  Package,
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import AppLayout from '@/shared/components/layout/AppLayout.vue'
import FollowUpCard from '@/modules/dashboard/components/FollowUpCard.vue'
import { useLeadsStore } from '@/modules/leads/application/stores/useLeadsStore'
import { useStatusesStore } from '@/modules/statuses/application/stores/useStatusesStore'
import { useSectorsStore } from '@/modules/sectors/application/stores/useSectorsStore'
import { useMessageTemplatesStore } from '@/modules/templates/application/stores/useMessageTemplatesStore'
import { useActivitiesStore } from '@/modules/activities/application/stores/useActivitiesStore'
import StatsCharts from '@/modules/dashboard/components/StatsCharts.vue'
import { useDashboardStats } from '@/modules/dashboard/composables/useDashboardStats'

const router = useRouter()
const leadsStore = useLeadsStore()
const statusesStore = useStatusesStore()
const sectorsStore = useSectorsStore()
const templatesStore = useMessageTemplatesStore()
const activitiesStore = useActivitiesStore()

const { stats, activeLeadsValue, wonLeadsValue, conversionRate, totalActiveLeads, volumeTrend } =
  useDashboardStats()

function openLeadDetail(leadId: string) {
  leadsStore.selectedLeadId = leadId
  leadsStore.isDrawerOpen = true
}

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 20) return 'Buenas tardes'
  return 'Buenas noches'
})

const userName = ref('Marco')

onMounted(async () => {
  if (!leadsStore.leads.length) await leadsStore.fetchLeads()
  if (!statusesStore.statuses.length) await statusesStore.fetchStatuses()
  if (!sectorsStore.sectors.length) sectorsStore.fetchSectors()
  if (!templatesStore.templates.length) await templatesStore.fetchTemplates()
  await activitiesStore.fetchAll()
})

const wonLeadsCount = computed(() => {
  const wonStatus = statusesStore.statuses.find(
    (s) => s.name.toLowerCase().includes('ganado') || s.name.toLowerCase().includes('cerrado'),
  )
  return leadsStore.leads.filter((l) => l.status_id === wonStatus?.id).length
})

const dashboardStats = computed(() => stats.value)

import { ref } from 'vue'
</script>

<template>
  <AppLayout>
    <div class="space-y-8 animate-in fade-in duration-700 pb-10">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold text-text-main tracking-tight">
            {{ greeting }}, {{ userName }}
          </h1>
          <p class="text-text-muted mt-2 max-w-md">
            Aquí tienes un resumen de tu actividad comercial y el progreso de tus leads.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <div
            class="bg-white border border-gray-100 rounded-2xl px-4 py-2.5 flex items-center gap-2 shadow-soft"
          >
            <CalendarCheck class="w-4 h-4 text-primary" />
            <span class="text-sm font-medium text-text-main">Este Mes</span>
            <ChevronRight class="w-4 h-4 text-gray-400 rotate-90" />
          </div>

          <button
            class="bg-secondary text-white px-6 py-3 rounded-xl font-bold text-sm hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-secondary/10"
          >
            <Download class="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      <div class="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div
          v-for="stat in dashboardStats"
          :key="stat.label"
          class="bg-white p-4 sm:p-6 rounded-dashboard shadow-dashboard border border-gray-50 flex flex-col gap-4 group hover:shadow-premium transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div
              :class="[
                stat.color,
                'w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-current/10',
              ]"
            >
              <component :is="stat.icon" class="w-5 h-5" />
            </div>
            <div class="flex items-center gap-1">
              <component
                :is="stat.isUp ? ArrowUpRight : ArrowDownRight"
                :class="['w-3.5 h-3.5', stat.isUp ? 'text-success' : 'text-error']"
              />
              <span :class="['text-xs font-bold', stat.isUp ? 'text-success' : 'text-error']">
                {{ stat.trend }}
              </span>
            </div>
          </div>

          <div>
            <span
              class="text-[9px] sm:text-xs font-bold text-text-muted uppercase tracking-wider"
              >{{ stat.label }}</span
            >
            <p class="text-xl sm:text-2xl font-bold text-text-main mt-0.5 sm:mt-1">
              {{ stat.value }}
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Revenue/Activity Chart (Moved to order-2 on mobile) -->
        <div
          class="order-2 lg:order-1 lg:col-span-8 bg-white p-5 sm:p-8 rounded-[32px] shadow-dashboard border border-gray-50 flex flex-col"
        >
          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0"
              >
                <BarChart3 class="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 class="text-lg sm:text-xl font-bold text-text-main leading-tight">
                  Pipeline de Ingresos
                </h2>
                <p class="text-[10px] text-text-muted font-medium">Comparativa mensual</p>
              </div>
            </div>
            <div class="flex gap-2 self-end sm:self-auto">
              <div
                class="flex items-center gap-2 px-2.5 py-1 rounded-lg border border-gray-100 text-[9px] sm:text-xs font-bold text-text-muted"
              >
                <div class="w-1.5 h-1.5 rounded-full bg-primary"></div>
                Actual
              </div>
              <div
                class="flex items-center gap-2 px-2.5 py-1 rounded-lg border border-gray-100 text-[9px] sm:text-xs font-bold text-text-muted"
              >
                <div class="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                Anterior
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-12 mb-8 sm:mb-10">
            <div class="p-3 sm:p-6 rounded-3xl bg-gray-50/50 border border-gray-100/50">
              <p
                class="text-[8px] sm:text-[10px] text-text-muted font-bold uppercase tracking-[0.2em] mb-1 sm:mb-2"
              >
                Potencial
              </p>
              <p class="text-lg sm:text-3xl font-black text-text-main">
                {{
                  new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                    maximumFractionDigits: 0,
                  }).format(activeLeadsValue)
                }}
              </p>
              <div class="flex items-center gap-1 mt-1 sm:mt-2">
                <div
                  class="flex items-center gap-0.5 bg-success/10 text-success px-1 py-0.5 rounded-md text-[8px] sm:text-[10px] font-bold"
                >
                  <ArrowUpRight class="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                  +14%
                </div>
              </div>
            </div>
            <div class="p-3 sm:p-6 rounded-3xl bg-gray-50/50 border border-gray-100/50">
              <p
                class="text-[8px] sm:text-[10px] text-text-muted font-bold uppercase tracking-[0.2em] mb-1 sm:mb-2"
              >
                Cerradas
              </p>
              <p class="text-lg sm:text-3xl font-black text-text-main">
                {{
                  new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                    maximumFractionDigits: 0,
                  }).format(wonLeadsValue)
                }}
              </p>
              <div class="flex items-center gap-1 mt-1 sm:mt-2">
                <div
                  class="flex items-center gap-0.5 bg-success/10 text-success px-1 py-0.5 rounded-md text-[8px] sm:text-[10px] font-bold"
                >
                  <ArrowUpRight class="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                  +2.1%
                </div>
              </div>
            </div>
          </div>

          <div class="flex-1 min-h-[320px]">
            <StatsCharts />
          </div>
        </div>

        <!-- Side Cards Column (Moved to order-1 on mobile) -->
        <div class="order-1 lg:order-2 lg:col-span-4 space-y-6 sm:space-y-8">
          <div
            class="bg-primary p-6 sm:p-8 rounded-[32px] shadow-xl shadow-primary/20 text-white flex flex-col items-center relative overflow-hidden group"
          >
            <div
              class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"
            ></div>
            <div
              class="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"
            ></div>

            <!-- Hide icons on mobile to make it more compact -->
            <div class="hidden sm:flex w-full items-center justify-between mb-10 relative z-10">
              <div
                class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xl border border-white/20"
              >
                <Package class="w-6 h-6" />
              </div>
              <div
                class="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-xl border border-white/20 flex items-center gap-2"
              >
                <span class="text-[10px] font-bold uppercase tracking-widest">Global</span>
              </div>
            </div>

            <h3 class="text-xl font-bold mb-1 relative z-10 sm:mt-0 mt-2">Meta de Conversión</h3>
            <p class="text-white/60 text-[11px] sm:text-xs font-medium mb-6 sm:mb-10 relative z-10 text-center px-4">
              Progreso actual basado en leads cerrados con éxito.
            </p>

            <div class="relative w-56 h-32 mb-4 sm:mb-8 flex items-end justify-center">
              <svg
                viewBox="0 0 100 50"
                class="w-full h-full transform transition-transform duration-1000"
              >
                <path
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke="rgba(255,255,255,0.15)"
                  stroke-width="12"
                  stroke-linecap="round"
                />
                <path
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke="white"
                  stroke-width="12"
                  stroke-linecap="round"
                  :stroke-dasharray="`${(conversionRate * 125.6) / 100} 125.6`"
                />
              </svg>
              <div class="absolute bottom-0 text-center translate-y-2">
                <p class="text-4xl font-black">{{ conversionRate }}%</p>
                <div
                  class="flex items-center justify-center gap-1.5 mt-1 bg-white/20 px-2 py-0.5 rounded-lg border border-white/10"
                >
                  <TrendingUp class="w-3 h-3" />
                  <span class="text-[9px] font-black uppercase tracking-tighter">On Track</span>
                </div>
              </div>
            </div>

            <div class="w-full h-px bg-white/10 my-4"></div>
            <div class="w-full flex justify-between px-2">
              <div class="text-center">
                <p class="text-[10px] text-white/50 uppercase font-bold tracking-widest">
                  Total Leads
                </p>
                <p class="text-lg font-bold">{{ leadsStore.leads.length }}</p>
              </div>
              <div class="text-center">
                <p class="text-[10px] text-white/50 uppercase font-bold tracking-widest">Ganados</p>
                <p class="text-lg font-bold text-success-light">{{ wonLeadsCount }}</p>
              </div>
            </div>
          </div>

          <div
            class="bg-white p-8 rounded-[32px] shadow-dashboard border border-gray-50 relative overflow-hidden group"
          >
            <div class="flex items-center justify-between mb-10">
              <div class="flex items-center gap-3">
                <div
                  class="w-12 h-12 rounded-2xl bg-secondary/5 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all duration-500"
                >
                  <Users class="w-6 h-6" />
                </div>
                <div>
                  <h3 class="text-lg font-bold text-text-main">Metas de Volumen</h3>
                  <p class="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                    Métricas de Crecimiento
                  </p>
                </div>
              </div>
              <div
                :class="[
                  volumeTrend >= 0 ? 'bg-success/10 text-success' : 'bg-error/10 text-error',
                  'px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-black text-[10px] uppercase tracking-wider',
                ]"
              >
                <component
                  :is="volumeTrend >= 0 ? ArrowUpRight : ArrowDownRight"
                  class="w-3.5 h-3.5"
                />
                {{ Math.abs(volumeTrend) }}%
              </div>
            </div>

            <div class="space-y-12">
              <div class="relative">
                <div class="flex justify-between items-end mb-4">
                  <div class="space-y-1">
                    <p class="text-sm font-black text-text-main flex items-center gap-2">
                      Captación de Leads
                      <span
                        class="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] font-black uppercase"
                        >Q2 Goal</span
                      >
                    </p>
                    <p class="text-[10px] text-text-muted font-medium">Objetivo: 50 leads nuevos</p>
                  </div>
                  <div class="text-right">
                    <span class="text-2xl font-black text-primary">{{
                      Math.min(leadsStore.leads.length, 50)
                    }}</span>
                    <span class="text-xs font-bold text-text-muted">/50</span>
                  </div>
                </div>
                <div
                  class="relative h-4 bg-gray-100 rounded-full border border-gray-200/50 p-1 overflow-hidden"
                >
                  <div
                    class="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                  ></div>
                  <div
                    class="h-full bg-linear-to-r from-primary via-primary to-[#4D8FFF] rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(0,97,255,0.3)] relative"
                    :style="{ width: `${Math.min((leadsStore.leads.length / 50) * 100, 100)}%` }"
                  >
                    <div
                      class="absolute right-0 top-0 bottom-0 w-2 bg-white/40 blur-[2px] rounded-full"
                    ></div>
                  </div>
                </div>
              </div>

              <div class="relative">
                <div class="flex justify-between items-end mb-4">
                  <div class="space-y-1">
                    <p class="text-sm font-black text-text-main flex items-center gap-2">
                      Cierre de Ventas
                      <span
                        class="px-2 py-0.5 rounded-md bg-secondary/10 text-secondary text-[9px] font-black uppercase"
                        >Monthly</span
                      >
                    </p>
                    <p class="text-[10px] text-text-muted font-medium">Objetivo: 10 ventas</p>
                  </div>
                  <div class="text-right">
                    <span class="text-2xl font-black text-secondary">{{
                      Math.min(wonLeadsCount, 10)
                    }}</span>
                    <span class="text-xs font-bold text-text-muted">/10</span>
                  </div>
                </div>
                <div
                  class="relative h-4 bg-gray-100 rounded-full border border-gray-200/50 p-1 overflow-hidden"
                >
                  <div
                    class="h-full bg-linear-to-r from-secondary via-secondary to-[#2E3A59] rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(15,23,42,0.2)] relative"
                    :style="{ width: `${Math.min((wonLeadsCount / 10) * 100, 100)}%` }"
                  >
                    <div
                      class="absolute right-0 top-0 bottom-0 w-2 bg-white/30 blur-[2px] rounded-full"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <button
              class="w-full mt-12 py-4 rounded-2xl bg-gray-50 text-text-muted text-xs font-bold hover:bg-secondary hover:text-white transition-all duration-300 uppercase tracking-widest border border-gray-100 group-hover:border-transparent shadow-sm"
            >
              Ver reporte detallado
            </button>
          </div>
        </div>
      </div>

      <div class="pt-4">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-text-main">Seguimientos Pendientes</h2>
          <button
            @click="router.push('/leads')"
            class="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
          >
            Ver Todos <ChevronRight class="w-4 h-4" />
          </button>
        </div>

        <div
          v-if="leadsStore.todayFollowUps.length === 0"
          class="bg-white p-12 rounded-dashboard border border-gray-50 text-center shadow-dashboard"
        >
          <CalendarCheck class="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p class="text-text-muted font-medium">¡Todo al día! No hay seguimientos para hoy.</p>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FollowUpCard
            v-for="lead in leadsStore.todayFollowUps.slice(0, 4)"
            :key="lead.id"
            :lead="lead"
          />
        </div>
      </div>
    </div>
  </AppLayout>
</template>
