// 项目管理相关 API

import type { APIResponse, Item } from '@/types'
import { api, clearCache, getCached, setCached, retryWithExponentialBackoff } from './client'

export const itemApi = {
  getList: async (groupId?: string) => {
    const cacheKey = groupId ? `items_${groupId}` : 'items_all'
    const cached = getCached<APIResponse<Item[]>>(cacheKey)
    if (cached) return cached
    const res = await retryWithExponentialBackoff(() =>
      api.get<APIResponse<Item[]>>('/items', { params: { groupId } })
    )
    setCached(cacheKey, res)
    return res
  },
  
  create: (data: Partial<Item>) => {
    clearCache('items_all')
    if (data.groupId) clearCache(`items_${data.groupId}`)
    return api.post('/items', data)
  },
  
  update: (id: string, data: Partial<Item>) => {
    clearCache('items_all')
    if (data.groupId) clearCache(`items_${data.groupId}`)
    return api.put(`/items/${id}`, data)
  },
  
  delete: (id: string) => {
    clearCache('items_all')
    return api.delete(`/items/${id}`)
  },
  
  reorder: (ids: string[]) => {
    clearCache('items_all')
    return api.post('/items/reorder', { ids })
  }
}
