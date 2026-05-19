import { ref } from 'vue'

type EventCallback = (...args: any[]) => void

class SimpleEventBus {
  private events: Map<string, EventCallback[]> = new Map()

  on(event: string, callback: EventCallback) {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push(callback)
  }

  off(event: string, callback: EventCallback) {
    const callbacks = this.events.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  emit(event: string, ...args: any[]) {
    const callbacks = this.events.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(...args))
    }
  }
}

export const eventBus = new SimpleEventBus()

export const EVENTS = {
  SETTINGS_CHANGED: 'settings-changed',
  GLOBAL_SETTINGS_CHANGED: 'global-settings-changed',
  PAGE_TEXTS_REFRESH: 'page-texts-refresh'
} as const

const isBrowser = typeof window !== 'undefined'
const SYNC_KEY_PREFIX = 'sunpanel_sync_'

export const useCrossFrameSync = () => {
  const isSyncing = ref(false)

  const broadcastChange = (eventName: string, data: any) => {
    if (!isBrowser) return
    
    try {
      const syncData = {
        eventName,
        data,
        timestamp: Date.now()
      }
      
      localStorage.setItem(`${SYNC_KEY_PREFIX}${eventName}`, JSON.stringify(syncData))
      
      const storageEvent = new StorageEvent('storage', {
        key: `${SYNC_KEY_PREFIX}${eventName}`,
        newValue: JSON.stringify(syncData)
      })
      window.dispatchEvent(storageEvent)
      
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'sunpanel-event',
          eventName,
          data
        }, '*')
      }
      
      window.postMessage({
        type: 'sunpanel-event',
        eventName,
        data
      }, window.location.origin)
      
      console.log(`[CrossFrameSync] Broadcasted: ${eventName}`)
    } catch (e) {
      console.warn('[CrossFrameSync] Broadcast failed:', e)
    }
  }

  const listenForChanges = (eventName: string, callback: (data: any) => void) => {
    if (!isBrowser) return () => {}

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `${SYNC_KEY_PREFIX}${eventName}` && e.newValue) {
        try {
          const syncData = JSON.parse(e.newValue)
          if (syncData.eventName === eventName) {
            callback(syncData.data)
          }
        } catch (err) {
          console.warn('[CrossFrameSync] Parse failed:', err)
        }
      }
    }

    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'sunpanel-event' && e.data.eventName === eventName) {
        callback(e.data.data)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('message', handleMessage)
    }
  }

  return {
    isSyncing,
    broadcastChange,
    listenForChanges
  }
}
