<template>
  <div class="max-w-2xl">
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div class="p-6 border-b border-slate-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">个人信息</h3>
      </div>
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <div class="flex items-center gap-6">
          <div class="relative">
            <div class="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
              <img v-if="form.avatar" :src="form.avatar" class="w-full h-full object-cover" />
              <span v-else>{{ form.nickname?.charAt(0) || 'U' }}</span>
            </div>
            <button type="button" class="absolute bottom-0 right-0 w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-white text-xs">
              📷
            </button>
          </div>
          <div>
            <p class="text-sm text-slate-500">上传头像</p>
            <p class="text-xs text-slate-400">建议尺寸 200x200</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">用户名</label>
            <input
              v-model="form.username"
              type="text"
              disabled
              class="w-full px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">昵称</label>
            <input
              v-model="form.nickname"
              type="text"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">邮箱</label>
          <input
            v-model="form.email"
            type="email"
            class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>

        <div class="flex justify-end gap-3">
          <button type="button" class="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            取消
          </button>
          <button type="submit" class="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
            保存
          </button>
        </div>
      </form>
    </div>

    <!-- 修改密码 -->
    <div class="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div class="p-6 border-b border-slate-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">修改密码</h3>
      </div>
      <form @submit.prevent="handlePasswordChange" class="p-6 space-y-6">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">当前密码</label>
          <input
            v-model="passwordForm.oldPassword"
            type="password"
            class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">新密码</label>
          <input
            v-model="passwordForm.newPassword"
            type="password"
            class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">确认新密码</label>
          <input
            v-model="passwordForm.confirmPassword"
            type="password"
            class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>
        <div class="flex justify-end">
          <button type="submit" class="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
            修改密码
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { userApi } from '@/api'

const authStore = useAuthStore()

const form = reactive({
  username: '',
  nickname: '',
  email: '',
  avatar: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

onMounted(() => {
  if (authStore.user) {
    form.username = authStore.user.username
    form.nickname = authStore.user.nickname
    form.email = authStore.user.email || ''
    form.avatar = authStore.user.avatar || ''
  }
})

const handleSubmit = async () => {
  try {
    await userApi.updateProfile(form)
    alert('保存成功')
  } catch {
    alert('保存失败')
  }
}

const handlePasswordChange = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }
  if (passwordForm.newPassword.length < 6) {
    alert('密码长度至少为6位')
    return
  }
  try {
    await userApi.changePassword(passwordForm.oldPassword, passwordForm.newPassword)
    alert('密码修改成功')
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch {
    alert('密码修改失败')
  }
}
</script>
