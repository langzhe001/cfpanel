// 设置相关 API

import type { APIResponse, Settings } from '@/types'
import { api, clearCache, getCached, setCached } from './client'

export const settingsApi = {
  get: async (forceRefresh = false) => {
    // 强制刷新时清除缓存
    if (forceRefresh) {
      clearCache('settings')
    }
    const cached = getCached<APIResponse<Settings>>('settings')
    if (cached && !forceRefresh) return cached
    const res = await api.get<APIResponse<Settings>>('/settings')
    setCached('settings', res)
    return res
  },
  
  update: (data: Partial<Settings>) => {
    clearCache('settings')
    return api.put('/settings', data)
  }
}
