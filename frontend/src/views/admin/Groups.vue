<template>
  <div class="space-y-6">
    <!-- 错误提示 -->
    <div v-if="errorMessage" class="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
      <div class="flex items-center gap-3">
        <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-red-600 dark:text-red-400">{{ errorMessage }}</p>
        <button @click="errorMessage = ''" class="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded">
          <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 成功提示 -->
    <div v-if="successMessage" class="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl">
      <div class="flex items-center gap-3">
        <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-green-600 dark:text-green-400">{{ successMessage }}</p>
        <button @click="successMessage = ''" class="ml-auto p-1 hover:bg-green-100 dark:hover:bg-green-800 rounded">
          <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 分组列表 -->
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div class="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">分组管理</h3>
        <button @click="showGroupModal = true" :disabled="isLoading" class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2">
          <Icon icon="ph:plus-bold" class="w-5 h-5" />
          添加分组
        </button>
      </div>
      <div class="p-6">
        <div v-if="groups.length === 0" class="text-center py-12 text-slate-500">
          暂无分组，点击上方按钮添加
        </div>
        <div v-else class="space-y-3">
          <div 
            v-for="group in groups" 
            :key="group.id"
            class="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <div class="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Icon v-if="group.icon" :icon="group.icon" class="w-5 h-5 text-orange-500" />
              <Icon v-else icon="ph:folder-bold" class="w-5 h-5 text-orange-500" />
            </div>
            <div class="flex-1">
              <p class="font-medium text-slate-700 dark:text-slate-300">{{ group.name }}</p>
              <p class="text-sm text-slate-500">{{ getItemsCount(group.id) }} 个网站</p>
            </div>
            <div class="flex items-center gap-2">
              <button @click="editGroup(group)" class="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded">
                <Icon icon="ph:pencil-bold" class="w-4 h-4 text-slate-500" />
              </button>
              <button @click="deleteGroup(group.id)" class="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">
                <Icon icon="ph:trash-bold" class="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 网站管理 -->
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div class="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">网站管理</h3>
        <button @click="showItemModal = true" :disabled="isLoading" class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2">
          <Icon icon="ph:plus-bold" class="w-5 h-5" />
          添加网站
        </button>
      </div>
      <div class="p-6">
        <div v-if="items.length === 0" class="text-center py-12 text-slate-500">
          暂无网站，点击上方按钮添加
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="item in items" 
            :key="item.id"
            class="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Icon v-if="item.icon" :icon="item.icon" class="w-5 h-5 text-blue-500" />
                <Icon v-else icon="ph:globe-bold" class="w-5 h-5 text-blue-500" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-slate-700 dark:text-slate-300 truncate">{{ item.name }}</p>
                <p class="text-sm text-slate-500 truncate">{{ item.url }}</p>
              </div>
            </div>
            <div class="flex items-center justify-end gap-2 mt-3">
              <button @click="editItem(item)" class="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded">
                <Icon icon="ph:pencil-bold" class="w-4 h-4 text-slate-500" />
              </button>
              <button @click="deleteItem(item.id)" class="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">
                <Icon icon="ph:trash-bold" class="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分组弹窗 -->
    <div v-if="showGroupModal" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md">
        <div class="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">
            {{ editingGroup ? '编辑分组' : '添加分组' }}
          </h3>
        </div>
        <form @submit.prevent="saveGroup" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">名称</label>
            <input v-model="groupForm.name" type="text" required class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">图标 (Iconify)</label>
            <input v-model="groupForm.icon" type="text" placeholder="ph:folder-bold" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" @click="closeGroupModal" class="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">取消</button>
            <button type="submit" :disabled="isLoading" class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50">保存</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 网站弹窗 -->
    <div v-if="showItemModal" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-800 rounded-xl w-full max-w-lg">
        <div class="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">
            {{ editingItem ? '编辑网站' : '添加网站' }}
          </h3>
        </div>
        <form @submit.prevent="saveItem" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">名称</label>
            <input v-model="itemForm.name" type="text" required class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">网址</label>
            <input v-model="itemForm.url" type="url" required class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">图标 (Iconify)</label>
            <input v-model="itemForm.icon" type="text" placeholder="ph:globe-bold" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">描述</label>
            <input v-model="itemForm.description" type="text" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">卡片颜色</label>
            <div class="flex items-center gap-3">
              <input
                v-model="itemForm.color"
                type="color"
                class="w-12 h-12 rounded-lg cursor-pointer border-0"
              />
              <input
                v-model="itemForm.color"
                type="text"
                placeholder="#FF5733"
                class="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
              <div class="flex gap-1 overflow-x-auto max-w-32 pb-1 scrollbar-thin">
                <button
                  v-for="preset in presetColors"
                  :key="preset"
                  type="button"
                  @click="itemForm.color = preset"
                  class="w-6 h-6 rounded-full border-2 border-white dark:border-slate-700 hover:scale-110 transition-transform flex-shrink-0"
                  :style="{ backgroundColor: preset }"
                />
              </div>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">分组</label>
            <select v-model="itemForm.groupId" required class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
              <option value="">请选择分组</option>
              <option v-for="g in groups" :key="g.id" :value="g.id">{{ g.name }}</option>
            </select>
          </div>
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2">
              <input v-model="itemForm.openInNewTab" type="checkbox" class="w-4 h-4" />
              <span class="text-sm text-slate-700 dark:text-slate-300">新标签页打开</span>
            </label>
            <label class="flex items-center gap-2">
              <input v-model="itemForm.showAsWindow" type="checkbox" class="w-4 h-4" />
              <span class="text-sm text-slate-700 dark:text-slate-300">小窗口模式</span>
            </label>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" @click="closeItemModal" class="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">取消</button>
            <button type="submit" :disabled="isLoading" class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50">保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useDataStore } from '@/stores/data'
