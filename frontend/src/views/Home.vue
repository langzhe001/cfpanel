<template>
  <div 
    class="min-h-screen transition-all duration-300 relative overflow-hidden"
    :style="backgroundStyle"
  >
    <div v-if="settings.wallpaperType === 'image'" class="absolute inset-0 bg-black/30 z-0"></div>
    
    <div class="fixed top-4 right-4 z-50">
      <div class="flex items-center gap-2 px-3 py-2 rounded-2xl backdrop-blur-xl bg-white/30 dark:bg-slate-900/40 border border-white/20 dark:border-slate-700/30">
        <button 
          v-if="isLoggedIn"
          @click="openAdminModal"
          class="p-2 rounded-full hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all hover:scale-110"
          title="管理后台"
        >
          <svg class="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </button>
        <button 
          @click="toggleTheme"
          class="p-2 rounded-full hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all hover:scale-110"
          :title="isDark ? '切换到浅色模式' : '切换到深色模式'"
        >
          <svg v-if="isDark" class="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
          <svg v-else class="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>
        </button>
        <button 
          v-if="isLoggedIn"
          @click="handleLogout"
          class="p-2 rounded-full hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all hover:scale-110"
          title="退出登录"
        >
          <svg class="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
        </button>
      </div>
    </div>

    <main class="max-w-7xl mx-auto px-4 py-8 relative z-10">
      <div class="flex flex-col items-center justify-center py-12 mb-8">
        <div class="flex items-center gap-4 mb-6">
          <h1 class="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">Sun-Panel</h1>
          <div class="text-right">
            <div class="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">{{ currentTime }}</div>
            <div class="text-sm text-white/80 drop-shadow">{{ currentDate }}</div>
          </div>
        </div>
        
        <div v-if="settings.showSearchBar" class="w-full max-w-2xl">
          <div class="relative">
            <div class="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <svg class="w-5 h-5 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.71 19.5c-.83-.83-2.17-.83-3.01 0l-2.38 2.38c-.39.39-1.02.39-1.41 0l-4.76-4.76c-.39-.39-.39-1.02 0-1.41l2.38-2.38c.83-.83 2.17-.83 3.01 0l3.35 3.35c.39.39 1.02.39 1.41 0l4.76 4.76c.4.38.4 1.02 0 1.41l-2.37 2.37zM12 6.5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/>
              </svg>
            </div>
            <input
              v-model="searchQuery"
              @keyup.enter="doSearch"
              type="text"
              placeholder="请输入搜索内容"
              class="w-full px-14 py-4 text-lg rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 shadow-lg"
            />
            <button 
              @click="doSearch"
              class="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
            >
              <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <ErrorMessage
        v-if="dataStore.error"
        :message="dataStore.error.message"
        type="error"
        :closable="true"
        :retry="true"
        @close="dataStore.clearError()"
        @retry="handleRetry"
      />

      <div v-if="isLoading" class="py-20">
        <LoadingSpinner text="加载中..." />
      </div>

      <div v-else-if="!isLoggedIn || groups.length === 0" class="flex flex-col items-center justify-center py-20">
        <div class="text-6xl mb-4">🌞</div>
        <h2 class="text-2xl font-bold text-white drop-shadow-lg mb-2">欢迎使用 SunPanel</h2>
        <p class="text-white/80 drop-shadow mb-6">开始添加您的第一个分组和网站吧</p>
        <button 
          v-if="isLoggedIn"
          @click="openAdminModal"
          class="px-6 py-3 text-white bg-orange-500 rounded-full hover:bg-orange-600 transition-colors shadow-lg"
        >
          前往管理后台
        </button>
        <button 
          v-else
          @click="goLogin"
          class="px-6 py-3 text-white bg-orange-500 rounded-full hover:bg-orange-600 transition-colors shadow-lg"
        >
          登录后开始配置
        </button>
      </div>

      <div v-else class="space-y-8">
        <div 
          v-for="group in groups" 
          :key="group.id"
          class="group-card"
        >
          <div v-if="settings.showGroupNames" class="mb-4 flex items-center gap-2">
            <Icon 
              v-if="group.icon" 
              :icon="group.icon" 
              class="w-6 h-6 text-orange-500"
            />
            <h2 class="text-lg font-semibold text-white drop-shadow">{{ group.name }}</h2>
          </div>

          <div class="grid gap-3" :style="{ gridTemplateColumns: `repeat(${getItemsPerRow()}, minmax(0, 1fr))` }">
            <a
              v-for="item in getGroupItems(group.id)"
              :key="item.id"
              :href="item.url"
              :target="item.openInNewTab ? '_blank' : '_self'"
              @click.prevent="openItem(item)"
              class="item-card flex items-start gap-3 p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
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

    <Modal v-model="adminModalOpen" title="SunPanel 管理后台" icon="☀️" @close="closeAdminModal">
      <div class="w-full h-full min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
        <iframe 
          :src="adminUrl" 
          class="w-full h-full border-0 bg-slate-50 dark:bg-slate-900"
          @load="onIframeLoad"
        ></iframe>
      </div>
    </Modal>

    <Modal v-model="activeWindowModalOpen" :title="activeWindow?.name || ''" @close="closeWindow">
      <div class="w-full h-full min-h-[400px] sm:min-h-[500px]">
        <iframe 
          v-if="activeWindow"
          :src="activeWindow.url" 
          class="w-full h-full border-0 bg-slate-50 dark:bg-slate-900"
        ></iframe>
      </div>
    </Modal>

    <style v-if="safeCustomCSS" v-html="safeCustomCSS" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { useDataStore } from '@/stores/data'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'
