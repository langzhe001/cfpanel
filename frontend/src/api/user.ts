// 用户管理相关 API

import type { APIResponse, User } from '@/types'
import { api, clearCache, getCached, setCached, validateFileUpload } from './client'

export const userApi = {
  getProfile: async () => {
    const cached = getCached<APIResponse<User>>('user_profile')
    if (cached) return cached
    const res = await api.get<APIResponse<User>>('/users/profile')
    setCached('user_profile', res)
    return res
  },
  
  updateProfile: (data: Partial<User>) => {
    clearCache('user_profile')
    return api.put('/users/profile', data)
  },
  
  changePassword: (oldPassword: string, newPassword: string) =>
    api.post('/users/change-password', { oldPassword, newPassword }),
  
  getSettings: async (forceRefresh = false) => {
    if (forceRefresh) {
      clearCache('user_settings')
    }
    const cached = getCached<APIResponse<any>>('user_settings')
    if (cached && !forceRefresh) return cached
    const res = await api.get<APIResponse<any>>('/users/settings')
    setCached('user_settings', res)
    return res
  },
  
  updateSettings: (data: any) => {
    clearCache('user_settings')
    return api.put('/users/settings', data)
  },
  
  getList: () => api.get<APIResponse<User[]>>('/users'),
  
  create: (data: { username: string; nickname?: string; email?: string; password: string; role?: string }) =>
    api.post('/users', data),
  
  update: (id: string, data: { nickname?: string; email?: string; role?: string }) =>
    api.put(`/users/${id}`, data),
  
  delete: (id: string) => api.delete(`/users/${id}`),
  
  uploadAvatar: (file: File) => {
    const validation = validateFileUpload(file)
    if (!validation.valid) {
      return Promise.reject(new Error(validation.error))
    }
    clearCache('user_profile')
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}