import type { Group, Item } from '@/types'

const dataStore = useDataStore()
const groups = computed(() => dataStore.groups)
const items = computed(() => dataStore.items)

const showGroupModal = ref(false)
const showItemModal = ref(false)
const editingGroup = ref<Group | null>(null)
const editingItem = ref<Item | null>(null)
const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)

const groupForm = reactive({
  name: '',
  icon: ''
})

const itemForm = reactive({
  name: '',
  url: '',
  icon: '',
  description: '',
  groupId: '',
  openInNewTab: true,
  showAsWindow: false,
  windowWidth: 800,
  windowHeight: 600,
  color: ''
})

const presetColors = [
  '#FB7299', '#00A4DC', '#FF9F43', '#4ECDC4', 
  '#A29BFE', '#FD79A8', '#00B894', '#E17055',
  '#6C5CE7', '#0984E3', '#FDCB6E', '#E84393'
]

const getItemsCount = (groupId: string) => {
  return dataStore.getItemsByGroup(groupId).length
}

const editGroup = (group: Group) => {
  editingGroup.value = group
  groupForm.name = group.name
  groupForm.icon = group.icon
  showGroupModal.value = true
}

const closeGroupModal = () => {
  showGroupModal.value = false
  editingGroup.value = null
  groupForm.name = ''
  groupForm.icon = ''
}

const saveGroup = async () => {
  try {
    isLoading.value = true
    if (editingGroup.value) {
      await dataStore.updateGroup(editingGroup.value.id, groupForm)
      successMessage.value = '分组更新成功'
    } else {
      await dataStore.addGroup(groupForm)
      successMessage.value = '分组创建成功'
    }
    closeGroupModal()
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || '操作失败，请重试'
  } finally {
    isLoading.value = false
  }
}

const deleteGroup = async (id: string) => {
  if (confirm('确定要删除这个分组吗？')) {
    try {
      isLoading.value = true
      await dataStore.deleteGroup(id)
      successMessage.value = '分组删除成功'
    } catch (error: any) {
      errorMessage.value = error.response?.data?.message || '删除失败，该分组下可能存在网站'
    } finally {
      isLoading.value = false
    }
  }
}

const editItem = (item: Item) => {
  editingItem.value = item
  Object.assign(itemForm, item)
  showItemModal.value = true
}

const closeItemModal = () => {
  showItemModal.value = false
  editingItem.value = null
  Object.assign(itemForm, {
    name: '',
    url: '',
    icon: '',
    description: '',
    groupId: '',
    openInNewTab: true,
    showAsWindow: false,
    windowWidth: 800,
    windowHeight: 600,
    color: ''
  })
}

const saveItem = async () => {
  try {
    isLoading.value = true
    if (editingItem.value) {
      await dataStore.updateItem(editingItem.value.id, itemForm)
      successMessage.value = '网站更新成功'
    } else {
      await dataStore.addItem(itemForm)
      successMessage.value = '网站创建成功'
    }
    closeItemModal()
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || '操作失败，请重试'
  } finally {
    isLoading.value = false
  }
}

const deleteItem = async (id: string) => {
  if (confirm('确定要删除这个网站吗？')) {
    try {
      isLoading.value = true
      await dataStore.deleteItem(id)
      successMessage.value = '网站删除成功'
    } catch (error: any) {
      errorMessage.value = error.response?.data?.message || '删除失败，请重试'
    } finally {
      isLoading.value = false
    }
  }
}

onMounted(() => {
  dataStore.fetchAll()
})
</script>
