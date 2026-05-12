import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import type { APIResponse, LoginRequest, LoginResponse, User, Group, Item, Settings } from '@/types'

// ============ 安全常量配置 ============
export const SECURITY_CONFIG = {
  // 缓存配置
  CACHE_TTL: 5 * 60 * 1000, // 5分钟
  
  // 重试配置
  MAX_RETRIES: 3,
  INITIAL_RETRY_DELAY: 1000,
  
  // 文件上传配置
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  MAX_FILENAME_LENGTH: 255,
  
  // 请求超时
  REQUEST_TIMEOUT: 15000,
  
  // 会话配置
  SESSION_KEYS: {
    TOKEN: 'token',
    CSRF_TOKEN: 'csrfToken'
  }
} as const

interface ErrorHandler {
  showError: (message: string) => void
  showSuccess: (message: string) => void
}

let errorHandler: ErrorHandler | null = null

export const setErrorHandler = (handler: ErrorHandler) => {
  errorHandler = handler
}

// ============ 安全工具函数 ============
const isBrowser = typeof window !== 'undefined'

const getSecureStorage = () => {
  try {
    // 使用 localStorage 支持跨标签页共享
    return localStorage
  } catch {
    console.error('localStorage not available')
    throw new Error('Storage unavailable')
  }
}

const secureGetItem = (key: string): string | null => {
  if (!isBrowser) return null
  try {
    return getSecureStorage().getItem(key)
  } catch {
    return null
  }
}

const secureSetItem = (key: string, value: string): void => {
  if (!isBrowser) return
  try {
    getSecureStorage().setItem(key, value)
  } catch {
    console.error('Failed to save to secure storage')
  }
}

const secureRemoveItem = (key: string): void => {
  if (!isBrowser) return
  try {
    getSecureStorage().removeItem(key)
  } catch {
    console.error('Failed to remove from secure storage')
  }
}

const showErrorToast = (message: string) => {
  if (errorHandler) {
    errorHandler.showError(message)
  } else if (isBrowser) {
    console.error(message)
  }
}

const showSuccessToast = (message: string) => {
  if (errorHandler) {
    errorHandler.showSuccess(message)
  }
}

// ============ API 客户端创建 ============
const createApiClient = (baseURL: string = '/api'): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: SECURITY_CONFIG.REQUEST_TIMEOUT,
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true
  })

  client.interceptors.request.use((config) => {
    // 从安全存储获取 token
    const token = secureGetItem(SECURITY_CONFIG.SESSION_KEYS.TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    const csrfToken = secureGetItem(SECURITY_CONFIG.SESSION_KEYS.CSRF_TOKEN)
    if (csrfToken && config.method !== 'get') {
      config.headers['X-CSRF-Token'] = csrfToken
    }
    
    return config
  })

  client.interceptors.response.use(
    (response) => response.data,
    (error) => {
      if (error.response?.status === 401) {
        clearAllAuth()
        if (isBrowser) {
          window.location.href = '/login'
        }
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

  return client
}

const api = createApiClient()

// ============ 重试机制 ============
const retryWithExponentialBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = SECURITY_CONFIG.MAX_RETRIES,
  initialDelay: number = SECURITY_CONFIG.INITIAL_RETRY_DELAY
): Promise<T> => {
  let delay = initialDelay
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      if (attempt >= maxRetries) {
        throw error
      }
      
      const shouldRetry = 
        error.code === 'ECONNABORTED' || 
        !error.response || 
        error.response.status >= 500
      
      if (!shouldRetry) {
        throw error
      }
      
      await new Promise(resolve => setTimeout(resolve, delay))
      delay *= 2
    }
  }
  
  throw new Error('Max retries exceeded')
}

// ============ 认证清理 ============
const clearAllAuth = () => {
  secureRemoveItem(SECURITY_CONFIG.SESSION_KEYS.TOKEN)
  secureRemoveItem(SECURITY_CONFIG.SESSION_KEYS.CSRF_TOKEN)
  clearCache()
}

export const clearAuthAndRedirect = () => {
  clearAllAuth()
  if (isBrowser) {
    window.location.href = '/login'
  }
}

// ============ 缓存管理 ============
interface CacheEntry<T> {
  data: T
  timestamp: number
}

const MEMORY_CACHE_KEY = '__sunpanel_cache'

const cache = new Map<string, CacheEntry<any>>()

