/**
 * SSE 管理器 Composable
 * 提供统一的 SSE 连接管理和事件订阅
 */

import { ref, readonly, onUnmounted } from 'vue'
import type { SSEMessage, SSEEventMap } from './useSSE'

// SSE 连接状态
export type SSEConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

// 事件订阅者类型
type EventCallback<T = any> = (data: T) => void

// 全局 SSE 连接实例
let globalEventSource: EventSource | null = null
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_DELAY = 3000

// 全局状态
const isConnected = ref(false)
const connectionStatus = ref<SSEConnectionStatus>('disconnected')
const error = ref<Error | null>(null)

// 全局订阅者列表
const globalSubscribers = new Map<string, Set<EventCallback>>()

// 自动重连定时器
let reconnectTimer: number | null = null

/**
 * 连接到 SSE 服务器
 */
const connect = (url: string = '/api/sse'): void => {
  if (globalEventSource && connectionStatus.value === 'connected') {
    console.log('[SSEManager] SSE 已经连接，无需重复连接')
    return
  }

  // 如果正在连接，先关闭
  if (connectionStatus.value === 'connecting') {
    console.log('[SSEManager] SSE 正在连接中，先关闭现有连接')
    disconnect()
  }

  console.log('[SSEManager] 开始连接 SSE:', url)
  connectionStatus.value = 'connecting'

  globalEventSource = new EventSource(url, {
    withCredentials: true
  })

  globalEventSource.onopen = () => {
    console.log('[SSEManager] SSE 连接已建立')
    isConnected.value = true
    connectionStatus.value = 'connected'
    error.value = null
    reconnectAttempts = 0
  }

  globalEventSource.onerror = (e) => {
    console.warn('[SSEManager] SSE 连接错误:', e)
    isConnected.value = false
    connectionStatus.value = 'error'
    
    if (globalEventSource?.readyState === EventSource.CLOSED) {
      error.value = new Error('SSE 连接已关闭')
      scheduleReconnect(url)
    }
  }

  // 监听所有事件
  globalEventSource.onmessage = (e: MessageEvent) => {
    try {
      const message = JSON.parse(e.data) as SSEMessage
      notifySubscribers('message', message)
    } catch (err) {
      console.error('[SSEManager] 解析消息失败:', err)
    }
  }

  // 为每种事件类型添加监听器
  const eventNames: (keyof SSEEventMap)[] = [
    'connected',
    'ping',
    'groupCreated',
    'groupUpdated',
    'groupDeleted',
    'itemCreated',
    'itemUpdated',
    'itemDeleted',
    'settingsChanged'
  ]

  eventNames.forEach(eventName => {
    globalEventSource?.addEventListener(eventName, (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data)
        notifySubscribers(eventName, data)
      } catch (err) {
        console.error(`[SSEManager] 解析 ${eventName} 事件失败:`, err)
      }
    })
  })
}

/**
 * 断开 SSE 连接
 */
const disconnect = (): void => {
  console.log('[SSEManager] 断开 SSE 连接')
  
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }

  if (globalEventSource) {
    globalEventSource.close()
    globalEventSource = null
  }

  isConnected.value = false
  connectionStatus.value = 'disconnected'
}

/**
 * 调度重连
 */
const scheduleReconnect = (url: string): void => {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.warn('[SSEManager] 达到最大重连次数，停止重连')
    error.value = new Error('SSE 连接失败，请刷新页面重试')
    return
  }

  reconnectAttempts++
  const delay = RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1) // 指数退避
  
  console.log(`[SSEManager] ${delay}ms 后尝试第 ${reconnectAttempts} 次重连...`)
  
  reconnectTimer = window.setTimeout(() => {
    connect(url)
  }, delay)
}

/**
 * 通知订阅者
 */
const notifySubscribers = (eventName: string, data: any): void => {
  const subscribers = globalSubscribers.get(eventName)
  if (subscribers) {
    subscribers.forEach(callback => {
      try {
        callback(data)
      } catch (err) {
        console.error(`[SSEManager] 执行订阅者回调失败:`, err)
      }
    })
  }
}

/**
 * 订阅 SSE 事件
 * @param eventName 事件名称
 * @param callback 回调函数
 * @returns 取消订阅的函数
 */
export const useSSESubscription = <K extends keyof SSEEventMap>(
  eventName: K,
  callback: (data: SSEEventMap[K]) => void
): (() => void) => {
  if (!globalSubscribers.has(eventName as string)) {
    globalSubscribers.set(eventName as string, new Set())
  }
  
  const subscribers = globalSubscribers.get(eventName as string)!
  subscribers.add(callback)

  console.log(`[SSEManager] 订阅事件: ${eventName}, 当前订阅者: ${subscribers.size}`)

  // 返回取消订阅函数
  return () => {
    subscribers.delete(callback)
    console.log(`[SSEManager] 取消订阅事件: ${eventName}, 剩余订阅者: ${subscribers.size}`)
    
    // 如果没有订阅者了，可以选择断开连接
    // 但为了保持连接的活跃性，我们暂时不断开
  }
}

/**
 * 监听原始消息
 */
export const onSSEMessage = (callback: (message: SSEMessage) => void): (() => void) => {
  return useSSESubscription('message' as any, callback as any)
}

/**
 * SSE 管理器 Hook
 * 提供 SSE 状态和连接管理功能
 */
export const useSSEManager = () => {
  // 在组件卸载时不断开连接，只清理订阅
  onUnmounted(() => {
    // 不在这里断开连接，因为可能是全局连接
    // 订阅者会在订阅时自动管理
  })

  return {
    // 状态（只读）
    isConnected: readonly(isConnected),
    connectionStatus: readonly(connectionStatus),
    error: readonly(error),
    
    // 方法
    connect,
    disconnect,
    subscribe: useSSESubscription,
    onMessage: onSSEMessage
  }
}

// 导出类型
export type { SSEEventMap, SSEMessage }
