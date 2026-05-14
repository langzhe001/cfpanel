import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/admin/Dashboard.vue')
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/admin/Profile.vue')
      },
      {
        path: 'personalization',
        name: 'Personalization',
        component: () => import('@/views/admin/Personalization.vue')
      },
      {
        path: 'groups',
        name: 'Groups',
        component: () => import('@/views/admin/Groups.vue')
      },
  
      {
        path: 'gallery',
        name: 'Gallery',
        component: () => import('@/views/admin/Gallery.vue')
      },
      {
        path: 'export-import',
        name: 'ExportImport',
        component: () => import('@/views/admin/ExportImport.vue')
      },
      {
        path: 'api',
        name: 'API',
        component: () => import('@/views/admin/API.vue')
      },
      {
        path: 'accounts',
        name: 'Accounts',
        component: () => import('@/views/admin/Accounts.vue'),
        meta: { requiresAdmin: true }
      },
      {
        path: 'public-gallery',
        name: 'PublicGallery',
        component: () => import('@/views/admin/PublicGallery.vue'),
        meta: { requiresAdmin: true }
      },
      {
        path: 'global-settings',
        name: 'GlobalSettings',
        component: () => import('@/views/admin/GlobalSettings.vue'),
        meta: { requiresAdmin: true }
      },
  
      {
        path: 'migration',
        name: 'Migration',
        component: () => import('@/views/admin/Migration.vue'),
        meta: { requiresAdmin: true }
      },
      {
        path: 'about',
        name: 'About',
        component: () => import('@/views/admin/About.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const LOGIN_PATH = '/login'
const HOME_PATH = '/'

let lastNavigationTime = 0
const NAVIGATION_THROTTLE_MS = 500

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const timestamp = Date.now()
  
  const timeSinceLastNav = timestamp - lastNavigationTime
  if (timeSinceLastNav < NAVIGATION_THROTTLE_MS) {
    console.log(`[ROUTE-GUARD] ${timestamp} - 导航过于频繁，忽略本次请求 (间隔: ${timeSinceLastNav}ms)`)
    next(false)
    return
  }
  lastNavigationTime = timestamp
  
  console.log(`[ROUTE-GUARD] ${timestamp} - 开始路由守卫`, {
    from: from.path || '(首次加载)',
    to: to.path,
    requiresAuth: to.meta.requiresAuth,
    requiresAdmin: to.meta.requiresAdmin,
    isSessionValid: authStore.isSessionValid(),
    hasUser: !!authStore.user,
    isFetchingUser: authStore.isFetchingUser
  })
  
  if (to.path === LOGIN_PATH) {
    console.log(`[ROUTE-GUARD] ${timestamp} - 目标是登录页`)
    if (authStore.isSessionValid()) {
      console.log(`[ROUTE-GUARD] ${timestamp} - 会话有效，重定向到首页`)
      next(HOME_PATH)
      return
    }
    console.log(`[ROUTE-GUARD] ${timestamp} - 会话无效，允许访问登录页`)
    next()
    return
  }
  
  if (to.meta.requiresAuth && !authStore.isSessionValid()) {
    console.log(`[ROUTE-GUARD] ${timestamp} - 需要认证但会话无效，重定向到登录页`)
    next(LOGIN_PATH)
    return
  }
  
  if (to.meta.requiresAuth && !authStore.user && !authStore.isFetchingUser) {
    console.log(`[ROUTE-GUARD] ${timestamp} - 需要用户信息，开始获取...`)
    try {
      const user = await authStore.fetchUser()
      console.log(`[ROUTE-GUARD] ${timestamp} - 用户信息获取成功:`, user?.username)
    } catch (err) {
      console.error(`[ROUTE-GUARD] ${timestamp} - 用户信息获取失败:`, err)
      await authStore.logout()
      next(LOGIN_PATH)
      return
    }
  }
  
  if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    console.log(`[ROUTE-GUARD] ${timestamp} - 非管理员访问管理员页面，重定向到仪表盘`)
    next('/admin/dashboard')
    return
  }
  
  console.log(`[ROUTE-GUARD] ${timestamp} - 允许路由: ${to.path}`)
  next()
})

export default router
