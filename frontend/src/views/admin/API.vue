<template>
  <div class="space-y-6">
    <ErrorMessage
      v-if="message"
      :message="message"
      :type="messageType"
      :closable="true"
      @close="message = ''"
    />

    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div class="p-6 border-b border-slate-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">Open API</h3>
      </div>
      <div class="p-6 space-y-6">
        <!-- Token 管理区域 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">API Token</label>
          <div class="space-y-3">
            <div v-if="apiToken" class="space-y-2">
              <div class="flex gap-2">
                <input
                  :value="maskedToken"
                  type="text"
                  readonly
                  class="flex-1 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-mono"
                />
                <button 
                  @click="toggleTokenVisibility"
                  class="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <Icon :icon="showToken ? 'ph:eye-slash-bold' : 'ph:eye-bold'" class="w-5 h-5" />
                </button>
                <button 
                  @click="copyToken" 
                  class="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <Icon icon="ph:copy-bold" class="w-5 h-5" />
                </button>
              </div>
              <div class="flex items-center gap-4 text-sm text-slate-500">
                <span v-if="tokenExpiresAt">
                  <Icon icon="ph:clock-bold" class="w-4 h-4 inline mr-1" />
                  过期时间: {{ formatTokenExpiry() }}
                </span>
                <span>
                  <Icon icon="ph:key-bold" class="w-4 h-4 inline mr-1" />
                  最后更新: {{ formatTokenCreatedAt() }}
                </span>
              </div>
            </div>
            <div v-else class="flex gap-2">
              <input
                value="未生成 API Token"
                type="text"
                readonly
                class="flex-1 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-500 font-mono"
              />
            </div>
            
            <div class="flex gap-2">
              <button 
                @click="generateToken" 
                class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                :disabled="isLoading"
              >
                <span v-if="isLoading" class="flex items-center gap-2">
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  生成中...
                </span>
                <span v-else>
                  <Icon :icon="apiToken ? 'ph:arrow-clockwise-bold' : 'ph:key-bold'" class="w-5 h-5" />
                  {{ apiToken ? '重新生成' : '生成 Token' }}
                </span>
              </button>
              <button 
                v-if="apiToken"
                @click="revokeToken" 
                class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                :disabled="isLoading"
              >
                <Icon icon="ph:x-bold" class="w-5 h-5" />
                撤销
              </button>
            </div>
          </div>
          
          <!-- 安全警告 -->
          <div class="mt-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <div class="flex items-start gap-3">
              <Icon icon="ph:warning-bold" class="w-5 h-5 text-yellow-500 mt-0.5" />
              <div class="text-sm">
                <p class="font-medium text-yellow-700 dark:text-yellow-400 mb-1">安全警告</p>
                <ul class="text-yellow-600 dark:text-yellow-500 space-y-1 list-disc list-inside">
                  <li>请妥善保管您的 API Token，不要泄露给他人</li>
                  <li>Token 拥有完整的账户权限，请谨慎使用</li>
                  <li>建议定期重新生成 Token 以增强安全性</li>
                  <li>如发现 Token 泄露，请立即撤销</li>
                  <li>Token 将在 90 天后自动过期</li>
                </ul>
              </div>
            </div>
          </div>
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
    
    <!-- 确认对话框 -->
    <div v-if="showConfirmModal" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md p-6">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">{{ confirmModalTitle }}</h3>
        <p class="text-slate-600 dark:text-slate-400 mb-6">{{ confirmModalMessage }}</p>
        <div class="flex gap-3">
          <button @click="showConfirmModal = false" class="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
            取消
          </button>
          <button @click="confirmModalAction" class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            确认
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import ErrorMessage from '@/components/ErrorMessage.vue'

// 安全常量
const TOKEN_EXPIRY_DAYS = 90
const TOKEN_MASK_LENGTH = 8

const apiToken = ref('')
const tokenCreatedAt = ref<number | null>(null)
const tokenExpiresAt = ref<number | null>(null)
const isLoading = ref(false)
const showToken = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error' | 'warning'>('success')
const showConfirmModal = ref(false)
const confirmModalTitle = ref('')
const confirmModalMessage = ref('')
let confirmModalCallback: (() => void) | null = null

