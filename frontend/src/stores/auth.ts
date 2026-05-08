import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types'
import { userApi } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const csrfToken = ref<string | null>(localStorage.getItem('csrfToken'))
  const sessionExpiresAt = ref<number | null>(null)

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
    sessionExpiresAt.value = Date.now() + 7 * 24 * 60 * 60 * 1000
  }

  const setCsrfToken = (newCsrfToken: string) => {
    csrfToken.value = newCsrfToken
    localStorage.setItem('csrfToken', newCsrfToken)
  }

  const setUser = (newUser: User) => {
    user.value = newUser
  }

  const logout = async () => {
    try {
      if (token.value) {
        await userApi.logout()
      }
    } catch (e) {
      // 即使失败也要继续清理本地状态
    }
    
    token.value = null
    csrfToken.value = null
    user.value = null
    sessionExpiresAt.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('csrfToken')
    document.cookie = 'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'csrf_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
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
    } catch {
      logout()
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
