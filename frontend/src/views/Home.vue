<template>
  <div 
    class="min-h-screen transition-all duration-300 relative overflow-hidden"
    :style="backgroundStyle"
  >
    <div v-if="settings.wallpaperType === 'image'" class="absolute inset-0 bg-black/30 z-0"></div>
    <!-- 顶部工具栏 -->
    <header class="sticky top-0 z-50 backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-b border-slate-200/30 dark:border-slate-700/30">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <h1 class="text-xl font-bold text-orange-500">☀️ SunPanel</h1>
          <button 
            v-if="isLoggedIn"
            @click="goAdmin"
            class="text-sm text-slate-500 hover:text-orange-500 transition-colors"
          >
            管理后台
          </button>
        </div>
        <div class="flex items-center gap-3">
          <!-- 搜索框 -->
          <div v-if="settings.showSearchBar" class="flex items-center gap-2">
            <select
              v-model="selectedSearchEngine"
              class="px-3 py-2 text-sm rounded-full bg-slate-100 dark:bg-slate-800 border-0 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            >
              <option value="https://www.google.com/search?q=">Google</option>
              <option value="https://www.bing.com/search?q=">Bing</option>
              <option value="https://www.baidu.com/s?wd=">百度</option>
              <option value="https://search.yahoo.com/search?p=">Yahoo</option>
            </select>
            <div class="relative">
              <input
                v-model="searchQuery"
                @keyup.enter="doSearch"
                type="text"
                placeholder="搜索..."
                class="w-48 px-4 py-2 pl-10 text-sm rounded-full bg-slate-100 dark:bg-slate-800 border-0 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              />
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <!-- 主题切换 -->
          <button 
            @click="toggleTheme"
            class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg v-if="isDark" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
            <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            </svg>
          </button>
          <!-- 登录/登出 -->
          <button 
            v-if="!isLoggedIn"
            @click="goLogin"
            class="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-full hover:bg-orange-600 transition-colors"
          >
            登录
          </button>
          <button 
            v-else
            @click="handleLogout"
            class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors"
          >
            退出
          </button>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="max-w-7xl mx-auto px-4 py-8">
      <!-- 空状态 -->
      <div v-if="!isLoading && groups.length === 0" class="flex flex-col items-center justify-center py-20">
        <div class="text-6xl mb-4">🌞</div>
        <h2 class="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">欢迎使用 SunPanel</h2>
        <p class="text-slate-500 dark:text-slate-400 mb-6">开始添加您的第一个分组和网站吧</p>
        <button 
          v-if="isLoggedIn"
          @click="goAdmin"
          class="px-6 py-3 text-white bg-orange-500 rounded-full hover:bg-orange-600 transition-colors"
        >
          前往管理后台
        </button>
        <button 
          v-else
          @click="goLogin"
          class="px-6 py-3 text-white bg-orange-500 rounded-full hover:bg-orange-600 transition-colors"
        >
          登录后开始配置
        </button>
      </div>

      <!-- 分组列表 -->
      <div v-else class="space-y-8">
        <div 
          v-for="group in groups" 
          :key="group.id"
          class="group-card"
        >
          <!-- 分组标题 -->
          <div v-if="settings.showGroupNames" class="mb-4 flex items-center gap-2">
            <Icon 
              v-if="group.icon" 
              :icon="group.icon" 
              class="w-6 h-6 text-orange-500"
            />
            <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-200">
              {{ group.name }}
            </h2>
          </div>

          <!-- 分组内的项目 -->
          <div class="grid gap-3" :style="{ gridTemplateColumns: `repeat(${currentItemsPerRow}, minmax(0, 1fr))` }">
            <a
              v-for="item in getGroupItems(group.id)"
              :key="item.id"
              :href="item.url"
              :target="item.openInNewTab ? '_blank' : '_self'"
              @click.prevent="openItem(item)"
              class="item-card flex items-start gap-3 p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
            >
              <div 
                class="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl flex-shrink-0"
                :style="{ backgroundColor: item.color || getItemColor(item.name) }"
              >
                <Icon 
                  v-if="item.icon" 
                  :icon="item.icon" 
                  class="w-6 h-6 text-white"
                />
                <span v-else class="text-lg font-bold text-white">{{ getDefaultIcon(item.name) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap truncate">
                  {{ item.name }}
                </div>
                <div class="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap truncate">
                  {{ getDomain(item.url) }}
                </div>
                <div v-if="item.description" class="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap truncate mt-0.5">
                  {{ item.description }}
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </main>

    <!-- 小窗口模式 -->
    <div 
      v-if="activeWindow"
      class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="closeWindow"
    >
      <div 
        class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
        :style="{ width: `${activeWindow.windowWidth || 800}px`, height: `${activeWindow.windowHeight || 600}px` }"
      >
        <div class="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <span class="font-medium text-slate-700 dark:text-slate-300">{{ activeWindow.name }}</span>
          <button @click="closeWindow" class="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <iframe :src="activeWindow.url" class="w-full h-[calc(100%-52px)] border-0" />
      </div>
    </div>

    <!-- 自定义样式 -->
    <style v-if="settings.customCSS" v-html="settings.customCSS" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { useDataStore } from '@/stores/data'
import type { Item } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const dataStore = useDataStore()

const searchQuery = ref('')
const activeWindow = ref<Item | null>(null)
const selectedSearchEngine = ref('https://www.bing.com/search?q=')

const isLoggedIn = computed(() => !!authStore.token)
const isDark = computed(() => settingsStore.theme === 'dark')
const settings = computed(() => settingsStore.settings)
const groups = computed(() => dataStore.groups)
const items = computed(() => dataStore.items)
const isLoading = computed(() => dataStore.isLoading)

const currentItemsPerRow = computed(() => {
  if (typeof window === 'undefined') return settings.value.desktopItemsPerRow
  
  const width = window.innerWidth
  if (width < 640) return settings.value.mobileItemsPerRow || 2
  if (width < 1024) return settings.value.tabletItemsPerRow || 3
  return settings.value.desktopItemsPerRow || 6
})

const backgroundStyle = computed(() => {
  if (settings.value.wallpaperType === 'color') {
    return { backgroundColor: settings.value.wallpaper }
  }
  if (!settings.value.wallpaper) {
    return { backgroundColor: '#1e293b' }
  }
  return { 
    backgroundImage: `url(${settings.value.wallpaper})`, 
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed'
  }
})

const getGroupItems = (groupId: string) => {
  return dataStore.getItemsByGroup(groupId)
}

const getDefaultIcon = (name: string) => {
  const icons: Record<string, string> = {
    'G': '🔍', 'B': '🌐', 'M': '📧', 'S': '⚙️', 'W': '🌐'
  }
  return icons[name[0]?.toUpperCase()] || '📁'
}

const getDomain = (url: string): string => {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace(/^www\./i, '')
  } catch {
    return url
  }
}

const getItemColor = (name: string): string => {
  const colors: Record<string, string> = {
    'bilibili': '#FB7299',
    'Jellyfin': '#00A4DC',
    'iKuai': '#00C853',
    'Navidrome': '#4169E1',
    'ubuntu': '#E95420',
    'VSCode': '#007ACC',
    '迅镭': '#1DA1F2',
    'windows': '#0078D4',
    'WeChat': '#07C160',
    'QQ': '#12B7F5',
    'OpenWRT': '#4DB6AC',
    'Blog': '#FF9800',
    'Portainer': '#13A8E2',
    'JD': '#D0021B',
    'Postgresql': '#4169E1',
    'Sun-Panel': '#00B894',
    'Nextcloud': '#0082C9',
    'Nginx': '#269539',
    'Docker': '#2496ED',
    'HomeAssistant': '#049DBF',
  }
  
  const normalizedName = name.toLowerCase().trim()
  const matchedKey = Object.keys(colors).find(key => 
    key.toLowerCase() === normalizedName || 
    name.toLowerCase().includes(key.toLowerCase())
  )
  
  if (matchedKey) {
    return colors[matchedKey]
  }
  
  const colorList = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1',
    '#FF7F50', '#9370DB', '#20B2AA', '#FF69B4',
    '#32CD32', '#FFD700', '#FF6347', '#87CEEB'
  ]
  
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colorList[Math.abs(hash) % colorList.length]
}

const openItem = (item: Item) => {
  if (item.showAsWindow) {
    activeWindow.value = item
  } else {
    window.open(item.url, item.openInNewTab ? '_blank' : '_self')
  }
}

const closeWindow = () => {
  activeWindow.value = null
}

const toggleTheme = () => {
  const newTheme = settings.value.theme === 'dark' ? 'light' : 'dark'
  settingsStore.updateSettings({ theme: newTheme })
}

const doSearch = () => {
  if (searchQuery.value.trim()) {
    window.open(selectedSearchEngine.value + encodeURIComponent(searchQuery.value), '_blank')
  }
}

const goLogin = () => router.push('/login')
const goAdmin = () => router.push('/admin')
const handleLogout = async () => {
  await authStore.logout()
  dataStore.groups = []
  dataStore.items = []
  settingsStore.resetSettings()
  router.push('/')
}

onMounted(async () => {
  await Promise.all([
    settingsStore.loadSettings(),
    authStore.fetchUser()
  ])
  
  if (isLoggedIn.value) {
    await dataStore.fetchAll()
  }
})
</script>

<style scoped>
.item-card {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
