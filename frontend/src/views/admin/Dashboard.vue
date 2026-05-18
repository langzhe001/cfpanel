<template>
  <div class="space-y-6">
    <ErrorMessage
      v-if="dataStore.error"
      :message="dataStore.error.message"
      type="error"
      :closable="true"
      :retry="true"
      @close="dataStore.clearError()"
      @retry="handleRefresh"
    />

    <div v-if="isLoading" class="py-20">
      <LoadingSpinner :text="t('common.loading') || '加载中...'" />
    </div>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-500">{{ t('dashboard.groupCount') || '分组数量' }}</p>
              <p class="text-2xl font-bold text-slate-800 dark:text-slate-200">{{ stats.groups }}</p>
            </div>
            <div class="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Icon icon="ph:folder-bold" class="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-500">{{ t('dashboard.websiteCount') || '网站数量' }}</p>
              <p class="text-2xl font-bold text-slate-800 dark:text-slate-200">{{ stats.items }}</p>
            </div>
            <div class="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Icon icon="ph:globe-bold" class="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-500">{{ t('dashboard.imageCount') || '图片数量' }}</p>
              <p class="text-2xl font-bold text-slate-800 dark:text-slate-200">
                <span v-if="isStatsLoading">
                  <svg class="w-5 h-5 inline animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                <span v-else>{{ stats.images }}</span>
              </p>
            </div>
            <div class="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Icon icon="ph:image-bold" class="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-500">{{ t('dashboard.userCount') || '用户数量' }}</p>
              <p class="text-2xl font-bold text-slate-800 dark:text-slate-200">
                <span v-if="isStatsLoading">
                  <svg class="w-5 h-5 inline animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                <span v-else>{{ stats.users }}</span>
              </p>
            </div>
            <div class="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Icon icon="ph:users-bold" class="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{{ t('dashboard.quickActions') || '快捷操作' }}</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <button 
            v-for="action in quickActions" 
            :key="action.path"
            @click="$router.push(action.path)"
            class="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="action.bgClass">
              <Icon :icon="action.icon" class="w-5 h-5" :class="action.iconClass" />
            </div>
            <span class="text-sm text-slate-600 dark:text-slate-400">{{ action.label }}</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{{ t('dashboard.recentWebsites') || '最近添加的网站' }}</h3>
          <div class="space-y-3">
            <div 
              v-for="item in recentItems" 
              :key="item.id"
              class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <div class="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Icon v-if="item.icon" :icon="item.icon" class="w-4 h-4 text-orange-500" />
                <Icon v-else icon="ph:link-bold" class="w-4 h-4 text-orange-500" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{{ item.name }}</p>
                <p class="text-xs text-slate-500 truncate">{{ getDomain(item.url) }}</p>
              </div>
            </div>
            <EmptyState
              v-if="recentItems.length === 0"
              icon="📭"
              :title="t('dashboard.noWebsites') || '暂无网站'"
              :description="t('dashboard.noWebsitesDesc') || '还没有添加任何网站'"
            />
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{{ t('dashboard.recentGroups') || '最近添加的分组' }}</h3>
          <div class="space-y-3">
            <div 
              v-for="group in recentGroups" 
              :key="group.id"
              class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Icon v-if="group.icon" :icon="group.icon" class="w-4 h-4 text-blue-500" />
                <Icon v-else icon="ph:folder-bold" class="w-4 h-4 text-blue-500" />
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ group.name }}</p>
                <p class="text-xs text-slate-500">{{ getItemsCount(group.id) }} {{ t('dashboard.websites') || '个网站' }}</p>
              </div>
            </div>
            <EmptyState
              v-if="recentGroups.length === 0"
              icon="📁"
              :title="t('dashboard.noGroups') || '暂无分组'"
              :description="t('dashboard.noGroupsDesc') || '还没有添加任何分组'"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useDataStore } from '@/stores/data'
import { useAuthStore } from '@/stores/auth'
import { usePageTexts } from '@/composables/useI18n'
import { galleryApi, userApi } from '@/api'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'
import EmptyState from '@/components/EmptyState.vue'

const dataStore = useDataStore()
const authStore = useAuthStore()
const { dashboard: dashboardTexts, t } = usePageTexts()

const isStatsLoading = ref(false)
const imageCount = ref(0)
const userCount = ref(1)

const quickActions = computed(() => [
  { path: '/admin/groups', label: t('dashboard.addGroup') || '添加分组', icon: 'ph:folder-plus-bold', bgClass: 'bg-orange-100 dark:bg-orange-900/30', iconClass: 'text-orange-500' },
  { path: '/admin/groups', label: t('dashboard.addWebsite') || '添加网站', icon: 'ph:globe-bold', bgClass: 'bg-blue-100 dark:bg-blue-900/30', iconClass: 'text-blue-500' },
  { path: '/admin/gallery', label: t('dashboard.uploadImage') || '上传图片', icon: 'ph:image-bold', bgClass: 'bg-green-100 dark:bg-green-900/30', iconClass: 'text-green-500' },
  { path: '/admin/personalization', label: t('dashboard.changeTheme') || '更换主题', icon: 'ph:paint-brush-bold', bgClass: 'bg-purple-100 dark:bg-purple-900/30', iconClass: 'text-purple-500' },
  { path: '/admin/export-import', label: t('dashboard.exportData') || '导出数据', icon: 'ph:export-bold', bgClass: 'bg-cyan-100 dark:bg-cyan-900/30', iconClass: 'text-cyan-500' },
  { path: '/admin/api', label: t('dashboard.viewApi') || '查看API', icon: 'ph:code-bold', bgClass: 'bg-pink-100 dark:bg-pink-900/30', iconClass: 'text-pink-500' },
])

const isLoading = computed(() => dataStore.isLoading)

const stats = computed(() => ({
  groups: dataStore.groups.length,
  items: dataStore.items.length,
  images: imageCount.value,
  users: userCount.value
}))

const recentItems = computed(() => {
  return [...dataStore.items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
})

const recentGroups = computed(() => {
  return [...dataStore.groups].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
})

const getItemsCount = (groupId: string) => {
  return dataStore.getItemsByGroup(groupId).length
}

const getDomain = (url: string): string => {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace(/^www\./i, '')
  } catch {
    return url
  }
}

const fetchStats = async () => {
  isStatsLoading.value = true
  try {
    const [imagesRes, usersRes] = await Promise.all([
      galleryApi.getImages('user'),
      authStore.user?.role === 'admin' ? userApi.getList() : Promise.resolve({ data: [authStore.user] })
    ])
    
    const imagesData = imagesRes.data?.data || imagesRes.data || []
    imageCount.value = imagesData.length
    
    const usersData = usersRes.data || []
    userCount.value = usersData.length
  } catch (error) {
    console.error('获取统计数据失败:', error)
  } finally {
    isStatsLoading.value = false
  }
}

const handleRefresh = () => {
  dataStore.clearError()
  dataStore.refreshAll().then(fetchStats)
}

onMounted(() => {
  dataStore.fetchAll().then(fetchStats)
})
</script>