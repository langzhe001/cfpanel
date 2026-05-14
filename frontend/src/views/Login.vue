<template>
  <div class="min-h-screen relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-amber-500 opacity-60"></div>
    <div class="absolute top-1/4 -left-32 w-96 h-96 bg-green-300 rounded-full blur-3xl opacity-40 animate-pulse"></div>
    <div class="absolute bottom-1/4 -right-32 w-96 h-96 bg-orange-300 rounded-full blur-3xl opacity-40 animate-pulse" style="animation-delay: 1s;"></div>
    
    <div class="relative z-10 min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 rounded-3xl shadow-2xl p-8 border border-white/20">
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="4"></circle>
                  <path d="M12 2v2"></path>
                  <path d="M12 20v2"></path>
                  <path d="m4.93 4.93 1.41 1.41"></path>
                  <path d="m17.66 17.66 1.41 1.41"></path>
                  <path d="M2 12h2"></path>
                  <path d="M20 12h2"></path>
                  <path d="m6.34 17.66-1.41 1.41"></path>
                  <path d="m19.07 4.93-1.41 1.41"></path>
                </svg>
              </div>
            </div>
            <button class="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors">
              {{ currentLanguageDisplay }}
            </button>
          </div>

          <div class="text-center mb-8">
            <h1 class="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              Sun-Panel
            </h1>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-5">
            <div class="relative">
              <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <input
                v-model="form.username"
                type="text"
                required
                class="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/60 dark:bg-slate-700/60 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                :placeholder="login.username || 'admin@sun.cc'"
              />
            </div>

            <div class="relative">
              <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <input
                v-model="form.password"
                type="password"
                required
                class="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/60 dark:bg-slate-700/60 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                :placeholder="login.password || '••••••••'"
              />
            </div>

            <div v-if="isRegisterMode" class="space-y-5">
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <input
                  v-model="form.nickname"
                  type="text"
                  required
                  class="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/60 dark:bg-slate-700/60 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  :placeholder="login.nickname || '请输入昵称'"
                />
              </div>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <input
                  v-model="form.confirmPassword"
                  type="password"
                  required
                  class="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/60 dark:bg-slate-700/60 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  :placeholder="login.confirmPassword || '请再次输入密码'"
                />
              </div>
            </div>

            <div v-if="error" class="p-4 text-sm bg-red-50/80 dark:bg-red-900/30 rounded-xl border border-red-200 dark:border-red-800">
              <div class="flex items-center gap-2" :class="rateLimited ? 'text-orange-600' : 'text-red-600'">
                <svg v-if="rateLimited" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                <span>{{ error }}</span>
              </div>
              <div v-if="rateLimited" class="mt-2 text-xs text-orange-500">
                剩余等待时间: {{ rateLimitRemaining }} 秒
              </div>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full py-4 text-white font-medium bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/30"
            >
              <span v-if="loading">{{ login.loading || '请稍候...' }}</span>
              <span v-else>{{ isRegisterMode ? (login.register || '注册') : (login.submit || '登录') }}</span>
            </button>
          </form>

          <div class="mt-6 text-center">
            <button
              @click="() => { isRegisterMode = !isRegisterMode; resetForm() }"
              class="text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
            >
              {{ isRegisterMode ? (login.haveAccount || '已有账号？去登录') : (login.noAccount || '没有账号？去注册') }}
            </button>
          </div>

          <div class="mt-4 text-center">
            <button
              @click="$router.push('/')"
              class="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
            >
              {{ login.backToHome || '返回首页' }}
            </button>
          </div>

          <div class="mt-6 text-center">
            <p class="text-xs text-slate-400">
              Powered By Sun-Panel
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useGlobalSettingsStore } from '@/stores/globalSettings'
import { usePageTexts } from '@/composables/useI18n'
import { authApi } from '@/api'

const router = useRouter()
const authStore = useAuthStore()
const globalSettingsStore = useGlobalSettingsStore()
const { login, pageTexts } = usePageTexts()

const isRegisterMode = ref(false)
const loading = ref(false)
const error = ref('')
const rateLimited = ref(false)
const rateLimitRemaining = ref(0)
const lastRequestTime = ref(0)

const currentLanguageDisplay = computed(() => {
  const lang = globalSettingsStore.currentLanguage
  const langNames: Record<string, string> = {
    'zh-CN': '简体中文',
    'en-US': 'English',
    'ja-JP': '日本語',
    'ko-KR': '한국어'
  }
  return langNames[lang] || lang
})

const form = reactive({
  username: '',
  password: '',
  nickname: '',
  confirmPassword: ''
})

const MIN_REQUEST_INTERVAL = 1000

const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return '密码长度至少为8位'
  }
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
    return '密码需包含大小写字母、数字和特殊字符(@$!%*?&)'
  }
  return null
}

const validateUsername = (username: string): string | null => {
  if (!/^[a-zA-Z0-9_]{3,50}$/.test(username)) {
    return '用户名只能包含字母、数字和下划线，长度3-50位'
  }
  return null
}

const handleLogin = async () => {
  const now = Date.now()
  if (now - lastRequestTime.value < MIN_REQUEST_INTERVAL) {
    return
  }
  lastRequestTime.value = now

  error.value = ''

  if (isRegisterMode.value) {
    if (!form.nickname.trim()) {
      error.value = '请输入昵称'
      return
    }
    if (form.password !== form.confirmPassword) {
      error.value = '两次输入的密码不一致'
      return
    }
    const passwordError = validatePassword(form.password)
    if (passwordError) {
      error.value = passwordError
      return
    }
    const usernameError = validateUsername(form.username)
    if (usernameError) {
      error.value = usernameError
      return
    }
  } else {
    if (!form.username.trim()) {
      error.value = '请输入用户名'
      return
    }
    if (!form.password.trim()) {
      error.value = '请输入密码'
      return
    }
  }

  loading.value = true
  try {
    if (isRegisterMode.value) {
      await authApi.register({
        username: form.username,
        password: form.password,
        nickname: form.nickname
      })
      error.value = '注册成功，请登录'
      isRegisterMode.value = false
      form.password = ''
      form.confirmPassword = ''
      form.nickname = ''
    } else {
      const res = await authApi.login({
        username: form.username,
        password: form.password
      })

      if (res.data?.user) {
        authStore.setUser(res.data.user)
        await router.push('/')
      } else {
        error.value = '登录失败，请重试'
      }
    }
  } catch (err: any) {
    console.error('登录失败:', err)
    
    if (err.response?.status === 429) {
      rateLimited.value = true
      rateLimitRemaining.value = 60
      error.value = '请求过于频繁，请稍后再试'
      
      const countdownInterval = setInterval(() => {
        rateLimitRemaining.value--
        if (rateLimitRemaining.value <= 0) {
          rateLimited.value = false
          clearInterval(countdownInterval)
        }
      }, 1000)
    } else {
      error.value = err.response?.data?.message || 
                   (err.response?.status === 401 ? '用户名或密码错误' : 
                   (err.response?.status === 500 ? '服务器内部错误，请稍后重试' : 
                   '操作失败，请重试'))
    }
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.username = ''
  form.password = ''
  form.nickname = ''
  form.confirmPassword = ''
  error.value = ''
}
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.6;
  }
}

.animate-pulse {
  animation: pulse 3s ease-in-out infinite;
}
</style>