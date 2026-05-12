<template>
  <div class="space-y-6">
    <ErrorMessage
      v-if="error"
      :message="error"
      :type="messageType"
      :closable="true"
      @close="error = ''"
    />

    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div class="p-6 border-b border-slate-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">全局设置</h3>
      </div>
      <div class="p-6 space-y-6">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">网站名称</label>
          <input 
            v-model="settings.siteName" 
            type="text" 
            class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
            :disabled="isLoading"
            placeholder="SunPanel"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">默认语言</label>
          <select 
            v-model="settings.defaultLanguage" 
            class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
            :disabled="isLoading"
          >
            <option value="zh-CN">简体中文</option>
            <option value="en-US">English</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">默认每行显示数量</label>
          <input 
            v-model.number="settings.defaultItemsPerRow" 
            type="number" 
            min="2" 
            max="12" 
            class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
            :disabled="isLoading"
          />
        </div>
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-slate-700 dark:text-slate-300">允许新用户注册</p>
            <p class="text-sm text-slate-500">控制是否允许访客注册新账号</p>
          </div>
          <button 
            @click="settings.allowRegistration = !settings.allowRegistration" 
            class="relative w-12 h-6 rounded-full transition-colors" 
            :class="settings.allowRegistration ? 'bg-orange-500' : 'bg-slate-300'"
            :disabled="isLoading"
          >
            <span 
              class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform" 
              :class="settings.allowRegistration ? 'translate-x-6' : ''" 
            />
          </button>
        </div>
        <div class="flex justify-end gap-3">
          <button 
            @click="resetSettings" 
            :disabled="isLoading"
            class="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            重置默认
          </button>
          <button 
            @click="saveSettings" 
            :disabled="isLoading"
            class="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            <span v-if="isLoading" class="flex items-center gap-2">
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              保存中...
            </span>
            <span v-else>保存设置</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { settingsApi } from '@/api'
import ErrorMessage from '@/components/ErrorMessage.vue'

const defaultSettings = {
  siteName: 'SunPanel',
  defaultLanguage: 'zh-CN',
  defaultItemsPerRow: 6,
  allowRegistration: true
}

const settings = reactive({ ...defaultSettings })
const isLoading = ref(false)
const error = ref('')
const messageType = ref<'success' | 'error'>('success')

const loadSettings = async () => {
  isLoading.value = true
  try {
    const res = await settingsApi.get()
    if (res.data) {
      const savedSettings = res.data
      if (savedSettings.siteName !== undefined) settings.siteName = savedSettings.siteName
      if (savedSettings.language !== undefined) settings.defaultLanguage = savedSettings.language
      if (savedSettings.itemsPerRow !== undefined) settings.defaultItemsPerRow = savedSettings.itemsPerRow
    }
  } catch (err: any) {
    const saved = localStorage.getItem('globalSettings')
    if (saved) {
      const savedSettings = JSON.parse(saved)
      Object.assign(settings, savedSettings)
    }
    console.error('加载全局设置失败:', err)
  } finally {
    isLoading.value = false
  }
}

const saveSettings = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    localStorage.setItem('globalSettings', JSON.stringify(settings))
    await settingsApi.update({
      siteName: settings.siteName,
      language: settings.defaultLanguage,
      itemsPerRow: settings.defaultItemsPerRow
    })
    error.value = '设置保存成功！'
    messageType.value = 'success'
  } catch (err: any) {
    error.value = err.response?.data?.message || '保存失败，请重试'
    messageType.value = 'error'
  } finally {
    isLoading.value = false
    setTimeout(() => { error.value = '' }, 3000)
  }
}

const resetSettings = () => {
  if (confirm('确定要重置为默认设置吗？')) {
    Object.assign(settings, defaultSettings)
    saveSettings()
  }
}

onMounted(() => {
  loadSettings()
})
</script>