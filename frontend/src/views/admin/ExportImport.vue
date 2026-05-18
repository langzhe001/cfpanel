<template>
  <div class="space-y-6">
    <ErrorMessage
      v-if="error"
      :message="error"
      type="error"
      :closable="true"
      @close="error = ''"
    />
    <div 
      v-if="showSuccess" 
      class="p-4 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800"
    >
      <div class="flex items-center gap-3">
        <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <p class="text-green-600 dark:text-green-400">{{ successMessage }}</p>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div class="p-6 border-b border-slate-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">{{ t('admin.exportData') || '导出数据' }}</h3>
      </div>
      <div class="p-6">
        <p class="text-slate-600 dark:text-slate-400 mb-4">{{ t('admin.exportDescription') || '导出您的所有配置数据，包括分组、网站和设置。' }}</p>
        <button 
          @click="exportData" 
          :disabled="isExporting"
          class="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2 disabled:opacity-50"
        >
          <Icon icon="ph:download-bold" class="w-5 h-5" />
          {{ isExporting ? (t('admin.exporting') || '导出中...') : (t('admin.exportConfig') || '导出配置') }}
        </button>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div class="p-6 border-b border-slate-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">{{ t('admin.importData') || '导入数据' }}</h3>
      </div>
      <div class="p-6">
        <p class="text-slate-600 dark:text-slate-400 mb-4">{{ t('admin.importDescription') || '从之前导出的备份文件中恢复配置。' }}</p>
        <label class="px-6 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer flex items-center gap-2 inline-flex">
          <Icon icon="ph:upload-bold" class="w-5 h-5" />
          {{ t('admin.selectFile') || '选择文件' }}
          <input type="file" accept=".json" @change="handleImport" class="hidden" :disabled="isImporting" />
        </label>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div class="p-6 border-b border-slate-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">{{ t('admin.importInstructions') || '导入说明' }}</h3>
      </div>
      <div class="p-6 text-slate-600 dark:text-slate-400 space-y-2 text-sm">
        <p>{{ t('admin.supportJson') || '• 支持导入 .json 格式的备份文件' }}</p>
        <p>{{ t('admin.importOverwrite') || '• 导入将覆盖现有配置，请谨慎操作' }}</p>
        <p>{{ t('admin.backupBeforeImport') || '• 建议在导入前先导出当前配置作为备份' }}</p>
        <p>{{ t('admin.imagesSeparate') || '• 图片文件需要单独上传' }}</p>
      </div>
    </div>

    <div v-if="showConfirmModal" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md p-6">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">{{ t('admin.confirmImport') || '确认导入' }}</h3>
        <p class="text-slate-600 dark:text-slate-400 mb-6">{{ t('admin.importConfirmMessage') || '导入将覆盖现有配置，此操作不可撤销。确定继续吗？' }}</p>
        <div class="flex gap-3">
          <button @click="showConfirmModal = false" class="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
            {{ t('common.cancel') || '取消' }}
          </button>
          <button @click="confirmImport" class="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
            {{ t('admin.confirmImport') || '确认导入' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { exportImportApi } from '@/api'
import { useDataStore } from '@/stores/data'
import { useSettingsStore } from '@/stores/settings'
import { usePageTexts } from '@/composables/useI18n'
import ErrorMessage from '@/components/ErrorMessage.vue'

const { t } = usePageTexts()
const dataStore = useDataStore()
const settingsStore = useSettingsStore()

const error = ref('')
const showSuccess = ref(false)
const successMessage = ref('')
const isExporting = ref(false)
const isImporting = ref(false)
const showConfirmModal = ref(false)
const importFile = ref<File | null>(null)

const showSuccessMessage = (message: string) => {
  successMessage.value = message
  showSuccess.value = true
  setTimeout(() => { showSuccess.value = false }, 3000)
}

const exportData = async () => {
  isExporting.value = true
  error.value = ''
  
  try {
    const res = await exportImportApi.exportData()
    
    if (!res || typeof res !== 'object') {
      throw new Error(t('admin.exportError') || '无效的响应格式')
    }
    
    const blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sunpanel-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    showSuccessMessage(t('admin.exportSuccess') || '导出成功')
  } catch {
    error.value = t('admin.exportFailed') || '导出失败，请重试'
  } finally {
    isExporting.value = false
  }
}

const handleImport = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  importFile.value = file
  showConfirmModal.value = true
}

const confirmImport = async () => {
  if (!importFile.value) return
  
  showConfirmModal.value = false
  isImporting.value = true
  error.value = ''
  
  try {
    await exportImportApi.importData(importFile.value)
    showSuccessMessage(t('admin.importSuccess') || '导入成功')
    
    await settingsStore.loadSettings()
    await dataStore.refreshAll()
    
    setTimeout(() => {
      window.location.reload()
    }, 1500)
  } catch {
    error.value = t('admin.importFailed') || '导入失败，请检查文件格式'
  } finally {
    isImporting.value = false
    importFile.value = null
  }
}
</script>