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
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">{{ pageTitle }}</h3>
          <div class="flex items-center gap-3">
            <label class="text-sm font-medium text-slate-600 dark:text-slate-400">{{ languageLabel }}:</label>
            <select
              v-model="currentLanguage"
              @change="onLanguageChange"
              class="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            >
              <option v-for="lang in configuredLanguages" :key="lang.code" :value="lang.code">
                {{ lang.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
      <div class="p-6 space-y-6">
        <!-- 中文表单 -->
        <div v-if="currentLanguage === 'zh-CN'">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ websiteTitleLabel }}</label>
            <input
              v-model="languageForms['zh-CN'].websiteTitle"
              type="text"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
              :disabled="isLoading"
              :placeholder="websiteTitlePlaceholder"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ websiteDescriptionLabel }}</label>
            <textarea
              v-model="languageForms['zh-CN'].websiteDescription"
              rows="3"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
              :disabled="isLoading"
              :placeholder="websiteDescriptionPlaceholder"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ footerTextLabel }}</label>
            <input
              v-model="languageForms['zh-CN'].footerText"
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
                  v-model="languageForms['zh-CN'].pageTexts.home.title"
                  type="text"
                  class="flex-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  :placeholder="homeTitlePlaceholder"
                />
              </div>
              <div class="flex items-center gap-2">
                <span class="text-slate-500 dark:text-slate-400 w-32">{{ homeWelcomeLabel }}:</span>
                <input
                  v-model="languageForms['zh-CN'].pageTexts.home.welcome"
                  type="text"
                  class="flex-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  :placeholder="homeWelcomePlaceholder"
                />
              </div>
              <div class="flex items-center gap-2">
                <span class="text-slate-500 dark:text-slate-400 w-32">{{ navHomeLabel }}:</span>
                <input
                  v-model="languageForms['zh-CN'].pageTexts.nav.home"
                  type="text"
                  class="flex-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  :placeholder="navHomePlaceholder"
                />
              </div>
              <div class="flex items-center gap-2">
                <span class="text-slate-500 dark:text-slate-400 w-32">{{ navAdminLabel }}:</span>
                <input
                  v-model="languageForms['zh-CN'].pageTexts.nav.admin"
                  type="text"
                  class="flex-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  :placeholder="navAdminPlaceholder"
                />
              </div>
              <div class="flex items-center gap-2">
                <span class="text-slate-500 dark:text-slate-400 w-32">{{ loginTitleLabel }}:</span>
                <input
                  v-model="languageForms['zh-CN'].pageTexts.login.title"
                  type="text"
                  class="flex-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  :placeholder="loginTitlePlaceholder"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 英文表单 -->
        <div v-if="currentLanguage === 'en-US'">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ websiteTitleLabel }}</label>
            <input
              v-model="languageForms['en-US'].websiteTitle"
              type="text"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
              :disabled="isLoading"
              :placeholder="websiteTitlePlaceholder"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ websiteDescriptionLabel }}</label>
            <textarea
              v-model="languageForms['en-US'].websiteDescription"
              rows="3"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
              :disabled="isLoading"
              :placeholder="websiteDescriptionPlaceholder"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ footerTextLabel }}</label>
            <input
              v-model="languageForms['en-US'].footerText"
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
                  v-model="languageForms['en-US'].pageTexts.home.title"
                  type="text"
                  class="flex-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  :placeholder="homeTitlePlaceholder"
                />
              </div>
              <div class="flex items-center gap-2">
                <span class="text-slate-500 dark:text-slate-400 w-32">{{ homeWelcomeLabel }}:</span>
                <input
                  v-model="languageForms['en-US'].pageTexts.home.welcome"
                  type="text"
                  class="flex-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  :placeholder="homeWelcomePlaceholder"
                />
              </div>
              <div class="flex items-center gap-2">
                <span class="text-slate-500 dark:text-slate-400 w-32">{{ navHomeLabel }}:</span>
                <input
                  v-model="languageForms['en-US'].pageTexts.nav.home"
                  type="text"
                  class="flex-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  :placeholder="navHomePlaceholder"
                />
              </div>
              <div class="flex items-center gap-2">
                <span class="text-slate-500 dark:text-slate-400 w-32">{{ navAdminLabel }}:</span>
                <input
                  v-model="languageForms['en-US'].pageTexts.nav.admin"
                  type="text"
                  class="flex-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  :placeholder="navAdminPlaceholder"
                />
              </div>
              <div class="flex items-center gap-2">
                <span class="text-slate-500 dark:text-slate-400 w-32">{{ loginTitleLabel }}:</span>
                <input
                  v-model="languageForms['en-US'].pageTexts.login.title"
                  type="text"
                  class="flex-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  :placeholder="loginTitlePlaceholder"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 日文表单 -->
        <div v-if="currentLanguage === 'ja-JP'">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ websiteTitleLabel }}</label>
            <input
              v-model="languageForms['ja-JP'].websiteTitle"
              type="text"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
              :disabled="isLoading"
              :placeholder="websiteTitlePlaceholder"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ websiteDescriptionLabel }}</label>
            <textarea
              v-model="languageForms['ja-JP'].websiteDescription"
              rows="3"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
              :disabled="isLoading"
              :placeholder="websiteDescriptionPlaceholder"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ footerTextLabel }}</label>
            <input
              v-model="languageForms['ja-JP'].footerText"
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
                  v-model="languageForms['ja-JP'].pageTexts.home.title"
                  type="text"
                  class="flex-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  :placeholder="homeTitlePlaceholder"
                />
              </div>
              <div class="flex items-center gap-2">
                <span class="text-slate-500 dark:text-slate-400 w-32">{{ homeWelcomeLabel }}:</span>
                <input
                  v-model="languageForms['ja-JP'].pageTexts.home.welcome"
                  type="text"
                  class="flex-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  :placeholder="homeWelcomePlaceholder"
                />
              </div>
              <div class="flex items-center gap-2">
                <span class="text-slate-500 dark:text-slate-400 w-32">{{ navHomeLabel }}:</span>
                <input
                  v-model="languageForms['ja-JP'].pageTexts.nav.home"
                  type="text"
                  class="flex-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  :placeholder="navHomePlaceholder"
                />
              </div>
              <div class="flex items-center gap-2">
                <span class="text-slate-500 dark:text-slate-400 w-32">{{ navAdminLabel }}:</span>
                <input
                  v-model="languageForms['ja-JP'].pageTexts.nav.admin"
                  type="text"
                  class="flex-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  :placeholder="navAdminPlaceholder"
                />
              </div>
              <div class="flex items-center gap-2">
                <span class="text-slate-500 dark:text-slate-400 w-32">{{ loginTitleLabel }}:</span>
                <input
                  v-model="languageForms['ja-JP'].pageTexts.login.title"
                  type="text"
                  class="flex-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  :placeholder="loginTitlePlaceholder"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 韩文表单 -->
        <div v-if="currentLanguage === 'ko-KR'">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ websiteTitleLabel }}</label>
            <input
              v-model="languageForms['ko-KR'].websiteTitle"
              type="text"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
              :disabled="isLoading"
              :placeholder="websiteTitlePlaceholder"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ websiteDescriptionLabel }}</label>
            <textarea
              v-model="languageForms['ko-KR'].websiteDescription"
              rows="3"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
              :disabled="isLoading"
              :placeholder="websiteDescriptionPlaceholder"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ footerTextLabel }}</label>
            <input
              v-model="languageForms['ko-KR'].footerText"
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
                  v-model="languageForms['ko-KR'].pageTexts.home.title"
                  type="text"
                  class="flex-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  :placeholder="homeTitlePlaceholder"
                />
              </div>
              <div class="flex items-center gap-2">
                <span class="text-slate-500 dark:text-slate-400 w-32">{{ homeWelcomeLabel }}:</span>
                <input
                  v-model="languageForms['ko-KR'].pageTexts.home.welcome"
                  type="text"
                  class="flex-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  :placeholder="homeWelcomePlaceholder"
                />
              </div>
              <div class="flex items-center gap-2">
                <span class="text-slate-500 dark:text-slate-400 w-32">{{ navHomeLabel }}:</span>
                <input
                  v-model="languageForms['ko-KR'].pageTexts.nav.home"
                  type="text"
                  class="flex-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  :placeholder="navHomePlaceholder"
                />
              </div>
              <div class="flex items-center gap-2">
                <span class="text-slate-500 dark:text-slate-400 w-32">{{ navAdminLabel }}:</span>
                <input
                  v-model="languageForms['ko-KR'].pageTexts.nav.admin"
                  type="text"
                  class="flex-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  :placeholder="navAdminPlaceholder"
                />
              </div>
              <div class="flex items-center gap-2">
                <span class="text-slate-500 dark:text-slate-400 w-32">{{ loginTitleLabel }}:</span>
                <input
                  v-model="languageForms['ko-KR'].pageTexts.login.title"
                  type="text"
                  class="flex-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  :placeholder="loginTitlePlaceholder"
                />
              </div>
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
import { reactive, ref, computed, onMounted } from 'vue'
import { useGlobalSettingsStore } from '@/stores/globalSettings'
import { globalSettingsApi } from '@/api'
import { usePageTexts } from '@/composables/useI18n'
import { eventBus, EVENTS } from '@/composables/useEventBus'
import ErrorMessage from '@/components/ErrorMessage.vue'

