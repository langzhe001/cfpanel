// 全局设置相关 API

import type { APIResponse, GlobalSettings } from '@/types'
import { api, clearCache, getCached, setCached } from './client'

const CACHE_KEY = 'global_settings'

export const globalSettingsApi = {
  get: async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = getCached<APIResponse<GlobalSettings>>(CACHE_KEY)
      if (cached) {
        console.log('[globalSettingsApi] 从缓存获取')
        return cached
      }
    }
    
    console.log('[globalSettingsApi] 从 API 获取')
    const res = await api.get<APIResponse<GlobalSettings>>('/global-settings')
    setCached(CACHE_KEY, res)
    return res
  },
  
  getAll: async () => {
    console.log('[globalSettingsApi] 获取所有全局设置')
    const res = await api.get<APIResponse<GlobalSettings[]>>('/global-settings/all')
    return res
  },
  
  update: (data: Partial<GlobalSettings>) => {
    console.log('[globalSettingsApi] 更新设置')
    clearCache(CACHE_KEY)
    const cacheKeys = Array.from(cache.keys()).filter(k => k.startsWith('global_settings'))
    cacheKeys.forEach(k => clearCache(k))
    
    return api.put('/global-settings', data)
  },
  
  clearAllCache: () => {
    console.log('[globalSettingsApi] 清除所有全局设置缓存')
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key && key.startsWith('global_settings')) {
        clearCache(key)
      }
    }
    const cacheKeys = Array.from(cache.keys()).filter(k => k.startsWith('global_settings'))
    cacheKeys.forEach(k => clearCache(k))
  }
}

import { cache } from './client'
