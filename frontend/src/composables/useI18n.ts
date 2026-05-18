import { computed, toRef } from 'vue'
import { useGlobalSettingsStore } from '@/stores/globalSettings'

export interface PageTexts {
  home: {
    welcome?: string
    searchPlaceholder?: string
    addFirstGroup?: string
    goAdmin?: string
    loginToConfigure?: string
  }
  nav: {
    admin?: string
    logout?: string
    backToHome?: string
    home?: string
  }
  admin: {
    dashboard?: string
    profile?: string
    personalization?: string
    groups?: string
    gallery?: string
    settings?: string
    users?: string
    api?: string
    openAPI?: string
    about?: string
    migration?: string
    dataMigration?: string
    publicGallery?: string
    exportImport?: string
    user?: string
    management?: string
    confirmClose?: string
    closeConfirm?: string
  }
  login: {
    username?: string
    password?: string
    nickname?: string
    confirmPassword?: string
    submit?: string
    register?: string
    loading?: string
    haveAccount?: string
    noAccount?: string
    backToHome?: string
  }
  profile: {
    title?: string
    username?: string
    nickname?: string
    email?: string
    language?: string
    save?: string
    cancel?: string
    password?: string
    currentPassword?: string
    newPassword?: string
    confirmNewPassword?: string
    changePassword?: string
    uploading?: string
    uploadSuccess?: string
    uploadError?: string
    saveSuccess?: string
  }
  groups: {
    title?: string
    addGroup?: string
    editGroup?: string
    deleteConfirm?: string
    name?: string
    icon?: string
    websites?: string
    noGroups?: string
    addFirstGroup?: string
    websiteTitle?: string
    addWebsite?: string
    editWebsite?: string
    deleteWebsiteConfirm?: string
    url?: string
    description?: string
    color?: string
    group?: string
    openInNewTab?: string
    showAsWindow?: string
    noWebsites?: string
    addFirstWebsite?: string
  }
  dashboard: {
    title?: string
    groupCount?: string
    websiteCount?: string
    imageCount?: string
    userCount?: string
    quickActions?: string
    recentWebsites?: string
    recentGroups?: string
    noWebsites?: string
    noGroups?: string
    addGroup?: string
    addWebsite?: string
    uploadImage?: string
    changeTheme?: string
    exportData?: string
    viewApi?: string
  }
  globalSettings: {
    title?: string
    websiteTitle?: string
    websiteDescription?: string
    language?: string
    footerText?: string
    save?: string
    resetCache?: string
    cacheResetSuccess?: string
  }
  common: {
    cancel?: string
    save?: string
    delete?: string
    edit?: string
    add?: string
    loading?: string
    error?: string
    success?: string
    confirm?: string
    yes?: string
    no?: string
    search?: string
    submit?: string
    close?: string
    refresh?: string
    retry?: string
  }
}

export const useI18n = () => {
  const globalSettingsStore = useGlobalSettingsStore()

  const t = (key: string, fallback?: string): string => {
    return globalSettingsStore.getText(key, fallback || key)
  }

  const currentLanguage = computed(() => globalSettingsStore.currentLanguage)

  const availableLanguages = [
    { code: 'zh-CN', name: '简体中文', native: '简体中文' },
    { code: 'en-US', name: 'English', native: 'English' },
    { code: 'ja-JP', name: 'Japanese', native: '日本語' },
    { code: 'ko-KR', name: 'Korean', native: '한국어' }
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

  const t = (key: string, fallback?: string): string => {
    return globalSettingsStore.getText(key, fallback || key)
  }

  const pageTexts = computed<PageTexts>(() => {
    return globalSettingsStore.settings?.pageTexts || {} as PageTexts
  })

  const home = computed(() => pageTexts.value.home || {})
  const nav = computed(() => pageTexts.value.nav || {})
  const admin = computed(() => pageTexts.value.admin || {})
  const login = computed(() => pageTexts.value.login || {})
  const profile = computed(() => pageTexts.value.profile || {})
  const groups = computed(() => pageTexts.value.groups || {})
  const dashboard = computed(() => pageTexts.value.dashboard || {})
  const globalSettings = computed(() => pageTexts.value.globalSettings || {})
  const common = computed(() => pageTexts.value.common || {})

  return {
    t,
    pageTexts,
    home,
    nav,
    admin,
    login,
    profile,
    groups,
    dashboard,
    globalSettings,
    common
  }
}

export const useCommonTexts = () => {
  const { common } = usePageTexts()
  return computed(() => ({
    cancel: common.value.cancel || '取消',
    save: common.value.save || '保存',
    delete: common.value.delete || '删除',
    edit: common.value.edit || '编辑',
    add: common.value.add || '添加',
    loading: common.value.loading || '加载中...',
    error: common.value.error || '发生错误',
    success: common.value.success || '操作成功',
    confirm: common.value.confirm || '确认',
    yes: common.value.yes || '是',
    no: common.value.no || '否',
    search: common.value.search || '搜索',
    submit: common.value.submit || '提交',
    close: common.value.close || '关闭',
    refresh: common.value.refresh || '刷新',
    retry: common.value.retry || '重试'
  }))
}