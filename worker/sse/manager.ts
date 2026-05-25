/**
 * SunPanel Cloudflare Workers API
 * 使用 D1 数据库存储元数据，KV 存储图片数据
 */

export interface Env {
  SUNPANEL_DB: D1Database
  ADMIN_PASSWORD?: string
  ALLOWED_ORIGINS?: string
  ENVIRONMENT?: string
  ASSETS: {
    fetch: (request: Request) => Promise<Response>
  }
  IMAGES_KV: KVNamespace
  SSE_MANAGER?: DurableObjectNamespace
}

interface SSEClient {
  userId: number
  send: (event: string, data: any) => void
  close: () => void
}

export class SSEManager {
  state: DurableObjectState
  clients: Map<string, SSEClient>

  constructor(state: DurableObjectState) {
    this.state = state
    this.clients = new Map()
  }

  async fetch(request: Request) {
    const url = new URL(request.url)
    const path = url.pathname

    if (path === '/sse') {
      return this.handleSSE(request)
    }

    if (path === '/broadcast') {
      return this.handleBroadcast(request)
    }

    if (path === '/broadcast-message') {
      return this.handleBroadcastMessage(request)
    }

    return new Response('Not Found', { status: 404 })
  }

  async handleSSE(request: Request) {
    const userId = parseInt(request.headers.get('X-User-Id') || '0')
    //console.log(`[SSE] SSE 连接请求 - 用户: ${userId}`)

    const stream = new ReadableStream({
      start: (controller) => {
        const encoder = new TextEncoder()
        const clientId = crypto.randomUUID()

        const sendMessage = (event: string, data: any) => {
          const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
          controller.enqueue(encoder.encode(message))
        }

        const client: SSEClient = {
          userId,
          send: sendMessage,
          close: () => {
            try {
              controller.close()
            } catch {
              // ignore
            }
          }
        }

        this.clients.set(clientId, client)
        //console.log(`[SSE] 客户端已注册 - ID: ${clientId}, 用户: ${userId}, 总数: ${this.clients.size}`)

        sendMessage('connected', { message: 'SSE 连接已建立' })

        const interval = setInterval(() => {
          sendMessage('ping', { timestamp: Date.now() })
        }, 30000)

        if (controller.signal) {
          controller.signal.addEventListener('abort', () => {
            this.clients.delete(clientId)
            clearInterval(interval)
            //console.log(`[SSE] 客户端断开 - ID: ${clientId}, 用户: ${userId}, 总数: ${this.clients.size}`)
          })
        }
      },
      cancel: () => {
        console.log('[SSE] SSE 流被取消')
      }
    })

    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    })

    return new Response(stream, { headers })
  }

  async handleBroadcast(request: Request) {
    try {
      const body = await request.json()
      const { userId, event, data } = body

      // 发送给指定用户的所有客户端
      let sent = 0
      this.clients.forEach((client) => {
        if (client.userId === userId) {
          client.send(event, data)
          sent++
        }
      })

      return Response.json({ success: true, sent })
    } catch (error: any) {
      return Response.json({ success: false, error: error.message }, { status: 500 })
    }
  }

  async handleBroadcastMessage(request: Request) {
    try {
      const body = await request.json()
      const { userId, type, data } = body

      let sent = 0
      this.clients.forEach((client) => {
        if (client.userId === userId) {
          client.send(type, { type, data })
          sent++
        }
      })

      return Response.json({ success: true, sent })
    } catch (error: any) {
      return Response.json({ success: false, error: error.message }, { status: 500 })
    }
  }
}