// 初始化时从安全存储读取 Token
const loadTokenFromStorage = () => {
  try {
    const storedToken = sessionStorage.getItem('apiToken')
    const storedCreatedAt = sessionStorage.getItem('apiTokenCreatedAt')
    const storedExpiresAt = sessionStorage.getItem('apiTokenExpiresAt')
    
    if (storedToken && storedExpiresAt) {
      const expiryTime = parseInt(storedExpiresAt, 10)
      if (Date.now() < expiryTime) {
        apiToken.value = storedToken
        tokenCreatedAt.value = storedCreatedAt ? parseInt(storedCreatedAt, 10) : null
        tokenExpiresAt.value = expiryTime
      } else {
        clearTokenStorage()
        showMessage('Token 已过期，请重新生成', 'warning')
      }
    }
  } catch (error) {
    console.error('Failed to load token:', error)
  }
}

const maskedToken = computed(() => {
  if (!apiToken.value) return ''
  if (!showToken.value) {
    const maskLength = Math.min(TOKEN_MASK_LENGTH, apiToken.value.length)
    return `${apiToken.value.slice(0, 4)}${'*'.repeat(apiToken.value.length - 8)}${apiToken.value.slice(-4)}`
  }
  return apiToken.value
})

const clearTokenStorage = () => {
  sessionStorage.removeItem('apiToken')
  sessionStorage.removeItem('apiTokenCreatedAt')
  sessionStorage.removeItem('apiTokenExpiresAt')
  // 清理旧的 localStorage 存储
  localStorage.removeItem('apiToken')
}

const saveTokenToStorage = (token: string) => {
  const now = Date.now()
  const expiry = now + (TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
  
  apiToken.value = token
  tokenCreatedAt.value = now
  tokenExpiresAt.value = expiry
  
  sessionStorage.setItem('apiToken', token)
  sessionStorage.setItem('apiTokenCreatedAt', now.toString())
  sessionStorage.setItem('apiTokenExpiresAt', expiry.toString())
}

const generateToken = async () => {
  const action = () => {
    isLoading.value = true
    try {
      const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
      
      saveTokenToStorage(token)
      showMessage('Token 生成成功！请妥善保管，有效期 90 天', 'success')
      showToken.value = true
    } catch (error) {
      showMessage('生成失败，请重试', 'error')
    } finally {
      isLoading.value = false
      showConfirmModal.value = false
    }
  }
  
  if (apiToken.value) {
    confirmModalTitle.value = '重新生成 Token'
    confirmModalMessage.value = '重新生成将导致之前的 Token 立即失效，是否继续？'
    confirmModalCallback = action
    showConfirmModal.value = true
  } else {
    action()
  }
}

const revokeToken = () => {
  confirmModalTitle.value = '撤销 Token'
  confirmModalMessage.value = '确定要撤销当前的 API Token 吗？撤销后将无法使用该 Token 访问 API。'
  confirmModalCallback = () => {
    apiToken.value = ''
    tokenCreatedAt.value = null
    tokenExpiresAt.value = null
    clearTokenStorage()
    showToken.value = false
    showMessage('Token 已撤销', 'success')
    showConfirmModal.value = false
  }
  showConfirmModal.value = true
}

const confirmModalAction = () => {
  if (confirmModalCallback) {
    confirmModalCallback()
    confirmModalCallback = null
  }
}

const toggleTokenVisibility = () => {
  showToken.value = !showToken.value
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

const formatTokenExpiry = () => {
  if (!tokenExpiresAt.value) return ''
  const date = new Date(tokenExpiresAt.value)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatTokenCreatedAt = () => {
  if (!tokenCreatedAt.value) return ''
  const date = new Date(tokenCreatedAt.value)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const showMessage = (msg: string, type: 'success' | 'error' | 'warning') => {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 5000)
}

loadTokenFromStorage()
</script>
