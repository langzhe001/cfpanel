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
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">{{ pageTitle }}</h3>
      </div>
      <div class="p-6 space-y-6">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ websiteTitleLabel }}</label>
          <input
            v-model="localSettings.websiteTitle"
            type="text"
            class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
            :disabled="isLoading"
            :placeholder="websiteTitlePlaceholder"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ websiteDescriptionLabel }}</label>
          <textarea
            v-model="localSettings.websiteDescription"
            rows="3"
            class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
            :disabled="isLoading"
            :placeholder="websiteDescriptionPlaceholder"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ footerTextLabel }}</label>
          <input
            v-model="localSettings.footerText"
            type="text"
            class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
            :disabled="isLoading"
            :placeholder="footerTextPlaceholder"
          />
        </div>

        <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <h4 class="font-medium text-slate-700 dark:text-slate-300 mb-4">{{ pageTextsLabel }}</h4>
          <div class="space-y-3 text-sm">
            <div class="flex items-center gap-2">
              <span class="text-slate-500 dark:text-slate-400 w-32">{{ homeTitleLabel }}:</span>
              <input
                v-model="localPageTexts.home.title"
                type="text"
                class="flex-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                :placeholder="homeTitlePlaceholder"
              />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-slate-500 dark:text-slate-400 w-32">{{ homeWelcomeLabel }}:</span>
              <input
                v-model="localPageTexts.home.welcome"
                type="text"
                class="flex-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                :placeholder="homeWelcomePlaceholder"
              />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-slate-500 dark:text-slate-400 w-32">{{ navHomeLabel }}:</span>
              <input
                v-model="localPageTexts.nav.home"
                type="text"
                class="flex-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                :placeholder="navHomePlaceholder"
              />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-slate-500 dark:text-slate-400 w-32">{{ navAdminLabel }}:</span>
              <input
                v-model="localPageTexts.nav.admin"
                type="text"
                class="flex-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                :placeholder="navAdminPlaceholder"
              />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-slate-500 dark:text-slate-400 w-32">{{ loginTitleLabel }}:</span>
              <input
                v-model="localPageTexts.login.title"
                type="text"
                class="flex-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                :placeholder="loginTitlePlaceholder"
              />
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3">
          <button
            @click="resetSettings"
            :disabled="isLoading"
            class="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            {{ resetButtonText }}
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
              {{ savingText }}
            </span>
            <span v-else>{{ saveButtonText }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted, watch } from 'vue'
import { useGlobalSettingsStore } from '@/stores/globalSettings'
import ErrorMessage from '@/components/ErrorMessage.vue'

const globalSettingsStore = useGlobalSettingsStore()

const isLoading = ref(false)
const error = ref('')
const messageType = ref<'success' | 'error'>('success')

const localSettings = reactive({
  websiteTitle: '',
  websiteDescription: '',
  footerText: ''
})

const localPageTexts = reactive({
  home: { title: '', welcome: '' },
  nav: { home: '', admin: '' },
  login: { title: '' }
})

const t = (key: string, fallback: string) => globalSettingsStore.getText(key, fallback)

const pageTitle = computed(() => globalSettingsStore.getText('admin.globalSettings', '全局设置'))
const websiteTitleLabel = computed(() => globalSettingsStore.getText('globalSettings.websiteTitle', '网站标题'))
const websiteTitlePlaceholder = computed(() => globalSettingsStore.getText('globalSettings.websiteTitlePlaceholder', '输入网站标题'))
const websiteDescriptionLabel = computed(() => globalSettingsStore.getText('globalSettings.websiteDescription', '网站描述'))
const websiteDescriptionPlaceholder = computed(() => globalSettingsStore.getText('globalSettings.websiteDescriptionPlaceholder', '输入网站描述'))
const footerTextLabel = computed(() => globalSettingsStore.getText('globalSettings.footerText', '页脚文字'))
const footerTextPlaceholder = computed(() => globalSettingsStore.getText('globalSettings.footerTextPlaceholder', '输入页脚文字'))
const pageTextsLabel = computed(() => globalSettingsStore.getText('globalSettings.pageTexts', '页面文本'))
const homeTitleLabel = computed(() => globalSettingsStore.getText('home.title', '首页标题'))
const homeTitlePlaceholder = computed(() => '首页')
const homeWelcomeLabel = computed(() => globalSettingsStore.getText('home.welcome', '欢迎文字'))
const homeWelcomePlaceholder = computed(() => '欢迎使用 SunPanel')
const navHomeLabel = computed(() => globalSettingsStore.getText('nav.home', '首页导航'))
const navHomePlaceholder = computed(() => '首页')
const navAdminLabel = computed(() => globalSettingsStore.getText('nav.admin', '管理导航'))
const navAdminPlaceholder = computed(() => '管理')
const loginTitleLabel = computed(() => globalSettingsStore.getText('login.title', '登录标题'))
const loginTitlePlaceholder = computed(() => '登录')
const saveButtonText = computed(() => globalSettingsStore.getText('common.save', '保存'))
const resetButtonText = computed(() => globalSettingsStore.getText('common.reset', '重置'))
const savingText = computed(() => globalSettingsStore.getText('common.saving', '保存中...'))

const loadSettings = async () => {
  isLoading.value = true
  try {
    await globalSettingsStore.loadSettings()
    const settings = globalSettingsStore.settings

    localSettings.websiteTitle = settings?.websiteTitle || ''
    localSettings.websiteDescription = settings?.websiteDescription || ''
    localSettings.footerText = settings?.footerText || ''

    const pageTexts = settings?.pageTexts || {}
    localPageTexts.home = pageTexts.home || { title: '', welcome: '' }
    localPageTexts.nav = pageTexts.nav || { home: '', admin: '' }
    localPageTexts.login = pageTexts.login || { title: '' }
  } catch (err: any) {
    console.error('加载全局设置失败:', err)
    error.value = globalSettingsStore.getText('globalSettings.loadError', '加载失败')
    messageType.value = 'error'
  } finally {
    isLoading.value = false
  }
}

const saveSettings = async () => {
  isLoading.value = true
  error.value = ''

  try {
    await globalSettingsStore.updateSettings({
      websiteTitle: localSettings.websiteTitle,
      websiteDescription: localSettings.websiteDescription,
      footerText: localSettings.footerText,
      pageTexts: {
        home: localPageTexts.home,
        nav: localPageTexts.nav,
        login: localPageTexts.login
      }
    })
    error.value = globalSettingsStore.getText('globalSettings.saveSuccess', '设置保存成功！')
    messageType.value = 'success'
  } catch (err: any) {
    error.value = err.response?.data?.message || globalSettingsStore.getText('globalSettings.saveError', '保存失败')
    messageType.value = 'error'
  } finally {
    isLoading.value = false
    setTimeout(() => { error.value = '' }, 3000)
  }
}

const resetSettings = () => {
  if (confirm(globalSettingsStore.getText('globalSettings.resetConfirm', '确定要重置为默认设置吗？'))) {
    localSettings.websiteTitle = 'SunPanel'
    localSettings.websiteDescription = ''
    localSettings.footerText = '© 2024 SunPanel. All rights reserved.'
    localPageTexts.home = { title: '首页', welcome: '欢迎使用 SunPanel' }
    localPageTexts.nav = { home: '首页', admin: '管理' }
    localPageTexts.login = { title: '登录' }
    saveSettings()
  }
}

onMounted(() => {
  loadSettings()
})
</script>
