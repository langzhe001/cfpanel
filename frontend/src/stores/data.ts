import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Group, Item } from '@/types'
import { groupApi, itemApi, cacheApi } from '@/api'

export interface FetchError {
  message: string
  code?: string
  timestamp: number
}

export const useDataStore = defineStore('data', () => {
  const groups = ref<Group[]>([])
  const items = ref<Item[]>([])
  const isLoading = ref(false)
  const isLoadingGroups = ref(false)
  const isLoadingItems = ref(false)
  const error = ref<FetchError | null>(null)

  const hasError = computed(() => error.value !== null)

  const clearError = () => {
    error.value = null
  }

  const setError = (message: string, code?: string) => {
    error.value = { message, code, timestamp: Date.now() }
  }

  const fetchGroups = async () => {
    isLoadingGroups.value = true
    error.value = null
    try {
      const res = await groupApi.getList()
      groups.value = res.data.sort((a, b) => a.order - b.order)
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || '获取分组失败'
      setError(msg)
      groups.value = []
    } finally {
      isLoadingGroups.value = false
    }
  }

  const fetchItems = async (groupId?: string) => {
    isLoadingItems.value = true
    error.value = null
    try {
      const res = await itemApi.getList(groupId)
      items.value = res.data.sort((a, b) => a.order - b.order)
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || '获取网站列表失败'
      setError(msg)
      items.value = []
    } finally {
      isLoadingItems.value = false
    }
  }

  const fetchAll = async () => {
    isLoading.value = true
    error.value = null
    try {
      await Promise.all([fetchGroups(), fetchItems()])
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || '获取数据失败'
      setError(msg)
    } finally {
      isLoading.value = false
    }
  }

  const refreshAll = async () => {
    cacheApi.clear()
    await fetchAll()
  }

  const addGroup = async (data: Partial<Group>) => {
    try {
      const res = await groupApi.create(data)
      groups.value.push(res.data)
      groups.value.sort((a, b) => a.order - b.order)
      return res.data
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || '创建分组失败'
      setError(msg)
      throw err
    }
  }

  const updateGroup = async (id: string, data: Partial<Group>) => {
    try {
      const res = await groupApi.update(id, data)
      const index = groups.value.findIndex(g => g.id === id)
      if (index !== -1) {
        groups.value[index] = res.data
      }
      groups.value.sort((a, b) => a.order - b.order)
      return res.data
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || '更新分组失败'
      setError(msg)
      throw err
    }
  }

  const deleteGroup = async (id: string) => {
    try {
      await groupApi.delete(id)
      groups.value = groups.value.filter(g => g.id !== id)
      items.value = items.value.filter(i => i.groupId !== id)
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || '删除分组失败'
      setError(msg)
      throw err
    }
  }

  const addItem = async (data: Partial<Item>) => {
    try {
      const res = await itemApi.create(data)
      items.value.push(res.data)
      items.value.sort((a, b) => a.order - b.order)
      return res.data
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || '创建网站失败'
      setError(msg)
      throw err
    }
  }

  const updateItem = async (id: string, data: Partial<Item>) => {
    try {
      const res = await itemApi.update(id, data)
      const index = items.value.findIndex(i => i.id === id)
      if (index !== -1) {
        items.value[index] = res.data
      }
      items.value.sort((a, b) => a.order - b.order)
      return res.data
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || '更新网站失败'
      setError(msg)
      throw err
    }
  }

  const deleteItem = async (id: string) => {
    try {
      await itemApi.delete(id)
      items.value = items.value.filter(i => i.id !== id)
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || '删除网站失败'
      setError(msg)
      throw err
    }
  }

  const getItemsByGroup = (groupId: string) => {
    return items.value.filter(i => i.groupId === groupId)
  }

  const getItemCountByGroup = (groupId: string) => {
    return items.value.filter(i => i.groupId === groupId).length
  }

  return {
    groups,
    items,
    isLoading,
    isLoadingGroups,
    isLoadingItems,
    error,
    hasError,
    clearError,
    fetchGroups,
    fetchItems,
    fetchAll,
    refreshAll,
    addGroup,
    updateGroup,
    deleteGroup,
    addItem,
    updateItem,
    deleteItem,
    getItemsByGroup,
    getItemCountByGroup
  }
})