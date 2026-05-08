<template>
  <Transition name="fade">
    <div v-if="showWarning" class="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <svg class="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">会话即将过期</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              您的登录将在 <span class="font-medium text-orange-500">{{ formattedTime }}</span> 后过期
            </p>
          </div>
        </div>

        <p class="text-slate-600 dark:text-slate-300 mb-6">
          由于长时间未活动，为了保护您的账户安全，请选择继续操作或重新登录。
        </p>

        <div class="flex gap-3">
          <button
            @click="handleRefresh"
            :disabled="isRefreshing"
            class="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ isRefreshing ? '刷新中...' : '继续操作' }}
          </button>
          <button
            @click="handleLogout"
            class="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            重新登录
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionTimeout, formatRemainingTime } from '@/composables/useSessionTimeout'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const isRefreshing = ref(false)

const { showWarning, remainingSeconds, refreshSession } = useSessionTimeout({
  warningBeforeMinutes: 5,
  onWarning: () => {
    console.log('会话即将过期提醒')
  },
  onExpired: () => {
    router.push('/login')
  }
})

const formattedTime = computed(() => formatRemainingTime(remainingSeconds.value))

const handleRefresh = async () => {
  isRefreshing.value = true
  try {
    await refreshSession()
  } finally {
    isRefreshing.value = false
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
