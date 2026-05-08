<template>
  <div class="space-y-6">
    <div v-if="message" class="p-4 rounded-lg" :class="messageType === 'success' ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800'">
      <div class="flex items-center gap-3">
        <Icon v-if="messageType === 'success'" icon="ph:check-circle-bold" class="w-5 h-5 text-green-500" />
        <Icon v-else icon="ph:x-circle-bold" class="w-5 h-5 text-red-500" />
        <p :class="messageType === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">{{ message }}</p>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div class="p-6 border-b border-slate-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">Open API</h3>
      </div>
      <div class="p-6 space-y-6">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">API Token</label>
          <div class="flex gap-2">
            <input
              :value="apiToken || '点击生成API Token'"
              type="text"
              readonly
              class="flex-1 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-500 font-mono"
            />
            <button 
              @click="generateToken" 
              class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="flex items-center gap-2">
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                生成中...
              </span>
              <span v-else>{{ apiToken ? '重新生成' : '生成' }}</span>
            </button>
            <button 
              v-if="apiToken"
              @click="copyToken" 
              class="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <Icon icon="ph:copy-bold" class="w-5 h-5" />
            </button>
          </div>
          <p class="mt-2 text-sm text-slate-500">请妥善保管您的 API Token，不要泄露给他人。Token 用于 API 认证，拥有完整的账户权限。</p>
        </div>

        <div class="border-t border-slate-200 dark:border-slate-700 pt-6">
          <h4 class="font-medium text-slate-700 dark:text-slate-300 mb-4">API 使用示例</h4>
          <div class="space-y-4">
            <div class="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 font-mono text-sm">
              <p class="text-slate-500 mb-2">获取分组列表</p>
              <pre class="text-slate-700 dark:text-slate-300">GET /api/groups
Authorization: Bearer YOUR_TOKEN</pre>
            </div>
            <div class="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 font-mono text-sm">
              <p class="text-slate-500 mb-2">获取网站列表</p>
              <pre class="text-slate-700 dark:text-slate-300">GET /api/items
Authorization: Bearer YOUR_TOKEN</pre>
            </div>
            <div class="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 font-mono text-sm">
              <p class="text-slate-500 mb-2">创建分组</p>
              <pre class="text-slate-700 dark:text-slate-300">POST /api/groups
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "我的分组",
  "icon": "ph:folder-bold"
}</pre>
            </div>
          </div>
        </div>

        <div class="border-t border-slate-200 dark:border-slate-700 pt-6">
          <h4 class="font-medium text-slate-700 dark:text-slate-300 mb-4">API 端点</h4>
          <div class="space-y-3">
            <div class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
              <span class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded text-xs font-medium">GET</span>
              <code class="text-sm text-slate-600 dark:text-slate-400">/api/groups</code>
              <span class="text-xs text-slate-500">获取分组列表</span>
            </div>
            <div class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
              <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs font-medium">POST</span>
              <code class="text-sm text-slate-600 dark:text-slate-400">/api/groups</code>
              <span class="text-xs text-slate-500">创建新分组</span>
            </div>
            <div class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
              <span class="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded text-xs font-medium">PUT</span>
              <code class="text-sm text-slate-600 dark:text-slate-400">/api/groups/{id}</code>
              <span class="text-xs text-slate-500">更新分组</span>
            </div>
            <div class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
              <span class="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-xs font-medium">DELETE</span>
              <code class="text-sm text-slate-600 dark:text-slate-400">/api/groups/{id}</code>
              <span class="text-xs text-slate-500">删除分组</span>
            </div>
            <div class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
              <span class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded text-xs font-medium">GET</span>
              <code class="text-sm text-slate-600 dark:text-slate-400">/api/items</code>
              <span class="text-xs text-slate-500">获取网站列表</span>
            </div>
            <div class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
              <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs font-medium">POST</span>
              <code class="text-sm text-slate-600 dark:text-slate-400">/api/items</code>
              <span class="text-xs text-slate-500">创建新网站</span>
            </div>
            <div class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
              <span class="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded text-xs font-medium">PUT</span>
              <code class="text-sm text-slate-600 dark:text-slate-400">/api/items/{id}</code>
              <span class="text-xs text-slate-500">更新网站</span>
            </div>
            <div class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
              <span class="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-xs font-medium">DELETE</span>
              <code class="text-sm text-slate-600 dark:text-slate-400">/api/items/{id}</code>
              <span class="text-xs text-slate-500">删除网站</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

const apiToken = ref(localStorage.getItem('apiToken') || '')
const isLoading = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const generateToken = async () => {
  if (apiToken.value && !confirm('重新生成将导致之前的 Token 失效，是否继续？')) {
    return
  }
  
  isLoading.value = true
  try {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    apiToken.value = token
    localStorage.setItem('apiToken', token)
    showMessage('Token 生成成功！', 'success')
  } catch (error) {
    showMessage('生成失败，请重试', 'error')
  } finally {
    isLoading.value = false
  }
}

const copyToken = async () => {
  if (!apiToken.value) return
  
  try {
    await navigator.clipboard.writeText(apiToken.value)
    showMessage('Token 已复制到剪贴板', 'success')
  } catch (error) {
    showMessage('复制失败，请手动复制', 'error')
  }
}

const showMessage = (msg: string, type: 'success' | 'error') => {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}
</script>