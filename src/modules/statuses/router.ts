import type { RouteRecordRaw } from 'vue-router'

export const statusesRoutes: RouteRecordRaw[] = [
  {
    path: '/settings/statuses',
    name: 'statuses',
    component: () => import('@/modules/statuses/views/StatusesView.vue'),
    meta: { requiresAuth: true },
  },
]
