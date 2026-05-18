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
}

const getAllowedOrigins = (env: Env): string[] => {
  if (!env.ALLOWED_ORIGINS) {
    return ['http://localhost:5173', 'http://localhost:8787']
  }
  return env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
}

const getCorsHeaders = (request: Request, env: Env): Record<string, string> => {
  const origin = request.headers.get('Origin')
  const allowedOrigins = getAllowedOrigins(env)

  if (!origin) {
    log(`CORS: 直接访问，无 Origin 头`, 'info')
    return {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token'
    }
  }

  const originWithoutTrailing = origin.replace(/\/$/, '')
  const matched = allowedOrigins.some(allowed => {
    const allowedWithoutTrailing = allowed.replace(/\/$/, '')
    return originWithoutTrailing === allowedWithoutTrailing
  })

  if (!matched) {
    log(`CORS: 不允许的来源 - Origin: ${origin}, 允许的来源: ${allowedOrigins.join(', ')}`, 'warn')
    return {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token'
    }
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin'
  }
}

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Expect-CT': 'max-age=86400, enforce'
}

const generateRequestId = (): string => {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
}

const sanitizeLogValue = (value: unknown): string => {
  if (value === null || value === undefined) return 'null'
  
  const strValue = String(value)
  
  const sensitivePatterns = [
    /password/i,
    /token/i,
    /secret/i,
    /csrf/i,
    /authorization/i
  ]
  
  if (sensitivePatterns.some(pattern => pattern.test(strValue))) {
    return '[REDACTED]'
  }
  
  if (strValue.length > 200) {
    return strValue.substring(0, 200) + '...'
  }
  
  return strValue
}

const log = (message: string, level: 'info' | 'warn' | 'error' = 'info', requestId?: string) => {
  const timestamp = new Date().toISOString()
  const requestPrefix = requestId ? `[${requestId}] ` : ''
  const sanitizedMessage = sanitizeLogValue(message)
  console.log(`[${level.toUpperCase()}] ${timestamp} - ${requestPrefix}${sanitizedMessage}`)
}

type AuditEventType = 'LOGIN' | 'LOGOUT' | 'REGISTER' | 'PASSWORD_CHANGE' | 'PROFILE_UPDATE' | 'DATA_EXPORT' | 'DATA_IMPORT' | 'GROUP_CREATE' | 'GROUP_UPDATE' | 'GROUP_DELETE' | 'ITEM_CREATE' | 'ITEM_UPDATE' | 'ITEM_DELETE' | 'IMAGE_UPLOAD' | 'IMAGE_DELETE' | 'LOGIN_FAILED' | 'RATE_LIMIT_EXCEEDED' | 'CSRF_VALIDATION_FAILED' | 'UNAUTHORIZED_ACCESS'

const maskIpAddress = (ip: string): string => {
  if (!ip || ip === 'unknown') return 'unknown'
  const parts = ip.split('.')
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.xxx.xxx`
  }
  return 'masked'
}

const auditLog = async (env: Env, event: AuditEventType, data: {
  userId?: number
  username?: string
  ip?: string
  userAgent?: string
  resource?: string
  action?: string
  result?: string
  details?: string
}): Promise<void> => {
  try {
    const now = new Date().toISOString()
    await env.SUNPANEL_DB.prepare(`
      INSERT INTO audit_logs (event_type, user_id, username, ip_address, user_agent, resource, action, result, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      event,
      data.userId || null,
      data.username || null,
      maskIpAddress(data.ip || '') || null,
      data.userAgent ? (data.userAgent.length > 200 ? data.userAgent.substring(0, 200) : data.userAgent) : null,
      data.resource || null,
      data.action || null,
      data.result || null,
      data.details || null,
      now
    ).run()
  } catch (error: any) {
    console.error(`审计日志记录失败: ${error.message}`)
  }
}

const setAuthCookies = (sessionId: string, csrfToken: string, env: Env): string => {
  const cookieOptions = 'HttpOnly; Secure; SameSite=Strict; Path=/'
  const maxAge = 7 * 24 * 60 * 60
  return `session_token=${sessionId}; ${cookieOptions}; Max-Age=${maxAge}, csrf_token=${csrfToken}; ${cookieOptions}; Max-Age=${maxAge}`
}

const jsonResponse = (data: any, status = 200, corsHeaders: Record<string, string>, requestId?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...corsHeaders,
    ...securityHeaders
  }
  if (requestId) {
    headers['X-Request-Id'] = requestId
  }
  
  return new Response(JSON.stringify({
    code: 0,
    message: 'success',
    data,
    requestId
  }), {
    status,
    headers
  })
}

const jsonResponseWithCookies = (data: any, cookieHeader: string, status = 200, corsHeaders: Record<string, string>, requestId?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...corsHeaders,
    ...securityHeaders,
    'Set-Cookie': cookieHeader
  }
  if (requestId) {
    headers['X-Request-Id'] = requestId
  }
  
  return new Response(JSON.stringify({
    code: 0,
    message: 'success',
    data,
    requestId
  }), {
    status,
    headers
  })
}

const errorResponse = (message: string, status = 400, corsHeaders: Record<string, string>, requestId?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...corsHeaders,
    ...securityHeaders
  }
  if (requestId) {
    headers['X-Request-Id'] = requestId
  }
  
  return new Response(JSON.stringify({
    code: status,
    message,
    data: null,
    requestId
  }), {
    status,
    headers
  })
}

