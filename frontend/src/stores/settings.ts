import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Settings } from '@/types'
import { settingsApi } from '@/api'
import { eventBus, EVENTS } from '@/composables/useEventBus'

const defaultSettings: Settings = {
  theme: 'light',
  language: 'zh-CN',
  wallpaper: '#1e293b',
  wallpaperType: 'color',
  showSearchBar: true,
  searchEngine: 'https://www.bing.com/search?q=',
  itemsPerRow: 6,
  mobileItemsPerRow: 2,
  tabletItemsPerRow: 3,
  desktopItemsPerRow: 6,
  showGroupNames: true,
  customCSS: '',
  customJS: ''
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings>({ ...defaultSettings })
  const isLoaded = ref(false)

  const loadSettings = async (forceApi = false) => {
    const isAuthenticated = () => {
      if (typeof window === 'undefined') return false
      const cookies = document.cookie.split('; ')
      return cookies.some(c => c.startsWith('session_token='))
    }

    if (!isAuthenticated() && !forceApi) {
      const saved = localStorage.getItem('settings')
      if (saved) {
        settings.value = { ...defaultSettings, ...JSON.parse(saved) }
      }
      isLoaded.value = true
      return
    }

    try {
      const res = await settingsApi.get()
      settings.value = { ...defaultSettings, ...res.data }
      localStorage.setItem('settings', JSON.stringify(settings.value))
    } catch (err: any) {
      console.warn('加载设置失败，使用本地缓存:', err.message)
      const saved = localStorage.getItem('settings')
      if (saved) {
        settings.value = { ...defaultSettings, ...JSON.parse(saved) }
      }
    }
    isLoaded.value = true
  }

  const saveSettings = async () => {
    localStorage.setItem('settings', JSON.stringify(settings.value))
    try {
      await settingsApi.update(settings.value)
    } catch {
      // ignore
    }
  }

  const updateSettings = async (newSettings: Partial<Settings>) => {
    settings.value = { ...settings.value, ...newSettings }
    await saveSettings()
    // 触发事件通知其他组件
    eventBus.emit(EVENTS.SETTINGS_CHANGED, settings.value)
  }

  const resetSettings = () => {
    settings.value = { ...defaultSettings }
    saveSettings()
  }

  watch(() => settings.value.theme, (theme) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, { immediate: true })

  return {
    settings,
    isLoaded,
    loadSettings,
    saveSettings,
    updateSettings,
    resetSettings
  }
})
