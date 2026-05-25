// 认证相关 API

import type { APIResponse, LoginRequest, LoginResponse, User } from '@/types'
import { api, clearCache } from './client'

export const authApi = {
  login: (data: LoginRequest) => api.post<APIResponse<LoginResponse>>('/auth/login', data),
  
  logout: () => {
    clearCache()
    return api.post('/auth/logout')
  },
  
  getCurrentUser: () => api.get<APIResponse<User>>('/auth/me'),
  
  register: (data: LoginRequest & { nickname: string }) => api.post('/auth/register', data)
}
