import type { RouteRecordRaw } from 'vue-router'

export const leadsRoutes: RouteRecordRaw[] = [
  {
    path: '/leads',
    name: 'leads',
    component: () => import('./views/LeadsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/leads/:id',
    name: 'lead-detail',
    component: () => import('./views/LeadDetailView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/historial',
    name: 'historial',
    component: () => import('./views/HistorialView.vue'),
    meta: { requiresAuth: true },
  },
]
