/**
 * 数据库操作服务
 */

export const toCamelCase = (str: string | undefined | null): string => {
  if (!str) return ''
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())
}

export const toSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

// 数据库结果转换为驼峰命名
export const transformResult = <T extends Record<string, any>>(result: any): T => {
  if (!result) return {} as T
  const transformed: Record<string, any> = {}
  for (const key in result) {
    const camelKey = toCamelCase(key)
    transformed[camelKey] = result[key]
  }
  return transformed as T
}

// 批量转换
export const transformResults = <T extends Record<string, any>>(results: any[]): T[] => {
  return results.map(result => transformResult<T>(result))
}
