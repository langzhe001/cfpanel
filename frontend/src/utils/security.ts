/**
 * XSS 防护工具函数
 * 提供输入验证、输出编码和安全处理功能
 */

/**
 * HTML 特殊字符转义
 * 防止 XSS 攻击的基础函数
 */
export const escapeHtml = (str: string | null | undefined): string => {
  if (str == null) return ''
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * 安全的 innerHTML 设置
 * 使用 DOMPurify 风格的基础清理
 */
export const setSafeInnerHTML = (element: HTMLElement, html: string): void => {
  const safeHtml = sanitizeHtml(html)
  element.innerHTML = safeHtml
}

/**
 * HTML 内容清理（基础实现）
 * 移除危险标签和属性
 */
export const sanitizeHtml = (html: string | null | undefined): string => {
  if (html == null) return ''
  
  let sanitized = String(html)
  
  const dangerousTags = [
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /<style[^>]*>[\s\S]*?<\/style>/gi,
    /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
    /<object[^>]*>[\s\S]*?<\/object>/gi,
    /<embed[^>]*>[\s\S]*?<\/embed>/gi,
    /<applet[^>]*>[\s\S]*?<\/applet>/gi,
    /<base[^>]*>/gi,
    /<form[^>]*>[\s\S]*?<\/form>/gi,
    /<svg[^>]*>[\s\S]*?<\/svg>/gi,
    /<math[^>]*>[\s\S]*?<\/math>/gi,
    /<canvas[^>]*>[\s\S]*?<\/canvas>/gi
  ]
  
  for (const pattern of dangerousTags) {
    sanitized = sanitized.replace(pattern, '')
  }
  
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=\s*[^>\s]*/gi, '')
  
  sanitized = sanitized.replace(/javascript:/gi, '')
  sanitized = sanitized.replace(/vbscript:/gi, '')
  sanitized = sanitized.replace(/data:/gi, '')
  
  return sanitized
}

/**
 * 反转义 HTML 特殊字符
 */
export const unescapeHtml = (str: string | null | undefined): string => {
  if (str == null) return ''
  
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
}

/**
 * URL 编码
 */
export const encodeUrl = (str: string | null | undefined): string => {
  if (str == null) return ''
  return encodeURIComponent(str)
}

/**
 * 安全的 URL 解码
 */
export const decodeUrl = (str: string | null | undefined): string => {
  if (str == null) return ''
  try {
    return decodeURIComponent(str)
  } catch {
    return str
  }
}

/**
 * 去除危险的 JavaScript 协议
 */
export const sanitizeUrl = (url: string | null | undefined): string => {
  if (url == null) return ''
  
  let str = String(url).trim()
  
  // 禁止 javascript: 协议
  if (/^javascript:/i.test(str)) {
    return '#'
  }
  
  // 禁止 data: 协议（除了图片）
  if (/^data:/i.test(str) && !/^data:image\//i.test(str)) {
    return '#'
  }
  
  // 禁止 vbscript: 协议
  if (/^vbscript:/i.test(str)) {
    return '#'
  }
  
  // 禁止 livescript: 协议
  if (/^livescript:/i.test(str)) {
    return '#'
  }
  
  // 禁止 mocha: 协议
  if (/^mocha:/i.test(str)) {
    return '#'
  }
  
  // 禁止 shell: 协议
  if (/^shell:/i.test(str)) {
    return '#'
  }
  
  // 禁止 filesystem: 协议
  if (/^filesystem:/i.test(str)) {
    return '#'
  }
  
  // 移除 URL 中的 JavaScript 伪协议编码
  str = str.replace(/(%6A|%4A)(%61|%41)(%76|%56)(%61|%41)(%73|%53)(%63|%43)(%72|%52)(%69|%49)(%70|%50)(%74|%54)(%3A|%3a)/gi, '#')
  
  // 验证基础 URL 格式
  try {
    const urlObj = new URL(str)
    const allowedProtocols = ['http:', 'https:', 'ftp:', 'ftps:']
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return '#'
    }
    return str
  } catch {
    // 如果不是有效的 URL，返回原值让后续处理
    return str
  }
}

/**
 * 验证并清理用户名
 */
export const sanitizeUsername = (username: string | null | undefined): string => {
  if (username == null) return ''
  
  // 只允许字母、数字、下划线和连字符
  return String(username).trim().replace(/[^\w\-]/g, '').slice(0, 50)
}

/**
 * 验证邮箱格式
 */
export const validateEmail = (email: string | null | undefined): boolean => {
  if (email == null) return false
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(String(email).trim())
}

/**
 * 清理并验证昵称
 */
export const sanitizeNickname = (nickname: string | null | undefined): string => {
  if (nickname == null) return ''
  
  // 允许中文、字母、数字、下划线、连字符和一些常见符号
  // 但不允许 HTML 标签和脚本
  return escapeHtml(String(nickname).trim()).slice(0, 100)
}

/**
 * 检测潜在的 XSS 攻击模式
 */
