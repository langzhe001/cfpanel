<template>
  <div class="space-y-6">
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
            class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            :disabled="isLoading"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">默认语言</label>
          <select 
            v-model="settings.defaultLanguage" 
            class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
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
            class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
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
          <button @click="resetSettings" class="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            重置默认
          </button>
          <button 
            @click="saveSettings" 
            class="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            :disabled="isLoading"
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

    <div v-if="message" class="p-4 rounded-lg" :class="messageType === 'success' ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800'">
      <div class="flex items-center gap-3">
        <Icon v-if="messageType === 'success'" icon="ph:check-circle-bold" class="w-5 h-5 text-green-500" />
        <Icon v-else icon="ph:x-circle-bold" class="w-5 h-5 text-red-500" />
        <p :class="messageType === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { settingsApi } from '@/api'

const defaultSettings = {
  siteName: 'SunPanel',
  defaultLanguage: 'zh-CN',
  defaultItemsPerRow: 6,
  allowRegistration: true
}

const settings = reactive({ ...defaultSettings })
const isLoading = ref(false)
const message = ref('')
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
  } catch (error) {
    const saved = localStorage.getItem('globalSettings')
    if (saved) {
      const savedSettings = JSON.parse(saved)
      Object.assign(settings, savedSettings)
    }
    console.error('加载全局设置失败:', error)
  } finally {
    isLoading.value = false
  }
}

const saveSettings = async () => {
  isLoading.value = true
  message.value = ''
  
  try {
    localStorage.setItem('globalSettings', JSON.stringify(settings))
    await settingsApi.update({
      siteName: settings.siteName,
      language: settings.defaultLanguage,
      itemsPerRow: settings.defaultItemsPerRow
    })
    message.value = '设置保存成功！'
    messageType.value = 'success'
  } catch (error) {
    message.value = '保存失败，请重试'
    messageType.value = 'error'
  } finally {
    isLoading.value = false
    setTimeout(() => {
      message.value = ''
    }, 3000)
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