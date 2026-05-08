<template>
  <div class="min-h-screen flex bg-slate-50 dark:bg-slate-900">
    <!-- 侧边栏 -->
    <aside 
      class="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transform transition-transform duration-300 lg:translate-x-0"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Logo -->
      <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-2 text-xl font-bold text-orange-500">
          <span>☀️</span>
          <span>SunPanel</span>
        </router-link>
        <button 
          @click="sidebarOpen = false"
          class="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <Icon icon="ph:x-bold" class="w-5 h-5" />
        </button>
      </div>

      <!-- 导航菜单 -->
      <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        <div class="mb-4">
          <p class="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">用户</p>
          <router-link
            v-for="item in userMenuItems"
            :key="item.path"
            :to="item.path"
            class="menu-item"
            :class="{ active: isActive(item.path) }"
            @click="sidebarOpen = false"
          >
            <Icon :icon="item.icon" class="w-5 h-5" />
            <span>{{ item.label }}</span>
          </router-link>
        </div>

        <div class="mb-4">
          <p class="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">管理</p>
          <router-link
            v-for="item in adminMenuItems"
            :key="item.path"
            :to="item.path"
            class="menu-item"
            :class="{ active: isActive(item.path) }"
            @click="sidebarOpen = false"
          >
            <Icon :icon="item.icon" class="w-5 h-5" />
            <span>{{ item.label }}</span>
          </router-link>
        </div>
      </nav>

      <!-- 底部 -->
      <div class="p-4 border-t border-slate-200 dark:border-slate-700">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-medium">
            {{ userInitial }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
              {{ authStore.user?.nickname || authStore.user?.username }}
            </p>
            <p class="text-xs text-slate-500">{{ authStore.user?.role === 'admin' ? '管理员' : '用户' }}</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- 移动端遮罩层 -->
    <div 
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="sidebarOpen = false"
    ></div>

    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col min-w-0 lg:ml-64">
      <!-- 顶部栏 -->
      <header class="h-14 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 lg:px-6">
        <div class="flex items-center gap-4">
          <button 
            @click="sidebarOpen = true"
            class="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <Icon icon="ph:menu-bold" class="w-5 h-5" />
          </button>
          <h1 class="text-lg font-semibold text-slate-800 dark:text-slate-200">
            {{ currentPageTitle }}
          </h1>
        </div>
        <div class="flex items-center gap-4">
          <a href="/" target="_blank" class="hidden sm:block text-sm text-slate-500 hover:text-orange-500">
            查看前台 →
          </a>
          <button
            @click="toggleTheme"
            class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <Icon v-if="isDark" icon="ph:sun-bold" class="w-5 h-5" />
            <Icon v-else icon="ph:moon-bold" class="w-5 h-5" />
          </button>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="flex-1 p-4 lg:p-6 overflow-y-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const sidebarOpen = ref(false)
const isDark = computed(() => settingsStore.settings.theme === 'dark')

const userMenuItems = [
  { path: '/admin/dashboard', label: '仪表盘', icon: 'ph:chart-pie-bold' },
  { path: '/admin/profile', label: '个人信息', icon: 'ph:user-bold' },
  { path: '/admin/personalization', label: '个性化设置', icon: 'ph:paint-brush-bold' },
]

const adminMenuItems = [
  { path: '/admin/groups', label: '分组管理', icon: 'ph:folder-bold' },
  { path: '/admin/gallery', label: '图库', icon: 'ph:image-bold' },
  { path: '/admin/export-import', label: '导出/导入', icon: 'ph:export-bold' },
  { path: '/admin/api', label: 'API / Open API', icon: 'ph:code-bold' },
  { path: '/admin/accounts', label: '账号管理', icon: 'ph:users-bold' },
  { path: '/admin/public-gallery', label: '公共图库', icon: 'ph:images-bold' },
  { path: '/admin/global-settings', label: '全局设置', icon: 'ph:gear-bold' },
  { path: '/admin/migration', label: '迁移', icon: 'ph:git-merge-bold' },
  { path: '/admin/about', label: '关于', icon: 'ph:info-bold' },
]

const currentPageTitle = computed(() => {
  const allItems = [...userMenuItems, ...adminMenuItems]
  const current = allItems.find(item => isActive(item.path))
  return current?.label || 'SunPanel'
})

const userInitial = computed(() => {
  const name = authStore.user?.nickname || authStore.user?.username || 'U'
  return name.charAt(0).toUpperCase()
})

const isActive = (path: string) => {
  return route.path === path
}

const toggleTheme = () => {
  const newTheme = settingsStore.settings.theme === 'dark' ? 'light' : 'dark'
  settingsStore.updateSettings({ theme: newTheme })
}
</script>

<style scoped>
.menu-item {
  @apply flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200 transition-colors;
}

.menu-item.active {
  @apply bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400;
}
</style>