const globalSettingsStore = useGlobalSettingsStore()
const { t } = usePageTexts()

const isLoading = ref(false)
const error = ref('')
const messageType = ref<'success' | 'error'>('success')

// 为每种语言创建独立的表单
const languageForms = reactive({
  'zh-CN': {
    websiteTitle: '',
    websiteDescription: '',
    footerText: '',
    pageTexts: {
      home: { title: '', welcome: '' },
      nav: { home: '', admin: '' },
      login: { title: '' }
    }
  },
  'en-US': {
    websiteTitle: '',
    websiteDescription: '',
    footerText: '',
    pageTexts: {
      home: { title: '', welcome: '' },
      nav: { home: '', admin: '' },
      login: { title: '' }
    }
  },
  'ja-JP': {
    websiteTitle: '',
    websiteDescription: '',
    footerText: '',
    pageTexts: {
      home: { title: '', welcome: '' },
      nav: { home: '', admin: '' },
      login: { title: '' }
    }
  },
  'ko-KR': {
    websiteTitle: '',
    websiteDescription: '',
    footerText: '',
    pageTexts: {
      home: { title: '', welcome: '' },
      nav: { home: '', admin: '' },
      login: { title: '' }
    }
  }
})

const currentLanguage = ref('zh-CN')
const configuredLanguages = ref<Array<{ code: string; name: string }>>([
  { code: 'zh-CN', name: '中文 (Chinese)' },
  { code: 'en-US', name: 'English (英文)' },
  { code: 'ja-JP', name: '日本語 (Japanese)' },
  { code: 'ko-KR', name: '한국어 (Korean)' }
])

