<template>
  <div class="space-y-6">
    <!-- 保存反馈提示 -->
    <Transition name="toast">
      <div 
        v-if="showToast"
        class="fixed top-4 right-4 z-[100] px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 max-w-sm"
        :class="toastClass"
      >
        <svg v-if="toastType === 'success'" class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="flex-1 text-sm font-medium">{{ toastMessage }}</span>
        <button @click="showToast = false" class="p-1 hover:bg-white/20 rounded transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </Transition>

    <div v-if="isLoading" class="py-12">
      <LoadingSpinner :text="t('common.loading')" />
    </div>

    <template v-else>
      <!-- 主题设置 -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div class="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">{{ t('admin.personalization.theme') }}</h3>
        </div>
        <div class="p-6 space-y-6">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{{ t('admin.personalization.themeMode') }}</label>
            <div class="flex gap-3">
              <button
                v-for="theme in themes"
                :key="theme.value"
                @click="formData.theme = theme.value"
                class="px-4 py-3 rounded-lg border-2 transition-all"
                :class="formData.theme === theme.value ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30' : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'"
              >
                <Icon :icon="theme.icon" class="w-6 h-6 mb-1" :class="formData.theme === theme.value ? 'text-orange-500' : 'text-slate-400'" />
                <p class="text-sm">{{ theme.label }}</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 背景设置 -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div class="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">{{ t('admin.personalization.background') }}</h3>
        </div>
        <div class="p-6 space-y-6">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{{ t('admin.personalization.backgroundType') }}</label>
            <div class="flex gap-3">
              <button
                @click="formData.wallpaperType = 'color'"
                class="px-4 py-3 rounded-lg border-2 transition-all"
                :class="formData.wallpaperType === 'color' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30' : 'border-slate-200 dark:border-slate-700'"
              >
                <p class="text-sm">{{ t('admin.personalization.solidColor') }}</p>
              </button>
              <button
                @click="formData.wallpaperType = 'image'"
                class="px-4 py-3 rounded-lg border-2 transition-all"
                :class="formData.wallpaperType === 'image' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30' : 'border-slate-200 dark:border-slate-700'"
              >
                <p class="text-sm">{{ t('admin.personalization.imageBackground') }}</p>
              </button>
            </div>
          </div>

          <div v-if="formData.wallpaperType === 'color'">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ t('admin.personalization.selectColor') }}</label>
            <div class="flex items-center gap-3">
              <input
                type="color"
                v-model="formData.wallpaper"
                class="w-12 h-12 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                v-model="formData.wallpaper"
                class="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="#1e293b"
              />
            </div>
          </div>

          <div v-else>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ t('admin.personalization.backgroundImage') }}</label>
            <div v-if="formData.wallpaper" class="mb-4">
              <div class="relative w-full h-40 rounded-lg overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-600">
                <img :src="formData.wallpaper" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <button @click="formData.wallpaper = ''" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                    {{ t('admin.personalization.removeImage') }}
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
                {{ t('admin.personalization.selectFromGallery') }}
              </button>
              <input
                v-model="formData.wallpaper"
                type="text"
                :placeholder="t('admin.personalization.orEnterURL')"
                class="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 显示设置 -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div class="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">{{ t('admin.personalization.display') }}</h3>
        </div>
        <div class="p-6 space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-slate-700 dark:text-slate-300">{{ t('admin.personalization.showSearchBar') }}</p>
              <p class="text-sm text-slate-500">{{ t('admin.personalization.searchBarDesc') }}</p>
            </div>
            <button
              @click="formData.showSearchBar = !formData.showSearchBar"
              class="relative w-12 h-6 rounded-full transition-colors"
              :class="formData.showSearchBar ? 'bg-orange-500' : 'bg-slate-300'"
            >
              <span class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform" :class="formData.showSearchBar ? 'translate-x-6' : ''" />
            </button>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-slate-700 dark:text-slate-300">{{ t('admin.personalization.showGroupNames') }}</p>
              <p class="text-sm text-slate-500">{{ t('admin.personalization.groupNamesDesc') }}</p>
            </div>
            <button
              @click="formData.showGroupNames = !formData.showGroupNames"
              class="relative w-12 h-6 rounded-full transition-colors"
              :class="formData.showGroupNames ? 'bg-orange-500' : 'bg-slate-300'"
            >
              <span class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform" :class="formData.showGroupNames ? 'translate-x-6' : ''" />
            </button>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{{ t('admin.personalization.mobileItems') }}</label>
            <input
              type="range"
              min="1"
              max="4"
              v-model.number="formData.mobileItemsPerRow"
              class="w-full"
            />
            <p class="text-sm text-slate-500 mt-1">{{ formData.mobileItemsPerRow }} {{ t('dashboard.websites') }} (屏幕宽度 &lt; 640px)</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{{ t('admin.personalization.tabletItems') }}</label>
            <input
              type="range"
              min="2"
              max="6"
              v-model.number="formData.tabletItemsPerRow"
              class="w-full"
            />
            <p class="text-sm text-slate-500 mt-1">{{ formData.tabletItemsPerRow }} {{ t('dashboard.websites') }} (屏幕宽度 640px - 1024px)</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{{ t('admin.personalization.desktopItems') }}</label>
            <input
              type="range"
              min="2"
              max="12"
              v-model.number="formData.desktopItemsPerRow"
              class="w-full"
            />
            <p class="text-sm text-slate-500 mt-1">{{ formData.desktopItemsPerRow }} {{ t('dashboard.websites') }} (屏幕宽度 &gt; 1024px)</p>
          </div>
        </div>
      </div>

      <!-- 自定义代码 -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div class="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">{{ t('admin.personalization.customCode') }}</h3>
        </div>
        <div class="p-6 space-y-6">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ t('admin.personalization.customCSS') }}</label>
            <textarea
              v-model="formData.customCSS"
              rows="6"
              placeholder="/* 在此处添加自定义样式 */"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
            <p class="text-xs text-slate-500 mt-2">注意：{{ t('admin.personalization.customCSS') }} 会经过安全过滤以防止注入攻击。</p>
          </div>
        </div>
      </div>

      <!-- 保存/取消按钮 -->
      <div class="flex justify-end gap-3">
        <button
          @click="cancelChanges"
          :disabled="isSaving || !hasChanges"
          class="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          @click="saveSettings"
          :disabled="isSaving || !hasChanges"
          class="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
        >
          <span v-if="isSaving" class="flex items-center gap-2">
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ t('common.saving') }}
          </span>
          <span v-else>{{ t('common.save') }}</span>
        </button>
      </div>
    </template>

    <!-- 图库弹窗 -->
    <div v-if="showGalleryModal" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-800 rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div class="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">{{ t('admin.personalization.selectBackground') }}</h3>
          <button @click="showGalleryModal = false" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <Icon icon="ph:x-bold" class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div v-if="galleryLoading" class="py-12">
            <LoadingSpinner :text="t('admin.personalization.loadingImages')" />
          </div>
          <div v-else-if="galleryImages.length === 0" class="py-12">
            <EmptyState
              icon="🖼️"
              :title="t('common.noImages')"
              :description="t('common.uploadImagesFirst')"
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
import { computed, ref, reactive, watch, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useSettingsStore } from '@/stores/settings'
import { usePageTexts } from '@/composables/useI18n'
import { galleryApi } from '@/api'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import EmptyState from '@/components/EmptyState.vue'

