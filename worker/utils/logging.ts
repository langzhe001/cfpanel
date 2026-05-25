/**
 * 日志工具
 */

export const generateRequestId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const sanitizeLogValue = (value: unknown): string => {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'string') {
    // 限制长度并移除可能的敏感信息
    return value.length > 200 ? value.substring(0, 200) + '...' : value
  }
  if (typeof value === 'object') {
    try {
      const str = JSON.stringify(value)
      return str.length > 200 ? str.substring(0, 200) + '...' : str
    } catch {
      return '[Object]'
    }
  }
  return String(value)
}

export const log = (message: string, level: 'info' | 'warn' | 'error' = 'info', requestId?: string) => {
  const timestamp = new Date().toISOString()
  const prefix = requestId ? `[${requestId}]` : ''
  const logMessage = `${timestamp} ${prefix} ${message}`
  
  switch (level) {
    case 'error':
      console.error(logMessage)
      break
    case 'warn':
      console.warn(logMessage)
      break
    default:
      console.log(logMessage)
  }
}

export const maskIpAddress = (ip: string): string => {
  if (!ip) return 'unknown'
  const parts = ip.split('.')
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.xxx.xxx`
  }
  return ip.substring(0, 8) + '...'
}
