import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Group, Item } from '@/types'
import { groupApi, itemApi } from '@/api'

export const useDataStore = defineStore('data', () => {
  const groups = ref<Group[]>([])
  const items = ref<Item[]>([])
  const isLoading = ref(false)

  const fetchGroups = async () => {
    try {
      const res = await groupApi.getList()
      groups.value = res.data.sort((a, b) => a.order - b.order)
    } catch {
      groups.value = []
    }
  }

  const fetchItems = async (groupId?: string) => {
    try {
      const res = await itemApi.getList(groupId)
      items.value = res.data.sort((a, b) => a.order - b.order)
    } catch {
      items.value = []
    }
  }

  const fetchAll = async () => {
    isLoading.value = true
    await Promise.all([fetchGroups(), fetchItems()])
    isLoading.value = false
  }

  const addGroup = async (data: Partial<Group>) => {
    const res = await groupApi.create(data)
    groups.value.push(res.data)
    return res.data
  }

  const updateGroup = async (id: string, data: Partial<Group>) => {
    const res = await groupApi.update(id, data)
    const index = groups.value.findIndex(g => g.id === id)
    if (index !== -1) {
      groups.value[index] = res.data
    }
    return res.data
  }

  const deleteGroup = async (id: string) => {
    await groupApi.delete(id)
    groups.value = groups.value.filter(g => g.id !== id)
  }

  const addItem = async (data: Partial<Item>) => {
    const res = await itemApi.create(data)
    items.value.push(res.data)
    return res.data
  }

  const updateItem = async (id: string, data: Partial<Item>) => {
    const res = await itemApi.update(id, data)
    const index = items.value.findIndex(i => i.id === id)
    if (index !== -1) {
      items.value[index] = res.data
    }
    return res.data
  }

  const deleteItem = async (id: string) => {
    await itemApi.delete(id)
    items.value = items.value.filter(i => i.id !== id)
  }

  const getItemsByGroup = (groupId: string) => {
    return items.value.filter(i => i.groupId === groupId)
  }

  return {
    groups,
    items,
    isLoading,
    fetchGroups,
    fetchItems,
    fetchAll,
    addGroup,
    updateGroup,
    deleteGroup,
    addItem,
    updateItem,
    deleteItem,
    getItemsByGroup
  }
})
