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

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  console.log('路由守卫:', { from: from.path, to: to.path })
  console.log('会话有效:', authStore.isSessionValid())
  console.log('用户信息:', authStore.user)
  console.log('Cookie:', document.cookie)
  
  if (to.meta.requiresAuth && !authStore.isSessionValid()) {
    console.log('会话无效，跳转到登录页')
    next('/login')
    return
  }
  
  if (to.meta.requiresAuth && !authStore.user) {
    console.log('没有用户信息，尝试获取...')
    try {
      await authStore.fetchUser()
      console.log('用户信息获取成功:', authStore.user)
    } catch {
      console.error('获取用户信息失败')
      await authStore.logout()
      next('/login')
      return
    }
  }
  
  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    next('/admin/dashboard')
    return
  }
  
  next()
})

export default router
