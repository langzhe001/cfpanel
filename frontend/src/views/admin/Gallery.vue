<template>
  <div class="space-y-6">
    <ErrorMessage
      v-if="error"
      :message="error"
      type="error"
      :closable="true"
      :retry="true"
      @close="error = ''"
      @retry="handleRefresh"
    />

    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div class="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">{{ t('admin.gallery') || '我的图库' }}</h3>
        <label class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer flex items-center gap-2 transition-colors">
          <Icon icon="ph:upload-bold" class="w-5 h-5" />
          {{ t('admin.uploadImage') || '上传图片' }}
          <input type="file" accept="image/*" multiple @change="handleUpload" class="hidden" />
        </label>
      </div>
      <div class="p-6">
        <div v-if="loading" class="py-12">
          <LoadingSpinner text="{{ t('admin.loadingImages') || '加载图片中...' }}" />
        </div>
        <div v-else-if="images.length === 0" class="py-12">
          <EmptyState
            icon="🖼️"
            :title="t('common.noImages') || '暂无图片'"
            :description="t('admin.clickUploadImage') || '点击上方按钮上传图片'"
          />
        </div>
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div 
            v-for="image in images" 
            :key="image.id"
            class="relative group aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700"
          >
            <img :src="image.url" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button @click="copyUrl(image.url)" class="p-2 bg-white rounded-full hover:bg-slate-100 transition-colors">
                <Icon icon="ph:copy-bold" class="w-4 h-4" />
              </button>
              <button @click="deleteImage(image.id)" class="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                <Icon icon="ph:trash-bold" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { usePageTexts } from '@/composables/useI18n'
import { galleryApi } from '@/api'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'
import EmptyState from '@/components/EmptyState.vue'

const { t } = usePageTexts()
const images = ref<any[]>([])
const loading = ref(false)
const error = ref('')

const fetchImages = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await galleryApi.getImages('user')
    images.value = res.data?.data || res.data || []
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || '获取图片失败'
    images.value = []
  } finally {
    loading.value = false
  }
}

const handleUpload = async (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  
  for (const file of files) {
    try {
      const res = await galleryApi.uploadImage(file)
      const uploadedImage = res.data?.data || res.data
      if (uploadedImage) {
        images.value.push(uploadedImage)
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || '上传失败'
      setTimeout(() => { error.value = '' }, 3000)
    }
  }
}

const copyUrl = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url)
    alert('链接已复制')
  } catch {
    error.value = '复制失败，请手动复制'
    setTimeout(() => { error.value = '' }, 3000)
  }
}

const deleteImage = async (id: string) => {
  if (!confirm('确定要删除这张图片吗？')) return
  try {
    await galleryApi.deleteImage(id)
    images.value = images.value.filter(i => i.id !== id)
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || '删除失败'
    setTimeout(() => { error.value = '' }, 3000)
  }
}

const handleRefresh = () => {
  fetchImages()
}

onMounted(() => {
  fetchImages()
})
</script>