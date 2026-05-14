import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GlobalSettings } from '@/types'
import { globalSettingsApi } from '@/api'

const isBrowser = typeof window !== 'undefined'
const GLOBAL_SETTINGS_KEY = 'sunpanel_global_settings'

interface CachedGlobalSettings {
  settings: GlobalSettings
  timestamp: number
}

const DEFAULT_SETTINGS: GlobalSettings = {
  language: 'zh-CN',
  websiteTitle: 'SunPanel',
  websiteDescription: '',
  pageTexts: {},
  footerText: ''
}

export const useGlobalSettingsStore = defineStore('globalSettings', () => {
  const settings = ref<GlobalSettings>({ ...DEFAULT_SETTINGS })
  const currentLanguage = ref('zh-CN')
  const isLoaded = ref(false)
  const lastFetchTime = ref<number>(0)
  const CACHE_DURATION = 30 * 60 * 1000 // 30分钟

  /**
   * 清除所有全局设置相关的缓存
   */
  const clearAllCache = () => {
    if (!isBrowser) return
    try {
      // 清除主缓存
      localStorage.removeItem(GLOBAL_SETTINGS_KEY)
      
      // 清除所有相关的API缓存（如果有）
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (key && (key.includes('global_settings') || key.includes('sunpanel_settings'))) {
          localStorage.removeItem(key)
        }
      }
      
      console.log('[globalSettingsStore] 所有缓存已清除')
    } catch (e) {
      console.warn('[globalSettingsStore] 清除缓存失败:', e)
    }
  }

  /**
   * 清除指定语言的缓存
   */
  const clearLanguageCache = (language: string) => {
    if (!isBrowser) return
    try {
      // 清除主缓存（因为主缓存也可能是该语言）
      localStorage.removeItem(GLOBAL_SETTINGS_KEY)
      console.log(`[globalSettingsStore] ${language} 语言缓存已清除`)
    } catch (e) {
      console.warn('[globalSettingsStore] 清除语言缓存失败:', e)
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
          currentLanguage.value = parsed.settings.language
          console.log('[globalSettingsStore] 从缓存加载设置:', parsed.settings.language)
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
  const loadSettings = async (language?: string, forceRefresh = false) => {
    const targetLanguage = language || currentLanguage.value

    // 如果不是强制刷新，先尝试从缓存加载
    if (!forceRefresh && loadFromCache() && !language) {
      isLoaded.value = true
      return
    }

    try {
      console.log(`[globalSettingsStore] 从 API 加载设置: ${targetLanguage}`)
      const res = await globalSettingsApi.get(targetLanguage)
      settings.value = res.data
      currentLanguage.value = targetLanguage
      saveToCache() // 立即保存到缓存
    } catch (err: any) {
      console.warn('[globalSettingsStore] 加载设置失败:', err.message)
      if (!language && settings.value.websiteTitle === DEFAULT_SETTINGS.websiteTitle) {
        settings.value = { ...DEFAULT_SETTINGS }
      }
    } finally {
      isLoaded.value = true
      lastFetchTime.value = Date.now()
    }
  }

  /**
   * 根据用户语言加载设置
   */
  const loadSettingsByUserLanguage = async (userLanguage: string) => {
    if (!userLanguage || userLanguage === currentLanguage.value) return
    
    console.log(`[globalSettingsStore] 用户语言设置: ${userLanguage}`)
    currentLanguage.value = userLanguage
    await loadSettings(userLanguage, true) // 强制刷新
  }

  /**
   * 更新全局设置（立即刷新缓存）
   */
  const updateSettings = async (data: Partial<GlobalSettings>) => {
    try {
      console.log('[globalSettingsStore] 更新设置:', data)
      
      // 先清除当前缓存，确保获取最新数据
      clearLanguageCache(currentLanguage.value)
      
      // 调用API更新
      const res = await globalSettingsApi.update({
        ...data,
        language: currentLanguage.value
      })
      
      // 更新本地状态
      settings.value = res.data
      
      // 立即保存到缓存
      saveToCache()
      
      console.log('[globalSettingsStore] 设置更新成功')
      return res.data
    } catch (err: any) {
      console.error('[globalSettingsStore] 更新设置失败:', err.message)
      throw err
    }
  }

  /**
   * 设置语言（刷新缓存）
   */
  const setLanguage = async (language: string) => {
    if (language === currentLanguage.value) return
    
    console.log(`[globalSettingsStore] 切换语言: ${language}`)
    
    // 清除旧语言缓存
    clearLanguageCache(currentLanguage.value)
    
    currentLanguage.value = language
    await loadSettings(language, true) // 强制刷新
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
  const websiteTitle = computed(() => settings.value?.websiteTitle || 'SunPanel')
  const websiteDescription = computed(() => settings.value?.websiteDescription || '')
  const footerText = computed(() => settings.value?.footerText || '')
  const pageTexts = computed(() => settings.value?.pageTexts || {})

  return {
    settings,
    currentLanguage,
    isLoaded,
    lastFetchTime,
    websiteTitle,
    websiteDescription,
    footerText,
    pageTexts,
    loadSettings,
    loadSettingsByUserLanguage,
    updateSettings,
    setLanguage,
    getText,
    clearAllCache,
    clearLanguageCache,
    saveToCache
  }
})
