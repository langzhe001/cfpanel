<template>
  <div :class="{ dark: isDark }">
    <router-view v-if="appReady" />
    <div v-else class="min-h-screen flex items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    </div>
    <SessionWarning />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'
import { useGlobalSettingsStore } from '@/stores/globalSettings'
import SessionWarning from '@/components/SessionWarning.vue'

const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const globalSettingsStore = useGlobalSettingsStore()
const appReady = ref(false)

const isDark = computed(() => settingsStore.theme === 'dark')

const updatePageTitle = (title: string) => {
  if (typeof window !== 'undefined' && (window as any).__UPDATE_PAGE_TITLE__) {
    (window as any).__UPDATE_PAGE_TITLE__(title)
  }
}

const initApp = async () => {
  const timestamp = Date.now()
  console.log(`[APP] ${timestamp} - App 组件挂载开始`)

  try {
    console.log(`[APP] ${timestamp} - 开始加载全局设置(多语言)`)
    await globalSettingsStore.loadSettings()
    console.log(`[APP] ${timestamp} - 全局设置加载完成:`, globalSettingsStore.websiteTitle)

    updatePageTitle(globalSettingsStore.websiteTitle)

    console.log(`[APP] ${timestamp} - 开始加载用户设置`)
    await settingsStore.loadSettings()
    console.log(`[APP] ${timestamp} - 用户设置加载完成`)

    const hasToken = !!authStore.getToken()
    console.log(`[APP] ${timestamp} - 检查会话状态:`, { hasToken, isSessionValid: authStore.isSessionValid() })

    if (authStore.isSessionValid()) {
      console.log(`[APP] ${timestamp} - 会话有效，开始获取用户信息`)
      const user = await authStore.fetchUser()
      console.log(`[APP] ${timestamp} - 用户信息获取完成`)

      if (user && user.language) {
        console.log(`[APP] ${timestamp} - 用户语言设置: ${user.language}`)
        await globalSettingsStore.loadSettingsByUserLanguage(user.language)
        console.log(`[APP] ${timestamp} - 根据用户语言重新加载全局设置完成`)
        updatePageTitle(globalSettingsStore.websiteTitle)
      }
    }

    console.log(`[APP] ${timestamp} - App 组件挂载完成`)
  } catch (err) {
    console.error(`[APP] ${timestamp} - App 挂载过程出错:`, err)
  } finally {
    appReady.value = true
  }
}

onMounted(() => {
  initApp()
})
</script>