const getCookie = (request: Request, name: string): string | null => {
  const cookies = request.headers.get('Cookie')
  if (!cookies) return null
  const match = cookies.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`))
  return match ? match[2] : null
}

const verifyToken = (request: Request): string | null => {
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  const sessionCookie = getCookie(request, 'session_token')
  return sessionCookie || null
}

const getCsrfTokenFromRequest = (request: Request): string | null => {
  const csrfHeader = request.headers.get('X-CSRF-Token')
  if (csrfHeader) return csrfHeader
  return getCookie(request, 'csrf_token')
}

const generateToken = (): string => {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
}

import * as bcrypt from 'bcryptjs'
import { z } from 'zod'

const GroupSchema = z.object({
  name: z.string().min(1).max(100),
  icon: z.string().max(255).optional(),
  order: z.number().int().optional(),
  parentId: z.string().nullable().optional()
})

const validateUrl = (url: string): boolean => {
  if (!url || url.length > 500) return false
  
  try {
    const urlObj = new URL(url)
    
    const allowedProtocols = ['http:', 'https:']
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return false
    }
    
    if (urlObj.hostname === 'localhost' && urlObj.protocol === 'http:') {
      return true
    }
    
    if (!/^[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]$/.test(urlObj.hostname)) {
      return false
    }
    
    if (urlObj.pathname.includes('..')) {
      return false
    }
    
    const suspiciousParams = ['javascript', 'vbscript', 'data:', 'mocha:', 'livescript:']
    for (const param of suspiciousParams) {
      if (url.toLowerCase().includes(param)) {
        return false
      }
    }
    
    return true
  } catch {
    return false
  }
}

const ItemSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().refine(validateUrl, '无效的 URL').max(500),
  icon: z.string().max(255).optional(),
  description: z.string().max(500).optional(),
  groupId: z.string(),
  order: z.number().int().optional(),
  openInNewTab: z.boolean().optional(),
  showAsWindow: z.boolean().optional(),
  windowWidth: z.number().int().positive().optional(),
  windowHeight: z.number().int().positive().optional()
})

const sanitizeJs = (input: string): { sanitized: string; warnings: string[] } => {
  if (!input) return { sanitized: '', warnings: [] }
  
  const warnings: string[] = []
  
  let sanitized = input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
  
  if (/javascript:/gi.test(input)) {
    warnings.push('检测到 JavaScript 协议，已移除')
    sanitized = sanitized.replace(/javascript:/gi, '')
  }
  
  if (/vbscript:/gi.test(input)) {
    warnings.push('检测到 VBScript 协议，已移除')
    sanitized = sanitized.replace(/vbscript:/gi, '')
  }
  
  if (/on\w+\s*=/gi.test(input)) {
    warnings.push('检测到事件处理器属性，已移除')
    sanitized = sanitized.replace(/on\w+\s*=/gi, '')
  }
  
  if (/<script[^>]*>[\s\S]*?<\/script>/gi.test(input)) {
    warnings.push('检测到 script 标签，已移除')
    sanitized = sanitized.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  }
  
  if (/<iframe[^>]*>[\s\S]*?<\/iframe>/gi.test(input)) {
    warnings.push('检测到 iframe 标签，已移除')
    sanitized = sanitized.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
  }
  
  if (/<svg[^>]*>[\s\S]*?<\/svg>/gi.test(input)) {
    warnings.push('检测到 svg 标签，已移除')
    sanitized = sanitized.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '')
  }
  
  if (/eval\s*\(/gi.test(input)) {
    warnings.push('检测到 eval 调用，已移除')
    sanitized = sanitized.replace(/eval\s*\([^)]*\)/gi, '')
  }
  
  if (/document\s*\./gi.test(input)) {
    warnings.push('检测到 document 对象访问，已移除')
    sanitized = sanitized.replace(/document\s*\.[a-zA-Z]+/gi, '')
  }
  
  if (/window\s*\./gi.test(input)) {
    warnings.push('检测到 window 对象访问，已移除')
    sanitized = sanitized.replace(/window\s*\.[a-zA-Z]+/gi, '')
  }
  
  return { sanitized, warnings }
}

const SettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']),
  language: z.string(),
  wallpaper: z.string(),
  wallpaperType: z.enum(['color', 'image']),
  showSearchBar: z.boolean(),
  searchEngine: z.string().regex(/^https?:\/\/.+/),
  itemsPerRow: z.number().int().positive(),
  mobileItemsPerRow: z.number().int().positive(),
  tabletItemsPerRow: z.number().int().positive(),
  desktopItemsPerRow: z.number().int().positive(),
  showGroupNames: z.boolean(),
  customCSS: z.string().max(5000),
  customJS: z.string().max(5000)
})

const PasswordSchema = z.string()
  .min(8, '密码至少需要8个字符')
  .max(100, '密码最多100个字符')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
    '密码需包含大小写字母、数字和特殊字符(@$!%*?&)')

const LoginSchema = z.object({
  username: z.string().min(1).max(50),
  password: PasswordSchema
})

const RegisterSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
  password: PasswordSchema,
  nickname: z.string().min(1).max(100).optional()
})

const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(6).max(100),
  newPassword: PasswordSchema
})

const ImportGroupSchema = z.object({
  name: z.string().min(1).max(100),
  icon: z.string().max(255).optional(),
  parentId: z.string().nullable().optional(),
  order: z.number().int().optional()
})

const ImportItemSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url().max(500),
  icon: z.string().max(255).optional(),
  description: z.string().max(500).optional(),
  groupId: z.string(),
  order: z.number().int().optional(),
  openInNewTab: z.boolean().optional(),
  showAsWindow: z.boolean().optional(),
  windowWidth: z.number().int().positive().optional(),
  windowHeight: z.number().int().positive().optional()
})

const ImportSchema = z.object({
  version: z.string().optional(),
  exportTime: z.string().optional(),
  groups: z.array(ImportGroupSchema).optional(),
  items: z.array(ImportItemSchema).optional(),
  settings: SettingsSchema.partial().optional()
})

const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12)
  return bcrypt.hash(password, salt)
}

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash)
}

const uint8ArrayToBase64 = (bytes: Uint8Array): string => {
  const chunksize = 3 * 1024
  let result = ''
  const len = bytes.length
  let i = 0
  
  while (i < len) {
    const end = Math.min(i + chunksize, len)
    let chunkStr = ''
    for (let j = i; j < end; j++) {
      chunkStr += String.fromCharCode(bytes[j])
    }
    result += btoa(chunkStr)
    i = end
  }
  
  const padding = (4 - (result.length % 4)) % 4
  for (let p = 0; p < padding; p++) {
    result += '='
  }
  
  return result.replace(/[^A-Za-z0-9+/=]/g, '')
}

const initAdminUser = async (env: Env): Promise<void> => {
  // 不再自动创建 admin 账号，第一个注册的用户将成为管理员
  return
}

const generateCsrfToken = (): string => {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
}

const getCsrfToken = (request: Request): string | null => {
  return getCsrfTokenFromRequest(request)
}

interface Session {
  id: string
  user_id: number
  username: string
  role: string
  csrf_token: string | null
  expires_at: number
  created_at: string
}



const RATE_LIMITS = {
  default: 100,
  login: 5,
  register: 3,
  passwordChange: 3,
  apiKey: 10
}
const RATE_LIMIT_WINDOW = 60 * 1000

const checkRateLimit = async (ip: string, env: Env, requestId?: string, action: keyof typeof RATE_LIMITS = 'default'): Promise<boolean> => {
  const limit = RATE_LIMITS[action] || RATE_LIMITS.default
  const now = Date.now()
  
  try {
    const key = `${ip}:${action}`
    const existing = await env.SUNPANEL_DB.prepare(`
      SELECT count, timestamp FROM rate_limits WHERE ip = ?
    `).bind(key).first()

    if (!existing || now - existing.timestamp > RATE_LIMIT_WINDOW) {
      await env.SUNPANEL_DB.prepare(`
        INSERT OR REPLACE INTO rate_limits (ip, count, timestamp) VALUES (?, ?, ?)
      `).bind(key, 1, now).run()
      return true
    }

    if (existing.count >= limit) {
      log(`速率限制触发 - IP: ${ip}, Action: ${action}`, 'warn', requestId)
      return false
    }

    await env.SUNPANEL_DB.prepare(`
      UPDATE rate_limits SET count = count + 1, timestamp = ? WHERE ip = ?
    `).bind(now, key).run()
    return true
  } catch (error: any) {
    log(`速率限制检查失败: ${error.message}`, 'error', requestId)
    return true
  }
}

const getClientIp = (request: Request): string => {
  return request.headers.get('CF-Connecting-IP') || 
         request.headers.get('X-Forwarded-For') || 
         request.headers.get('X-Real-IP') || 
         'unknown'
}

const MAX_REQUEST_SIZE = 10 * 1024 * 1024

const checkRequestSize = (request: Request, corsHeaders: Record<string, string>, requestId?: string): Response | null => {
  const contentLength = request.headers.get('Content-Length')
  if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
    log('请求体过大', 'warn', requestId)
    return errorResponse('请求体过大', 413, corsHeaders, requestId)
  }
  return null
}

interface MiddlewareResult {
  success: boolean
  response?: Response
  session?: Session
}

const authenticate = async (request: Request, env: Env, corsHeaders: Record<string, string>, requestId?: string): Promise<MiddlewareResult> => {
  log(`[AUTH] 开始认证`, 'info', requestId)
  
  const token = verifyToken(request)
  log(`[AUTH] Token: ${token ? '存在' : '不存在'}`, 'info', requestId)
  
  if (!token) {
    return { success: false, response: errorResponse('未登录', 401, corsHeaders) }
  }

  const session = await d1Sessions.getById(env, token)
  log(`[AUTH] Session: ${session ? '存在' : '不存在'}`, 'info', requestId)
  
  if (!session) {
    return { success: false, response: errorResponse('Token 无效', 401, corsHeaders) }
  }

  log(`[AUTH] Session ID: ${session.id}, User ID: ${session.user_id}`, 'info', requestId)
  
  if (!session.id) {
    return { success: false, response: errorResponse('会话ID无效', 401, corsHeaders) }
  }

  log(`[AUTH] 准备返回成功结果`, 'info', requestId)
  const result = { success: true, session }
  log(`[AUTH] 返回结果: success=${result.success}, session=${result.session ? '存在' : '不存在'}`, 'info', requestId)
  return result
}

const validateCsrf = async (request: Request, env: Env, corsHeaders: Record<string, string>, session: Session, requestId?: string): Promise<MiddlewareResult> => {
  const csrfToken = getCsrfToken(request)
  
  if (!csrfToken) {
    log('CSRF Token缺失', 'warn', requestId)
    return { success: false, response: errorResponse('CSRF Token 缺失', 403, corsHeaders, requestId) }
  }
  
  if (!session.csrf_token) {
    log('会话CSRF Token未初始化', 'warn', requestId)
    return { success: false, response: errorResponse('会话无效', 403, corsHeaders, requestId) }
  }
  
  if (session.csrf_token !== csrfToken) {
    log('CSRF Token验证失败', 'warn', requestId)
    return { success: false, response: errorResponse('CSRF Token 无效', 403, corsHeaders, requestId) }
  }
  
  return { success: true }
}

const d1Sessions = {
  create: async (env: Env, userId: number, username: string, role: string): Promise<Session> => {
    const id = generateToken()
    const csrfToken = generateCsrfToken()
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000
    const now = new Date().toISOString()

    await env.SUNPANEL_DB.prepare(`
      INSERT INTO sessions (id, user_id, username, role, csrf_token, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(id, userId, username, role, csrfToken, expiresAt, now).run()

    return { id, user_id: userId, username, role, csrf_token: csrfToken, expires_at: expiresAt, created_at: now }
  },

  getById: async (env: Env, id: string): Promise<Session | null> => {
    console.log(`[d1Sessions.getById] 会话ID: ${id}`)
    const result = await env.SUNPANEL_DB.prepare(`
      SELECT id, user_id, username, role, csrf_token, expires_at, created_at
      FROM sessions WHERE id = ?
    `).bind(id).first()
    console.log(`[d1Sessions.getById] 查询结果: ${result ? JSON.stringify(result) : 'null'}`)

    if (!result) return null
    
    if (!result.id) {
      console.log(`[d1Sessions.getById] 会话ID为空`)
      return null
    }

    const now = Date.now()
    if (result.expires_at && now > result.expires_at) {
      console.log(`[d1Sessions.getById] 会话已过期`)
      await d1Sessions.delete(env, id)
      return null
    }

    console.log(`[d1Sessions.getById] 返回会话: id=${result.id}, user_id=${result.user_id}`)
    return result as Session
  },

  updateCsrfToken: async (env: Env, sessionId: string): Promise<string> => {
    const csrfToken = generateCsrfToken()
    await env.SUNPANEL_DB.prepare(`
      UPDATE sessions SET csrf_token = ? WHERE id = ?
    `).bind(csrfToken, sessionId).run()
    return csrfToken
  },

  delete: async (env: Env, id: string): Promise<void> => {
    await env.SUNPANEL_DB.prepare(`DELETE FROM sessions WHERE id = ?`).bind(id).run()
  },

  validateCsrfToken: async (env: Env, sessionId: string, csrfToken: string): Promise<boolean> => {
    const session = await d1Sessions.getById(env, sessionId)
    if (!session) return false

    if (!session.csrf_token || session.csrf_token !== csrfToken) {
      return false
    }

    return true
  },

  cleanupExpired: async (env: Env): Promise<void> => {
    await env.SUNPANEL_DB.prepare(`DELETE FROM sessions WHERE expires_at < ?`).bind(Date.now()).run()
  }
}

interface Group {
  id?: number
  name: string
  icon?: string
  user_id: number
  parent_id?: number
  order_index: number
  created_at: string
  updated_at: string
}

interface Item {
  id?: number
  name: string
  url: string
  icon?: string
  description?: string
  group_id: number
  user_id: number
  order_index: number
  open_in_new_tab: number
  show_as_window: number
  window_width: number
  window_height: number
  created_at: string
  updated_at: string
}

interface Settings {
  theme: string
  language: string
  wallpaper: string
  wallpaperType: string
  showSearchBar: number
  searchEngine: string
  itemsPerRow: number
  mobileItemsPerRow: number
  tabletItemsPerRow: number
  desktopItemsPerRow: number
  showGroupNames: number
  customCSS: string
  customJS: string
  createdAt?: string
}

interface GlobalSettings {
  id: number
  language: string
  websiteTitle: string
  websiteDescription: string
  pageTexts: Record<string, any>
  footerText: string
  createdAt: string
  updatedAt: string
}

const d1Groups = {
  getAll: async (env: Env, userId: number = 1): Promise<Group[]> => {
    const result = await env.SUNPANEL_DB.prepare(`
      SELECT id, name, icon, user_id, parent_id, order_index, created_at, updated_at
      FROM groups WHERE user_id = ? ORDER BY order_index ASC
    `).bind(userId).all()
    return result.results as Group[]
  },

  getById: async (env: Env, id: number): Promise<Group | null> => {
    const result = await env.SUNPANEL_DB.prepare(`
      SELECT id, name, icon, user_id, parent_id, order_index, created_at, updated_at
      FROM groups WHERE id = ?
    `).bind(id).first()
    return result as Group | null
  },

  create: async (env: Env, data: { name: string; icon?: string; parentId?: number; order?: number }, userId: number = 1): Promise<Group> => {
    const now = new Date().toISOString()
    const result = await env.SUNPANEL_DB.prepare(`
      INSERT INTO groups (name, icon, user_id, parent_id, order_index, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.name,
      data.icon || null,
      userId,
      data.parentId || null,
      data.order || 0,
      now,
      now
    ).run()

    const newGroup = await d1Groups.getById(env, result.meta.last_row_id as number)
    return newGroup!
  },

  update: async (env: Env, id: number, data: { name?: string; icon?: string; parentId?: number; order?: number }): Promise<Group | null> => {
    const existing = await d1Groups.getById(env, id)
    if (!existing) return null

    const now = new Date().toISOString()
    await env.SUNPANEL_DB.prepare(`
      UPDATE groups SET name = ?, icon = ?, parent_id = ?, order_index = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      data.name ?? existing.name,
      data.icon ?? existing.icon,
      data.parentId ?? existing.parent_id,
      data.order ?? existing.order_index,
      now,
      id
    ).run()

    return d1Groups.getById(env, id)
  },

  delete: async (env: Env, id: number): Promise<boolean> => {
    const items = await env.SUNPANEL_DB.prepare(`
      SELECT COUNT(*) as count FROM items WHERE group_id = ?
    `).bind(id).first()
    
    if (items && items.count > 0) {
      throw new Error('该分组下存在项目，无法删除')
    }
    
    await env.SUNPANEL_DB.prepare(`DELETE FROM groups WHERE id = ?`).bind(id).run()
    return true
  }
}

