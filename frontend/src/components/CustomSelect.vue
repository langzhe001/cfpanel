<script setup lang="ts">
import { ref, computed } from 'vue'

interface Option {
  value: string | number
  label: string
}

const props = defineProps<{
  modelValue: string | number
  options: Option[]
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const isOpen = ref(false)
const selectedOption = computed(() => {
  return props.options.find(opt => opt.value === props.modelValue)
})

const selectOption = (option: Option) => {
  emit('update:modelValue', option.value)
  isOpen.value = false
}

const toggleOpen = () => {
  isOpen.value = !isOpen.value
}

const close = () => {
  isOpen.value = false
}

defineExpose({
  focus: () => {}
})
</script>

<template>
  <div class="relative select-wrapper">
    <button
      type="button"
      @click="toggleOpen"
      class="w-full px-4 py-3 text-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl hover:border-slate-300 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-200 flex items-center justify-between cursor-pointer"
    >
      <span v-if="selectedOption" class="text-slate-800 dark:text-slate-200">
        {{ selectedOption.label }}
      </span>
      <span v-else class="text-slate-400 dark:text-slate-500">
        {{ placeholder || '请选择' }}
      </span>
      <svg
        class="w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden z-50"
      >
        <div
          v-for="option in options"
          :key="option.value"
          @click="selectOption(option)"
          class="px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-150 flex items-center"
          :class="{ 'bg-orange-50 dark:bg-slate-700': option.value === modelValue }"
        >
          <span
            class="text-sm"
            :class="option.value === modelValue ? 'text-orange-600 dark:text-orange-400 font-medium' : 'text-slate-700 dark:text-slate-300'"
          >
            {{ option.label }}
          </span>
          <svg
            v-if="option.value === modelValue"
            class="w-4 h-4 ml-auto text-orange-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.select-wrapper:focus-within button {
  border-color: #94a3b8;
  box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.15);
}

.dark .select-wrapper:focus-within button {
  border-color: #475569;
  box-shadow: 0 0 0 3px rgba(71, 85, 105, 0.25);
}
</style>
