<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div 
        v-if="modelValue"
        class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
        @click.self="handleClose"
      >
        <div 
          class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full"
          :class="modalSize"
          @click.stop
        >
          <div class="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <div class="flex items-center gap-2">
              <span v-if="icon" class="text-lg sm:text-xl font-bold text-orange-500">{{ icon }}</span>
              <span class="font-medium text-slate-700 dark:text-slate-200 text-sm sm:text-base">{{ title }}</span>
            </div>
            <button @click="handleClose" class="p-1 sm:p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors">
              <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="flex-1 min-h-0 overflow-hidden">
            <slot></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title: string
  icon?: string
  src?: string
  size?: 'sm' | 'md' | 'lg' | 'full'
}>(), {
  size: 'lg'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const modalSize = computed(() => {
  if (typeof window === 'undefined') {
    if (props.size === 'sm') return 'w-full max-w-md'
    if (props.size === 'md') return 'w-full max-w-lg'
    if (props.size === 'full') return 'w-full h-full rounded-none'
    return 'w-[85%] max-w-7xl'
  }
  
  const width = window.innerWidth
  
  if (props.size === 'sm') {
    return width < 640 ? 'w-full' : 'w-full max-w-md'
  }
  
  if (props.size === 'md') {
    return width < 640 ? 'w-full' : 'w-full max-w-lg'
  }
  
  if (props.size === 'full') {
    return 'w-full h-full rounded-none'
  }
  
  if (width < 640) return 'w-full h-full rounded-none'
  if (width < 768) return 'w-[95%] h-[90%]'
  if (width < 1024) return 'w-[90%] h-[85%]'
  if (width < 1280) return 'w-[88%] h-[82%]'
  return 'w-[85%] h-[80%] max-w-7xl'
})

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.modelValue) {
    handleClose()
  }
}

watch(() => props.modelValue, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active > div,
.modal-fade-leave-active > div {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-fade-enter-from > div,
.modal-fade-leave-to > div {
  transform: scale(0.95);
  opacity: 0;
}
</style>