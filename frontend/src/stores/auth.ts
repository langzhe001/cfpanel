import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types'
import { userApi, authApi } from '@/api'

const isBrowser = typeof window !== 'undefined'
const SESSION_KEY = 'sunpanel_session'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const sessionExpiresAt = ref<number | null>(null)
  const csrfToken = ref('')
  const isFetchingUser = ref(false)

  const loadSession = () => {
    if (!isBrowser) return
    try {
      const stored = localStorage.getItem(SESSION_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        if (data.expiresAt && Date.now() < data.expiresAt) {
          sessionExpiresAt.value = data.expiresAt
        }
        if (data.csrfToken) {
          csrfToken.value = data.csrfToken
        }
      }
    } catch (e) {
      console.warn('Failed to load session from storage')
    }
  }

  const saveSession = () => {
    if (!isBrowser) return
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        expiresAt: sessionExpiresAt.value,
        csrfToken: csrfToken.value
      }))
    } catch (e) {
      console.warn('Failed to save session to storage')
    }
  }

  const clearSession = () => {
    if (!isBrowser) return
    try {
      localStorage.removeItem(SESSION_KEY)
    } catch (e) {
      console.warn('Failed to clear session from storage')
    }
  }

  const setUser = (newUser: User) => {
    user.value = newUser
    sessionExpiresAt.value = Date.now() + 7 * 24 * 60 * 60 * 1000
    saveSession()
  }

  const setCsrfToken = (token: string) => {
    csrfToken.value = token
    saveSession()
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (e) {
      console.warn('Logout API call failed, but cleaning up locally')
    }
    
    user.value = null
    sessionExpiresAt.value = null
    csrfToken.value = ''
    clearSession()
  }

  const isSessionValid = (): boolean => {
    if (!sessionExpiresAt.value) return false
    return Date.now() < sessionExpiresAt.value
  }

  const getToken = (): string | null => {
    if (!isBrowser) return null
    const cookies = document.cookie.split('; ')
    const sessionCookie = cookies.find(c => c.startsWith('session_token='))
    return sessionCookie ? sessionCookie.substring('session_token='.length) : null
  }

  const fetchUser = async (force = false) => {
    const timestamp = Date.now()
    console.log(`[AUTH-STORE] ${timestamp} - fetchUser 调用`, { force, isFetchingUser: isFetchingUser.value })
    
    if (isFetchingUser.value && !force) {
      console.log(`[AUTH-STORE] ${timestamp} - 已有请求进行中，返回缓存用户`)
      return user.value
    }
    
    isFetchingUser.value = true
    console.log(`[AUTH-STORE] ${timestamp} - 开始获取用户信息`)
    
    try {
      console.log(`[AUTH-STORE] ${timestamp} - 发起 API 请求`)
      const res = await userApi.getProfile()
      console.log(`[AUTH-STORE] ${timestamp} - API 响应成功`)
      
      user.value = res.data
      sessionExpiresAt.value = Date.now() + 7 * 24 * 60 * 60 * 1000
      saveSession()
      console.log(`[AUTH-STORE] ${timestamp} - 用户信息更新完成:`, res.data?.username)
      return user.value
    } catch (err: any) {
      console.error(`[AUTH-STORE] ${timestamp} - 获取用户信息失败:`, err.response?.status, err.response?.data?.message || err.message)
      user.value = null
      sessionExpiresAt.value = null
      clearSession()
      return null
    } finally {
      isFetchingUser.value = false
      console.log(`[AUTH-STORE] ${timestamp} - fetchUser 完成，isFetchingUser 重置为 false`)
    }
  }

  loadSession()

  return {
    user,
    sessionExpiresAt,
    csrfToken,
    isFetchingUser,
    setUser,
    setCsrfToken,
    logout,
    fetchUser,
    isSessionValid,
    getToken
  }
})
