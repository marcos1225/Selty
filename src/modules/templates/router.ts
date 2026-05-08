import type { RouteRecordRaw } from 'vue-router'

export const templatesRoutes: RouteRecordRaw[] = [
  {
    path: '/templates',
    name: 'templates',
    component: () => import('@/modules/templates/views/TemplatesView.vue'),
    meta: { requiresAuth: true },
  },
]
