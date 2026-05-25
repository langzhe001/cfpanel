// 全局设置相关 API

import type { APIResponse, GlobalSettings } from '@/types'
import { api, clearCache, getCached, setCached } from './client'

export const globalSettingsApi = {
  get: async (language: string = 'zh-CN', forceRefresh = false) => {
    const cacheKey = `global_settings_${language}`
    
    // 如果不是强制刷新，先尝试从缓存获取
    if (!forceRefresh) {
      const cached = getCached<APIResponse<GlobalSettings>>(cacheKey)
      if (cached) {
        console.log('[globalSettingsApi] 从缓存获取:', language)
        return cached
      }
    }
    
    console.log('[globalSettingsApi] 从 API 获取:', language)
    const res = await api.get<APIResponse<GlobalSettings>>('/global-settings', { params: { language } })
    setCached(cacheKey, res)
    return res
  },
  
  getAll: async () => {
    console.log('[globalSettingsApi] 获取所有语言的全局设置')
    const res = await api.get<APIResponse<GlobalSettings[]>>('/global-settings/all')
    return res
  },
  
  update: (data: Partial<GlobalSettings> & { language: string }) => {
    console.log('[globalSettingsApi] 更新设置，清除缓存:', data.language)
    // 清除该语言的缓存
    clearCache(`global_settings_${data.language}`)
    // 清除所有语言的缓存（确保完全刷新）
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key && key.startsWith('global_settings_')) {
        clearCache(key)
      }
    }
    // 清除内存缓存中的所有相关项
    const cacheKeys = Array.from(cache.keys()).filter(k => k.startsWith('global_settings_'))
    cacheKeys.forEach(k => clearCache(k))
    
    return api.put('/global-settings', data)
  },
  
  create: (data: Partial<GlobalSettings> & { language: string }) => {
    // 创建新语言时不需要清除现有缓存
    return api.post('/global-settings', data)
  },
  
  delete: (language: string) => {
    console.log('[globalSettingsApi] 删除语言设置:', language)
    // 清除该语言的缓存
    clearCache(`global_settings_${language}`)
    return api.delete('/global-settings', { params: { language } })
  },
  
  clearAllCache: () => {
    console.log('[globalSettingsApi] 清除所有全局设置缓存')
    // 清除 localStorage 中的缓存
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key && key.startsWith('global_settings_')) {
        clearCache(key)
      }
    }
    // 清除内存缓存
    const cacheKeys = Array.from(cache.keys()).filter(k => k.startsWith('global_settings_'))
    cacheKeys.forEach(k => clearCache(k))
  }
}

// 从 client 导入 cache
import { cache } from './client'