const d1Items = {
  getAll: async (env: Env, groupId?: number, userId: number = 1): Promise<Item[]> => {
    let query = `
      SELECT id, name, url, icon, description, group_id, user_id, order_index,
             open_in_new_tab, show_as_window, window_width, window_height, color, created_at, updated_at
      FROM items WHERE user_id = ?
    `
    const bindings: (number | string)[] = [userId]

    if (groupId) {
      query += ` AND group_id = ?`
      bindings.push(groupId)
    }

    query += ` ORDER BY order_index ASC`

    const result = await env.SUNPANEL_DB.prepare(query).bind(...bindings).all()
    return result.results as Item[]
  },

  getById: async (env: Env, id: number): Promise<Item | null> => {
    const result = await env.SUNPANEL_DB.prepare(`
      SELECT id, name, url, icon, description, group_id, user_id, order_index,
             open_in_new_tab, show_as_window, window_width, window_height, color, created_at, updated_at
      FROM items WHERE id = ?
    `).bind(id).first()
    return result as Item | null
  },

  create: async (env: Env, data: {
    name: string
    url: string
    icon?: string
    description?: string
    groupId: number
    order?: number
    openInNewTab?: boolean
    showAsWindow?: boolean
    windowWidth?: number
    windowHeight?: number
    color?: string
  }, userId: number = 1): Promise<Item> => {
    const now = new Date().toISOString()
    const result = await env.SUNPANEL_DB.prepare(`
      INSERT INTO items (name, url, icon, description, group_id, user_id, order_index,
                        open_in_new_tab, show_as_window, window_width, window_height, color, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.name,
      data.url,
      data.icon || null,
      data.description || null,
      data.groupId,
      userId,
      data.order || 0,
      data.openInNewTab ? 1 : 0,
      data.showAsWindow ? 1 : 0,
      data.windowWidth || 800,
      data.windowHeight || 600,
      data.color || null,
      now,
      now
    ).run()

    const newItem = await d1Items.getById(env, result.meta.last_row_id as number)
    return newItem!
  },

  update: async (env: Env, id: number, data: {
    name?: string
    url?: string
    icon?: string
    description?: string
    groupId?: number
    order?: number
    openInNewTab?: boolean
    showAsWindow?: boolean
    windowWidth?: number
    windowHeight?: number
    color?: string
  }): Promise<Item | null> => {
    const existing = await d1Items.getById(env, id)
    if (!existing) return null

    const now = new Date().toISOString()
    await env.SUNPANEL_DB.prepare(`
      UPDATE items SET name = ?, url = ?, icon = ?, description = ?, group_id = ?,
                      order_index = ?, open_in_new_tab = ?, show_as_window = ?,
                      window_width = ?, window_height = ?, color = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      data.name ?? existing.name,
      data.url ?? existing.url,
      data.icon ?? existing.icon,
      data.description ?? existing.description,
      data.groupId ?? existing.group_id,
      data.order ?? existing.order_index,
      data.openInNewTab !== undefined ? (data.openInNewTab ? 1 : 0) : existing.open_in_new_tab,
      data.showAsWindow !== undefined ? (data.showAsWindow ? 1 : 0) : existing.show_as_window,
      data.windowWidth ?? existing.window_width,
      data.windowHeight ?? existing.window_height,
      data.color ?? existing.color,
      now,
      id
    ).run()

    return d1Items.getById(env, id)
  },

  delete: async (env: Env, id: number): Promise<boolean> => {
    await env.SUNPANEL_DB.prepare(`DELETE FROM items WHERE id = ?`).bind(id).run()
    return true
  }
}