import Modal from '@/components/Modal.vue'
import { sanitizeUrl, containsXss, sanitizeCSS } from '@/utils/security'
import type { Item } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const dataStore = useDataStore()

const searchQuery = ref('')
const activeWindow = ref<Item | null>(null)
const activeWindowModalOpen = ref(false)
const selectedSearchEngine = ref('https://www.bing.com/search?q=')
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1280)
const currentTime = ref('')
const currentDate = ref('')
const adminModalOpen = ref(false)
const adminUrl = ref('')
let timeInterval: number | null = null

const updateTime = () => {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  currentTime.value = `${hours}:${minutes}:${seconds}`
  
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const month = now.getMonth() + 1
  const day = now.getDate()
  const weekday = weekdays[now.getDay()]
  currentDate.value = `${month}-${day} 星期${weekday}`
}

const openAdminModal = () => {
  adminUrl.value = '/admin'
  adminModalOpen.value = true
}

const closeAdminModal = () => {
  adminModalOpen.value = false
  adminUrl.value = ''
}

const onIframeLoad = () => {
  try {
    const iframe = document.querySelector('iframe')
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'closeAdminModal' }, '*')
    }
  } catch (e) {
    console.log('Cannot access iframe content')
  }
}

window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'closeAdminModal') {
    closeAdminModal()
  }
})

const isLoggedIn = computed(() => {
  if (authStore.user) return true
  if (authStore.isSessionValid()) return true
  return false
})
const isDark = computed(() => settingsStore.settings.theme === 'dark')
const settings = computed(() => settingsStore.settings)
const groups = computed(() => dataStore.groups)
const items = computed(() => dataStore.items)
const isLoading = computed(() => dataStore.isLoading)

const safeCustomCSS = computed(() => {
  return sanitizeCSS(settings.value.customCSS)
})

const currentItemsPerRow = computed(() => {
  if (typeof window === 'undefined') return settings.value.desktopItemsPerRow
  
  const width = windowWidth.value
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

const getItemsPerRow = () => {
  const width = windowWidth.value
  if (width < 640) return settings.value.mobileItemsPerRow || 2
  if (width < 1024) return settings.value.tabletItemsPerRow || 3
  return settings.value.desktopItemsPerRow || 6
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
  const safeUrl = sanitizeUrl(item.url)
  
  if (containsXss(safeUrl)) {
    console.warn('Potentially unsafe URL detected:', item.url)
    return
  }
  
  if (item.showAsWindow) {
    activeWindow.value = item
    activeWindowModalOpen.value = true
  } else {
    window.open(safeUrl, item.openInNewTab ? '_blank' : '_self')
  }
}

const closeWindow = () => {
  activeWindowModalOpen.value = false
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

const handleLogout = async () => {
  await authStore.logout()
  dataStore.groups = []
  dataStore.items = []
  settingsStore.resetSettings()
  router.push('/')
}

const handleRetry = () => {
  dataStore.clearError()
  if (isLoggedIn.value) {
    dataStore.refreshAll()
  }
}

const handleResize = () => {
  windowWidth.value = window.innerWidth
}

onMounted(async () => {
  await settingsStore.loadSettings()

  if (authStore.isSessionValid()) {
    await authStore.fetchUser()
    await dataStore.fetchAll()
  }

  updateTime()
  timeInterval = window.setInterval(updateTime, 1000)

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  window.removeEventListener('resize', handleResize)
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