// 界面翻译保持固定
const languageLabel = computed(() => t('globalSettings.language'))
const pageTitle = computed(() => t('admin.settings'))
const websiteTitleLabel = computed(() => t('globalSettings.websiteTitle'))
const websiteTitlePlaceholder = computed(() => t('globalSettings.websiteTitlePlaceholder'))
const websiteDescriptionLabel = computed(() => t('globalSettings.websiteDescription'))
const websiteDescriptionPlaceholder = computed(() => t('globalSettings.websiteDescriptionPlaceholder'))
const footerTextLabel = computed(() => t('globalSettings.footerText'))
const footerTextPlaceholder = computed(() => t('globalSettings.footerTextPlaceholder'))
const pageTextsLabel = computed(() => t('globalSettings.pageTexts'))
const homeTitleLabel = computed(() => t('home.title'))
const homeTitlePlaceholder = computed(() => t('home.title'))
const homeWelcomeLabel = computed(() => t('home.welcome'))
const homeWelcomePlaceholder = computed(() => t('home.welcome'))
const navHomeLabel = computed(() => t('nav.home'))
const navHomePlaceholder = computed(() => t('nav.home'))
const navAdminLabel = computed(() => t('nav.admin'))
const navAdminPlaceholder = computed(() => t('nav.admin'))
const loginTitleLabel = computed(() => t('login.title'))
const loginTitlePlaceholder = computed(() => t('login.title'))
const saveButtonText = computed(() => t('common.save'))
const resetButtonText = computed(() => t('common.reset'))
const savingText = computed(() => t('common.saving'))

