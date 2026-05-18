<template>
  <div class="max-w-2xl space-y-6">
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
      <div class="text-6xl mb-4">☀️</div>
      <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-200">SunPanel Cloudflare</h2>
      <p class="text-slate-500 mt-2">{{ t('admin.version') || '版本' }} v1.0.0</p>
      <p class="text-sm text-slate-400 mt-1">{{ t('admin.cloudflareNavigation') || '基于 Cloudflare 部署的导航面板' }}</p>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div class="p-6 border-b border-slate-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">{{ t('admin.aboutProject') || '关于项目' }}</h3>
      </div>
      <div class="p-6 text-slate-600 dark:text-slate-400 space-y-3 text-sm">
        <p>{{ t('admin.projectDescription') || 'SunPanel Cloudflare 是一个专为 Cloudflare 优化的开源导航面板项目。' }}</p>
        <p>{{ t('admin.inspiredBy') || '本项目受' }} <a href="https://github.com/hslr-s/sun-panel" target="_blank" class="text-orange-500 hover:underline">sun-panel</a> {{ t('admin.andAdapted') || '启发并进行适配优化。' }}</p>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div class="p-6 border-b border-slate-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">{{ t('admin.techStack') || '技术栈' }}</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-2 gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Icon icon="ph:vue-logo-bold" class="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p class="font-medium text-slate-700 dark:text-slate-300">Vue 3</p>
              <p class="text-xs text-slate-500">{{ t('admin.frontendFramework') || '前端框架' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Icon icon="ph:cloud-bold" class="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p class="font-medium text-slate-700 dark:text-slate-300">Cloudflare</p>
              <p class="text-xs text-slate-500">{{ t('admin.deploymentPlatform') || '部署平台' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Icon icon="ph:lightning-bold" class="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p class="font-medium text-slate-700 dark:text-slate-300">Cloudflare Workers</p>
              <p class="text-xs text-slate-500">{{ t('admin.backendService') || '后端服务' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Icon icon="ph:database-bold" class="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p class="font-medium text-slate-700 dark:text-slate-300">Cloudflare D1</p>
              <p class="text-xs text-slate-500">{{ t('admin.database') || '数据库' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div class="p-6 border-b border-slate-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">{{ t('admin.license') || '许可证' }}</h3>
      </div>
      <div class="p-6 text-slate-600 dark:text-slate-400 text-sm">
        <p>{{ t('admin.mitLicense') || '本项目基于 MIT 许可证开源。' }}</p>
        <p class="mt-2">{{ t('admin.freeUse') || '您可以自由使用、修改和分发本项目。' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { usePageTexts } from '@/composables/useI18n'

const { t } = usePageTexts()
</script>
