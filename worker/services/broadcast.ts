/**
 * SSE 广播服务
 */

export const broadcastToUser = async (userId: number, event: string, data: any, env: any) => {
  if (!env.SSE_MANAGER) {
    console.log('[Broadcast] SSE_MANAGER Durable Object 未配置')
    return
  }

  try {
    const id = env.SSE_MANAGER.idFromName('sse-manager')
    const stub = env.SSE_MANAGER.get(id)

    const response = await stub.fetch(new Request('http://localhost/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, event, data })
    }))

    const result = await response.json()
    //console.log(`[Broadcast] 广播结果: ${JSON.stringify(result)}`)
  } catch (error: any) {
    //console.log(`[Broadcast] 广播失败: ${error.message}`)
  }
}

export const broadcastToUserOld = async (userId: number, eventType: string, data: any, env: any) => {
  console.log('[SSE] broadcastToUserOld 被调用 - 用户:', userId, '事件:', eventType)
  console.log('[SSE] IMAGES_KV 是否存在:', !!env.IMAGES_KV)
  
  if (!env.IMAGES_KV) {
    console.log('[SSE] IMAGES_KV 未配置，跳过推送')
    return
  }

  try {
    const messageKey = `sse_messages_${userId}`
    console.log('[SSE] 消息键:', messageKey)
    
    let eventName: string
    let eventData: any
    
    if (data && typeof data === 'object' && 'type' in data && 'data' in data) {
      eventName = toCamelCase(data.type)
      eventData = data.data
    } else {
      eventName = toCamelCase(eventType)
      eventData = data
    }

    const newMessage = {
      id: Date.now(),
      event: eventName,
      data: eventData
    }

    const existingJson = await env.IMAGES_KV.get(messageKey, 'text')
    const messages = existingJson ? JSON.parse(existingJson) : []
    messages.push(newMessage)

    const messagesJson = JSON.stringify(messages)
    await env.IMAGES_KV.put(messageKey, messagesJson)
    
    const verifyJson = await env.IMAGES_KV.get(messageKey)
    if (verifyJson) {
      const verifyMessages = JSON.parse(verifyJson)
    }
  } catch (error: any) {
    console.log(`[SSE] 广播失败: ${error.message}`)
  }
}

const toCamelCase = (str: string | undefined | null): string => {
  if (!str) return ''
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())
}