const loadConfiguredLanguages = async () => {
  try {
    const res = await globalSettingsApi.getAll()
    if (res.data && res.data.length > 0) {
      configuredLanguages.value = res.data.map(lang => ({
        code: lang.language,
        name: getLanguageDisplayName(lang.language)
      }))
    }
  } catch (err) {
    console.error('加载语言列表失败:', err)
  }
}

const getLanguageDisplayName = (code: string) => {
  const names: Record<string, string> = {
    'zh-CN': '中文 (Chinese)',
    'en-US': 'English (英文)',
    'ja-JP': '日本語 (Japanese)',
    'ko-KR': '한국어 (Korean)'
  }
  return names[code] || code
}

const loadAllLanguageSettings = async () => {
  isLoading.value = true
  try {
    // 加载所有语言的设置
    for (const lang of configuredLanguages.value) {
      try {
        const res = await globalSettingsApi.get(lang.code, true)
        if (res.data) {
          languageForms[lang.code as keyof typeof languageForms] = {
            websiteTitle: res.data.websiteTitle || '',
            websiteDescription: res.data.websiteDescription || '',
            footerText: res.data.footerText || '',
            pageTexts: {
              home: res.data.pageTexts?.home || { title: '', welcome: '' },
              nav: res.data.pageTexts?.nav || { home: '', admin: '' },
              login: res.data.pageTexts?.login || { title: '' }
            }
          }
        }
      } catch (err) {
        console.warn(`加载 ${lang.code} 设置失败，使用默认值`)
      }
    }
  } finally {
    isLoading.value = false
  }
}

const onLanguageChange = () => {
  // 语言切换时不需要保存，只是显示对应语言的表单
  console.log('切换到语言:', currentLanguage.value)
}

const saveSettings = async () => {
  isLoading.value = true
  error.value = ''

  try {
    // 保存当前选择的语言的设置
    const formData = languageForms[currentLanguage.value as keyof typeof languageForms]
    await globalSettingsApi.update({
      language: currentLanguage.value,
      websiteTitle: formData.websiteTitle,
      websiteDescription: formData.websiteDescription,
      footerText: formData.footerText,
      pageTexts: formData.pageTexts
    })

    // 更新 store 以便前台立即看到变化
    globalSettingsStore.settings = {
      ...globalSettingsStore.settings,
      language: currentLanguage.value,
      websiteTitle: formData.websiteTitle,
      websiteDescription: formData.websiteDescription,
      footerText: formData.footerText,
      pageTexts: formData.pageTexts
    }

    // 触发事件通知其他组件刷新翻译
    eventBus.emit(EVENTS.GLOBAL_SETTINGS_CHANGED, globalSettingsStore.settings)

    error.value = t('globalSettings.saveSuccess', '设置保存成功！')
    messageType.value = 'success'
  } catch (err: any) {
    error.value = err.response?.data?.message || t('globalSettings.saveError', '保存失败')
    messageType.value = 'error'
  } finally {
    isLoading.value = false
    setTimeout(() => { error.value = '' }, 3000)
  }
}

const resetSettings = () => {
  if (confirm(t('globalSettings.resetConfirm', '确定要重置为默认设置吗？'))) {
    const formData = languageForms[currentLanguage.value as keyof typeof languageForms]
    formData.websiteTitle = 'SunPanel'
    formData.websiteDescription = ''
    formData.footerText = '© 2024 SunPanel. All rights reserved.'
    formData.pageTexts.home = { title: '首页', welcome: '欢迎使用 SunPanel' }
    formData.pageTexts.nav = { home: '首页', admin: '管理' }
    formData.pageTexts.login = { title: '登录' }
    saveSettings()
  }
}

onMounted(async () => {
  // 默认显示中文，但优先使用用户设置的语言
  currentLanguage.value = globalSettingsStore.currentLanguage || 'zh-CN'

  // 先加载全局设置到 store（强制刷新）
  await globalSettingsStore.loadSettings(currentLanguage.value, true)

  // 然后加载所有语言的表单数据
  await loadConfiguredLanguages()
  await loadAllLanguageSettings()
})
</script>
