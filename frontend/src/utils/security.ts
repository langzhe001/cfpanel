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