const loadFromLocalStorage = (): void => {
  if (!isBrowser) return
  
  try {
    const stored = localStorage.getItem(MEMORY_CACHE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, CacheEntry<any>>
      const now = Date.now()
      
      for (const [key, entry] of Object.entries(parsed)) {
        if (now - entry.timestamp <= SECURITY_CONFIG.CACHE_TTL) {
          cache.set(key, entry)
        }
      }
    }
  } catch (e) {
    console.warn('Failed to load cache from localStorage')
  }
}

const saveToLocalStorage = (): void => {
  if (!isBrowser) return
  
  try {
    const cacheObj: Record<string, CacheEntry<any>> = {}
    cache.forEach((value, key) => {
      cacheObj[key] = value
    })
    localStorage.setItem(MEMORY_CACHE_KEY, JSON.stringify(cacheObj))
  } catch (e) {
    console.warn('Failed to save cache to localStorage')
  }
}

loadFromLocalStorage()

const getCached = <T>(key: string): T | null => {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > SECURITY_CONFIG.CACHE_TTL) {
    cache.delete(key)
    saveToLocalStorage()
    return null
  }
  return entry.data
}

const setCached = <T>(key: string, data: T): void => {
  cache.set(key, { data, timestamp: Date.now() })
  saveToLocalStorage()
}

const clearCache = (key?: string): void => {
  if (key) {
    cache.delete(key)
  } else {
    cache.clear()
  }
  saveToLocalStorage()
}

export const cacheApi = {
  get: getCached,
  set: setCached,
  clear: clearCache
}

// ============ 文件验证函数 ============
export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
  // 验证文件大小
  if (file.size > SECURITY_CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `文件大小不能超过 ${SECURITY_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`
    }
  }
  
  // 验证文件类型
  if (!SECURITY_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `只支持以下文件类型: ${SECURITY_CONFIG.ALLOWED_IMAGE_TYPES.join(', ')}`
    }
  }
  
  // 验证文件名长度
  if (file.name.length > SECURITY_CONFIG.MAX_FILENAME_LENGTH) {
    return {
      valid: false,
      error: `文件名长度不能超过 ${SECURITY_CONFIG.MAX_FILENAME_LENGTH} 个字符`
    }
  }
  
  // 验证文件名安全性（防止路径遍历攻击）
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return {
      valid: false,
      error: '文件名包含非法字符'
    }
  }
  
  return { valid: true }
}

// ============ API 端点定义 ============
export const authApi = {
  login: (data: LoginRequest) => api.post<APIResponse<LoginResponse>>('/auth/login', data),
  logout: () => {
    clearCache()
    return api.post('/auth/logout')
  },
  getCurrentUser: () => api.get<APIResponse<User>>('/auth/me'),
  register: (data: LoginRequest & { nickname: string }) => api.post('/auth/register', data)
}

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

export const settingsApi = {
  get: async () => {
    const cached = getCached<APIResponse<Settings>>('settings')
    if (cached) return cached
    const res = await api.get<APIResponse<Settings>>('/settings')
    setCached('settings', res)
    return res
  },
  update: (data: Partial<Settings>) => {
    clearCache('settings')
    return api.put('/settings', data)
  }
}

export const galleryApi = {
  getImages: (type: 'public' | 'user') => {
    const cacheKey = `gallery_${type}`
    return retryWithExponentialBackoff(async () => {
      const cached = getCached(cacheKey)
      if (cached) return cached
      const res = await api.get(`/gallery/${type}`)
      setCached(cacheKey, res)
      return res
    })
  },
  uploadImage: (file: File) => {
    const validation = validateFileUpload(file)
    if (!validation.valid) {
      return Promise.reject(new Error(validation.error))
    }
    
    clearCache('gallery_user')
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/gallery/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  deleteImage: (id: string) => {
    clearCache('gallery_user')
    return api.delete(`/gallery/${id}`)
  }
}

export const exportImportApi = {
  exportData: () => api.get('/export', { responseType: 'blob' }),
  importData: (file: File) => {
    // 验证导入文件
    if (!file.name.endsWith('.json')) {
      return Promise.reject(new Error('只支持 JSON 格式的导入文件'))
    }
    
    if (file.size > SECURITY_CONFIG.MAX_FILE_SIZE) {
      return Promise.reject(new Error(`导入文件大小不能超过 ${SECURITY_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`))
    }
    
    clearCache()
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export default api
