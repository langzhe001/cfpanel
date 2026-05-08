<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600">
    <div class="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-orange-500 mb-2">☀️ SunPanel</h1>
        <p class="text-slate-500 dark:text-slate-400">登录到您的控制面板</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            用户名
          </label>
          <input
            v-model="form.username"
            type="text"
            required
            class="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-colors"
            placeholder="请输入用户名"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            密码
          </label>
          <input
            v-model="form.password"
            type="password"
            required
            class="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-colors"
            placeholder="请输入密码"
          />
        </div>

        <div v-if="isRegisterMode" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              昵称
            </label>
            <input
              v-model="form.nickname"
              type="text"
              required
              class="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-colors"
              placeholder="请输入昵称"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              确认密码
            </label>
            <input
              v-model="form.confirmPassword"
              type="password"
              required
              class="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-colors"
              placeholder="请再次输入密码"
            />
          </div>
        </div>

        <div v-if="error" class="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 rounded-lg">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 text-white font-medium bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span v-if="loading">请稍候...</span>
          <span v-else>{{ isRegisterMode ? '注册' : '登录' }}</span>
        </button>
      </form>

      <div class="mt-6 text-center">
        <button
          @click="isRegisterMode = !isRegisterMode"
          class="text-sm text-orange-500 hover:text-orange-600"
        >
          {{ isRegisterMode ? '已有账号？去登录' : '没有账号？去注册' }}
        </button>
      </div>

      <div class="mt-4 text-center">
        <button
          @click="$router.push('/')"
          class="text-sm text-slate-500 hover:text-slate-600"
        >
          返回首页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/api'

const router = useRouter()
const authStore = useAuthStore()

const isRegisterMode = ref(false)
const loading = ref(false)
const error = ref('')

const form = reactive({
  username: '',
  password: '',
  nickname: '',
  confirmPassword: ''
})

const handleLogin = async () => {
  error.value = ''
  
  if (isRegisterMode.value) {
    if (form.password !== form.confirmPassword) {
      error.value = '两次输入的密码不一致'
      return
    }
    if (form.password.length < 8) {
      error.value = '密码长度至少为8位'
      return
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(form.password)) {
      error.value = '密码需包含大小写字母、数字和特殊字符(@$!%*?&)'
      return
    }
    if (!/^[a-zA-Z0-9_]{3,50}$/.test(form.username)) {
      error.value = '用户名只能包含字母、数字和下划线，长度3-50位'
      return
    }
  } else {
    if (form.password.length < 6) {
      error.value = '密码长度至少为6位'
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
    } else {
      const res = await authApi.login({
        username: form.username,
        password: form.password
      })
      authStore.setToken(res.data.token)
      if (res.data.csrfToken) {
        authStore.setCsrfToken(res.data.csrfToken)
      }
      authStore.setUser(res.data.user)
      router.push('/admin')
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || '操作失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>
