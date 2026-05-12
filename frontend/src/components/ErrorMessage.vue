<template>
  <div 
    class="p-4 rounded-xl border transition-all duration-300"
    :class="[
      show ? 'opacity-100' : 'opacity-0',
      type === 'error' 
        ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800' 
        : 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800'
    ]"
  >
    <div class="flex items-start gap-3">
      <svg 
        v-if="type === 'error'"
        class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <svg 
        v-else
        class="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div class="flex-1">
        <p :class="type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'">
          {{ message }}
        </p>
        <p v-if="details" class="text-sm text-slate-500 mt-1">{{ details }}</p>
      </div>
      <button 
        v-if="closable"
        @click="$emit('close')" 
        class="p-1 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded transition-colors"
      >
        <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <button 
      v-if="retry"
      @click="$emit('retry')"
      class="mt-3 px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
    >
      重试
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string
  type?: 'error' | 'warning'
  details?: string
  closable?: boolean
  retry?: boolean
  show?: boolean
}>()

defineEmits<{
  close: []
  retry: []
}>()
</script>