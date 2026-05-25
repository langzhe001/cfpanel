// API 客户端配置和工具函数

import axios, { type AxiosInstance } from 'axios'

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

export const getCookie = (name: string): string | null => {
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

export const createApiClient = (baseURL: string = '/api'): AxiosInstance => {
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

export const retryWithExponentialBackoff = async <T>(
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

export const clearAllAuth = () => {
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

export const getCached = <T>(key: string): T | null => {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > SECURITY_CONFIG.CACHE_TTL) {
    cache.delete(key)
    saveToLocalStorage()
    return null
  }
  return entry.data
}

export const setCached = <T>(key: string, data: T): void => {
  cache.set(key, { data, timestamp: Date.now() })
  saveToLocalStorage()
}

export const clearCache = (key?: string): void => {
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

// 创建并导出默认的 API 客户端实例
export const api = createApiClient()

// 导出 cache 用于其他模块
export { cache }