export const containsXss = (str: string | null | undefined): boolean => {
  if (str == null) return false
  
  const s = String(str).toLowerCase()
  
  // 常见 XSS 模式
  const patterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onload=/i,
    /onclick=/i,
    /onmouseover=/i,
    /onfocus=/i,
    /onblur=/i,
    /expression\(/i,
    /eval\(/i,
    /alert\(/i,
    /document\./i,
    /window\./i,
    /\.\.\//
  ]
  
  return patterns.some(pattern => pattern.test(s))
}

/**
 * 安全的 JSON 解析
 */
export const safeJsonParse = <T>(str: string | null | undefined, fallback: T): T => {
  if (str == null) return fallback
  
  try {
    return JSON.parse(str) as T
  } catch {
    return fallback
  }
}

/**
 * 安全的 CSS 过滤
 * 移除危险的 CSS 属性和表达式
 */
export const sanitizeCSS = (css: string | null | undefined): string => {
  if (!css) return ''
  
  const dangerousPatterns = [
    /expression\(/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /url\(['"]?javascript:/gi,
    /url\(['"]?vbscript:/gi,
    /on\w+\s*=/gi,
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
    /<svg[^>]*>[\s\S]*?<\/svg>/gi,
    /@import\s+["']?javascript:/gi,
    /@import\s+["']?vbscript:/gi
  ]
  
  let sanitized = css
  for (const pattern of dangerousPatterns) {
    sanitized = sanitized.replace(pattern, '')
  }
  
  return sanitized.trim()
}

/**
 * 安全的 HTML 属性值处理
 */
export const sanitizeHtmlAttribute = (value: string | null | undefined): string => {
  if (value == null) return ''
  
  // 转义所有引号和特殊字符
  return escapeHtml(String(value).trim())
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * 验证输入长度
 */
export const validateLength = (str: string | null | undefined, min: number, max: number): boolean => {
  if (str == null) return false
  const len = String(str).length
  return len >= min && len <= max
}

/**
 * 移除 HTML 标签
 */
export const stripHtml = (str: string | null | undefined): string => {
  if (str == null) return ''
  return String(str).replace(/<[^>]*>/g, '')
}

/**
 * 安全的文件名生成
 */
export const sanitizeFilename = (filename: string | null | undefined): string => {
  if (filename == null) return ''
  
  // 移除路径遍历字符
  let sanitized = String(filename)
    .replace(/[\\\/\:\*\?\"\<\>\|]/g, '_') // 移除非法字符
    .replace(/\.\./g, '_') // 防止路径遍历
    .trim()
  
  // 限制长度
  if (sanitized.length > 255) {
    const extIndex = sanitized.lastIndexOf('.')
    if (extIndex > 0) {
      const ext = sanitized.slice(extIndex)
      sanitized = sanitized.slice(0, 255 - ext.length) + ext
    } else {
      sanitized = sanitized.slice(0, 255)
    }
  }
  
  return sanitized || 'file'
}

/**
 * 生成安全的随机字符串
 */
export const generateSecureRandomString = (length: number = 32): string => {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * 生成安全的 UUID
 */
export const generateUUID = (): string => {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  array[6] = (array[6] & 0x0f) | 0x40
  array[8] = (array[8] & 0x3f) | 0x80
  
  return Array.from(array, byte => byte.toString(16).padStart(2, '0'))
    .join('')
    .replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5')
}

/**
 * 验证密码强度
 */
export const validatePasswordStrength = (password: string | null | undefined): {
  strong: boolean
  score: number
  feedback: string
} => {
  if (!password) {
    return { strong: false, score: 0, feedback: '密码不能为空' }
  }
  
  let score = 0
  
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1
  
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[@$!%*?&]/.test(password)) score += 1
  
  if (/(.)\1{2,}/.test(password)) score -= 1
  
  let feedback = ''
  if (score <= 2) {
    feedback = '密码强度弱，请使用更长的密码并包含大小写字母、数字和特殊字符'
  } else if (score <= 4) {
    feedback = '密码强度中等，建议增加长度和复杂度'
  } else {
    feedback = '密码强度良好'
  }
  
  return {
    strong: score >= 5,
    score,
    feedback
  }
}

/**
 * 安全的字符串比较（时序攻击防护）
 */
export const secureStringCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  
  return result === 0
}

/**
 * 安全的对象深拷贝
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T
  }
  
  if (typeof obj === 'object') {
    const cloned: Record<string, any> = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned as T
  }
  
  return obj
}

/**
 * 防止 JSON 原型污染
 */
export const safeJsonParseWithProtection = <T>(str: string | null | undefined, fallback: T): T => {
  if (str == null) return fallback
  
  try {
    const parsed = JSON.parse(str) as T
    
    if (typeof parsed === 'object' && parsed !== null) {
      const hasOwnProperty = Object.prototype.hasOwnProperty
      const checkObj = (obj: any): void => {
        for (const key in obj) {
          if (hasOwnProperty.call(obj, key)) {
            if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
              throw new Error('Prototype pollution detected')
            }
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              checkObj(obj[key])
            }
          }
        }
      }
      checkObj(parsed)
    }
    
    return parsed
  } catch {
    return fallback
  }
}
