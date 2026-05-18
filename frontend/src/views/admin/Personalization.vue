<template>
  <div class="space-y-6">
    <ErrorMessage
      v-if="error"
      :message="error"
      type="error"
      :closable="true"
      @close="error = ''"
    />

    <div v-if="isLoading" class="py-12">
      <LoadingSpinner text="加载设置中..." />
    </div>

    <template v-else>
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div class="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">{{ t('admin.personalization.theme') || '主题设置' }}</h3>
        </div>
        <div class="p-6 space-y-6">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{{ t('admin.personalization.themeMode') || '主题模式' }}</label>
            <div class="flex gap-3">
              <button
                v-for="theme in themes"
                :key="theme.value"
                @click="updateSetting('theme', theme.value)"
                class="px-4 py-3 rounded-lg border-2 transition-all"
                :class="settings.theme === theme.value ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30' : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'"
              >
                <Icon :icon="theme.icon" class="w-6 h-6 mb-1" :class="settings.theme === theme.value ? 'text-orange-500' : 'text-slate-400'" />
                <p class="text-sm">{{ theme.label }}</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div class="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">{{ t('admin.personalization.background') || '背景设置' }}</h3>
        </div>
        <div class="p-6 space-y-6">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{{ t('admin.personalization.backgroundType') || '背景类型' }}</label>
            <div class="flex gap-3">
              <button
                @click="updateSetting('wallpaperType', 'color')"
                class="px-4 py-3 rounded-lg border-2 transition-all"
                :class="settings.wallpaperType === 'color' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30' : 'border-slate-200 dark:border-slate-700'"
              >
                <p class="text-sm">{{ t('admin.personalization.solidColor') || '纯色背景' }}</p>
              </button>
              <button
                @click="updateSetting('wallpaperType', 'image')"
                class="px-4 py-3 rounded-lg border-2 transition-all"
                :class="settings.wallpaperType === 'image' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30' : 'border-slate-200 dark:border-slate-700'"
              >
                <p class="text-sm">{{ t('admin.personalization.imageBackground') || '图片背景' }}</p>
              </button>
            </div>
          </div>

          <div v-if="settings.wallpaperType === 'color'">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ t('admin.personalization.selectColor') || '选择颜色' }}</label>
            <div class="flex items-center gap-3">
              <input
                type="color"
                :value="settings.wallpaper"
                @input="updateSetting('wallpaper', ($event.target as HTMLInputElement).value)"
                class="w-12 h-12 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                :value="settings.wallpaper"
                @change="updateSetting('wallpaper', ($event.target as HTMLInputElement).value)"
                class="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="#1e293b"
              />
            </div>
          </div>

          <div v-else>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ t('admin.personalization.backgroundImage') || '背景图片' }}</label>
            <div v-if="settings.wallpaper" class="mb-4">
              <div class="relative w-full h-40 rounded-lg overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-600">
                <img :src="settings.wallpaper" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <button @click="updateSetting('wallpaper', '')" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                    {{ t('admin.personalization.removeImage') || '移除图片' }}
                  </button>
                </div>
              </div>
            </div>
            <div class="flex gap-3">
              <button
                @click="openGallery"
                class="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center gap-2 transition-colors"
              >
                <Icon icon="ph:image-bold" class="w-5 h-5" />
                {{ t('admin.personalization.selectFromGallery') || '从图库选择' }}
              </button>
              <input
                v-model="wallpaperUrl"
                @change="updateSetting('wallpaper', wallpaperUrl)"
                type="text"
                :placeholder="t('admin.personalization.orEnterURL') || '或输入URL'"
                class="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div class="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">{{ t('admin.personalization.display') || '显示设置' }}</h3>
        </div>
        <div class="p-6 space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-slate-700 dark:text-slate-300">{{ t('admin.personalization.showSearchBar') || '显示搜索栏' }}</p>
              <p class="text-sm text-slate-500">{{ t('admin.personalization.searchBarDesc') || '在顶部显示搜索框' }}</p>
            </div>
            <button
              @click="updateSetting('showSearchBar', !settings.showSearchBar)"
              class="relative w-12 h-6 rounded-full transition-colors"
              :class="settings.showSearchBar ? 'bg-orange-500' : 'bg-slate-300'"
            >
              <span class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform" :class="settings.showSearchBar ? 'translate-x-6' : ''" />
            </button>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-slate-700 dark:text-slate-300">{{ t('admin.personalization.showGroupNames') || '显示分组名称' }}</p>
              <p class="text-sm text-slate-500">{{ t('admin.personalization.groupNamesDesc') || '在分组上方显示名称' }}</p>
            </div>
            <button
              @click="updateSetting('showGroupNames', !settings.showGroupNames)"
              class="relative w-12 h-6 rounded-full transition-colors"
              :class="settings.showGroupNames ? 'bg-orange-500' : 'bg-slate-300'"
            >
              <span class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform" :class="settings.showGroupNames ? 'translate-x-6' : ''" />
            </button>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{{ t('admin.personalization.mobileItems') || '移动端每行显示数量' }}</label>
            <input
              type="range"
              min="1"
              max="4"
              :value="settings.mobileItemsPerRow"
              @input="updateItemsPerRowSetting('mobileItemsPerRow', Number(($event.target as HTMLInputElement).value), 2)"
              class="w-full"
            />
            <p class="text-sm text-slate-500 mt-1">{{ settings.mobileItemsPerRow }} 个 (屏幕宽度 &lt; 640px)</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{{ t('admin.personalization.tabletItems') || '平板端每行显示数量' }}</label>
            <input
              type="range"
              min="2"
              max="6"
              :value="settings.tabletItemsPerRow"
              @input="updateItemsPerRowSetting('tabletItemsPerRow', Number(($event.target as HTMLInputElement).value), 3)"
              class="w-full"
            />
            <p class="text-sm text-slate-500 mt-1">{{ settings.tabletItemsPerRow }} 个 (屏幕宽度 640px - 1024px)</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{{ t('admin.personalization.desktopItems') || '电脑端每行显示数量' }}</label>
            <input
              type="range"
              min="2"
              max="12"
              :value="settings.desktopItemsPerRow"
              @input="updateItemsPerRowSetting('desktopItemsPerRow', Number(($event.target as HTMLInputElement).value), 6)"
              class="w-full"
            />
            <p class="text-sm text-slate-500 mt-1">{{ settings.desktopItemsPerRow }} 个 (屏幕宽度 &gt; 1024px)</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div class="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">{{ t('admin.personalization.customCode') || '自定义代码' }}</h3>
        </div>
        <div class="p-6 space-y-6">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ t('admin.personalization.customCSS') || '自定义 CSS' }}</label>
            <textarea
              v-model="customCSS"
              @change="updateSetting('customCSS', customCSS)"
              rows="6"
              placeholder="/* 在此处添加自定义样式 */"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
            <p class="text-xs text-slate-500 mt-2">注意：{{ t('admin.personalization.customCSS') || '自定义 CSS' }} 会经过安全过滤以防止注入攻击。</p>
          </div>
        </div>
      </div>
    </template>

    <div v-if="showGalleryModal" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-800 rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div class="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">{{ t('admin.personalization.selectBackground') || '选择背景图片' }}</h3>
          <button @click="showGalleryModal = false" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <Icon icon="ph:x-bold" class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div v-if="galleryLoading" class="py-12">
            <LoadingSpinner :text="t('admin.personalization.loadingImages') || '加载图片中...'" />
          </div>
          <div v-else-if="galleryImages.length === 0" class="py-12">
            <EmptyState
              icon="🖼️"
              title="{{ t('common.noImages') || '暂无图片' }}"
              description="{{ t('common.uploadImagesFirst') || '请先上传图片到图库' }}"
            />
          </div>
          <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div
              v-for="image in galleryImages"
              :key="image.id"
              class="relative group aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 cursor-pointer"
              @click="selectImage(image)"
            >
              <img :src="image.url" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Icon icon="ph:check-bold" class="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useSettingsStore } from '@/stores/settings'