const d1Settings = {
  get: async (env: Env, userId: number = 1): Promise<Settings> => {
    console.log(`[d1Settings.get] 用户ID: ${userId}`)
    const result = await env.SUNPANEL_DB.prepare(`
      SELECT theme, language, wallpaper, wallpaper_type, show_search_bar, search_engine,
             items_per_row, mobile_items_per_row, tablet_items_per_row, desktop_items_per_row,
             show_group_names, custom_css, custom_js, created_at
      FROM settings WHERE user_id = ?
    `).bind(userId).first()
    console.log(`[d1Settings.get] 查询结果: ${result ? '存在' : '不存在'}`)

    if (!result) {
      const now = new Date().toISOString()
      await env.SUNPANEL_DB.prepare(`
        INSERT INTO settings (user_id, theme, language, wallpaper, wallpaper_type,
                             show_search_bar, search_engine, items_per_row,
                             mobile_items_per_row, tablet_items_per_row, desktop_items_per_row,
                             show_group_names, custom_css, custom_js, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        userId,
        'light',
        'zh-CN',
        '#1e293b',
        'color',
        1,
        'https://www.bing.com/search?q=',
        6,
        2,
        3,
        6,
        1,
        '',
        '',
        now,
        now
      ).run()

      return {
        theme: 'light',
        language: 'zh-CN',
        wallpaper: '#1e293b',
        wallpaperType: 'color',
        showSearchBar: 1,
        searchEngine: 'https://www.bing.com/search?q=',
        itemsPerRow: 6,
        mobileItemsPerRow: 2,
        tabletItemsPerRow: 3,
        desktopItemsPerRow: 6,
        showGroupNames: 1,
        customCSS: '',
        customJS: '',
        createdAt: now
      }
    }

    return {
      theme: result.theme as string,
      language: result.language as string,
      wallpaper: result.wallpaper as string,
      wallpaperType: result.wallpaper_type as string,
      showSearchBar: result.show_search_bar as number,
      searchEngine: result.search_engine as string,
      itemsPerRow: result.items_per_row as number,
      mobileItemsPerRow: (result as any).mobile_items_per_row as number || 2,
      tabletItemsPerRow: (result as any).tablet_items_per_row as number || 3,
      desktopItemsPerRow: (result as any).desktop_items_per_row as number || 6,
      showGroupNames: result.show_group_names as number,
      customCSS: result.custom_css as string,
      customJS: result.custom_js as string,
      createdAt: result.created_at as string
    }
  },

  update: async (env: Env, data: Partial<Settings>, userId: number = 1): Promise<Settings> => {
    const existing = await d1Settings.get(env, userId)
    const now = new Date().toISOString()

    const merged = {
      theme: data.theme ?? existing.theme,
      language: data.language ?? existing.language,
      wallpaper: data.wallpaper ?? existing.wallpaper,
      wallpaperType: data.wallpaperType ?? existing.wallpaperType,
      showSearchBar: data.showSearchBar ?? existing.showSearchBar,
      searchEngine: data.searchEngine ?? existing.searchEngine,
      itemsPerRow: data.itemsPerRow ?? existing.itemsPerRow,
      mobileItemsPerRow: data.mobileItemsPerRow ?? existing.mobileItemsPerRow,
      tabletItemsPerRow: data.tabletItemsPerRow ?? existing.tabletItemsPerRow,
      desktopItemsPerRow: data.desktopItemsPerRow ?? existing.desktopItemsPerRow,
      showGroupNames: data.showGroupNames ?? existing.showGroupNames,
      customCSS: data.customCSS ?? existing.customCSS,
      customJS: '',
      createdAt: existing.createdAt || now
    }

    await env.SUNPANEL_DB.prepare(`
      UPDATE settings SET 
        theme = ?, language = ?, wallpaper = ?, wallpaper_type = ?,
        show_search_bar = ?, search_engine = ?, items_per_row = ?,
        mobile_items_per_row = ?, tablet_items_per_row = ?, desktop_items_per_row = ?,
        show_group_names = ?, custom_css = ?, custom_js = ?, updated_at = ?
      WHERE user_id = ?
    `).bind(
      merged.theme,
      merged.language,
      merged.wallpaper,
      merged.wallpaperType,
      merged.showSearchBar,
      merged.searchEngine,
      merged.itemsPerRow,
      merged.mobileItemsPerRow,
      merged.tabletItemsPerRow,
      merged.desktopItemsPerRow,
      merged.showGroupNames,
      merged.customCSS,
      merged.customJS,
      now,
      userId
    ).run()

    return merged
  }
}

const d1GlobalSettings = {
  get: async (env: Env, language: string = 'zh-CN'): Promise<GlobalSettings | null> => {
    const result = await env.SUNPANEL_DB.prepare(`
      SELECT id, language, website_title, website_description, page_texts, footer_text, created_at, updated_at
      FROM global_settings WHERE language = ?
    `).bind(language).first()

    if (!result) {
      const fallback = await env.SUNPANEL_DB.prepare(`
        SELECT id, language, website_title, website_description, page_texts, footer_text, created_at, updated_at
        FROM global_settings WHERE language = 'zh-CN'
      `).first()

      if (!fallback) return null

      return {
        id: fallback.id as number,
        language: fallback.language as string,
        websiteTitle: fallback.website_title as string,
        websiteDescription: (fallback as any).website_description as string || '',
        pageTexts: JSON.parse((fallback as any).page_texts as string || '{}'),
        footerText: (fallback as any).footer_text as string || '',
        createdAt: fallback.created_at as string,
        updatedAt: fallback.updated_at as string
      }
    }

    return {
      id: result.id as number,
      language: result.language as string,
      websiteTitle: result.website_title as string,
      websiteDescription: (result as any).website_description as string || '',
      pageTexts: JSON.parse((result as any).page_texts as string || '{}'),
      footerText: (result as any).footer_text as string || '',
      createdAt: result.created_at as string,
      updatedAt: result.updated_at as string
    }
  },

  getAll: async (env: Env): Promise<GlobalSettings[]> => {
    const result = await env.SUNPANEL_DB.prepare(`
      SELECT id, language, website_title, website_description, page_texts, footer_text, created_at, updated_at
      FROM global_settings ORDER BY id ASC
    `).all()

    return (result.results || []).map((row: any) => ({
      id: row.id,
      language: row.language,
      websiteTitle: row.website_title,
      websiteDescription: row.website_description || '',
      pageTexts: JSON.parse(row.page_texts || '{}'),
      footerText: row.footer_text || '',
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
  },

  update: async (env: Env, language: string, data: Partial<{
    websiteTitle: string
    websiteDescription: string
    pageTexts: Record<string, any>
    footerText: string
  }>): Promise<GlobalSettings | null> => {
    const existing = await d1GlobalSettings.get(env, language)
    if (!existing) return null

    const now = new Date().toISOString()
    const merged = {
      websiteTitle: data.websiteTitle ?? existing.websiteTitle,
      websiteDescription: data.websiteDescription ?? existing.websiteDescription,
      pageTexts: data.pageTexts ? JSON.stringify(data.pageTexts) : JSON.stringify(existing.pageTexts),
      footerText: data.footerText ?? existing.footerText
    }

    await env.SUNPANEL_DB.prepare(`
      UPDATE global_settings SET 
        website_title = ?, website_description = ?, page_texts = ?, footer_text = ?, updated_at = ?
      WHERE language = ?
    `).bind(
      merged.websiteTitle,
      merged.websiteDescription,
      merged.pageTexts,
      merged.footerText,
      now,
      language
    ).run()

    return d1GlobalSettings.get(env, language)
  },

  create: async (env: Env, data: {
    language: string
    websiteTitle: string
    websiteDescription?: string
    pageTexts?: Record<string, any>
    footerText?: string
  }): Promise<GlobalSettings> => {
    const now = new Date().toISOString()

    await env.SUNPANEL_DB.prepare(`
      INSERT INTO global_settings (language, website_title, website_description, page_texts, footer_text, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.language,
      data.websiteTitle,
      data.websiteDescription || '',
      JSON.stringify(data.pageTexts || {}),
      data.footerText || '',
      now,
      now
    ).run()

    return (await d1GlobalSettings.get(env, data.language))!
  }
}

export default {
  async fetch(request: Request, env: Env) {
    const requestId = generateRequestId()
    const url = new URL(request.url)
    const path = url.pathname.replace('/api', '') || '/'
    const method = request.method
    const corsHeaders = getCorsHeaders(request, env)

    log(`请求开始 - Method: ${method}, Path: ${url.pathname}, Origin: ${request.headers.get('Origin') || 'unknown'}`, 'info', requestId)
    
    if (url.pathname === '/api/users/profile' && method === 'PUT') {
      log(`[DEBUG] PUT /api/users/profile 请求已接收`, 'info', requestId)
      const authHeader = request.headers.get('Authorization')
      log(`[DEBUG] Authorization header: ${authHeader ? '存在' : '不存在'}`, 'info', requestId)
      const csrfHeader = request.headers.get('X-CSRF-Token')
      log(`[DEBUG] X-CSRF-Token header: ${csrfHeader ? '存在' : '不存在'}`, 'info', requestId)
      const cookieHeader = request.headers.get('Cookie')
      log(`[DEBUG] Cookie header: ${cookieHeader ? '存在' : '不存在'}`, 'info', requestId)
    }

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    if (!url.pathname.startsWith('/api')) {
      if (url.pathname.startsWith('/gallery/images/') && method === 'GET') {
        const filename = url.pathname.substring('/gallery/images/'.length)
        
        log(`请求图片: ${filename}`, 'info', requestId)
        
        try {
          // 先查询图片信息并验证权限
          const imageInfo = await env.SUNPANEL_DB.prepare(`
            SELECT user_id, is_public, content_type FROM images WHERE filename = ?
          `).bind(filename).first()

          if (!imageInfo) {
            log(`图片不存在: ${filename}`, 'warn', requestId)
            return new Response('图片不存在', { status: 404 })
          }

          // 验证权限
          if (!imageInfo.is_public) {
            const authResult = await authenticate(request, env, corsHeaders)
            if (!authResult.success) {
              log(`未认证访问私有图片: ${filename}`, 'warn', requestId)
              return authResult.response!
            }
            if (imageInfo.user_id !== authResult.session!.user_id) {
              log(`越权访问图片: ${filename}`, 'warn', requestId)
              return errorResponse('无权访问此图片', 403, corsHeaders, requestId)
            }
          }

          // 首先尝试从 KV 读取图片
          const kvData = await env.IMAGES_KV.get(filename, 'arrayBuffer')
          
          if (kvData) {
            log(`从 KV 读取图片成功`, 'info', requestId)
            const contentType = imageInfo.content_type || 'application/octet-stream'
            
            return new Response(kvData, {
              status: 200,
              headers: {
                'Content-Type': contentType,
                'Cache-Control': imageInfo.is_public ? 'public, max-age=31536000' : 'private, max-age=3600'
              }
            })
          }
          
          // 如果 KV 没有，尝试从 D1 读取（向后兼容）
          const result = await env.SUNPANEL_DB.prepare(`
            SELECT content_type, data FROM images WHERE filename = ?
          `).bind(filename).first()

          if (!result || !result.data) {
            log('图片数据为空', 'error', requestId)
            return new Response('图片数据为空', { status: 500 })
          }

          log(`找到图片, content_type: ${result.content_type}`, 'info', requestId)

          const base64Data = result.data as string
          const binaryStr = atob(base64Data)
          const len = binaryStr.length
          
          const bytes = new Uint8Array(len)
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryStr.charCodeAt(i)
          }
          
          return new Response(bytes, {
            status: 200,
            headers: {
              'Content-Type': result.content_type as string,
              'Content-Length': len.toString(),
              'Cache-Control': imageInfo.is_public ? 'public, max-age=31536000' : 'private, max-age=3600'
            }
          })
        } catch (error: any) {
          log(`图片处理失败: ${error.message}`, 'error', requestId)
          return new Response('图片处理失败', { status: 500 })
        }
      }

      if (!env.ASSETS) {
        log('静态资源服务未配置', 'warn', requestId)
        return new Response('静态资源服务未配置', { status: 503 })
      }
      
      try {
        const assetResponse = await env.ASSETS.fetch(request)
        if (assetResponse.status !== 404) {
          log(`静态资源服务成功 - Status: ${assetResponse.status}`, 'info', requestId)
          return assetResponse
        }
        
        log('静态资源未找到', 'warn', requestId)
        return new Response('Not Found', { status: 404 })
      } catch (error: any) {
        log(`静态资源服务错误: ${error.message}`, 'error', requestId)
        return new Response('静态资源服务错误', { status: 500 })
      }
    }

    if (path === '/health' && method === 'GET') {
      log('健康检查成功', 'info', requestId)
      return jsonResponse({ status: 'ok', timestamp: new Date().toISOString(), requestId }, 200, corsHeaders)
    }
    if (path === '/favicon.svg' && method === 'GET') {
      log('获取 favicon 成成功', 'info', requestId)
      return new Response('../public/favicon.svg', { status: 200, headers: { 'Content-Type': 'image/svg+xml' } })
    }

    const sizeError = checkRequestSize(request, corsHeaders, requestId)
    if (sizeError) {
      log('请求体过大', 'warn', requestId)
      return sizeError
    }

    const clientIp = getClientIp(request)
    if (!await checkRateLimit(clientIp, env, requestId)) {
      log('速率限制触发', 'warn', requestId)
      await auditLog(env, 'RATE_LIMIT_EXCEEDED', {
        ip: clientIp,
        userAgent: request.headers.get('User-Agent') || undefined,
        result: 'BLOCKED',
        details: '请求过于频繁'
      })
      return errorResponse('请求过于频繁，请稍后再试', 429, corsHeaders, requestId)
    }

    try {
      if (path === '/auth/login' && method === 'POST') {
        if (!await checkRateLimit(clientIp, env, requestId, 'login')) {
          await auditLog(env, 'RATE_LIMIT_EXCEEDED', {
            ip: clientIp,
            userAgent: request.headers.get('User-Agent') || undefined,
            result: 'BLOCKED',
            details: '登录请求过于频繁'
          })
          return errorResponse('登录请求过于频繁，请稍后再试', 429, corsHeaders, requestId)
        }
        try {
          const body = await request.json()
          const validation = LoginSchema.safeParse(body)
          if (!validation.success) {
            return errorResponse('输入验证失败', 400, corsHeaders, requestId)
          }

          const { username, password } = validation.data
          log(`尝试登录用户: ${username}`, 'info', requestId)

          const result = await env.SUNPANEL_DB.prepare(`
            SELECT id, username, password, nickname, role FROM users WHERE username = ?
          `).bind(username).first()

          if (!result) {
            log(`用户不存在: ${username}`, 'warn', requestId)
            await auditLog(env, 'LOGIN_FAILED', {
              username: username,
              ip: clientIp,
              userAgent: request.headers.get('User-Agent') || undefined,
              result: 'FAILED',
              details: '用户不存在'
            })
            return errorResponse('用户名或密码错误', 401, corsHeaders, requestId)
          }

          log(`找到用户: ${result.username}, 验证密码...`, 'info', requestId)
          const isPasswordValid = await verifyPassword(password, result.password)
          if (!isPasswordValid) {
            log(`密码验证失败: ${username}`, 'warn', requestId)
            await auditLog(env, 'LOGIN_FAILED', {
              userId: Number(result.id),
              username: result.username,
              ip: clientIp,
              userAgent: request.headers.get('User-Agent') || undefined,
              result: 'FAILED',
              details: '密码错误'
            })
            return errorResponse('用户名或密码错误', 401, corsHeaders, requestId)
          }

          const session = await d1Sessions.create(env, Number(result.id), result.username, result.role)

          const settings = await d1Settings.get(env, Number(result.id))

          await auditLog(env, 'LOGIN', {
            userId: Number(result.id),
            username: result.username,
            ip: clientIp,
            userAgent: request.headers.get('User-Agent') || undefined,
            result: 'SUCCESS'
          })

          const headers = new Headers({
            'Content-Type': 'application/json',
            ...corsHeaders,
            ...securityHeaders
          })
          const isSecure = request.headers.get('x-forwarded-proto') === 'https' || new URL(request.url).protocol === 'https:'
          const sessionCookieAttributes = isSecure 
            ? `HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}` 
            : `HttpOnly; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`
          const csrfCookieAttributes = isSecure 
            ? `Secure; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}` 
            : `SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`
          headers.append('Set-Cookie', `session_token=${session.id}; ${sessionCookieAttributes}`)
          headers.append('Set-Cookie', `csrf_token=${session.csrf_token}; ${csrfCookieAttributes}`)

          return new Response(JSON.stringify({
            code: 0,
            message: 'success',
            data: {
              user: {
                id: String(result.id),
                username: result.username,
                nickname: result.nickname || '用户',
                role: result.role,
                language: settings.language || 'zh-CN'
              }
            },
            requestId
          }), {
            status: 200,
            headers
          })
        } catch (error: any) {
          log(`登录失败: ${error.message}`, 'error', requestId)
          return errorResponse('登录失败', 500, corsHeaders, requestId)
        }
      }

      if (path === '/auth/csrf-token' && method === 'GET') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!

        const csrfToken = await d1Sessions.updateCsrfToken(env, authResult.session!.id)

        return jsonResponse({ csrfToken }, 200, corsHeaders, requestId)
      }

      if (path === '/auth/logout' && method === 'POST') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!

        const csrfResult = await validateCsrf(request, env, corsHeaders, authResult.session!, requestId)
        if (!csrfResult.success) return csrfResult.response!

        await d1Sessions.delete(env, authResult.session!.id)

        await auditLog(env, 'LOGOUT', {
          userId: authResult.session!.user_id,
          username: authResult.session!.username,
          ip: clientIp,
          userAgent: request.headers.get('User-Agent') || undefined,
          result: 'SUCCESS'
        })

        const headers = new Headers({
          'Content-Type': 'application/json',
          ...corsHeaders,
          ...securityHeaders
        })
        headers.append('Set-Cookie', 'session_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/;')
        headers.append('Set-Cookie', 'csrf_token=; Secure; SameSite=Strict; Max-Age=0; Path=/;')

        const response = new Response(JSON.stringify({ code: 200, message: 'success', data: { success: true }, requestId }), {
          headers
        })

        return response
      }

      if (path === '/auth/me' && method === 'GET') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!

        return jsonResponse({
          id: authResult.session!.user_id.toString(),
          username: authResult.session!.username,
          nickname: authResult.session!.username,
          role: authResult.session!.role
        }, 200, corsHeaders, requestId)
      }

      if (path === '/groups' && method === 'GET') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!

        const groups = await d1Groups.getAll(env, authResult.session!.user_id)

        return jsonResponse(groups.map(g => ({
          id: g.id?.toString(),
          name: g.name,
          icon: g.icon,
          parentId: g.parent_id?.toString(),
          order: g.order_index,
          createdAt: g.created_at,
          updatedAt: g.updated_at
        })), 200, corsHeaders, requestId)
      }

      if (path === '/groups' && method === 'POST') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!

        const csrfResult = await validateCsrf(request, env, corsHeaders, authResult.session!, requestId)
        if (!csrfResult.success) return csrfResult.response!

        const body = await request.json()
        const validation = GroupSchema.safeParse(body)
        if (!validation.success) {
          return errorResponse('输入验证失败', 400, corsHeaders, requestId)
        }

        const newGroup = await d1Groups.create(env, {
          name: validation.data.name,
          icon: validation.data.icon,
          parentId: validation.data.parentId ? parseInt(validation.data.parentId) : undefined,
          order: validation.data.order
        }, authResult.session!.user_id)

        return jsonResponse({
          id: newGroup.id?.toString(),
          name: newGroup.name,
          icon: newGroup.icon,
          parentId: newGroup.parent_id?.toString(),
          order: newGroup.order_index,
          createdAt: newGroup.created_at,
          updatedAt: newGroup.updated_at
        }, 201, corsHeaders, requestId)
      }

      if (path.match(/^\/groups\/[^/]+$/) && method === 'PUT') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!

        const csrfResult = await validateCsrf(request, env, corsHeaders, authResult.session!, requestId)
        if (!csrfResult.success) return csrfResult.response!

        const id = parseInt(path.split('/')[2])
        if (isNaN(id)) return errorResponse('无效的分组ID', 400, corsHeaders, requestId)

        const body = await request.json()
        const validation = GroupSchema.partial().safeParse(body)
        if (!validation.success) {
          return errorResponse('输入验证失败', 400, corsHeaders, requestId)
        }

        const updated = await d1Groups.update(env, id, {
          name: validation.data.name,
          icon: validation.data.icon,
          parentId: validation.data.parentId ? parseInt(validation.data.parentId) : undefined,
          order: validation.data.order
        })

        if (!updated) return errorResponse('分组不存在', 404, corsHeaders, requestId)

        return jsonResponse({
          id: updated.id?.toString(),
          name: updated.name,
          icon: updated.icon,
          parentId: updated.parent_id?.toString(),
          order: updated.order_index,
          createdAt: updated.created_at,
          updatedAt: updated.updated_at
        }, 200, corsHeaders, requestId)
      }

      if (path.match(/^\/groups\/[^/]+$/) && method === 'DELETE') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!

        const csrfResult = await validateCsrf(request, env, corsHeaders, authResult.session!, requestId)
        if (!csrfResult.success) return csrfResult.response!

        const id = parseInt(path.split('/')[2])
        if (isNaN(id)) return errorResponse('无效的分组ID', 400, corsHeaders, requestId)

        await d1Groups.delete(env, id)

        return jsonResponse({ success: true }, 200, corsHeaders, requestId)
      }

      if (path === '/items' && method === 'GET') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!

        const groupId = url.searchParams.get('groupId')
        const items = await d1Items.getAll(
          env,
          groupId ? parseInt(groupId) : undefined,
          authResult.session!.user_id
        )

        return jsonResponse(items.map(i => ({
          id: i.id?.toString(),
          name: i.name,
          url: i.url,
          icon: i.icon,
          description: i.description,
          groupId: i.group_id?.toString(),
          order: i.order_index,
          openInNewTab: i.open_in_new_tab === 1,
          showAsWindow: i.show_as_window === 1,
          windowWidth: i.window_width,
          windowHeight: i.window_height,
          color: i.color || '',
          createdAt: i.created_at,
          updatedAt: i.updated_at
        })), 200, corsHeaders, requestId)
      }

      if (path === '/items' && method === 'POST') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!

        const csrfResult = await validateCsrf(request, env, corsHeaders, authResult.session!, requestId)
        if (!csrfResult.success) return csrfResult.response!

        const body = await request.json()
        
        const CreateItemSchema = z.object({
          name: z.string().min(1).max(100),
          url: z.string().url().max(500),
          icon: z.string().max(255).optional().nullable(),
          description: z.string().max(500).optional().nullable(),
          groupId: z.union([z.string(), z.number()]),
          order: z.number().int().optional().nullable(),
          openInNewTab: z.boolean().optional().nullable(),
          showAsWindow: z.boolean().optional().nullable(),
          windowWidth: z.number().int().positive().optional().nullable(),
          windowHeight: z.number().int().positive().optional().nullable(),
          color: z.string().max(7).optional().nullable()
        })

        const validation = CreateItemSchema.safeParse(body)
        if (!validation.success) {
          return errorResponse('输入验证失败: ' + validation.error.issues.map(e => e.message).join(', '), 400, corsHeaders, requestId)
        }

        const newItem = await d1Items.create(env, {
          name: validation.data.name,
          url: validation.data.url,
          icon: validation.data.icon,
          description: validation.data.description,
          groupId: parseInt(String(validation.data.groupId)),
          order: validation.data.order,
          openInNewTab: validation.data.openInNewTab,
          showAsWindow: validation.data.showAsWindow,
          windowWidth: validation.data.windowWidth,
          windowHeight: validation.data.windowHeight,
          color: validation.data.color
        }, authResult.session!.user_id)

        return jsonResponse({
          id: newItem.id?.toString(),
          name: newItem.name,
          url: newItem.url,
          icon: newItem.icon,
          description: newItem.description,
          groupId: newItem.group_id?.toString(),
          order: newItem.order_index,
          openInNewTab: newItem.open_in_new_tab === 1,
          showAsWindow: newItem.show_as_window === 1,
          windowWidth: newItem.window_width,
          windowHeight: newItem.window_height,
          color: newItem.color || '',
          createdAt: newItem.created_at,
          updatedAt: newItem.updated_at
        }, 201, corsHeaders, requestId)
      }

      if (path.match(/^\/items\/[^/]+$/) && method === 'PUT') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!

        const csrfResult = await validateCsrf(request, env, corsHeaders, authResult.session!, requestId)
        if (!csrfResult.success) return csrfResult.response!

        const id = parseInt(path.split('/')[2])
        if (isNaN(id)) return errorResponse('无效的项目ID', 400, corsHeaders, requestId)

        const body = await request.json()
        
        const UpdateItemSchema = z.object({
          name: z.string().min(1).max(100).optional().nullable(),
          url: z.string().url().max(500).optional().nullable(),
          icon: z.string().max(255).optional().nullable(),
          description: z.string().max(500).optional().nullable(),
          groupId: z.union([z.string(), z.number()]).optional().nullable(),
          order: z.number().int().optional().nullable(),
          openInNewTab: z.boolean().optional().nullable(),
          showAsWindow: z.boolean().optional().nullable(),
          windowWidth: z.number().int().positive().optional().nullable(),
          windowHeight: z.number().int().positive().optional().nullable(),
          color: z.string().max(7).optional().nullable()
        })

        const validation = UpdateItemSchema.safeParse(body)
        if (!validation.success) {
          return errorResponse('输入验证失败: ' + validation.error.issues.map(e => e.message).join(', '), 400, corsHeaders, requestId)
        }

        const updated = await d1Items.update(env, id, {
          name: validation.data.name,
          url: validation.data.url,
          icon: validation.data.icon,
          description: validation.data.description,
          groupId: validation.data.groupId ? parseInt(String(validation.data.groupId)) : undefined,
          order: validation.data.order,
          openInNewTab: validation.data.openInNewTab,
          showAsWindow: validation.data.showAsWindow,
          windowWidth: validation.data.windowWidth,
          windowHeight: validation.data.windowHeight,
          color: validation.data.color
        })

        if (!updated) return errorResponse('项目不存在', 404, corsHeaders, requestId)

        return jsonResponse({
          id: updated.id?.toString(),
          name: updated.name,
          url: updated.url,
          icon: updated.icon,
          description: updated.description,
          groupId: updated.group_id?.toString(),
          order: updated.order_index,
          openInNewTab: updated.open_in_new_tab === 1,
          showAsWindow: updated.show_as_window === 1,
          windowWidth: updated.window_width,
          windowHeight: updated.window_height,
          color: updated.color || '',
          createdAt: updated.created_at,
          updatedAt: updated.updated_at
        }, 200, corsHeaders, requestId)
      }

      if (path.match(/^\/items\/[^/]+$/) && method === 'DELETE') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!

        const csrfResult = await validateCsrf(request, env, corsHeaders, authResult.session!, requestId)
        if (!csrfResult.success) return csrfResult.response!

        const id = parseInt(path.split('/')[2])
        if (isNaN(id)) return errorResponse('无效的项目ID', 400, corsHeaders, requestId)

        await d1Items.delete(env, id)

        return jsonResponse({ success: true }, 200, corsHeaders, requestId)
      }

      if (path === '/settings' && method === 'GET') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!
        
        const settings = await d1Settings.get(env, authResult.session!.user_id)

        return jsonResponse({
          theme: settings.theme,
          language: settings.language,
          wallpaper: settings.wallpaper,
          wallpaperType: settings.wallpaperType,
          showSearchBar: settings.showSearchBar === 1,
          searchEngine: settings.searchEngine,
          itemsPerRow: settings.itemsPerRow,
          mobileItemsPerRow: settings.mobileItemsPerRow || 2,
          tabletItemsPerRow: settings.tabletItemsPerRow || 3,
          desktopItemsPerRow: settings.desktopItemsPerRow || 6,
          showGroupNames: settings.showGroupNames === 1,
          customCSS: settings.customCSS
        }, 200, corsHeaders, requestId)
      }

      if (path === '/settings' && method === 'PUT') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!

        const csrfResult = await validateCsrf(request, env, corsHeaders, authResult.session!, requestId)
        if (!csrfResult.success) return csrfResult.response!

        const body = await request.json()
        const validation = SettingsSchema.partial().safeParse(body)
        if (!validation.success) {
          return errorResponse('输入验证失败', 400, corsHeaders, requestId)
        }

        const updated = await d1Settings.update(env, {
          theme: validation.data.theme,
          language: validation.data.language,
          wallpaper: validation.data.wallpaper,
          wallpaperType: validation.data.wallpaperType,
          showSearchBar: validation.data.showSearchBar ? 1 : 0,
          searchEngine: validation.data.searchEngine,
          itemsPerRow: validation.data.itemsPerRow,
          mobileItemsPerRow: validation.data.mobileItemsPerRow,
          tabletItemsPerRow: validation.data.tabletItemsPerRow,
          desktopItemsPerRow: validation.data.desktopItemsPerRow,
          showGroupNames: validation.data.showGroupNames ? 1 : 0,
          customCSS: validation.data.customCSS,
          customJS: validation.data.customJS
        }, authResult.session!.user_id)

        return jsonResponse({
          theme: updated.theme,
          language: updated.language,
          wallpaper: updated.wallpaper,
          wallpaperType: updated.wallpaperType,
          showSearchBar: updated.showSearchBar === 1,
          searchEngine: updated.searchEngine,
          itemsPerRow: updated.itemsPerRow,
          mobileItemsPerRow: updated.mobileItemsPerRow || 2,
          tabletItemsPerRow: updated.tabletItemsPerRow || 3,
          desktopItemsPerRow: updated.desktopItemsPerRow || 6,
          showGroupNames: updated.showGroupNames === 1,
          customCSS: updated.customCSS
        }, 200, corsHeaders, requestId)
      }

      if (path === '/global-settings' && method === 'GET') {
        const url = new URL(request.url)
        const language = url.searchParams.get('language') || 'zh-CN'

        const globalSettings = await d1GlobalSettings.get(env, language)
        if (!globalSettings) {
          return errorResponse('Global settings not found', 404, corsHeaders, requestId)
        }

        return jsonResponse({
          language: globalSettings.language,
          websiteTitle: globalSettings.websiteTitle,
          websiteDescription: globalSettings.websiteDescription,
          pageTexts: globalSettings.pageTexts,
          footerText: globalSettings.footerText
        }, 200, corsHeaders, requestId)
      }

      if (path === '/global-settings' && method === 'PUT') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!

        if (authResult.session!.role !== 'admin') {
          return errorResponse('Admin access required', 403, corsHeaders, requestId)
        }

        const csrfResult = await validateCsrf(request, env, corsHeaders, authResult.session!, requestId)
        if (!csrfResult.success) return csrfResult.response!

        const body = await request.json()
        const { language, websiteTitle, websiteDescription, pageTexts, footerText } = body

        if (!language) {
          return errorResponse('Language is required', 400, corsHeaders, requestId)
        }

        const updated = await d1GlobalSettings.update(env, language, {
          websiteTitle,
          websiteDescription,
          pageTexts,
          footerText
        })

        if (!updated) {
          return errorResponse('Global settings not found', 404, corsHeaders, requestId)
        }

        return jsonResponse({
          language: updated.language,
          websiteTitle: updated.websiteTitle,
          websiteDescription: updated.websiteDescription,
          pageTexts: updated.pageTexts,
          footerText: updated.footerText
        }, 200, corsHeaders, requestId)
      }

      if (path === '/global-settings' && method === 'POST') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!

        if (authResult.session!.role !== 'admin') {
          return errorResponse('Admin access required', 403, corsHeaders, requestId)
        }

        const csrfResult = await validateCsrf(request, env, corsHeaders, authResult.session!, requestId)
        if (!csrfResult.success) return csrfResult.response!

        const body = await request.json()
        const { language, websiteTitle, websiteDescription, pageTexts, footerText } = body

        if (!language) {
          return errorResponse('Language is required', 400, corsHeaders, requestId)
        }

        const created = await d1GlobalSettings.create(env, {
          language,
          websiteTitle: websiteTitle || 'SunPanel',
          websiteDescription,
          pageTexts,
          footerText
        })

        return jsonResponse({
          language: created.language,
          websiteTitle: created.websiteTitle,
          websiteDescription: created.websiteDescription,
          pageTexts: created.pageTexts,
          footerText: created.footerText
        }, 201, corsHeaders, requestId)
      }

      if (path === '/export' && method === 'GET') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!

        const groups = await d1Groups.getAll(env, authResult.session!.user_id)
        const items = await d1Items.getAll(env, undefined, authResult.session!.user_id)
        const settings = await d1Settings.get(env, authResult.session!.user_id)

        return jsonResponse({
          version: '1.0.0',
          exportTime: new Date().toISOString(),
          groups: groups.map(g => ({
            id: g.id?.toString(),
            name: g.name,
            icon: g.icon,
            parentId: g.parent_id?.toString(),
            order: g.order_index,
            createdAt: g.created_at,
            updatedAt: g.updated_at
          })),
          items: items.map(i => ({
            id: i.id?.toString(),
            name: i.name,
            url: i.url,
            icon: i.icon,
            description: i.description,
            groupId: i.group_id?.toString(),
            order: i.order_index,
            openInNewTab: i.open_in_new_tab === 1,
            showAsWindow: i.show_as_window === 1,
            windowWidth: i.window_width,
            windowHeight: i.window_height,
            createdAt: i.created_at,
            updatedAt: i.updated_at
          })),
          settings: {
            theme: settings.theme,
            language: settings.language,
            wallpaper: settings.wallpaper,
            wallpaperType: settings.wallpaperType,
            showSearchBar: settings.showSearchBar === 1,
            searchEngine: settings.searchEngine,
            itemsPerRow: settings.itemsPerRow,
            showGroupNames: settings.showGroupNames === 1,
            customCSS: settings.customCSS
          }
        }, 200, corsHeaders, requestId)
      }

      if (path === '/import' && method === 'POST') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!

        const csrfResult = await validateCsrf(request, env, corsHeaders, authResult.session!, requestId)
        if (!csrfResult.success) return csrfResult.response!

        const data = await request.json()
        const validation = ImportSchema.safeParse(data)
        
        if (!validation.success) {
          return errorResponse('导入数据格式无效', 400, corsHeaders, requestId)
        }

        const validData = validation.data
        const userId = authResult.session!.user_id

        if (validData.groups && validData.groups.length > 0) {
          for (const g of validData.groups) {
            await d1Groups.create(env, {
              name: g.name,
              icon: g.icon,
              parentId: g.parentId ? parseInt(g.parentId) : undefined,
              order: g.order
            }, userId)
          }
        }

        if (validData.items && validData.items.length > 0) {
          for (const i of validData.items) {
            await d1Items.create(env, {
              name: i.name,
              url: i.url,
              icon: i.icon,
              description: i.description,
              groupId: i.groupId ? parseInt(i.groupId) : 1,
              order: i.order,
              openInNewTab: i.openInNewTab,
              showAsWindow: i.showAsWindow,
              windowWidth: i.windowWidth,
              windowHeight: i.windowHeight
            }, userId)
          }
        }

        if (validData.settings) {
          await d1Settings.update(env, {
            theme: validData.settings.theme,
            language: validData.settings.language,
            wallpaper: validData.settings.wallpaper,
            wallpaperType: validData.settings.wallpaperType,
            showSearchBar: validData.settings.showSearchBar ? 1 : 0,
            searchEngine: validData.settings.searchEngine,
            itemsPerRow: validData.settings.itemsPerRow,
            showGroupNames: validData.settings.showGroupNames ? 1 : 0,
            customCSS: validData.settings.customCSS
          }, userId)
        }

        return jsonResponse({ success: true }, 200, corsHeaders, requestId)
      }

      if (path === '/docker/containers' && method === 'GET') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!
        
        if (authResult.session!.role !== 'admin') {
          return errorResponse('权限不足', 403, corsHeaders, requestId)
        }

        return jsonResponse([], 200, corsHeaders, requestId)
      }

      if (path === '/gallery/user' && method === 'GET') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!

        const result = await env.SUNPANEL_DB.prepare(`
          SELECT id, url, filename, user_id, is_public, created_at
          FROM images WHERE user_id = ? OR is_public = 1
        `).bind(authResult.session!.user_id).all()

        return jsonResponse(result.results || [], 200, corsHeaders, requestId)
      }

      if (path === '/gallery/public' && method === 'GET') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!

        return jsonResponse([
          { id: '1', url: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg', name: 'GitHub' },
          { id: '2', url: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/twitter.svg', name: 'Twitter' },
          { id: '3', url: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/docker.svg', name: 'Docker' },
          { id: '4', url: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/google.svg', name: 'Google' },
          { id: '5', url: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/cloudflare.svg', name: 'Cloudflare' }
        ], 200, corsHeaders, requestId)
      }

      if (path === '/users/profile' && method === 'GET') {
        const authResult = await authenticate(request, env, corsHeaders, requestId)
        if (!authResult.success) return authResult.response!
        
        if (!authResult.session) {
          return errorResponse('会话无效', 401, corsHeaders, requestId)
        }

        const user = await env.SUNPANEL_DB.prepare(`
          SELECT id, username, nickname, role, avatar, email FROM users WHERE id = ?
        `).bind(authResult.session.user_id).first()

        if (!user) {
          return errorResponse('用户不存在', 404, corsHeaders, requestId)
        }

        const settings = await d1Settings.get(env, authResult.session.user_id)

        return jsonResponse({
          id: user.id.toString(),
          username: user.username,
          nickname: user.nickname || '用户',
          role: user.role,
          avatar: user.avatar || '',
          email: user.email || '',
          language: settings.language || 'zh-CN'
        }, 200, corsHeaders, requestId)
      }

      if (path === '/users' && method === 'GET') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!

        const sessionUser = await env.SUNPANEL_DB.prepare(`
          SELECT role FROM users WHERE id = ?
        `).bind(authResult.session!.user_id).first()

        if (sessionUser?.role !== 'admin') {
          return errorResponse('权限不足', 403, corsHeaders, requestId)
        }

        const users = await env.SUNPANEL_DB.prepare(`
          SELECT id, username, nickname, email, role, created_at FROM users ORDER BY created_at DESC
        `).all()

        return jsonResponse(users.results.map((u: any) => ({
          id: u.id.toString(),
          username: u.username,
          nickname: u.nickname || '',
          email: u.email || '',
          role: u.role,
          createdAt: u.created_at
        })), 200, corsHeaders, requestId)
      }

      if (path === '/users' && method === 'POST') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!

        const csrfResult = await validateCsrf(request, env, corsHeaders, authResult.session!, requestId)
        if (!csrfResult.success) return csrfResult.response!

        const sessionUser = await env.SUNPANEL_DB.prepare(`
          SELECT role FROM users WHERE id = ?
        `).bind(authResult.session!.user_id).first()

        if (sessionUser?.role !== 'admin') {
          return errorResponse('权限不足', 403, corsHeaders, requestId)
        }

        const body = await request.json()
        const { username, nickname, email, password, role } = body

        if (!username || !password) {
          return errorResponse('用户名和密码不能为空', 400, corsHeaders, requestId)
        }

        const existingUser = await env.SUNPANEL_DB.prepare(`
          SELECT id FROM users WHERE username = ?
        `).bind(username).first()

        if (existingUser) {
          return errorResponse('用户名已存在', 400, corsHeaders, requestId)
        }

        const passwordHash = await hashPassword(password)
        const now = new Date().toISOString()

        const result = await env.SUNPANEL_DB.prepare(`
          INSERT INTO users (username, nickname, email, password, role, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(username, nickname || null, email || null, passwordHash, role || 'user', now, now).run()

        return jsonResponse({
          id: (result.meta?.last_row_id || 0).toString(),
          username,
          nickname: nickname || '',
          email: email || '',
          role: role || 'user'
        }, 201, corsHeaders, requestId)
      }

      if (path === '/users/profile' && method === 'PUT') {
        log(`[PUT /users/profile] 进入端点处理`, 'info', requestId)
        
        try {
          log(`[PUT /users/profile] 开始认证`, 'info', requestId)
          const authResult = await authenticate(request, env, corsHeaders, requestId)
          log(`[PUT /users/profile] 认证完成, 结果: ${authResult.success}`, 'info', requestId)
          
          if (!authResult.success) {
            log(`[PUT /users/profile] 认证失败`, 'warn', requestId)
            return authResult.response!
          }
          
          log(`[PUT /users/profile] 认证成功, 检查会话`, 'info', requestId)
          
          if (!authResult.session) {
            log(`[PUT /users/profile] 会话为空`, 'warn', requestId)
            return errorResponse('会话无效', 401, corsHeaders, requestId)
          }
          
          log(`[PUT /users/profile] 会话有效, ID: ${authResult.session.id}, UserID: ${authResult.session.user_id}`, 'info', requestId)
          
          log(`[PUT /users/profile] 开始CSRF验证`, 'info', requestId)
          const csrfResult = await validateCsrf(request, env, corsHeaders, authResult.session, requestId)
          log(`[PUT /users/profile] CSRF验证完成, 结果: ${csrfResult.success}`, 'info', requestId)
          
          if (!csrfResult.success) {
            log(`[PUT /users/profile] CSRF验证失败`, 'warn', requestId)
            return csrfResult.response!
          }

          log(`[PUT /users/profile] CSRF验证成功, 开始读取请求体`, 'info', requestId)
          
          const body = await request.json()
          log(`[PUT /users/profile] 请求体: ${JSON.stringify(body)}`, 'info', requestId)
          
          const { nickname, email, avatar, language } = body

          log(`[PUT /users/profile] 更新用户ID: ${authResult.session.user_id}, 语言: ${language}`, 'info', requestId)
          
          log(`[PUT /users/profile] 开始更新 users 表`, 'info', requestId)
          await env.SUNPANEL_DB.prepare(`
            UPDATE users SET nickname = ?, email = ?, avatar = ?, updated_at = ? WHERE id = ?
          `).bind(nickname || null, email || null, avatar || null, new Date().toISOString(), authResult.session.user_id).run()
          log(`[PUT /users/profile] users 表更新成功`, 'info', requestId)

          if (language) {
            log(`[PUT /users/profile] 开始更新 settings 表语言: ${language}`, 'info', requestId)
            const updateResult = await d1Settings.update(env, { language }, authResult.session.user_id)
            log(`[PUT /users/profile] settings 表更新成功: ${JSON.stringify(updateResult)}`, 'info', requestId)
          }

          log(`[PUT /users/profile] 开始查询更新后的用户信息`, 'info', requestId)
          const updatedUser = await env.SUNPANEL_DB.prepare(`
            SELECT id, username, nickname, email, avatar, role FROM users WHERE id = ?
          `).bind(authResult.session.user_id).first()

          if (!updatedUser) {
            log(`[PUT /users/profile] 用户不存在`, 'warn', requestId)
            return errorResponse('用户不存在', 404, corsHeaders, requestId)
          }

          log(`[PUT /users/profile] 开始获取 settings`, 'info', requestId)
          const settings = await d1Settings.get(env, authResult.session.user_id)
          log(`[PUT /users/profile] 获取 settings 成功: ${settings.language}`, 'info', requestId)

          log(`[PUT /users/profile] 更新成功`, 'info', requestId)
          
          return jsonResponse({
            id: updatedUser.id.toString(),
            username: updatedUser.username,
            nickname: updatedUser.nickname || '用户',
            email: updatedUser.email || '',
            avatar: updatedUser.avatar || '',
            role: updatedUser.role,
            language: settings.language || 'zh-CN'
          }, 200, corsHeaders, requestId)
        } catch (error: any) {
          log(`[PUT /users/profile] 错误: ${error.message}, 堆栈: ${error.stack}`, 'error', requestId)
          return errorResponse('更新失败: ' + error.message, 500, corsHeaders, requestId)
        }
      }

      if (path.startsWith('/users/') && method === 'PUT') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!

        const csrfResult = await validateCsrf(request, env, corsHeaders, authResult.session, requestId)
        if (!csrfResult.success) return csrfResult.response!

        const sessionUser = await env.SUNPANEL_DB.prepare(`
          SELECT role FROM users WHERE id = ?
        `).bind(authResult.session!.user_id).first()

        if (sessionUser?.role !== 'admin') {
          return errorResponse('权限不足', 403, corsHeaders, requestId)
        }

        const userId = path.split('/')[2]
        const body = await request.json()
        const { nickname, email, role } = body

        await env.SUNPANEL_DB.prepare(`
          UPDATE users SET nickname = ?, email = ?, role = ?, updated_at = ? WHERE id = ?
        `).bind(nickname || null, email || null, role || 'user', new Date().toISOString(), userId).run()

        const updatedUser = await env.SUNPANEL_DB.prepare(`
          SELECT id, username, nickname, email, role FROM users WHERE id = ?
        `).bind(userId).first()

        return jsonResponse({
          id: updatedUser.id.toString(),
          username: updatedUser.username,
          nickname: updatedUser.nickname || '',
          email: updatedUser.email || '',
          role: updatedUser.role
        }, 200, corsHeaders, requestId)
      }

      if (path.startsWith('/users/') && method === 'DELETE') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!

        const csrfResult = await validateCsrf(request, env, corsHeaders, authResult.session!, requestId)
        if (!csrfResult.success) return csrfResult.response!

        const sessionUser = await env.SUNPANEL_DB.prepare(`
          SELECT role FROM users WHERE id = ?
        `).bind(authResult.session!.user_id).first()

        if (sessionUser?.role !== 'admin') {
          return errorResponse('权限不足', 403, corsHeaders, requestId)
        }

        const userId = path.split('/')[2]

        if (authResult.session!.user_id.toString() === userId) {
          return errorResponse('不能删除自己的账号', 400, corsHeaders, requestId)
        }

        await env.SUNPANEL_DB.prepare(`DELETE FROM users WHERE id = ?`).bind(userId).run()
        await env.SUNPANEL_DB.prepare(`DELETE FROM sessions WHERE user_id = ?`).bind(userId).run()
        await env.SUNPANEL_DB.prepare(`DELETE FROM groups WHERE user_id = ?`).bind(userId).run()
        await env.SUNPANEL_DB.prepare(`DELETE FROM items WHERE user_id = ?`).bind(userId).run()
        await env.SUNPANEL_DB.prepare(`DELETE FROM images WHERE user_id = ?`).bind(userId).run()
        await env.SUNPANEL_DB.prepare(`DELETE FROM settings WHERE user_id = ?`).bind(userId).run()

        return jsonResponse({ success: true, message: '删除成功' }, 200, corsHeaders, requestId)
      }

      if (path === '/users/change-password' && method === 'POST') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!

        const csrfResult = await validateCsrf(request, env, corsHeaders, authResult.session!, requestId)
        if (!csrfResult.success) return csrfResult.response!

        const body = await request.json()
        const validation = ChangePasswordSchema.safeParse(body)
        if (!validation.success) {
          return errorResponse('输入验证失败', 400, corsHeaders, requestId)
        }

        const { oldPassword, newPassword } = validation.data
        const userId = authResult.session!.user_id

        const user = await env.SUNPANEL_DB.prepare(`
          SELECT id, password FROM users WHERE id = ?
        `).bind(userId).first()

        if (!user) {
          return errorResponse('用户不存在', 404, corsHeaders, requestId)
        }

        const isOldPasswordValid = await verifyPassword(oldPassword, user.password)
        if (!isOldPasswordValid) {
          return errorResponse('原密码错误', 400, corsHeaders, requestId)
        }

        const newPasswordHash = await hashPassword(newPassword)
        await env.SUNPANEL_DB.prepare(`
          UPDATE users SET password = ?, updated_at = ? WHERE id = ?
        `).bind(newPasswordHash, new Date().toISOString(), userId).run()

        await env.SUNPANEL_DB.prepare(`
          DELETE FROM sessions WHERE user_id = ?
        `).bind(userId).run()

        return jsonResponse({ success: true, message: '密码修改成功，请重新登录' }, 200, corsHeaders, requestId)
      }

      if (path === '/users/avatar' && method === 'POST') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!

        const csrfResult = await validateCsrf(request, env, corsHeaders, authResult.session!, requestId)
        if (!csrfResult.success) return csrfResult.response!

        let formData: FormData
        try {
          formData = await request.formData()
        } catch {
          return errorResponse('请求格式错误', 400, corsHeaders, requestId)
        }

        const file = formData.get('file') as File | null
        if (!file) {
          return errorResponse('未提供文件', 400, corsHeaders, requestId)
        }

        const maxSize = 2 * 1024 * 1024
        if (file.size > maxSize) {
          return errorResponse('文件大小不能超过2MB', 400, corsHeaders, requestId)
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
        if (!allowedTypes.includes(file.type)) {
          return errorResponse('只允许上传JPG、PNG、GIF、WebP格式的图片', 400, corsHeaders, requestId)
        }

        try {
          const arrayBuffer = await file.arrayBuffer()
          const filename = `avatar-${authResult.session!.user_id}-${Date.now()}.${file.type.split('/')[1]}`
          
          // 首先将头像存储到 KV
          await env.IMAGES_KV.put(filename, arrayBuffer, {
            metadata: {
              contentType: file.type,
              userId: authResult.session!.user_id,
              isPublic: true
            }
          })
          
          // 然后将元数据存储到 D1
          await env.SUNPANEL_DB.prepare(`
            INSERT INTO images (url, filename, content_type, data, user_id, is_public, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).bind(`/gallery/images/${filename}`, filename, file.type, '', authResult.session!.user_id, 1, new Date().toISOString()).run()

          const avatarUrl = `/gallery/images/${filename}`

          await env.SUNPANEL_DB.prepare(`
            UPDATE users SET avatar = ?, updated_at = ? WHERE id = ?
          `).bind(avatarUrl, new Date().toISOString(), authResult.session!.user_id).run()

          return jsonResponse({ avatar: avatarUrl }, 200, corsHeaders, requestId)
        } catch (error: any) {
          log(`头像上传失败: ${error.message}`, 'error', requestId)
          return errorResponse('头像上传失败', 500, corsHeaders, requestId)
        }
      }

      if (path === '/public-gallery' && method === 'GET') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!

        return jsonResponse([
          { id: '1', url: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg', name: 'GitHub' },
          { id: '2', url: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/twitter.svg', name: 'Twitter' },
          { id: '3', url: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/docker.svg', name: 'Docker' },
          { id: '4', url: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/google.svg', name: 'Google' },
          { id: '5', url: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/cloudflare.svg', name: 'Cloudflare' }
        ], 200, corsHeaders, requestId)
      }

      if (path === '/auth/register' && method === 'POST') {
        if (!await checkRateLimit(clientIp, env, requestId, 'register')) {
          await auditLog(env, 'RATE_LIMIT_EXCEEDED', {
            ip: clientIp,
            userAgent: request.headers.get('User-Agent') || undefined,
            result: 'BLOCKED',
            details: '注册请求过于频繁'
          })
          return errorResponse('注册请求过于频繁，请稍后再试', 429, corsHeaders, requestId)
        }
        try {
          const body = await request.json()
          const validation = RegisterSchema.safeParse(body)
          if (!validation.success) {
            const errorMessages = validation.error?.issues?.map(e => e.message) || []
            return errorResponse('输入验证失败: ' + errorMessages.join(', '), 400, corsHeaders, requestId)
          }

          const { username, password, nickname } = validation.data

          const existingUser = await env.SUNPANEL_DB.prepare(`
            SELECT id FROM users WHERE username = ?
          `).bind(username).first()

          if (existingUser) {
            return errorResponse('用户名已存在', 400, corsHeaders, requestId)
          }

          // 检查是否已有用户，第一个用户设为管理员
          const userCountResult = await env.SUNPANEL_DB.prepare(`
            SELECT COUNT(*) as count FROM users
          `).first()
          
          const isFirstUser = !userCountResult || userCountResult.count === 0
          const role = isFirstUser ? 'admin' : 'user'

          const passwordHash = await hashPassword(password)
          const now = new Date().toISOString()

          await env.SUNPANEL_DB.prepare(`
            INSERT INTO users (username, password, nickname, role, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
          `).bind(username, passwordHash, nickname || username, role, now, now).run()

          log(`新用户注册: ${username}, 角色: ${role}`, 'info', requestId)

          return jsonResponse({
            message: '注册成功，请登录'
          }, 201, corsHeaders, requestId)
        } catch (error: any) {
          log(`注册失败: ${error.message}`, 'error', requestId)
          return errorResponse('注册失败', 500, corsHeaders, requestId)
        }
      }

      if (path === '/groups/reorder' && method === 'POST') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!

        const csrfResult = await validateCsrf(request, env, corsHeaders, authResult.session!, requestId)
        if (!csrfResult.success) return csrfResult.response!

        const { ids } = await request.json()
        if (!Array.isArray(ids)) {
          return errorResponse('输入验证失败', 400, corsHeaders, requestId)
        }

        for (let i = 0; i < ids.length; i++) {
          await env.SUNPANEL_DB.prepare(`
            UPDATE groups SET order_index = ? WHERE id = ?
          `).bind(i, parseInt(ids[i])).run()
        }

        return jsonResponse({ success: true }, 200, corsHeaders, requestId)
      }

      if (path === '/items/reorder' && method === 'POST') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!

        const csrfResult = await validateCsrf(request, env, corsHeaders, authResult.session!, requestId)
        if (!csrfResult.success) return csrfResult.response!

        const { ids } = await request.json()
        if (!Array.isArray(ids)) {
          return errorResponse('输入验证失败', 400, corsHeaders, requestId)
        }

        for (let i = 0; i < ids.length; i++) {
          await env.SUNPANEL_DB.prepare(`
            UPDATE items SET order_index = ? WHERE id = ?
          `).bind(i, parseInt(ids[i])).run()
        }

        return jsonResponse({ success: true }, 200, corsHeaders, requestId)
      }

      if (path.match(/^\/docker\/containers\/[^/]+\/start$/) && method === 'POST') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!
        
        if (authResult.session!.role !== 'admin') {
          return errorResponse('权限不足', 403, corsHeaders, requestId)
        }

        return errorResponse('Docker 功能暂未开放', 501, corsHeaders, requestId)
      }

      if (path.match(/^\/docker\/containers\/[^/]+\/stop$/) && method === 'POST') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!
        
        if (authResult.session!.role !== 'admin') {
          return errorResponse('权限不足', 403, corsHeaders, requestId)
        }

        return errorResponse('Docker 功能暂未开放', 501, corsHeaders, requestId)
      }

      if (path.match(/^\/docker\/containers\/[^/]+\/restart$/) && method === 'POST') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!
        
        if (authResult.session!.role !== 'admin') {
          return errorResponse('权限不足', 403, corsHeaders, requestId)
        }

        return errorResponse('Docker 功能暂未开放', 501, corsHeaders, requestId)
      }

      if (path === '/gallery/upload' && method === 'POST') {
        log(`到达上传处理路径: ${path}`, 'info', requestId)
        
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) {
          log('认证失败', 'warn', requestId)
          return authResult.response!
        }
        log('认证成功', 'info', requestId)

        const csrfResult = await validateCsrf(request, env, corsHeaders, authResult.session!, requestId)
        if (!csrfResult.success) {
          log('CSRF验证失败', 'warn', requestId)
          return csrfResult.response!
        }
        log('CSRF验证成功', 'info', requestId)

        const contentType = request.headers.get('Content-Type') || ''
        log(`上传请求 Content-Type: ${contentType}`, 'info', requestId)

        let formData: FormData
        try {
          log('准备读取表单数据', 'info', requestId)
          formData = await request.formData()
          log('表单数据读取成功', 'info', requestId)
        } catch (error: any) {
          log(`解析表单数据失败: ${error.message}`, 'error', requestId)
          return errorResponse('请求格式错误，无法解析表单数据: ' + error.message, 400, corsHeaders, requestId)
        }

        const file = formData.get('file') as File | null

        if (!file) {
          log('未提供文件', 'warn', requestId)
          return errorResponse('未提供文件', 400, corsHeaders, requestId)
        }

        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
          log(`文件大小超过限制: ${file.size}`, 'warn', requestId)
          return errorResponse('文件大小不能超过5MB', 400, corsHeaders, requestId)
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
        if (!allowedTypes.includes(file.type)) {
          log(`不支持的文件类型: ${file.type}`, 'warn', requestId)
          return errorResponse('只允许上传JPG、PNG、GIF、WebP格式的图片', 400, corsHeaders, requestId)
        }

        const isPublic = formData.get('isPublic') === 'true'
        const now = new Date().toISOString()
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        
        try {
          const arrayBuffer = await file.arrayBuffer()
          log(`arrayBuffer长度: ${arrayBuffer.byteLength}`, 'info', requestId)
          
          // 首先将图片存储到 KV
          await env.IMAGES_KV.put(filename, arrayBuffer, {
            metadata: {
              contentType: file.type,
              userId: authResult.session!.user_id,
              isPublic: isPublic
            }
          })
          log(`图片已存入 KV`, 'info', requestId)
          
          // 然后将元数据存储到 D1（data 字段保持为空或可以用于存储其他元信息）
          const result = await env.SUNPANEL_DB.prepare(`
            INSERT INTO images (url, filename, content_type, data, user_id, is_public, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).bind(`/gallery/images/${filename}`, filename, file.type, '', authResult.session!.user_id, isPublic ? 1 : 0, now).run()

          log(`图片元数据插入成功: ${filename}, ID: ${result.meta.last_row_id}`, 'info', requestId)

          return jsonResponse({
            id: result.meta.last_row_id.toString(),
            url: `/gallery/images/${filename}`,
            filename: filename,
            isPublic: isPublic
          }, 201, corsHeaders, requestId)
        } catch (error: any) {
          log(`图片上传失败: ${error.message}`, 'error', requestId)
          return errorResponse('图片上传失败: ' + error.message, 500, corsHeaders, requestId)
        }
      }

      if (path.match(/^\/gallery\/[^/]+$/) && method === 'DELETE') {
        const authResult = await authenticate(request, env, corsHeaders)
        if (!authResult.success) return authResult.response!

        const csrfResult = await validateCsrf(request, env, corsHeaders, authResult.session!, requestId)
        if (!csrfResult.success) return csrfResult.response!

        const id = parseInt(path.split('/')[2])
        if (isNaN(id)) return errorResponse('无效的图片ID', 400, corsHeaders, requestId)

        // 首先获取图片的 filename
        const imageResult = await env.SUNPANEL_DB.prepare(`
          SELECT filename FROM images WHERE id = ? AND user_id = ?
        `).bind(id, authResult.session!.user_id).first()

        if (imageResult) {
          const filename = imageResult.filename as string
          // 尝试从 KV 中删除图片
          try {
            await env.IMAGES_KV.delete(filename)
            log(`从 KV 删除图片成功: ${filename}`, 'info', requestId)
          } catch (error: any) {
            log(`从 KV 删除图片失败: ${error.message}`, 'warn', requestId)
          }
        }

        // 从 D1 删除图片记录
        await env.SUNPANEL_DB.prepare(`
          DELETE FROM images WHERE id = ? AND user_id = ?
        `).bind(id, authResult.session!.user_id).run()

        return jsonResponse({ success: true }, 200, corsHeaders, requestId)
      }

      log(`404 Not Found - Method: ${method}, Path: ${path}, Original URL: ${url.pathname}`, 'warn', requestId)
      return errorResponse('Not Found', 404, corsHeaders, requestId)

    } catch (error: any) {
      const errorName = error.name || 'UnknownError'
      const errorMsg = error.message || 'Unknown error'
      const errorStack = error.stack || 'No stack trace'
      log(`服务器错误 - 名称: ${errorName}, 消息: ${errorMsg}, 堆栈: ${errorStack}`, 'error', requestId)
      const isProduction = env.ENVIRONMENT === 'production'
      const errorMessage = isProduction ? 'Internal Server Error' : `${errorName}: ${errorMsg}`
      return errorResponse(errorMessage, 500, corsHeaders, requestId)
    }
  }
}