export interface User {
  id: string
  username: string
  nickname: string
  role: 'admin' | 'user'
  avatar?: string
  email?: string
  language?: string
  createdAt?: string
  updatedAt?: string
}

export interface Group {
  id: string
  name: string
  icon: string
  order: number
  parentId: string | null
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Item {
  id: string
  name: string
  url: string
  icon: string
  description: string
  groupId: string
  userId: string
  order: number
  openInNewTab: boolean
  showAsWindow: boolean
  windowWidth: number
  windowHeight: number
  color: string
  createdAt: string
  updatedAt: string
}

export interface Settings {
  theme: 'light' | 'dark' | 'auto'
  language: string
  wallpaper: string
  wallpaperType: 'color' | 'image'
  showSearchBar: boolean
  searchEngine: string
  itemsPerRow: number
  mobileItemsPerRow: number
  tabletItemsPerRow: number
  desktopItemsPerRow: number
  showGroupNames: boolean
  customCSS: string
  customJS: string
}

export interface GlobalSettings {
  language: string
  websiteTitle: string
  websiteDescription: string
  pageTexts: Record<string, Record<string, string>>
  footerText: string
}

export interface PageTexts {
  home?: { title?: string; welcome?: string }
  nav?: { home?: string; admin?: string; login?: string; logout?: string }
  admin?: { dashboard?: string; settings?: string; users?: string; groups?: string; items?: string; personalization?: string }
  login?: { title?: string; username?: string; password?: string; submit?: string; register?: string; forgot?: string }
  settings?: { title?: string; theme?: string; language?: string; save?: string; reset?: string }
}

export interface DockerContainer {
  id: string
  name: string
  image: string
  status: 'running' | 'stopped' | 'paused'
  ports: string[]
  created: string
}

export interface APIResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  csrfToken?: string
  user: User
}
