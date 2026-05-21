<template>
  <div class="max-w-2xl space-y-6">
    <ErrorMessage
      v-if="error || successMessage"
      :message="error || successMessage"
      :type="error ? 'error' : 'success'"
      :closable="true"
      @close="clearMessages"
    />

    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div class="p-6 border-b border-slate-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">{{ profileTexts.title || '个人信息' }}</h3>
      </div>
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <div class="flex items-center gap-6">
          <div class="relative">
            <div class="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
              <img v-if="form.avatar" :src="form.avatar" class="w-full h-full object-cover" />
              <span v-else>{{ form.nickname?.charAt(0) || 'U' }}</span>
            </div>
            <label for="avatar-upload" class="absolute bottom-0 right-0 w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-white text-xs cursor-pointer hover:bg-slate-600">
              📷
            </label>
            <input id="avatar-upload" type="file" accept="image/*" @change="handleAvatarUpload" class="hidden" />
          </div>
          <div>
            <p class="text-sm text-slate-500">上传头像</p>
            <p class="text-xs text-slate-400">建议尺寸 200x200</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ profileTexts.username || '用户名' }}</label>
            <input
              v-model="form.username"
              type="text"
              disabled
              class="w-full px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ profileTexts.nickname || '昵称' }}</label>
            <input
              v-model="form.nickname"
              type="text"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
              :placeholder="profileTexts.nicknamePlaceholder || '请输入昵称'"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ profileTexts.email || '邮箱' }}</label>
          <input
            v-model="form.email"
            type="email"
            class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
            :placeholder="profileTexts.emailPlaceholder || '请输入邮箱'"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ profileTexts.language || '语言' }}</label>
          <select
            v-model="form.language"
            class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236B7280%22%20d%3D%22M10.293%203.293L6%207.586%201.707%203.293A1%201%200%2000.293%204.707l5%205a1%201%200%20001.414%200l5-5a1%201%200%2010-1.414-1.414z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.75rem_center]"
          >
            <option value="zh-CN">简体中文</option>
            <option value="en-US">English</option>
            <option value="ja-JP">日本語</option>
            <option value="ko-KR">한국어</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ profileTexts.searchEngine || '搜索引擎' }}</label>
          <select
            v-model="form.searchEngine"
            class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236B7280%22%20d%3D%22M10.293%203.293L6%207.586%201.707%203.293A1%201%200%2000.293%204.707l5%205a1%201%200%20001.414%200l5-5a1%201%200%2010-1.414-1.414z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.75rem_center]"
          >
            <option value="https://www.bing.com/search?q=">Bing</option>
            <option value="https://www.google.com/search?q=">Google</option>
            <option value="https://www.baidu.com/s?wd=">百度</option>
            <option value="https://www.so.com/s?q=">360搜索</option>
          </select>
        </div>

        <div class="flex justify-end gap-3">
          <button 
            type="button" 
            @click="resetForm"
            class="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            {{ t('common.cancel') || '取消' }}
          </button>
          <button 
            type="submit" 
            :disabled="isSaving"
            class="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            <span v-if="isSaving" class="flex items-center gap-2">
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ t('common.saving') || '保存中...' }}
            </span>
            <span v-else>{{ t('common.save') || '保存' }}</span>
          </button>
        </div>
      </form>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div class="p-6 border-b border-slate-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">{{ profileTexts.changePassword || '修改密码' }}</h3>
      </div>
      <form @submit.prevent="handlePasswordChange" class="p-6 space-y-6">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ profileTexts.currentPassword || '当前密码' }}</label>
          <input
            v-model="passwordForm.oldPassword"
            type="password"
            class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
            :placeholder="profileTexts.currentPasswordPlaceholder || '请输入当前密码'"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ profileTexts.newPassword || '新密码' }}</label>
          <input
            v-model="passwordForm.newPassword"
            type="password"
            class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
            :placeholder="profileTexts.newPasswordPlaceholder || '请输入新密码'"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ profileTexts.confirmNewPassword || '确认新密码' }}</label>
          <input
            v-model="passwordForm.confirmPassword"
            type="password"
            class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
            :placeholder="('请再次输入' + (profileTexts.newPassword || '新密码'))"
          />
        </div>
        <div class="flex justify-end">
          <button 
            type="submit" 
            :disabled="isChangingPassword"
            class="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            <span v-if="isChangingPassword" class="flex items-center gap-2">
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ t('common.saving') || '修改中...' }}
            </span>
            <span v-else>{{ profileTexts.changePassword || '修改密码' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useGlobalSettingsStore } from '@/stores/globalSettings'
import { usePageTexts } from '@/composables/useI18n'
import { userApi } from '@/api'
import ErrorMessage from '@/components/ErrorMessage.vue'
import { sanitizeNickname, validateEmail, containsXss } from '@/utils/security'

const showSuccess = ref(false)
const successMessage = ref('')

const showSuccessMessage = (message: string) => {
  successMessage.value = message
  showSuccess.value = true
  setTimeout(() => { showSuccess.value = false }, 3000)
}

const clearMessages = () => {
  error.value = ''
  successMessage.value = ''
}

const authStore = useAuthStore()
const globalSettingsStore = useGlobalSettingsStore()
const { profile: profileTexts, t } = usePageTexts()

const error = ref('')
const isSaving = ref(false)
const isChangingPassword = ref(false)

const form = reactive({
  username: '',
  nickname: '',
  email: '',
  avatar: '',
  language: 'zh-CN',
  searchEngine: 'https://www.bing.com/search?q='
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const originalForm = { ...form }

const resetForm = () => {
  Object.assign(form, originalForm)
}

const handleSubmit = async () => {
  try {
    isSaving.value = true
    error.value = ''
    
    // 安全验证
    if (form.nickname && containsXss(form.nickname)) {
      error.value = (profileTexts.nickname || '昵称') + '包含非法字符'
      return
    }
    
    if (form.email && !validateEmail(form.email)) {
      error.value = '请输入有效的邮箱地址'
      return
    }
    
    const updateData: Record<string, any> = {}
    if (form.nickname !== originalForm.nickname) {
      updateData.nickname = sanitizeNickname(form.nickname)
    }
    if (form.email !== originalForm.email) {
      updateData.email = form.email.trim()
    }
    if (form.avatar !== originalForm.avatar) {
      updateData.avatar = form.avatar
    }
    if (form.language !== originalForm.language) {
      updateData.language = form.language
    }
    
    if (Object.keys(updateData).length > 0) {
      const res = await userApi.updateProfile(updateData)
      authStore.user = { ...authStore.user!, ...updateData }
      
      if (updateData.language) {
        await globalSettingsStore.loadSettingsByUserLanguage(updateData.language)
      }
    }
    
    // 保存搜索引擎设置
    if (form.searchEngine !== originalForm.searchEngine) {
      await userApi.updateSettings({ searchEngine: form.searchEngine })
    }
    
    Object.assign(originalForm, form)
    showSuccessMessage('保存成功')
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || '保存失败'
  } finally {
    isSaving.value = false
  }
}

const handlePasswordChange = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    error.value = '两次输入的密码不一致'
    return
  }
  if (passwordForm.newPassword.length < 6) {
    error.value = '密码长度至少为6位'
    return
  }
  
  try {
    isChangingPassword.value = true
    error.value = ''
    
    await userApi.changePassword(passwordForm.oldPassword, passwordForm.newPassword)
    showSuccessMessage('密码修改成功')
    
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || '密码修改失败'
  } finally {
    isChangingPassword.value = false
  }
}

const handleAvatarUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  if (!file.type.startsWith('image/')) {
    error.value = '请选择有效的图片文件'
    return
  }
  
  if (file.size > 2 * 1024 * 1024) {
    error.value = '图片大小不能超过 2MB'
    return
  }
  
  try {
    isSaving.value = true
    error.value = ''
    
    const res = await userApi.uploadAvatar(file)
    const avatarUrl = res.data?.avatar || res.data
    if (avatarUrl) {
      form.avatar = avatarUrl
      if (authStore.user) {
        authStore.user.avatar = avatarUrl
      }
      showSuccessMessage('头像上传成功')
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || '头像上传失败'
  } finally {
    isSaving.value = false
  }
}

const loadSettings = async () => {
  try {
    const settings = await userApi.getSettings()
    if (settings.data) {
      form.searchEngine = settings.data.searchEngine || 'https://www.bing.com/search?q='
    }
  } catch (err) {
    console.warn('加载设置失败:', err)
  }
}

onMounted(async () => {
  if (authStore.user) {
    form.username = authStore.user.username
    form.nickname = authStore.user.nickname
    form.email = authStore.user.email || ''
    form.avatar = authStore.user.avatar || ''
    form.language = authStore.user.language || 'zh-CN'
    // 先设置原始值
    Object.assign(originalForm, form)
  }
  // 加载设置（包括搜索引擎）
  await loadSettings()
  // 设置加载后，更新 originalForm 以包含搜索引擎
  Object.assign(originalForm, form)
})
</script>
