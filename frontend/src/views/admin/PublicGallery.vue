<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div class="p-6 border-b border-slate-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">公共图库</h3>
      </div>
      <div class="p-6">
        <div v-if="loading" class="text-center py-12">
          <Icon icon="ph:circle-notch-bold" class="w-8 h-8 text-orange-500 animate-spin mx-auto" />
        </div>
        <div v-else class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div 
            v-for="image in images" 
            :key="image.id"
            class="relative group aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 cursor-pointer"
            @click="selectImage(image)"
          >
            <img :src="image.url" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Icon icon="ph:plus-bold" class="w-8 h-8 text-white" />
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
    const res = await galleryApi.getImages('public')
    images.value = res.data || []
  } catch {
    images.value = []
  } finally {
    loading.value = false
  }
}

const selectImage = (image: any) => {
  navigator.clipboard.writeText(image.url)
  alert('图片链接已复制')
}

onMounted(() => {
  fetchImages()
})
</script>
