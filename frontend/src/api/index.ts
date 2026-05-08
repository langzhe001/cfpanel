import axios from 'axios'
import type { APIResponse, LoginRequest, LoginResponse, User, Group, Item, Settings } from '@/types'

interface ErrorHandler {
  showError: (message: string) => void
  showSuccess: (message: string) => void
}

let errorHandler: ErrorHandler | null = null

export const setErrorHandler = (handler: ErrorHandler) => {
  errorHandler = handler
}

const showErrorToast = (message: string) => {
  if (errorHandler) {
    errorHandler.showError(message)
  } else if (typeof window !== 'undefined') {
    console.error(message)
  }
}

const showSuccessToast = (message: string) => {
  if (errorHandler) {
    errorHandler.showSuccess(message)
  }
}

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  const csrfToken = localStorage.getItem('csrfToken')
  if (csrfToken && config.method !== 'get') {
    config.headers['X-CSRF-Token'] = csrfToken
  }
  
  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('csrfToken')
      window.location.href = '/login'
      return Promise.reject(new Error('登录已过期，请重新登录'))
    }
    
    if (error.response?.status === 403) {
      showErrorToast(error.response?.data?.message || '权限不足')
      return Promise.reject(error)
    }
    
    if (error.response?.status >= 500) {
      showErrorToast('服务器错误，请稍后重试')
      return Promise.reject(error)
    }
    
    if (error.code === 'ECONNABORTED') {
      showErrorToast('请求超时，请检查网络连接')
      return Promise.reject(error)
    }
    
    if (!error.response) {
      showErrorToast('网络错误，请检查网络连接')
      return Promise.reject(error)
    }
    
    return Promise.reject(error)
  }
)

export const clearAuthAndRedirect = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('csrfToken')
  window.location.href = '/login'
}

export const authApi = {
  login: (data: LoginRequest) => api.post<APIResponse<LoginResponse>>('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get<APIResponse<User>>('/auth/me'),
  register: (data: LoginRequest & { nickname: string }) => api.post('/auth/register', data)
}

export const userApi = {
  getProfile: () => api.get<APIResponse<User>>('/users/profile'),
  updateProfile: (data: Partial<User>) => api.put('/users/profile', data),
  changePassword: (oldPassword: string, newPassword: string) => 
    api.post('/users/change-password', { oldPassword, newPassword }),
  getList: () => api.get<APIResponse<User[]>>('/users'),
  create: (data: { username: string; nickname?: string; email?: string; password: string; role?: string }) => 
    api.post('/users', data),
  update: (id: string, data: { nickname?: string; email?: string; role?: string }) => 
    api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`)
}

export const groupApi = {
  getList: () => api.get<APIResponse<Group[]>>('/groups'),
  create: (data: Partial<Group>) => api.post('/groups', data),
  update: (id: string, data: Partial<Group>) => api.put(`/groups/${id}`, data),
  delete: (id: string) => api.delete(`/groups/${id}`),
  reorder: (ids: string[]) => api.post('/groups/reorder', { ids })
}

export const itemApi = {
  getList: (groupId?: string) => 
    api.get<APIResponse<Item[]>>('/items', { params: { groupId } }),
  create: (data: Partial<Item>) => api.post('/items', data),
  update: (id: string, data: Partial<Item>) => api.put(`/items/${id}`, data),
  delete: (id: string) => api.delete(`/items/${id}`),
  reorder: (ids: string[]) => api.post('/items/reorder', { ids })
}

export const settingsApi = {
  get: () => api.get<APIResponse<Settings>>('/settings'),
  update: (data: Partial<Settings>) => api.put('/settings', data)
}

export const dockerApi = {
  getContainers: () => api.get('/docker/containers'),
  startContainer: (id: string) => api.post(`/docker/containers/${id}/start`),
  stopContainer: (id: string) => api.post(`/docker/containers/${id}/stop`),
  restartContainer: (id: string) => api.post(`/docker/containers/${id}/restart`)
}

export const galleryApi = {
  getImages: (type: 'public' | 'user') => api.get(`/gallery/${type}`),
  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const instance = axios.create({
      baseURL: '/api',
      withCredentials: true,
      headers: {
        'X-CSRF-Token': localStorage.getItem('csrfToken') || '',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    })
    return instance.post('/gallery/upload', formData)
  },
  deleteImage: (id: string) => api.delete(`/gallery/${id}`)
}

export const exportImportApi = {
  exportData: () => api.get('/export', { responseType: 'blob' }),
  importData: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export default api
