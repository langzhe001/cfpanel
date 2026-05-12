import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types'
import { userApi, authApi, SECURITY_CONFIG } from '@/api'

// 安全存储工具函数
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

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(secureGetItem(SECURITY_CONFIG.SESSION_KEYS.TOKEN))
  const csrfToken = ref<string | null>(secureGetItem(SECURITY_CONFIG.SESSION_KEYS.CSRF_TOKEN))
  const sessionExpiresAt = ref<number | null>(null)

  const setToken = (newToken: string) => {
    token.value = newToken
    secureSetItem(SECURITY_CONFIG.SESSION_KEYS.TOKEN, newToken)
    sessionExpiresAt.value = Date.now() + 7 * 24 * 60 * 60 * 1000 // 7天过期
  }

  const setCsrfToken = (newCsrfToken: string) => {
    csrfToken.value = newCsrfToken
    secureSetItem(SECURITY_CONFIG.SESSION_KEYS.CSRF_TOKEN, newCsrfToken)
  }

  const setUser = (newUser: User) => {
    user.value = newUser
  }

  const logout = async () => {
    try {
      if (token.value) {
        await authApi.logout()
      }
    } catch (e) {
      // 即使失败也要继续清理本地状态
      console.warn('Logout API call failed, but cleaning up locally')
    }
    
    token.value = null
    csrfToken.value = null
    user.value = null
    sessionExpiresAt.value = null
    
    // 清理所有认证相关数据
    secureRemoveItem(SECURITY_CONFIG.SESSION_KEYS.TOKEN)
    secureRemoveItem(SECURITY_CONFIG.SESSION_KEYS.CSRF_TOKEN)
    
    // 清理 cookie
    if (isBrowser) {
      document.cookie = 'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      document.cookie = 'csrf_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    }
  }

  const isSessionValid = (): boolean => {
    if (!token.value) return false
    if (!sessionExpiresAt.value) return true
    return Date.now() < sessionExpiresAt.value
  }

  const fetchUser = async () => {
    if (!token.value) return null
    try {
      const res = await userApi.getProfile()
      user.value = res.data
      return user.value
    } catch (err) {
      console.warn('Failed to fetch user profile:', err)
      return null
    }
  }

  return {
    user,
    token,
    csrfToken,
    sessionExpiresAt,
    setToken,
    setCsrfToken,
    setUser,
    logout,
    fetchUser,
    isSessionValid
  }
})
