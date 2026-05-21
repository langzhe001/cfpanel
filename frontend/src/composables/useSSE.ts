import { ref, onUnmounted } from 'vue'

export interface SSEMessage {
  type: string
  data: any
}

export interface GroupUpdate {
  id: string
  name: string
  icon: string
  parentId: string | null
  order: number
  createdAt: string
  updatedAt: string
}

export interface ItemUpdate {
  id: string
  name: string
  url: string
  icon: string
  description: string
  groupId: string
  order: number
  openInNewTab: boolean
  showAsWindow: boolean
  windowWidth: number
  windowHeight: number
  color: string
  createdAt: string
  updatedAt: string
}

export interface SettingsUpdate {
  theme: string
  language: string
  wallpaper: string
  wallpaperType: string
  showSearchBar: boolean
  searchEngine: string
  itemsPerRow: number
  mobileItemsPerRow: number
  tabletItemsPerRow: number
  desktopItemsPerRow: number
  showGroupNames: boolean
  customCSS: string
}

export interface SSEEventMap {
  connected: { message: string }
  ping: { timestamp: number }
  groupCreated: GroupUpdate
  groupUpdated: GroupUpdate
  groupDeleted: { id: string }
  itemCreated: ItemUpdate
  itemUpdated: ItemUpdate
  itemDeleted: { id: string }
  settingsChanged: SettingsUpdate
}

export const useSSE = () => {
  const eventSource = ref<EventSource | null>(null)
  const isConnected = ref(false)
  const error = ref<Error | null>(null)

  const connect = (url: string = '/api/sse') => {
    if (eventSource.value) {
      eventSource.value.close()
    }

    eventSource.value = new EventSource(url, {
      withCredentials: true
    })

    eventSource.value.onopen = () => {
      isConnected.value = true
      error.value = null
      console.log('[SSE] 连接已建立')
    }

    eventSource.value.onerror = (e) => {
      isConnected.value = false
      console.warn('[SSE] 连接不可用，将使用备用通信方式:', e)
      
      if (eventSource.value?.readyState === EventSource.CLOSED) {
        error.value = new Error('SSE 服务不可用')
      }
    }
  }

  const onMessage = (callback: (message: SSEMessage) => void) => {
    if (!eventSource.value) return () => {}

    const handler = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data)
        callback(data)
      } catch (err) {
        console.error('[SSE] 解析消息失败:', err)
      }
    }

    eventSource.value.addEventListener('message', handler)

    return () => {
      eventSource.value?.removeEventListener('message', handler)
    }
  }

  const on = <K extends keyof SSEEventMap>(eventName: K, callback: (data: SSEEventMap[K]) => void) => {
    if (!eventSource.value) return () => {}

    const handler = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data) as SSEEventMap[K]
        callback(data)
      } catch (err) {
        console.error(`[SSE] 解析 ${eventName} 消息失败:`, err)
      }
    }

    eventSource.value.addEventListener(eventName, handler)

    return () => {
      eventSource.value?.removeEventListener(eventName, handler)
    }
  }

  const disconnect = () => {
    if (eventSource.value) {
      eventSource.value.close()
      eventSource.value = null
      isConnected.value = false
      console.log('[SSE] 连接已关闭')
    }
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    eventSource,
    isConnected,
    error,
    connect,
    disconnect,
    onMessage,
    on
  }
}
