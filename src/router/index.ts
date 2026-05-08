import { createRouter, createWebHistory } from 'vue-router'
import { authRoutes } from '@/modules/auth/router'
import { dashboardRoutes } from '@/modules/dashboard/router'
import { leadsRoutes } from '@/modules/leads/router'
import { statusesRoutes } from '@/modules/statuses/router'
import { templatesRoutes } from '@/modules/templates/router'
import { sectorsRoutes } from '@/modules/sectors/router'
import { AuthRepository } from '@/modules/auth/infrastructure/repositories/AuthRepository'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...authRoutes, ...dashboardRoutes, ...leadsRoutes, ...statusesRoutes, ...templatesRoutes, ...sectorsRoutes],
})

router.beforeEach(async (to) => {
  const session = await AuthRepository.getSession()
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  if (requiresAuth && !session) {
    return '/login'
  }
  
  if (to.path === '/login' && session) {
    return '/'
  }
})

export default router
