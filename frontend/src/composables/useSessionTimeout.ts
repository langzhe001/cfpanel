import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

export interface SessionWarningOptions {
  warningBeforeMinutes?: number
  onWarning?: () => void
  onExpired?: () => void
}

export const useSessionTimeout = (options: SessionWarningOptions = {}) => {
  const {
    warningBeforeMinutes = 5,
    onWarning,
    onExpired
  } = options

  const authStore = useAuthStore()
  const showWarning = ref(false)
  const remainingSeconds = ref(0)
  let checkInterval: number | null = null

  const clearTimers = () => {
    if (checkInterval) {
      clearInterval(checkInterval)
      checkInterval = null
    }
  }

  const updateRemainingTime = () => {
    if (!authStore.sessionExpiresAt) {
      remainingSeconds.value = 0
      return
    }
    const remaining = authStore.sessionExpiresAt - Date.now()
    remainingSeconds.value = Math.max(0, Math.floor(remaining / 1000))
  }

  const checkSession = async () => {
    const token = authStore.getToken()
    if (!token) {
      clearTimers()
      return
    }

    if (!authStore.sessionExpiresAt) {
      return
    }

    const now = Date.now()
    const remaining = authStore.sessionExpiresAt - now

    if (remaining <= 0) {
      showWarning.value = false
      clearTimers()
      await authStore.logout()
      onExpired?.()
      return
    }

    const warningThreshold = warningBeforeMinutes * 60 * 1000
    if (remaining <= warningThreshold && !showWarning.value) {
      showWarning.value = true
      onWarning?.()
    }

    updateRemainingTime()
  }

  const startMonitoring = () => {
    const token = authStore.getToken()
    if (!token) return

    clearTimers()

    checkSession()

    checkInterval = window.setInterval(checkSession, 5000)
  }

  const stopMonitoring = () => {
    clearTimers()
    showWarning.value = false
    remainingSeconds.value = 0
  }

  const dismissWarning = () => {
    showWarning.value = false
  }

  const refreshSession = async () => {
    const token = authStore.getToken()
    if (!token) return

    try {
      const response = await fetch('/api/auth/csrf-token', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.data?.csrfToken) {
          authStore.setCsrfToken(data.data.csrfToken)
        }
        authStore.sessionExpiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000
        showWarning.value = false
      }
    } catch (error) {
      console.error('刷新会话失败:', error)
    }
  }

  onMounted(() => {
    if (authStore.isSessionValid()) {
      startMonitoring()
    }
  })

  onUnmounted(() => {
    stopMonitoring()
  })

  return {
    showWarning,
    remainingSeconds,
    startMonitoring,
    stopMonitoring,
    dismissWarning,
    refreshSession
  }
}

export const formatRemainingTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}
