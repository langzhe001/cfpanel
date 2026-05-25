/**
 * CORS 工具函数
 */

export const getAllowedOrigins = (env: any): string[] => {
  if (!env.ALLOWED_ORIGINS) return ['*']
  return env.ALLOWED_ORIGINS.split(',').map((o: string) => o.trim())
}

export const getCorsHeaders = (request: Request, env: any): Record<string, string> => {
  const origin = request.headers.get('Origin') || '*'
  const allowedOrigins = getAllowedOrigins(env)
  
  const corsOrigins = allowedOrigins.includes('*') ? '*' : allowedOrigins.includes(origin) ? origin : ''
  
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': corsOrigins,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, X-User-Id',
    'Access-Control-Allow-Credentials': 'true',
  }

  return headers
}

export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}
