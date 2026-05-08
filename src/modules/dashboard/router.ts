import type { RouteRecordRaw } from 'vue-router'

export const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/modules/dashboard/views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
]
