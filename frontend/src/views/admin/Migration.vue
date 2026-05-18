<template>
  <div class="space-y-6">
    <ErrorMessage
      v-if="error"
      :message="error"
      :type="messageType"
      :closable="true"
      @close="error = ''"
    />

    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div class="p-6 border-b border-slate-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">{{ t('admin.dataMigration') || '数据迁移' }}</h3>
      </div>
      <div class="p-6 space-y-6">
        <div>
          <h4 class="font-medium text-slate-700 dark:text-slate-300 mb-2">{{ t('admin.migrateFromSunPanel') || '从 sun-panel 迁移' }}</h4>
          <p class="text-sm text-slate-500 mb-4">{{ t('admin.migrateFromSunPanelDesc') || '支持从官方 sun-panel 导出数据迁移到本系统。' }}</p>
          <div class="flex gap-3">
            <button 
              @click="migrateFromSunPanel" 
              :disabled="isProcessing"
              class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              <span v-if="isProcessing" class="flex items-center gap-2">
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ t('common.processing') || '处理中...' }}
              </span>
              <span v-else>{{ t('admin.selectFileMigrate') || '选择文件迁移' }}</span>
            </button>
            <input type="file" ref="migrationFile" accept=".json" class="hidden" @change="handleMigrationFile" />
          </div>
        </div>

        <div class="border-t border-slate-200 dark:border-slate-700 pt-6">
          <h4 class="font-medium text-slate-700 dark:text-slate-300 mb-2">{{ t('admin.exportToSunPanel') || '导出到 sun-panel' }}</h4>
          <p class="text-sm text-slate-500 mb-4">{{ t('admin.exportToSunPanelDesc') || '将当前数据导出为 sun-panel 兼容格式。' }}</p>
          <button 
            @click="exportToSunPanel" 
            :disabled="isProcessing"
            class="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors"
          >
            <span v-if="isProcessing" class="flex items-center gap-2">
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ t('common.processing') || '处理中...' }}
            </span>
            <span v-else>{{ t('admin.exportCompatible') || '导出兼容格式' }}</span>
          </button>
        </div>

        <div class="border-t border-slate-200 dark:border-slate-700 pt-6">
          <h4 class="font-medium text-slate-700 dark:text-slate-300 mb-2">{{ t('admin.migrationInstructions') || '迁移说明' }}</h4>
          <div class="text-sm text-slate-500 space-y-2">
            <p>{{ t('admin.migrationStep1') || '1. 从 sun-panel 导出配置（设置 → 导出数据）' }}</p>
            <p>{{ t('admin.migrationStep2') || '2. 使用上方工具导入到本系统' }}</p>
            <p>{{ t('admin.migrationStep3') || '3. 迁移完成后请检查数据完整性' }}</p>
            <p>{{ t('admin.migrationStep4') || '4. 图片资源需要单独迁移' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDataStore } from '@/stores/data'
import { useSettingsStore } from '@/stores/settings'
import { usePageTexts } from '@/composables/useI18n'
import ErrorMessage from '@/components/ErrorMessage.vue'

const { t } = usePageTexts()
const dataStore = useDataStore()
const settingsStore = useSettingsStore()
const migrationFile = ref<HTMLInputElement | null>(null)
const isProcessing = ref(false)
const error = ref('')
const messageType = ref<'success' | 'error'>('success')

const migrateFromSunPanel = () => {
  migrationFile.value?.click()
}

const handleMigrationFile = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  isProcessing.value = true
  error.value = ''
  
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    
    if (data.groups) {
      for (const group of data.groups) {
        await dataStore.addGroup({
          name: group.name,
          icon: group.icon,
          order: group.order
        })
      }
    }
    
    if (data.items) {
      for (const item of data.items) {
        await dataStore.addItem({
          name: item.name,
          url: item.url,
          icon: item.icon,
          description: item.description,
          groupId: item.groupId,
          order: item.order,
          openInNewTab: item.openInNewTab,
          showAsWindow: item.showAsWindow
        })
      }
    }
    
    error.value = t('admin.migrationSuccess') || '迁移成功！'
    messageType.value = 'success'
    setTimeout(() => { error.value = '' }, 3000)
  } catch (err: any) {
    error.value = err.message || (t('admin.migrationFileError') || '文件格式错误，请检查文件内容')
    messageType.value = 'error'
  } finally {
    isProcessing.value = false
  }
}

const exportToSunPanel = () => {
  const data = {
    version: '1.0.0',
    exportTime: new Date().toISOString(),
    groups: dataStore.groups.map(g => ({
      id: g.id,
      name: g.name,
      icon: g.icon,
      order: g.order
    })),
    items: dataStore.items.map(i => ({
      id: i.id,
      name: i.name,
      url: i.url,
      icon: i.icon,
      description: i.description,
      groupId: i.groupId,
      order: i.order,
      openInNewTab: i.openInNewTab,
      showAsWindow: i.showAsWindow
    })),
    settings: settingsStore.settings
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sunpanel-export-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
</script>