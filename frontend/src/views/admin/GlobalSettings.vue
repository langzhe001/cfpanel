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
        <!-- 中文表单 -->
        <div v-if="currentLanguage === 'zh-CN'">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ websiteTitleLabel }}</label>
            <input
              v-model="languageForms['zh-CN'].websiteTitle"
              type="text"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-400 outline-none"
              :disabled="isLoading"
              :placeholder="websiteTitlePlaceholder"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ websiteDescriptionLabel }}</label>
            <textarea
              v-model="languageForms['zh-CN'].websiteDescription"
              rows="3"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-400 outline-none"
              :disabled="isLoading"
              :placeholder="websiteDescriptionPlaceholder"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ footerTextLabel }}</label>
            <input
              v-model="languageForms['zh-CN'].footerText"
              type="text"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-400 outline-none"
              :disabled="isLoading"
              :placeholder="footerTextPlaceholder"
            />
          </div>
        </div>

        <!-- 英文表单 -->
        <div v-if="currentLanguage === 'en-US'">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ websiteTitleLabel }}</label>
            <input
              v-model="languageForms['en-US'].websiteTitle"
              type="text"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-400 outline-none"
              :disabled="isLoading"
              :placeholder="websiteTitlePlaceholder"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ websiteDescriptionLabel }}</label>
            <textarea
              v-model="languageForms['en-US'].websiteDescription"
              rows="3"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-400 outline-none"
              :disabled="isLoading"
              :placeholder="websiteDescriptionPlaceholder"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ footerTextLabel }}</label>
            <input
              v-model="languageForms['en-US'].footerText"
              type="text"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-400 outline-none"
              :disabled="isLoading"
              :placeholder="footerTextPlaceholder"
            />
          </div>
        </div>

        <!-- 日文表单 -->
        <div v-if="currentLanguage === 'ja-JP'">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ websiteTitleLabel }}</label>
            <input
              v-model="languageForms['ja-JP'].websiteTitle"
              type="text"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-400 outline-none"
              :disabled="isLoading"
              :placeholder="websiteTitlePlaceholder"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ websiteDescriptionLabel }}</label>
            <textarea
              v-model="languageForms['ja-JP'].websiteDescription"
              rows="3"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-400 outline-none"
              :disabled="isLoading"
              :placeholder="websiteDescriptionPlaceholder"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ footerTextLabel }}</label>
            <input
              v-model="languageForms['ja-JP'].footerText"
              type="text"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-400 outline-none"
              :disabled="isLoading"
              :placeholder="footerTextPlaceholder"
            />
          </div>
        </div>

        <!-- 韩文表单 -->
        <div v-if="currentLanguage === 'ko-KR'">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ websiteTitleLabel }}</label>
            <input
              v-model="languageForms['ko-KR'].websiteTitle"
              type="text"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-400 outline-none"
              :disabled="isLoading"
              :placeholder="websiteTitlePlaceholder"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ websiteDescriptionLabel }}</label>
            <textarea
              v-model="languageForms['ko-KR'].websiteDescription"
              rows="3"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-400 outline-none"
              :disabled="isLoading"
              :placeholder="websiteDescriptionPlaceholder"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ footerTextLabel }}</label>
            <input
              v-model="languageForms['ko-KR'].footerText"
              type="text"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-400 outline-none"
              :disabled="isLoading"
              :placeholder="footerTextPlaceholder"
            />
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
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'
import { useGlobalSettingsStore } from '@/stores/globalSettings'
import { globalSettingsApi } from '@/api'
import { usePageTexts } from '@/composables/useI18n'
import { eventBus, EVENTS, useCrossFrameSync } from '@/composables/useEventBus'
import ErrorMessage from '@/components/ErrorMessage.vue'

const globalSettingsStore = useGlobalSettingsStore()
const { t } = usePageTexts()
const { broadcastChange, listenForChanges } = useCrossFrameSync()

// 监听跨窗口/标签页的设置变更
let unsubscribe: (() => void) | null = null

