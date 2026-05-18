<template>
  <div class="space-y-6">
    <ErrorMessage
      v-if="error"
      :message="error"
      :type="messageType"
      :closable="true"
      @close="error = ''"
    />

    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div class="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">{{ t('admin.users') || '账号管理' }}</h3>
        <button 
          @click="showAddModal = true" 
          :disabled="isLoading"
          class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2 transition-colors"
        >
          <Icon icon="ph:user-plus-bold" class="w-5 h-5" />
          {{ t('admin.addAccount') || '添加账号' }}
        </button>
      </div>
      <div class="p-6">
        <div v-if="isLoading" class="py-12">
          <LoadingSpinner text="{{ t('admin.loadingUsers') || '加载用户列表...' }}" />
        </div>
        <div v-else-if="users.length === 0" class="py-12">
          <EmptyState
            icon="👥"
            title="{{ t('admin.noAccounts') || '暂无账号' }}"
            :description="t('admin.clickAddAccount') || '点击上方按钮添加账号'"
            action-text="{{ t('admin.addAccount') || '添加账号' }}"
            @action="showAddModal = true"
          />
        </div>
        <div v-else class="space-y-3">
          <div 
            v-for="user in users" 
            :key="user.id"
            class="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <div class="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-medium">
              {{ user.nickname?.charAt(0) || user.username.charAt(0) }}
            </div>
            <div class="flex-1">
              <p class="font-medium text-slate-700 dark:text-slate-300">{{ user.nickname || user.username }}</p>
              <p class="text-sm text-slate-500">{{ user.email || ('无' + (t('admin.email') || '邮箱')) }}</p>
            </div>
            <div class="px-3 py-1 rounded-full text-xs font-medium" :class="user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-400'">
              {{ user.role === 'admin' ? (t('admin.admin') || '管理员') : (t('admin.user') || '用户') }}
            </div>
            <div class="flex items-center gap-2">
              <button @click="editUser(user)" class="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors">
                <Icon icon="ph:pencil-bold" class="w-4 h-4 text-slate-500" />
              </button>
              <button 
                v-if="user.id !== currentUserId" 
                @click="deleteUser(user.id)" 
                class="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
              >
                <Icon icon="ph:trash-bold" class="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAddModal" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md">
        <div class="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">
            {{ editingUser ? (t('admin.editAccount') || '编辑账号') : (t('admin.addAccount') || '添加账号') }}
          </h3>
        </div>
        <form @submit.prevent="saveUser" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ t('admin.username') || '用户名' }}</label>
            <input 
              v-model="userForm.username" 
              type="text" 
              required 
              :disabled="!!editingUser"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white disabled:opacity-50 focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder="请输入{{ t('admin.username') || '用户名' }}"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ t('admin.nickname') || '昵称' }}</label>
            <input 
              v-model="userForm.nickname" 
              type="text" 
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder="请输入{{ t('admin.nickname') || '昵称' }}"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ t('admin.email') || '邮箱' }}</label>
            <input 
              v-model="userForm.email" 
              type="email" 
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder="请输入{{ t('admin.email') || '邮箱' }}"
            />
          </div>
          <div v-if="!editingUser">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ t('admin.password') || '密码' }}</label>
            <input 
              v-model="userForm.password" 
              type="password" 
              required 
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder="请输入{{ t('admin.password') || '密码' }}"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{ t('admin.role') || '角色' }}</label>
            <select 
              v-model="userForm.role" 
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
            >
              <option value="user">{{ t('admin.user') || '用户' }}</option>
              <option value="admin">{{ t('admin.admin') || '管理员' }}</option>
            </select>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              @click="closeModal" 
              class="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              {{ t('common.cancel') || '取消' }}
            </button>
            <button 
              type="submit" 
              :disabled="isSaving"
              class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useAuthStore } from '@/stores/auth'
import { usePageTexts } from '@/composables/useI18n'
import { userApi } from '@/api'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'
import EmptyState from '@/components/EmptyState.vue'
import type { User } from '@/types'

const authStore = useAuthStore()
const { t } = usePageTexts()

const users = ref<User[]>([])
const showAddModal = ref(false)
const editingUser = ref<User | null>(null)
const isLoading = ref(false)
const isSaving = ref(false)
const error = ref('')
const messageType = ref<'success' | 'error'>('success')

const currentUserId = computed(() => authStore.user?.id)

const userForm = reactive({
  username: '',
  nickname: '',
  email: '',
  password: '',
  role: 'user' as 'user' | 'admin'
})

const fetchUsers = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const res = await userApi.getList()
    users.value = res.data || []
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || '获取用户列表失败'
    messageType.value = 'error'
    users.value = []
  } finally {
    isLoading.value = false
  }
}

const editUser = (user: User) => {
  editingUser.value = user
  userForm.username = user.username
  userForm.nickname = user.nickname || ''
  userForm.email = user.email || ''
  userForm.password = ''
  userForm.role = user.role
  showAddModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  editingUser.value = null
  Object.assign(userForm, { username: '', nickname: '', email: '', password: '', role: 'user' })
}

const saveUser = async () => {
  isSaving.value = true
  error.value = ''
  
  try {
    if (editingUser.value) {
      await userApi.update(editingUser.value.id, {
        nickname: userForm.nickname || undefined,
        email: userForm.email || undefined,
        role: userForm.role
      })
      error.value = '用户更新成功'
      messageType.value = 'success'
    } else {
      await userApi.create({
        username: userForm.username,
        nickname: userForm.nickname || undefined,
        email: userForm.email || undefined,
        password: userForm.password,
        role: userForm.role
      })
      error.value = '用户创建成功'
      messageType.value = 'success'
    }
    closeModal()
    await fetchUsers()
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || '保存失败'
    messageType.value = 'error'
  } finally {
    isSaving.value = false
    if (messageType.value === 'success') {
      setTimeout(() => { error.value = '' }, 3000)
    }
  }
}

const deleteUser = async (id: string) => {
  if (!confirm('确定要删除这个账号吗？此操作不可撤销。')) return
  
  isLoading.value = true
  try {
    await userApi.delete(id)
    error.value = '用户删除成功'
    messageType.value = 'success'
    await fetchUsers()
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || '删除失败'
    messageType.value = 'error'
  } finally {
    isLoading.value = false
    setTimeout(() => { error.value = '' }, 3000)
  }
}

onMounted(() => {
  fetchUsers()
})
</script>