import type { RouteRecordRaw } from 'vue-router'

export const sectorsRoutes: RouteRecordRaw[] = [
  {
    path: '/settings/sectors',
    name: 'sectors',
    component: () => import('@/modules/sectors/views/SectorsView.vue'),
    meta: { requiresAuth: true },
  },
]