const settingsStore = useSettingsStore()
const { t } = usePageTexts()

const isLoading = ref(true)
const isSaving = ref(false)

// Toast 提示系统
const showToast = ref(false)
const toastType = ref<'success' | 'error'>('success')
const toastMessage = ref('')

const toastClass = computed(() => {
  return toastType.value === 'success' 
    ? 'bg-green-500 text-white' 
    : 'bg-red-500 text-white'
})

const showMessage = (type: 'success' | 'error', message: string) => {
  toastType.value = type
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 3000)
}

// 本地表单数据
const formData = reactive({
  theme: 'light',
  wallpaperType: 'color' as 'color' | 'image',
  wallpaper: '#1e293b',
  showSearchBar: true,
  showGroupNames: true,
  mobileItemsPerRow: 2,
  tabletItemsPerRow: 3,
  desktopItemsPerRow: 6,
  customCSS: ''
})

// 原始数据（用于取消和检测更改）
const originalData = ref({})

// 是否有更改
const hasChanges = computed(() => {
  return JSON.stringify(formData) !== JSON.stringify(originalData.value)
})

// 主题选项
const themes = computed(() => [
  { value: 'light', label: t('admin.personalization.light'), icon: 'ph:sun-bold' },
  { value: 'dark', label: t('admin.personalization.dark'), icon: 'ph:moon-bold' },
  { value: 'auto', label: t('admin.personalization.auto'), icon: 'ph:desktop-bold' },
])

