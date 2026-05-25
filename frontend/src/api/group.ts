// 分组管理相关 API

import type { APIResponse, Group } from '@/types'
import { api, clearCache, getCached, setCached, retryWithExponentialBackoff } from './client'

export const groupApi = {
  getList: async () => {
    const cached = getCached<APIResponse<Group[]>>('groups')
    if (cached) return cached
    const res = await retryWithExponentialBackoff(() => api.get<APIResponse<Group[]>>('/groups'))
    setCached('groups', res)
    return res
  },
  
  create: (data: Partial<Group>) => {
    clearCache('groups')
    return api.post('/groups', data)
  },
  
  update: (id: string, data: Partial<Group>) => {
    clearCache('groups')
    return api.put(`/groups/${id}`, data)
  },
  
  delete: (id: string) => {
    clearCache('groups')
    return api.delete(`/groups/${id}`)
  },
  
  reorder: (ids: string[]) => {
    clearCache('groups')
    return api.post('/groups/reorder', { ids })
  }
}
