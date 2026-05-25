/**
 * SunPanel API 客户端
 * 模块化 API 定义，按功能拆分便于维护
 */

// 导出基础配置和工具函数
export {
  SECURITY_CONFIG,
  createApiClient,
  retryWithExponentialBackoff,
  getCookie,
  clearCache,
  clearAllAuth,
  clearAuthAndRedirect,
  validateFileUpload,
  cacheApi,
  api
} from './client'

// 导出各模块 API
export { authApi } from './auth'
export { userApi } from './user'
export { groupApi } from './group'
export { itemApi } from './item'
export { settingsApi } from './settings'
export { globalSettingsApi } from './globalSettings'
export { galleryApi, exportImportApi } from './gallery'
