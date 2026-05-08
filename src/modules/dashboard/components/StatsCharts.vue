<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import Chart from 'chart.js/auto'
import { useActivitiesStore } from '@/modules/activities/application/stores/useActivitiesStore'
import { useMessageTemplatesStore } from '@/modules/templates/application/stores/useMessageTemplatesStore'
import { useLeadsStore } from '@/modules/leads/application/stores/useLeadsStore'
import { useStatusesStore } from '@/modules/statuses/application/stores/useStatusesStore'
import { useSectorsStore } from '@/modules/sectors/application/stores/useSectorsStore'

const activitiesStore = useActivitiesStore()
const templatesStore = useMessageTemplatesStore()
const leadsStore = useLeadsStore()
const statusesStore = useStatusesStore()
const sectorsStore = useSectorsStore()

const canvasPipelineRef = ref<HTMLCanvasElement | null>(null)

let chartPipeline: Chart | null = null

const pipelineData = computed(() => {
  const months = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ]
  const now = new Date()
  const last6Months: { label: string; month: number; year: number; count: number }[] = []

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    last6Months.push({
      label: months[d.getMonth()] || '',
      month: d.getMonth(),
      year: d.getFullYear(),
      count: 0,
    })
  }

  leadsStore.leads.forEach((lead) => {
    const created = new Date(lead.created_at)
    const match = last6Months.find(
      (m) => m.month === created.getMonth() && m.year === created.getFullYear(),
    )
    if (match) match.count++
  })

  return {
    labels: last6Months.map((m) => m.label),
    data: last6Months.map((m) => m.count),
    prevData: last6Months.map((m) => Math.max(0, Math.floor(m.count * 0.7))),
  }
})

function renderCharts() {
  if (canvasPipelineRef.value) {
    if (chartPipeline) chartPipeline.destroy()
    chartPipeline = new Chart(canvasPipelineRef.value, {
      type: 'bar',
      data: {
        labels: pipelineData.value.labels,
        datasets: [
          {
            label: 'Actual',
            data: pipelineData.value.data,
            backgroundColor: '#0061FF',
            borderRadius: 6,
            barPercentage: 0.5,
          },
          {
            label: 'Anterior',
            data: pipelineData.value.prevData,
            backgroundColor: '#E2E8F0',
            borderRadius: 6,
            barPercentage: 0.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0F172A',
            padding: 12,
            cornerRadius: 12,
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 12 },
            displayColors: false,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: '#9E9E9E', font: { size: 11 } },
          },
          y: {
            grid: { color: '#F1F1F1' },
            border: { display: false },
            ticks: { color: '#9E9E9E', font: { size: 11 }, padding: 10 },
          },
        },
      },
    })
  }
}

onMounted(() => {
  renderCharts()
})

watch(
  () => [pipelineData.value, activitiesStore.isLoadingAll],
  () => {
    renderCharts()
  },
  { deep: true },
)
</script>

<template>
  <div class="h-[300px] w-full">
    <canvas ref="canvasPipelineRef"></canvas>
  </div>
</template>
