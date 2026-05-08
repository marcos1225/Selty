<script setup lang="ts">
import type { Lead } from '@/modules/leads/domain/Lead'
import SalesBrainCard from '@/modules/leads/components/SalesBrainCard.vue'

defineProps<{
  lead: Lead
}>()
</script>

<template>
  <div class="p-5 space-y-6">
    <SalesBrainCard :lead="lead" />
  </div>
</template>