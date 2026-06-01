import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { GlobalSettings } from '@/types'
import { globalSettingsApi } from '@/api'
import { eventBus, EVENTS, useCrossFrameSync } from '@/composables/useEventBus'

const isBrowser = typeof window !== 'undefined'
const GLOBAL_SETTINGS_KEY = 'cfpanel_global_settings'

interface CachedGlobalSettings {
  settings: GlobalSettings
  timestamp: number
}

const DEFAULT_SETTINGS: GlobalSettings = {
  websiteTitle: 'CFpanel',
  websiteDescription: '',
  pageTexts: {},
  footerText: ''
}

export const useGlobalSettingsStore = defineStore('globalSettings', () => {
  const settings = ref<GlobalSettings>({ ...DEFAULT_SETTINGS })
  const isLoaded = ref(false)
  const lastFetchTime = ref<number>(0)
  const CACHE_DURATION = 30 * 60 * 1000 // 30分钟
  const isFetching = ref(false)
  const hasFetched = ref(false)
  let pendingResolve: ((value: void) => void) | null = null

  /**
   * 清除所有全局设置相关的缓存
   */
  const clearAllCache = () => {
    if (!isBrowser) return
    try {
      localStorage.removeItem(GLOBAL_SETTINGS_KEY)
      
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (key && (key.includes('global_settings') || key.includes('cfpanel_settings'))) {
          localStorage.removeItem(key)
        }
      }
      
      hasFetched.value = false
      console.log('[globalSettingsStore] 所有缓存已清除')
    } catch (e) {
      console.warn('[globalSettingsStore] 清除缓存失败:', e)
    }
  }

  /**
   * 从localStorage加载缓存
   */
  const loadFromCache = (): boolean => {
    if (!isBrowser) return false
    try {
      const cached = localStorage.getItem(GLOBAL_SETTINGS_KEY)
      if (cached) {
        const parsed: CachedGlobalSettings = JSON.parse(cached)
        if (Date.now() - parsed.timestamp < CACHE_DURATION) {
          settings.value = parsed.settings
          console.log('[globalSettingsStore] 从缓存加载设置')
          return true
        }
      }
    } catch (e) {
      console.warn('[globalSettingsStore] 从缓存加载失败:', e)
    }
    return false
  }

  /**
   * 立即保存到localStorage（带时间戳）
   */
  const saveToCache = () => {
    if (!isBrowser) return
    try {
      const cacheData: CachedGlobalSettings = {
        settings: settings.value,
        timestamp: Date.now()
      }
      localStorage.setItem(GLOBAL_SETTINGS_KEY, JSON.stringify(cacheData))
      console.log('[globalSettingsStore] 缓存已更新')
    } catch (e) {
      console.warn('[globalSettingsStore] 保存缓存失败:', e)
    }
  }

  /**
   * 加载全局设置
   */
  const loadSettings = async (forceRefresh = false) => {
    if (!forceRefresh && loadFromCache()) {
      isLoaded.value = true
      return
    }

    if (!forceRefresh && hasFetched.value) {
      isLoaded.value = true
      return
    }

    if (isFetching.value) {
      return new Promise<void>((resolve) => {
        pendingResolve = resolve
      })
    }

    isFetching.value = true

    try {
      console.log('[globalSettingsStore] 从 API 加载设置')
      const res = await globalSettingsApi.get(forceRefresh)
      settings.value = res.data
      saveToCache()
      hasFetched.value = true
    } catch (err: any) {
      console.warn('[globalSettingsStore] 加载设置失败:', err.message)
      if (settings.value.websiteTitle === DEFAULT_SETTINGS.websiteTitle) {
        settings.value = { ...DEFAULT_SETTINGS }
      }
    } finally {
      isFetching.value = false
      isLoaded.value = true
      lastFetchTime.value = Date.now()
      
      if (pendingResolve) {
        pendingResolve()
        pendingResolve = null
      }
    }
  }

  /**
   * 更新全局设置（立即刷新缓存）
   */
  const updateSettings = async (data: Partial<GlobalSettings>) => {
    try {
      console.log('[globalSettingsStore] 更新设置:', data)

      clearAllCache()

      const res = await globalSettingsApi.update(data)

      settings.value = res.data

      saveToCache()

      eventBus.emit(EVENTS.GLOBAL_SETTINGS_CHANGED, res.data)

      const { broadcastChange } = useCrossFrameSync()
      broadcastChange(EVENTS.GLOBAL_SETTINGS_CHANGED, res.data)

      console.log('[globalSettingsStore] 设置更新成功')
      return res.data
    } catch (err: any) {
      console.error('[globalSettingsStore] 更新设置失败:', err.message)
      throw err
    }
  }

  /**
   * 获取文本
   */
  const getText = (path: string, fallback?: string): string => {
    const keys = path.split('.')
    let value: any = settings.value.pageTexts

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key]
      } else {
        return fallback || path
      }
    }

    return typeof value === 'string' ? value : (fallback || path)
  }

  // Computed properties
  const websiteTitle = computed(() => settings.value?.websiteTitle || 'CFpanel')
  const websiteDescription = computed(() => settings.value?.websiteDescription || '')
  const footerText = computed(() => settings.value?.footerText || '')
  const pageTexts = computed(() => settings.value?.pageTexts || {})

  // Watch for websiteTitle changes and update document title
  watch(websiteTitle, (newTitle) => {
    if (isBrowser && newTitle) {
      document.title = newTitle
      console.log('[globalSettingsStore] 页面标题已更新:', newTitle)
    }
  }, { immediate: true })

  return {
    settings,
    isLoaded,
    lastFetchTime,
    websiteTitle,
    websiteDescription,
    footerText,
    pageTexts,
    loadSettings,
    updateSettings,
    getText,
    clearAllCache,
    saveToCache
  }
})
