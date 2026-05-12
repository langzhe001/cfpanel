<template>
  <div :class="{ dark: isDark }">
    <router-view v-if="settingsLoaded" />
    <div v-else class="min-h-screen flex items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-slate-500 dark:text-slate-400">加载设置中...</p>
      </div>
    </div>
    <SessionWarning />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'
import SessionWarning from '@/components/SessionWarning.vue'

const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const settingsLoaded = ref(false)

const isDark = computed(() => settingsStore.theme === 'dark')

onMounted(async () => {
  await settingsStore.loadSettings()
  if (authStore.token) {
    await authStore.fetchUser()
  }
  settingsLoaded.value = true
})
</script>
