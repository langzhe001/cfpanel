<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div class="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">我的图库</h3>
        <label class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer flex items-center gap-2">
          <Icon icon="ph:upload-bold" class="w-5 h-5" />
          上传图片
          <input type="file" accept="image/*" multiple @change="handleUpload" class="hidden" />
        </label>
      </div>
      <div class="p-6">
        <div v-if="loading" class="text-center py-12">
          <Icon icon="ph:circle-notch-bold" class="w-8 h-8 text-orange-500 animate-spin mx-auto" />
        </div>
        <div v-else-if="images.length === 0" class="text-center py-12 text-slate-500">
          暂无图片，上传一些图片吧
        </div>
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div 
            v-for="image in images" 
            :key="image.id"
            class="relative group aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700"
          >
            <img :src="image.url" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button @click="copyUrl(image.url)" class="p-2 bg-white rounded-full hover:bg-slate-100">
                <Icon icon="ph:copy-bold" class="w-4 h-4" />
              </button>
              <button @click="deleteImage(image.id)" class="p-2 bg-red-500 text-white rounded-full hover:bg-red-600">
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
import { galleryApi } from '@/api'

const images = ref<any[]>([])
const loading = ref(false)

const fetchImages = async () => {
  loading.value = true
  try {
    const res = await galleryApi.getImages('user')
    images.value = res.data?.data || res.data || []
  } catch {
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
      images.value.push(res.data.data)
    } catch (error: any) {
      console.error('上传失败:', error.response?.data?.message || error.message)
      alert('上传失败: ' + (error.response?.data?.message || error.message))
    }
  }
}

const copyUrl = (url: string) => {
  navigator.clipboard.writeText(url)
  alert('链接已复制')
}

const deleteImage = async (id: string) => {
  if (!confirm('确定要删除这张图片吗？')) return
  await galleryApi.deleteImage(id)
  images.value = images.value.filter(i => i.id !== id)
}

onMounted(() => {
  fetchImages()
})
</script>
