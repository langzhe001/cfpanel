// 图库和导出导入相关 API

import { api, clearCache, getCached, setCached, retryWithExponentialBackoff, validateFileUpload, SECURITY_CONFIG } from './client'

export const galleryApi = {
  getImages: (type: 'public' | 'user') => {
    const cacheKey = `gallery_${type}`
    return retryWithExponentialBackoff(async () => {
      const cached = getCached(cacheKey)
      if (cached) return cached
      const res = await api.get(`/gallery/${type}`)
      setCached(cacheKey, res)
      return res
    })
  },
  
  uploadImage: (file: File) => {
    const validation = validateFileUpload(file)
    if (!validation.valid) {
      return Promise.reject(new Error(validation.error))
    }
    clearCache('gallery_user')
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/gallery/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  
  deleteImage: (id: string) => {
    clearCache('gallery_user')
    return api.delete(`/gallery/${id}`)
  }
}

export const exportImportApi = {
  exportData: () => api.get('/export', { responseType: 'blob' }),
  
  importData: (file: File) => {
    if (!file.name.endsWith('.json')) {
      return Promise.reject(new Error('只支持 JSON 格式的导入文件'))
    }
    if (file.size > SECURITY_CONFIG.MAX_FILE_SIZE) {
      return Promise.reject(new Error(`导入文件大小不能超过 ${SECURITY_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`))
    }
    clearCache()
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}