import { usePageTexts } from '@/composables/useI18n'
import { galleryApi } from '@/api'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'
import EmptyState from '@/components/EmptyState.vue'

const settingsStore = useSettingsStore()
const { t } = usePageTexts()
const settings = computed(() => settingsStore.settings)
const isLoading = ref(true)

const wallpaperUrl = ref('')
watch(() => settings.value.wallpaperType, (type) => {
  if (type === 'image') {
    wallpaperUrl.value = settings.value.wallpaper
  }
}, { immediate: true })

const themes = computed(() => [
  { value: 'light', label: t('admin.personalization.light') || 'Light', icon: 'ph:sun-bold' },
  { value: 'dark', label: t('admin.personalization.dark') || 'Dark', icon: 'ph:moon-bold' },
  { value: 'auto', label: t('admin.personalization.auto') || 'System', icon: 'ph:desktop-bold' },
])

const customCSS = ref('')

const showGalleryModal = ref(false)
const galleryImages = ref<any[]>([])
const galleryLoading = ref(false)
const error = ref('')

const updateSetting = (key: string, value: any) => {
  settingsStore.updateSettings({ [key]: value })
}

const updateItemsPerRowSetting = async (key: string, value: number, defaultValue: number) => {
  try {
    await settingsStore.updateSettings({ [key]: value })
  } catch {
    await settingsStore.updateSettings({ [key]: defaultValue })
    error.value = `保存失败，已恢复默认值 ${defaultValue}`
    setTimeout(() => { error.value = '' }, 3000)
  }
}

const openGallery = async () => {
  showGalleryModal.value = true
  await fetchGalleryImages()
}

const fetchGalleryImages = async () => {
  galleryLoading.value = true
  try {
    const res = await galleryApi.getImages('user')
    galleryImages.value = res.data?.data || res.data || []
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || '获取图片失败'
    galleryImages.value = []
  } finally {
    galleryLoading.value = false
  }
}

const selectImage = (image: any) => {
  updateSetting('wallpaper', image.url)
  showGalleryModal.value = false
}

onMounted(async () => {
  try {
    await settingsStore.loadSettings()
    customCSS.value = settings.value.customCSS || ''
  } catch (err: any) {
    error.value = '加载设置失败，使用默认值'
  } finally {
    isLoading.value = false
  }
})
</script>