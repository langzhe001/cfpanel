import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types'
import { userApi, authApi } from '@/api'

const isBrowser = typeof window !== 'undefined'
const SESSION_KEY = 'sunpanel_session'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const sessionExpiresAt = ref<number | null>(null)

  const loadSession = () => {
    if (!isBrowser) return
    try {
      const stored = localStorage.getItem(SESSION_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        if (data.expiresAt && Date.now() < data.expiresAt) {
          sessionExpiresAt.value = data.expiresAt
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
        expiresAt: sessionExpiresAt.value
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

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (e) {
      console.warn('Logout API call failed, but cleaning up locally')
    }
    
    user.value = null
    sessionExpiresAt.value = null
    clearSession()
  }

  const isSessionValid = (): boolean => {
    if (!sessionExpiresAt.value) return false
    return Date.now() < sessionExpiresAt.value
  }

  const fetchUser = async () => {
    try {
      const res = await userApi.getProfile()
      user.value = res.data
      sessionExpiresAt.value = Date.now() + 7 * 24 * 60 * 60 * 1000
      saveSession()
      return user.value
    } catch (err) {
      console.warn('Failed to fetch user profile:', err)
      user.value = null
      sessionExpiresAt.value = null
      clearSession()
      return null
    }
  }

  // 初始化时加载会话
  loadSession()

  return {
    user,
    sessionExpiresAt,
    setUser,
    logout,
    fetchUser,
    isSessionValid
  }
})
