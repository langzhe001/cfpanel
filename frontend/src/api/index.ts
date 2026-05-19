import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import type { APIResponse, LoginRequest, LoginResponse, User, Group, Item, Settings, GlobalSettings } from '@/types'

export const SECURITY_CONFIG = {
  CACHE_TTL: 5 * 60 * 1000,
  MAX_RETRIES: 3,
  INITIAL_RETRY_DELAY: 1000,
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  MAX_FILENAME_LENGTH: 255,
  REQUEST_TIMEOUT: 15000
} as const

interface ErrorHandler {
  showError: (message: string) => void
  showSuccess: (message: string) => void
}

let errorHandler: ErrorHandler | null = null

export const setErrorHandler = (handler: ErrorHandler) => {
  errorHandler = handler
}

const isBrowser = typeof window !== 'undefined'

const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null
  const cookies = document.cookie.split('; ')
  const cookie = cookies.find(c => c.startsWith(`${name}=`))
  return cookie ? cookie.substring(name.length + 1) : null
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
    const csrfToken = getCookie('csrf_token')
    if (csrfToken && config.method && config.method.toLowerCase() !== 'get') {
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

const clearAllAuth = () => {
  if (typeof window !== 'undefined') {
    document.cookie = 'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'csrf_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  }
  clearCache()
}

export const clearAuthAndRedirect = () => {
  clearAllAuth()
  if (isBrowser) {
    window.location.href = '/login'
  }
}

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

export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
  if (file.size > SECURITY_CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `文件大小不能超过 ${SECURITY_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`
    }
  }
  if (!SECURITY_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `只支持以下文件类型: ${SECURITY_CONFIG.ALLOWED_IMAGE_TYPES.join(', ')}`
    }
  }
  if (file.name.length > SECURITY_CONFIG.MAX_FILENAME_LENGTH) {
    return {
      valid: false,
      error: `文件名长度不能超过 ${SECURITY_CONFIG.MAX_FILENAME_LENGTH} 个字符`
    }
  }
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return {
      valid: false,
      error: '文件名包含非法字符'
    }
  }
  return { valid: true }
}

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
