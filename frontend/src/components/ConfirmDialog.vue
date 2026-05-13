<template>
  <Teleport to="body">
    <Transition name="confirm-fade">
      <div 
        v-if="modelValue"
        class="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        @click.self="handleCancel"
      >
        <div 
          class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full transform transition-all duration-200"
          :class="{ 'scale-100 opacity-100': modelValue, 'scale-95 opacity-0': !modelValue }"
          @click.stop
        >
          <div class="flex items-center gap-4 mb-4">
            <div 
              class="w-12 h-12 rounded-full flex items-center justify-center"
              :class="{
                'bg-orange-100 dark:bg-orange-900/30': type === 'warning',
                'bg-red-100 dark:bg-red-900/30': type === 'danger',
                'bg-blue-100 dark:bg-blue-900/30': type === 'info'
              }"
            >
              <Icon 
                :icon="iconMap[type]" 
                class="w-6 h-6"
                :class="{
                  'text-orange-500': type === 'warning',
                  'text-red-500': type === 'danger',
                  'text-blue-500': type === 'info'
                }"
              />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">{{ title }}</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ message }}</p>
            </div>
          </div>
          
          <div class="flex justify-end gap-3 mt-6">
            <button 
              @click="handleCancel"
              class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              {{ cancelText }}
            </button>
            <button 
              @click="handleConfirm"
              class="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
              :class="{
                'bg-orange-500 hover:bg-orange-600': type === 'warning',
                'bg-red-500 hover:bg-red-600': type === 'danger',
                'bg-blue-500 hover:bg-blue-600': type === 'info'
              }"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

type ConfirmType = 'warning' | 'danger' | 'info'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: ConfirmType
}>(), {
  confirmText: '确定',
  cancelText: '取消',
  type: 'warning'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const iconMap: Record<ConfirmType, string> = {
  warning: 'ph:warning-bold',
  danger: 'ph:x-circle-bold',
  info: 'ph:info-bold'
}

const handleConfirm = () => {
  emit('confirm')
  emit('update:modelValue', false)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.confirm-fade-enter-active,
.confirm-fade-leave-active {
  transition: opacity 0.2s ease;
}

.confirm-fade-enter-from,
.confirm-fade-leave-to {
  opacity: 0;
}
</style>