// 同页面事件监听回调
const handleSettingsChanged = (newSettings: any) => {
  console.log('[GlobalSettings] 收到设置变更通知，更新表单数据')
  if (newSettings && newSettings.language) {
    const lang = newSettings.language as keyof typeof languageForms
    if (languageForms[lang]) {
      languageForms[lang].websiteTitle = newSettings.websiteTitle || ''
      languageForms[lang].websiteDescription = newSettings.websiteDescription || ''
      languageForms[lang].footerText = newSettings.footerText || ''
    }
  }
}

const isLoading = ref(false)
const error = ref('')
const messageType = ref<'success' | 'error'>('success')

// 为每种语言创建独立的表单
const languageForms = reactive({
  'zh-CN': {
    websiteTitle: '',
    websiteDescription: '',
    footerText: ''
  },
  'en-US': {
    websiteTitle: '',
    websiteDescription: '',
    footerText: ''
  },
  'ja-JP': {
    websiteTitle: '',
    websiteDescription: '',
    footerText: ''
  },
  'ko-KR': {
    websiteTitle: '',
    websiteDescription: '',
    footerText: ''
  }
})

const currentLanguage = ref('zh-CN')

const configuredLanguages = ref<Array<{ code: string; name: string }>>([
  { code: 'zh-CN', name: '中文 (Chinese)' },
  { code: 'en-US', name: 'English (英文)' },
  { code: 'ja-JP', name: '日本語 (Japanese)' },
  { code: 'ko-KR', name: '한국어 (Korean)' }
])

const pageTitle = computed(() => t('admin.settings'))
const websiteTitleLabel = computed(() => t('globalSettings.websiteTitle'))
const websiteTitlePlaceholder = computed(() => t('globalSettings.websiteTitlePlaceholder'))
const websiteDescriptionLabel = computed(() => t('globalSettings.websiteDescription'))
const websiteDescriptionPlaceholder = computed(() => t('globalSettings.websiteDescriptionPlaceholder'))
const footerTextLabel = computed(() => t('globalSettings.footerText'))
const footerTextPlaceholder = computed(() => t('globalSettings.footerTextPlaceholder'))
const saveButtonText = computed(() => t('common.save'))
const resetButtonText = computed(() => t('common.reset'))
const savingText = computed(() => t('common.saving'))

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
            footerText: res.data.footerText || ''
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



const saveSettings = async () => {
  isLoading.value = true
  error.value = ''

  try {
    // 保存当前选择的语言的设置
    const formData = languageForms[currentLanguage.value as keyof typeof languageForms]
    
    // 使用 store 的 updateSettings 方法来更新设置（与其他设置保持一致）
    await globalSettingsStore.updateSettings({
      language: currentLanguage.value,
      websiteTitle: formData.websiteTitle,
      websiteDescription: formData.websiteDescription,
      footerText: formData.footerText
    })

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
    saveSettings()
  }
}

onMounted(async () => {
  // 默认显示中文，但优先使用用户设置的语言
  currentLanguage.value = globalSettingsStore.currentLanguage || 'zh-CN'

  // 先加载全局设置到 store（强制刷新）
  await globalSettingsStore.loadSettings(currentLanguage.value, true)

  // 然后加载所有语言的表单数据
  await loadAllLanguageSettings()

  // 监听同页面内的设置变更事件
  eventBus.on(EVENTS.GLOBAL_SETTINGS_CHANGED, handleSettingsChanged)

  // 监听跨窗口/标签页的设置变更
  unsubscribe = listenForChanges(EVENTS.GLOBAL_SETTINGS_CHANGED, handleSettingsChanged)
})

onUnmounted(() => {
  // 取消同页面事件监听
  eventBus.off(EVENTS.GLOBAL_SETTINGS_CHANGED, handleSettingsChanged)
  
  // 取消跨窗口事件监听
  if (unsubscribe) {
    unsubscribe()
    unsubscribe = null
  }
})
</script>