const showGalleryModal = ref(false)
const galleryImages = ref<any[]>([])
const galleryLoading = ref(false)

// 选择图片
const selectImage = (image: any) => {
  formData.wallpaper = image.url
  formData.wallpaperType = 'image'
  showGalleryModal.value = false
}

// 保存设置
const saveSettings = async () => {
  if (!hasChanges.value) return

  isSaving.value = true

  try {
    await settingsStore.updateSettings({
      theme: formData.theme,
      wallpaperType: formData.wallpaperType,
      wallpaper: formData.wallpaper,
      showSearchBar: formData.showSearchBar,
      showGroupNames: formData.showGroupNames,
      mobileItemsPerRow: formData.mobileItemsPerRow,
      tabletItemsPerRow: formData.tabletItemsPerRow,
      desktopItemsPerRow: formData.desktopItemsPerRow,
      customCSS: formData.customCSS
    })

    // 更新原始数据
    originalData.value = JSON.parse(JSON.stringify(formData))

    showMessage('success', t('common.success') || '保存成功')
  } catch (err: any) {
    showMessage('error', err.response?.data?.message || t('common.error') || '保存失败')
  } finally {
    isSaving.value = false
  }
}

// 取消更改
const cancelChanges = () => {
  const original = originalData.value as typeof formData
  Object.assign(formData, original)
}

// 打开图库
const openGallery = async () => {
  showGalleryModal.value = true
  await fetchGalleryImages()
}

// 获取图库图片
const fetchGalleryImages = async () => {
  galleryLoading.value = true
  try {
    const res = await galleryApi.getImages('user')
    galleryImages.value = res.data?.data || res.data || []
  } catch (err: any) {
    showMessage('error', err.response?.data?.message || err.message || '获取图片失败')
  } finally {
    galleryLoading.value = false
  }
}

onMounted(async () => {
  try {
    // 强制从API加载最新设置
    await settingsStore.loadSettings(true)

    // 初始化表单数据
    const settings = settingsStore.settings
    formData.theme = settings.theme || 'light'
    formData.wallpaperType = settings.wallpaperType || 'color'
    formData.wallpaper = settings.wallpaper || '#1e293b'
    formData.showSearchBar = settings.showSearchBar ?? true
    formData.showGroupNames = settings.showGroupNames ?? true
    formData.mobileItemsPerRow = settings.mobileItemsPerRow || 2
    formData.tabletItemsPerRow = settings.tabletItemsPerRow || 3
    formData.desktopItemsPerRow = settings.desktopItemsPerRow || 6
    formData.customCSS = settings.customCSS || ''

    // 保存原始数据（深拷贝）
    originalData.value = JSON.parse(JSON.stringify(formData))
  } catch (err: any) {
    showMessage('error', '加载设置失败，使用默认值')
  } finally {
    isLoading.value = false
  }
})
</script>