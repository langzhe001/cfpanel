import { computed, toRef } from 'vue'
import { useGlobalSettingsStore } from '@/stores/globalSettings'

export const useI18n = () => {
  const globalSettingsStore = useGlobalSettingsStore()

  const t = (key: string, fallback?: string): string => {
    return globalSettingsStore.getText(key, fallback || key)
  }

  const currentLanguage = computed(() => globalSettingsStore.currentLanguage)

  const availableLanguages = [
    { code: 'zh-CN', name: '简体中文' },
    { code: 'en-US', name: 'English' },
    { code: 'ja-JP', name: '日本語' },
    { code: 'ko-KR', name: '한국어' }
  ]

  const changeLanguage = async (language: string) => {
    await globalSettingsStore.setLanguage(language)
  }

  return {
    t,
    currentLanguage,
    availableLanguages,
    changeLanguage,
    websiteTitle: computed(() => globalSettingsStore.websiteTitle),
    websiteDescription: computed(() => globalSettingsStore.websiteDescription),
    footerText: computed(() => globalSettingsStore.footerText),
    settings: toRef(globalSettingsStore, 'settings')
  }
}

export const usePageTexts = () => {
  const globalSettingsStore = useGlobalSettingsStore()

  const pageTexts = computed(() => {
    return globalSettingsStore.settings?.pageTexts || {}
  })

  const home = computed(() => {
    return (pageTexts.value as any)?.home || {}
  })

  const nav = computed(() => {
    return (pageTexts.value as any)?.nav || {}
  })

  const admin = computed(() => {
    return (pageTexts.value as any)?.admin || {}
  })

  const login = computed(() => {
    return (pageTexts.value as any)?.login || {}
  })

  const settingsPage = computed(() => {
    return (pageTexts.value as any)?.settings || {}
  })

  return {
    pageTexts,
    home,
    nav,
    admin,
    login,
    settings: settingsPage
  }
}
