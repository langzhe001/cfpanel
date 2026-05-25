/**
 * 安全工具函数
 */

export const verifyToken = (request: Request): string | null => {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

export const generateToken = (): string => {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export const sanitizeHtml = (str: string): string => {
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

export const sanitizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url)
    // 只允许 http 和 https 协议
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return ''
    }
    return parsed.toString()
  } catch {
    return ''
  }
}

export const containsXss = (str: string): boolean => {
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /expression\s*\(/i,
    /url\s*\(/i,
  ]
  return xssPatterns.some(pattern => pattern.test(str))
}
