<template>
  <div class="min-h-screen flex bg-slate-50 dark:bg-slate-900">
    <!-- 侧边栏 -->
    <aside 
      class="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transform transition-transform duration-300 lg:translate-x-0"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Logo -->
      <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div class="flex items-center gap-2 text-xl font-bold text-orange-500">
          <span>☀️</span>
          <span>{{ globalSettingsStore.websiteTitle }}</span>
        </div>
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
          <p class="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{{ t('admin.user') || '用户' }}</p>
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
          <p class="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{{ t('admin.management') || '管理' }}</p>
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
            <p class="text-xs text-slate-500">{{ authStore.user?.role === 'admin' ? (t('admin.admin') || '管理员') : (t('admin.user') || '用户') }}</p>
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
      <header class="h-14 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
        <div class="flex items-center gap-4">
          <button 
            @click="sidebarOpen = true"
            class="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 class="text-lg font-semibold text-slate-800 dark:text-slate-200">
            {{ currentPageTitle }}
          </h1>
        </div>
        <div class="flex items-center gap-4">
          <button
            v-if="isInModal"
            @click="confirmClose"
            class="hidden sm:flex items-center gap-2 text-sm text-slate-500 hover:text-orange-500"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {{ t('common.close') || '关闭' }}
          </button>
          <button
            @click="toggleTheme"
            class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            :title="isDark ? (t('nav.lightMode') || '切换到浅色模式') : (t('nav.darkMode') || '切换到深色模式')"
          >
            <Icon v-if="isDark" icon="ph:sun-bold" class="w-5 h-5" />
            <Icon v-else icon="ph:moon-bold" class="w-5 h-5" />
          </button>
        </div>
      </header>

      <!-- 页面内容 - 支持平滑滚动 -->
      <main class="flex-1 overflow-y-auto p-4 lg:p-6" style="scroll-behavior: smooth;">
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <!-- 关闭确认对话框 -->
    <ConfirmDialog
      v-model="showCloseConfirm"
      :title="t('common.confirm') || '确认关闭'"
      :message="t('admin.closeConfirm') || '确定要关闭管理后台吗？所有未保存的更改将丢失。'"
      :confirm-text="t('admin.confirmClose') || '确定关闭'"
      :cancel-text="t('common.cancel') || '取消'"
      type="warning"
      @confirm="executeClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { useGlobalSettingsStore } from '@/stores/globalSettings'
import { usePageTexts } from '@/composables/useI18n'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const globalSettingsStore = useGlobalSettingsStore()
const { admin: adminTexts, t } = usePageTexts()

const sidebarOpen = ref(false)
const isDark = computed(() => settingsStore.settings.theme === 'dark')
const isInModal = ref(false)
const showCloseConfirm = ref(false)

onMounted(() => {
  try {
    if (window.self !== window.top) {
      isInModal.value = true
    }
  } catch (e) {
    isInModal.value = false
  }
})

const confirmClose = () => {
  showCloseConfirm.value = true
}

const executeClose = () => {
  showCloseConfirm.value = false
  try {
    window.parent.postMessage({ type: 'closeAdminModal' }, '*')
  } catch (e) {
    console.log('Cannot access parent window')
  }
}

const adminMenuItems = computed(() => {
  const items = [
    { path: '/admin/groups', label: t('admin.groups') || '分组管理', icon: 'ph:folder-bold' },
    { path: '/admin/gallery', label: t('admin.gallery') || '图库', icon: 'ph:image-bold' },
    { path: '/admin/export-import', label: t('admin.exportImport') || '导出/导入', icon: 'ph:export-bold' },
    { path: '/admin/api', label: t('admin.openAPI') || 'API / Open API', icon: 'ph:code-bold' },
  ]

  if (authStore.user?.role === 'admin') {
    items.push({ path: '/admin/accounts', label: t('admin.users') || '账号管理', icon: 'ph:users-bold' })
    items.push({ path: '/admin/public-gallery', label: t('admin.publicGallery') || '公共图库', icon: 'ph:images-bold' })
    items.push({ path: '/admin/global-settings', label: t('admin.settings') || '全局设置', icon: 'ph:gear-bold' })
    items.push({ path: '/admin/migration', label: t('admin.dataMigration') || '迁移', icon: 'ph:git-merge-bold' })
  }

  items.push({ path: '/admin/about', label: t('admin.about') || '关于', icon: 'ph:info-bold' })

  return items
})

const userMenuItems = computed(() => {
  return [
    { path: '/admin/dashboard', label: t('admin.dashboard') || '仪表盘', icon: 'ph:chart-pie-bold' },
    { path: '/admin/profile', label: t('admin.profile') || '个人信息', icon: 'ph:user-bold' },
    { path: '/admin/personalization', label: t('admin.personalization') || '个性化设置', icon: 'ph:paint-brush-bold' },
  ]
})

const currentPageTitle = computed(() => {
  const allItems = [...userMenuItems.value, ...adminMenuItems.value]
  const current = allItems.find(item => isActive(item.path))
  return current?.label || globalSettingsStore.websiteTitle
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

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.menu-item {
  @apply flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200 transition-colors;
}

.menu-item.active {
  @apply bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>