<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div class="p-6 border-b border-slate-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">导出数据</h3>
      </div>
      <div class="p-6">
        <p class="text-slate-600 dark:text-slate-400 mb-4">导出您的所有配置数据，包括分组、网站和设置。</p>
        <button @click="exportData" class="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2">
          <Icon icon="ph:download-bold" class="w-5 h-5" />
          导出配置
        </button>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div class="p-6 border-b border-slate-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">导入数据</h3>
      </div>
      <div class="p-6">
        <p class="text-slate-600 dark:text-slate-400 mb-4">从之前导出的备份文件中恢复配置。</p>
        <label class="px-6 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer flex items-center gap-2 inline-flex">
          <Icon icon="ph:upload-bold" class="w-5 h-5" />
          选择文件
          <input type="file" accept=".json" @change="handleImport" class="hidden" />
        </label>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div class="p-6 border-b border-slate-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">导入说明</h3>
      </div>
      <div class="p-6 text-slate-600 dark:text-slate-400 space-y-2 text-sm">
        <p>• 支持导入 .json 格式的备份文件</p>
        <p>• 导入将覆盖现有配置，请谨慎操作</p>
        <p>• 建议在导入前先导出当前配置作为备份</p>
        <p>• 图片文件需要单独上传</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { exportImportApi } from '@/api'

const exportData = async () => {
  try {
    const res = await exportImportApi.exportData()
    const blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sunpanel-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    alert('导出失败')
  }
}

const handleImport = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  if (!confirm('导入将覆盖现有配置，是否继续？')) return
  
  try {
    await exportImportApi.importData(file)
    alert('导入成功')
    window.location.reload()
  } catch {
    alert('导入失败，请检查文件格式')
  }
}
</script>
