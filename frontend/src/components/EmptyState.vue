<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <div class="text-6xl mb-4">{{ icon }}</div>
    <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">{{ title }}</h3>
    <p class="text-slate-500 dark:text-slate-400 mb-6">{{ description }}</p>
    <slot>
      <button 
        v-if="actionText"
        @click="$emit('action')"
        class="px-6 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
      >
        {{ actionText }}
      </button>
    </slot>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  description: string
  actionText?: string
}>()

defineEmits<{
  action: []
}>()
</script>