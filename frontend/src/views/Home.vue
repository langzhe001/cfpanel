<template>
  <div 
    class="min-h-screen transition-all duration-300 relative overflow-hidden"
    :style="backgroundStyle"
  >
    <div v-if="settings.wallpaperType === 'image'" class="absolute inset-0 bg-black/30 z-0"></div>
    
    <div class="fixed top-4 right-4 z-50">
      <div class="flex items-center gap-2 px-3 py-2 rounded-2xl backdrop-blur-xl bg-white/30 dark:bg-slate-900/40 border border-white/20 dark:border-slate-700/30">
        <button 
          v-if="isLoggedIn"
          @click="openAdminModal"
          class="p-2 rounded-full hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all hover:scale-110"
          :title="navTexts.admin"
        >
          <svg class="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </button>
        <button 
          @click="toggleTheme"
          class="p-2 rounded-full hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all hover:scale-110"
          :title="isDark ? navTexts.lightMode : navTexts.darkMode"
        >
          <svg v-if="isDark" class="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
          <svg v-else class="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>
        </button>
        <button 
          @click="toggleInternalMode"
          class="p-2 rounded-full hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all hover:scale-110"
          :title="isInternalMode ? '切换到外网模式' : '切换到内网模式'"
        >
          <!-- 内网模式：电脑/服务器图标 -->
          <svg v-if="isInternalMode" class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          <!-- 外网模式：地球图标 -->
          <svg v-else class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </button>
        <button 
          v-if="isLoggedIn"
          @click="handleLogout"
          class="p-2 rounded-full hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all hover:scale-110"
          :title="navTexts.logout"
        >
          <svg class="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
        </button>
      </div>
    </div>

    <main class="max-w-7xl mx-auto px-4 py-8 relative z-10">
      <div class="flex flex-col items-center justify-center py-12 mb-8">
        <div class="flex items-center gap-4 mb-6">
          <h1 class="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">{{ globalSettingsStore.websiteTitle }}</h1>
          <div class="text-right">
            <div class="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">{{ currentTime }}</div>
            <div class="text-sm text-white/80 drop-shadow">{{ currentDate }}</div>
          </div>
        </div>
        
        <p v-if="globalSettingsStore.websiteDescription" class="text-lg text-white/80 drop-shadow text-center max-w-2xl mb-6">
          {{ globalSettingsStore.websiteDescription }}
        </p>
        
        <div v-if="settings.showSearchBar" class="w-full max-w-2xl">
          <div class="relative">
            <div class="absolute left-1 top-1/2 -translate-y-1/2">
              <div class="relative search-engine-selector">
                <button 
                  @click="showSearchEngineDropdown = !showSearchEngineDropdown"
                  class="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div class="w-6 h-6 flex items-center justify-center">
                    <svg v-if="currentSearchEngineId === 0" class="w-5 h-5" viewBox="0 0 24 24" fill="#0066FF">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.3 1.02zm1.44-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.38-.48.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14C9.6 9.9 15 10.56 18.72 12.84c.36.18.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.3c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38C9.6 7.98 16.2 8.22 20.52 10.62c.42.24.6.84.36 1.32-.24.48-.84.66-1.32.42z"/>
                    </svg>
                    <svg v-else-if="currentSearchEngineId === 1" class="w-5 h-5" viewBox="0 0 24 24" fill="#4285F4">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <svg v-else-if="currentSearchEngineId === 2" class="w-5 h-5" viewBox="0 0 24 24" fill="#231916">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                    </svg>
                    <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="#F39C12">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.3 1.02zm1.44-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.38-.48.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14C9.6 9.9 15 10.56 18.72 12.84c.36.18.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.3c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38C9.6 7.98 16.2 8.22 20.52 10.62c.42.24.6.84.36 1.32-.24.48-.84.66-1.32.42z"/>
                    </svg>
                  </div>
                  <svg class="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                
                <div 
                  v-if="showSearchEngineDropdown"
                  class="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50"
                  @click.stop
                >
                  <div 
                    v-for="(engine, index) in searchEngines" 
                    :key="index"
                    @click.stop="selectSearchEngine(engine.url, index)"
                    class="flex items-center gap-3 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                  >
                    <div class="w-5 h-5 flex items-center justify-center">
                      <svg v-if="index === 0" class="w-4 h-4" viewBox="0 0 24 24" fill="#0066FF">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.3 1.02zm1.44-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.38-.48.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14C9.6 9.9 15 10.56 18.72 12.84c.36.18.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.3c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38C9.6 7.98 16.2 8.22 20.52 10.62c.42.24.6.84.36 1.32-.24.48-.84.66-1.32.42z"/>
                      </svg>
                      <svg v-else-if="index === 1" class="w-4 h-4" viewBox="0 0 24 24" fill="#4285F4">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <svg v-else-if="index === 2" class="w-4 h-4" viewBox="0 0 24 24" fill="#231916">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                      </svg>
                      <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="#F39C12">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.3 1.02zm1.44-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.38-.48.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14C9.6 9.9 15 10.56 18.72 12.84c.36.18.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.3c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38C9.6 7.98 16.2 8.22 20.52 10.62c.42.24.6.84.36 1.32-.24.48-.84.66-1.32.42z"/>
                      </svg>
                    </div>
                    <span class="text-sm text-slate-700 dark:text-slate-300">{{ engine.name }}</span>
                  </div>
                </div>
              </div>
            </div>
            <input
              v-model="searchQuery"
              @keyup.enter="doSearch"
              type="text"
              :placeholder="homeTexts.searchPlaceholder"
              class="w-full pl-20 pr-14 py-4 text-lg rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 shadow-lg"
            />
            <button 
              @click="doSearch"
              class="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
            >
              <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          
          <div class="fixed inset-0 z-40" v-if="showSearchEngineDropdown" @click="showSearchEngineDropdown = false"></div>
        </div>
      </div>

      <ErrorMessage
        v-if="dataStore.error"
        :message="dataStore.error.message"
        type="error"
        :closable="true"
        :retry="true"
        @close="dataStore.clearError()"
        @retry="handleRetry"
      />

      <div v-if="isLoading" class="py-20">
        <LoadingSpinner :text="t('common.loading')" />
      </div>

      <div v-else-if="!isLoggedIn || groups.length === 0" class="flex flex-col items-center justify-center py-20">
        <div class="text-6xl mb-4">🌞</div>
        <h2 class="text-2xl font-bold text-white drop-shadow-lg mb-2">{{ homeTexts.welcome }}</h2>
        <p class="text-white/80 drop-shadow mb-6">{{ homeTexts.addFirstGroupDesc }}</p>
        <button 
          v-if="isLoggedIn"
          @click="openAdminModal"
          class="px-6 py-3 text-white bg-orange-500 rounded-full hover:bg-orange-600 transition-colors shadow-lg"
        >
          {{ navTexts.admin }}
        </button>
        <button 
          v-else
          @click="goLogin"
          class="px-6 py-3 text-white bg-orange-500 rounded-full hover:bg-orange-600 transition-colors shadow-lg"
        >
          {{ homeTexts.loginToConfigure }}
        </button>
      </div>

      <div v-else class="space-y-8">
        <div 
          v-for="group in groups" 
          :key="group.id"
          class="group-card"
        >
          <div v-if="settings.showGroupNames" class="mb-4 flex items-center gap-2">
            <Icon 
              v-if="group.icon" 
              :icon="group.icon" 
              class="w-6 h-6 text-orange-500"
            />
            <h2 class="text-lg font-semibold text-white drop-shadow">{{ group.name }}</h2>
          </div>

          <div class="grid gap-3" :style="{ gridTemplateColumns: `repeat(${getItemsPerRow()}, minmax(0, 1fr))` }">
            <a
              v-for="item in getGroupItems(group.id)"
              :key="item.id"
              :href="getItemUrl(item)"
              :target="item.openInNewTab ? '_blank' : '_self'"
              @click.prevent="openItem(item)"
              class="item-card flex items-start gap-3 p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
            >
              <div 
                class="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl flex-shrink-0"
                :style="{ backgroundColor: item.color || getItemColor(item.name) }"
              >
                <Icon 
                  v-if="item.icon" 
                  :icon="item.icon" 
                  class="w-6 h-6 text-white"
                />
                <span v-else class="text-lg font-bold text-white">{{ getDefaultIcon(item.name) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap truncate">
                  {{ item.name }}
                </div>
                <div class="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap truncate">
                  {{ getDomain(getItemUrl(item)) }}
                </div>
                <div v-if="item.description" class="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap truncate mt-0.5">
                  {{ item.description }}
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </main>

    <Modal v-model="adminModalOpen" :title="globalSettingsStore.websiteTitle + ' ' + navTexts.admin" icon="☀️" @close="closeAdminModal">
      <div class="w-full h-full min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
        <iframe 
          :src="adminUrl" 
          class="w-full h-full border-0 bg-slate-50 dark:bg-slate-900"
          @load="onIframeLoad"
        ></iframe>
      </div>
    </Modal>

    <Modal v-model="activeWindowModalOpen" :title="activeWindow?.name || ''" @close="closeWindow">
      <div class="w-full h-full min-h-[400px] sm:min-h-[500px]">
        <iframe 
          v-if="activeWindow"
          :src="activeWindow.url" 
          class="w-full h-full border-0 bg-slate-50 dark:bg-slate-900"
        ></iframe>
      </div>
    </Modal>

 <style v-if="safeCustomCSS" v-html="safeCustomCSS" />
    
    <footer v-if="globalSettingsStore.footerText" class="absolute bottom-4 left-0 right-0 text-center">
      <p class="text-white/60 text-sm drop-shadow">
        {{ globalSettingsStore.footerText }}
      </p>
    </footer>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'
import { useDataStore } from '@/stores/data'
import { useGlobalSettingsStore } from '@/stores/globalSettings'
import { usePageTexts } from '@/composables/useI18n'
import { EVENTS, useCrossFrameSync } from '@/composables/useEventBus'
import { useSSE } from '@/composables/useSSE'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'
import Modal from '@/components/Modal.vue'
import { sanitizeUrl, containsXss, sanitizeCSS } from '@/utils/security'
import type { Item } from '@/types'

const router = useRouter()
const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const dataStore = useDataStore()
const globalSettingsStore = useGlobalSettingsStore()
const { home: homeTexts, nav: navTexts, t } = usePageTexts()

const searchQuery = ref('')
const activeWindow = ref<Item | null>(null)
const activeWindowModalOpen = ref(false)
const selectedSearchEngine = ref('https://www.bing.com/search?q=')
const currentSearchEngine = ref('https://www.bing.com/search?q=')
const currentSearchEngineId = ref(0)
const showSearchEngineDropdown = ref(false)
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1280)

const searchEngines = [
  { name: 'Bing', url: 'https://www.bing.com/search?q=' },
  { name: 'Google', url: 'https://www.google.com/search?q=' },
  { name: '百度', url: 'https://www.baidu.com/s?wd=' },
  { name: '360搜索', url: 'https://www.so.com/s?q=' }
]

const isInternalMode = ref(false)

const toggleInternalMode = () => {
  isInternalMode.value = !isInternalMode.value
  localStorage.setItem('isInternalMode', String(isInternalMode.value))
}

const getItemUrl = (item: Item): string => {
  // 获取原始URL值
  const rawUrl = item.url
  
  // 如果是字符串，尝试解析为JSON对象（后端存储的格式）
  if (typeof rawUrl === 'string') {
    try {
      // 尝试解析JSON字符串
      const parsed = JSON.parse(rawUrl)
      if (parsed && typeof parsed === 'object') {
        const urlObj = parsed as { external?: string; internal: string }
        const externalUrl = urlObj.external
        const internalUrl = urlObj.internal
        
        // 只有一个地址时返回那个地址
        if (!internalUrl && externalUrl) {
          return externalUrl
        }
        if (!externalUrl && internalUrl) {
          return internalUrl
        }
        
        // 两个都有，根据模式选择
        if (isInternalMode.value) {
          return internalUrl || externalUrl || ''
        } else {
          return externalUrl || internalUrl || ''
        }
      }
    } catch {
      // 不是JSON格式，直接返回原字符串
      return rawUrl
    }
  }
  
  // 处理 object 类型的 URL（直接是对象）
  if (rawUrl && typeof rawUrl === 'object') {
    const urlObj = rawUrl as { external?: string; internal: string }
    const externalUrl = urlObj.external
    const internalUrl = urlObj.internal
    
    // 只有一个地址时返回那个地址
    if (!internalUrl && externalUrl) {
      return externalUrl
    }
    if (!externalUrl && internalUrl) {
      return internalUrl
    }
    
    // 两个都有，根据模式选择
    if (isInternalMode.value) {
      return internalUrl || externalUrl || ''
    } else {
      return externalUrl || internalUrl || ''
    }
  }
  
  // 兜底返回空字符串
  return ''
}

const selectSearchEngine = (url: string, id: number) => {
  currentSearchEngine.value = url
  currentSearchEngineId.value = id
  showSearchEngineDropdown.value = false
  localStorage.setItem('searchEngine', url)
  localStorage.setItem('searchEngineId', id.toString())
}
const currentTime = ref('')
const currentDate = ref('')
const adminModalOpen = ref(false)
const adminUrl = ref('')
let timeInterval: number | null = null
let globalSettingsUnsubscribe: (() => void) | null = null
let sseUnsubscribe: (() => void) | null = null
const isInitializing = ref(false)

const { connect: connectSSE, onMessage: onSSEMessage, disconnect: disconnectSSE, on: onSSEEvent } = useSSE()

// 页面初始化函数 - 获取所有需要的数据
const initializePage = async () => {
  console.log('[Home] 开始页面初始化...')
  isInitializing.value = true
  
  try {
    // 加载搜索引擎设置
    const savedSearchEngine = localStorage.getItem('searchEngine')
    const savedSearchEngineId = localStorage.getItem('searchEngineId')
    
    if (savedSearchEngine) {
      currentSearchEngine.value = savedSearchEngine
    } else if (settingsStore.settings.searchEngine) {
      currentSearchEngine.value = settingsStore.settings.searchEngine
    }
    
    if (savedSearchEngineId) {
      currentSearchEngineId.value = parseInt(savedSearchEngineId)
    } else {
      // 根据 URL 计算 ID
      const engineIndex = searchEngines.findIndex(e => e.url === currentSearchEngine.value)
      currentSearchEngineId.value = engineIndex >= 0 ? engineIndex : 0
    }
    
    // 加载内外网模式设置
    const savedInternalMode = localStorage.getItem('isInternalMode')
    if (savedInternalMode) {
      isInternalMode.value = savedInternalMode === 'true'
    }
    
    // 1. 首先加载个人设置（包含主题、壁纸、搜索栏等）
    console.log('[Home] 1. 加载个人设置...')
    await settingsStore.loadSettings()
    console.log('[Home] 个人设置加载完成:', settingsStore.settings)
    
    // 2. 加载全局设置（包含网站标题、描述、页脚等）
    console.log('[Home] 2. 加载全局设置...')
    await globalSettingsStore.loadSettings()
    console.log('[Home] 全局设置加载完成:', globalSettingsStore.settings)
    
    // 3. 如果已登录，加载用户信息和数据
    if (authStore.isSessionValid()) {
      console.log('[Home] 3. 用户已登录，加载用户信息...')
      await authStore.fetchUser()
      console.log('[Home] 用户信息加载完成:', authStore.user)
      
      console.log('[Home] 4. 加载分组和项目数据...')
      await dataStore.fetchAll()
      console.log('[Home] 数据加载完成 - 分组:', dataStore.groups.length, '项目:', dataStore.items.length)
    } else {
      console.log('[Home] 3. 用户未登录，跳过用户信息和数据加载')
    }
    
    console.log('[Home] 页面初始化完成')
  } catch (err) {
    console.error('[Home] 页面初始化失败:', err)
  } finally {
    isInitializing.value = false
  }
}

const refreshAll = async () => {
  console.log('[Home] 开始刷新所有设置...')
  
  try {
    await settingsStore.loadSettings(true)
    await globalSettingsStore.loadSettings(undefined, true)
    
    if (authStore.isSessionValid()) {
      await dataStore.fetchAll()
    }
    
    console.log('[Home] 刷新完成')
  } catch (err) {
    console.error('[Home] 刷新失败:', err)
  }
}

const refreshGlobalSettings = async () => {
  console.log('[Home] 刷新全局设置...')
  try {
    await globalSettingsStore.loadSettings(undefined, true)
    console.log('[Home] 全局设置刷新完成')
  } catch (err) {
    console.error('[Home] 全局设置刷新失败:', err)
  }
}

const refreshLayoutSettings = async () => {
  console.log('[Home] 刷新布局设置...')
  try {
    await settingsStore.loadSettings(true)
    console.log('[Home] 布局设置刷新完成')
  } catch (err) {
    console.error('[Home] 布局设置刷新失败:', err)
  }
}

const refreshData = async () => {
  console.log('[Home] 刷新数据...')
  try {
    if (authStore.isSessionValid()) {
      await dataStore.fetchAll()
    }
    console.log('[Home] 数据刷新完成')
  } catch (err) {
    console.error('[Home] 数据刷新失败:', err)
  }
}

const updateTime = () => {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  currentTime.value = `${hours}:${minutes}:${seconds}`
  
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const weekdaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const weekdaysJa = ['日', '月', '火', '水', '木', '金', '土']
  const weekdaysKo = ['일', '월', '화', '수', '목', '금', '토']
  
  const weekdayMap: Record<string, string[]> = {
    'zh-CN': weekdays,
    'en-US': weekdaysEn,
    'ja-JP': weekdaysJa,
    'ko-KR': weekdaysKo
  }
  
  const weekdayList = weekdayMap[globalSettingsStore.currentLanguage] || weekdays
  const month = now.getMonth() + 1
  const day = now.getDate()
  const weekday = weekdayList[now.getDay()]
  
  const dateFormatMap: Record<string, string> = {
    'zh-CN': `${month}-${day} 星期${weekday}`,
    'en-US': `${month}/${day} ${weekday}`,
    'ja-JP': `${month}月${day}日 (${weekday})`,
    'ko-KR': `${month}월 ${day}일 (${weekday})`
  }
  
  currentDate.value = dateFormatMap[globalSettingsStore.currentLanguage] || `${month}-${day} 星期${weekday}`
}

const openAdminModal = () => {
  adminUrl.value = '/admin'
  adminModalOpen.value = true
}

const closeAdminModal = () => {
  adminModalOpen.value = false
  adminUrl.value = ''
}

const onIframeLoad = () => {
  try {
    const iframe = document.querySelector('iframe')
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'closeAdminModal' }, '*')
    }
  } catch (e) {
    console.log('Cannot access iframe content')
  }
}

window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'closeAdminModal') {
    closeAdminModal()
  }
})

const isLoggedIn = computed(() => {
  if (authStore.user) return true
  if (authStore.isSessionValid()) return true
  return false
})
const isDark = computed(() => settingsStore.settings.theme === 'dark')
const settings = computed(() => settingsStore.settings)
const groups = computed(() => dataStore.groups)
const items = computed(() => dataStore.items)
// 加载状态：页面初始化中 OR 数据加载中
const isLoading = computed(() => isInitializing.value || dataStore.isLoading)

const safeCustomCSS = computed(() => {
  return sanitizeCSS(settings.value.customCSS)
})

const currentItemsPerRow = computed(() => {
  if (typeof window === 'undefined') return settings.value.desktopItemsPerRow
  
  const width = windowWidth.value
  if (width < 640) return settings.value.mobileItemsPerRow || 2
  if (width < 1024) return settings.value.tabletItemsPerRow || 3
  return settings.value.desktopItemsPerRow || 6
})

const backgroundStyle = computed(() => {
  if (settings.value.wallpaperType === 'color') {
    return { backgroundColor: settings.value.wallpaper }
  }
  if (!settings.value.wallpaper) {
    return { backgroundColor: '#1e293b' }
  }
  return { 
    backgroundImage: `url(${settings.value.wallpaper})`, 
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed'
  }
})

const getGroupItems = (groupId: string) => {
  return dataStore.getItemsByGroup(groupId)
}

const getItemsPerRow = () => {
  const width = windowWidth.value
  if (width < 640) return settings.value.mobileItemsPerRow || 2
  if (width < 1024) return settings.value.tabletItemsPerRow || 3
  return settings.value.desktopItemsPerRow || 6
}

const getDefaultIcon = (name: string) => {
  const icons: Record<string, string> = {
    'G': '🔍', 'B': '🌐', 'M': '📧', 'S': '⚙️', 'W': '🌐'
  }
  return icons[name[0]?.toUpperCase()] || '📁'
}

const getDomain = (url: string): string => {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace(/^www\./i, '')
  } catch {
    return url
  }
}

const getItemColor = (name: string): string => {
  const colors: Record<string, string> = {
    'bilibili': '#FB7299',
    'Jellyfin': '#00A4DC',
    'iKuai': '#00C853',
    'Navidrome': '#4169E1',
    'ubuntu': '#E95420',
    'VSCode': '#007ACC',
    '迅镭': '#1DA1F2',
    'windows': '#0078D4',
    'WeChat': '#07C160',
    'QQ': '#12B7F5',
    'OpenWRT': '#4DB6AC',
    'Blog': '#FF9800',
    'Portainer': '#13A8E2',
    'JD': '#D0021B',
    'Postgresql': '#4169E1',
    'Sun-Panel': '#00B894',
    'Nextcloud': '#0082C9',
    'Nginx': '#269539',
    'Docker': '#2496ED',
    'HomeAssistant': '#049DBF',
  }
  
  const normalizedName = name.toLowerCase().trim()
  const matchedKey = Object.keys(colors).find(key => 
    key.toLowerCase() === normalizedName || 
    name.toLowerCase().includes(key.toLowerCase())
  )
  
  if (matchedKey) {
    return colors[matchedKey]
  }
  
  const colorList = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1',
    '#FF7F50', '#9370DB', '#20B2AA', '#FF69B4',
    '#32CD32', '#FFD700', '#FF6347', '#87CEEB'
  ]
  
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colorList[Math.abs(hash) % colorList.length]
}

const openItem = (item: Item) => {
  // 使用 getItemUrl 获取当前模式对应的正确URL
  const itemUrl = getItemUrl(item)
  const safeUrl = sanitizeUrl(itemUrl)
  
  if (containsXss(safeUrl)) {
    console.warn('Potentially unsafe URL detected:', itemUrl)
    return
  }
  
  if (item.showAsWindow) {
    activeWindow.value = item
    activeWindowModalOpen.value = true
  } else {
    window.open(safeUrl, item.openInNewTab ? '_blank' : '_self')
  }
}

const closeWindow = () => {
  activeWindowModalOpen.value = false
  activeWindow.value = null
}

const toggleTheme = () => {
  const newTheme = settings.value.theme === 'dark' ? 'light' : 'dark'
  settingsStore.updateSettings({ theme: newTheme })
}

const doSearch = () => {
  if (searchQuery.value.trim()) {
    window.open(currentSearchEngine.value + encodeURIComponent(searchQuery.value), '_blank')
  }
}

const goLogin = () => router.push('/login')

const handleLogout = async () => {
  await authStore.logout()
  dataStore.groups = []
  dataStore.items = []
  settingsStore.resetSettings()
  router.push('/')
}

const handleRetry = () => {
  dataStore.clearError()
  if (isLoggedIn.value) {
    dataStore.refreshAll()
  }
}

const handleResize = () => {
  windowWidth.value = window.innerWidth
}

onMounted(async () => {
  // 执行页面初始化
  await initializePage()

  // 更新时间和设置定时器
  updateTime()
  timeInterval = window.setInterval(updateTime, 1000)

  window.addEventListener('resize', handleResize)

  // 监听后台设置变更（跨 iframe 通信）
  const { listenForChanges } = useCrossFrameSync()
  globalSettingsUnsubscribe = listenForChanges(EVENTS.GLOBAL_SETTINGS_CHANGED, (newSettings) => {
    console.log('[Home] 收到后台设置变更通知，更新全局设置')
    globalSettingsStore.settings = { ...newSettings }
  })

  // 连接 SSE 服务（服务器推送）- 在数据加载完成后连接
  connectSSE()
  
  const handleGroupCreated = (data: any) => {
    console.log('[Home] 收到分组创建通知:', data)
    dataStore.groups.push(data)
    dataStore.groups.sort((a, b) => a.order - b.order)
  }

  const handleGroupUpdated = (data: any) => {
    console.log('[Home] 收到分组更新通知:', data)
    const index = dataStore.groups.findIndex(g => g.id === data.id)
    if (index !== -1) {
      dataStore.groups[index] = data
    }
    dataStore.groups.sort((a, b) => a.order - b.order)
  }

  const handleGroupDeleted = (data: any) => {
    console.log('[Home] 收到分组删除通知:', data)
    dataStore.groups = dataStore.groups.filter(g => g.id !== data.id)
    dataStore.items = dataStore.items.filter(i => i.groupId !== data.id)
  }

  const handleItemCreated = (data: any) => {
    console.log('[Home] 收到项目创建通知:', data)
    dataStore.items.push(data)
    dataStore.items.sort((a, b) => a.order - b.order)
  }

  const handleItemUpdated = (data: any) => {
    console.log('[Home] 收到项目更新通知:', data)
    const index = dataStore.items.findIndex(i => i.id === data.id)
    if (index !== -1) {
      dataStore.items[index] = data
    }
    dataStore.items.sort((a, b) => a.order - b.order)
  }

  const handleItemDeleted = (data: any) => {
    console.log('[Home] 收到项目删除通知:', data)
    dataStore.items = dataStore.items.filter(i => i.id !== data.id)
  }

  const groupCreatedUnsubscribe = onSSEEvent('groupCreated', handleGroupCreated)
  const groupUpdatedUnsubscribe = onSSEEvent('groupUpdated', handleGroupUpdated)
  const groupDeletedUnsubscribe = onSSEEvent('groupDeleted', handleGroupDeleted)
  const itemCreatedUnsubscribe = onSSEEvent('itemCreated', handleItemCreated)
  const itemUpdatedUnsubscribe = onSSEEvent('itemUpdated', handleItemUpdated)
  const itemDeletedUnsubscribe = onSSEEvent('itemDeleted', handleItemDeleted)
  
  const handleSettingsChanged = async (data: any) => {
    console.log('[Home] 收到设置变更通知:', data)
    await settingsStore.loadSettings(true)
    
    // 如果语言发生变化，切换全局设置的语言
    const newLanguage = settingsStore.settings.language
    if (newLanguage && newLanguage !== globalSettingsStore.currentLanguage) {
      console.log(`[Home] 语言变更: ${globalSettingsStore.currentLanguage} -> ${newLanguage}`)
      await globalSettingsStore.setLanguage(newLanguage)
    }
  }
  
  const handleGlobalSettingsChanged = (data: any) => {
    console.log('[Home] 收到全局设置变更通知:', data)
    globalSettingsStore.loadSettings(undefined, true)
  }
  
  const settingsChangedUnsubscribe = onSSEEvent('settingsChanged', handleSettingsChanged)
  const globalSettingsChangedUnsubscribe = onSSEEvent('globalSettingsChanged', handleGlobalSettingsChanged)
  
  sseUnsubscribe = onSSEMessage((message) => {
    console.log('[Home] 收到 SSE 消息:', message.type)
    
    switch (message.type) {
      case 'globalSettingsChanged':
        // 全局设置变更，从 API 重新获取
        globalSettingsStore.loadSettings(undefined, true)
        break
      case 'settingsChanged':
        // 设置变更，从 API 重新获取
        settingsStore.loadSettings(true)
        break
      case 'dataChanged':
        // 数据变更，直接更新本地数据
        handleDataChanged(message.data)
        break
      case 'refreshAll':
        refreshAll()
        break
      case 'themeChanged':
        refreshLayoutSettings()
        break
      default:
        console.log('[Home] 未知消息类型:', message.type)
    }
  })
  
  const handleDataChanged = (data: any) => {
    if (!data || !data.type) {
      console.warn('[Home] 无效的数据变更消息:', data)
      return
    }
    
    console.log('[Home] 数据变更类型:', data.type)
    
    switch (data.type) {
      case 'groupCreated':
        handleGroupCreated(data.data)
        break
      case 'groupUpdated':
        handleGroupUpdated(data.data)
        break
      case 'groupDeleted':
        handleGroupDeleted(data.data)
        break
      case 'itemCreated':
        handleItemCreated(data.data)
        break
      case 'itemUpdated':
        handleItemUpdated(data.data)
        break
      case 'itemDeleted':
        handleItemDeleted(data.data)
        break
      default:
        console.warn('[Home] 未知的数据变更类型:', data.type)
        refreshData()
    }
  }
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  window.removeEventListener('resize', handleResize)
  
  // 取消监听
  if (globalSettingsUnsubscribe) {
    globalSettingsUnsubscribe()
  }
  
  // 取消 SSE 事件订阅
  if (groupCreatedUnsubscribe) {
    groupCreatedUnsubscribe()
  }
  if (groupUpdatedUnsubscribe) {
    groupUpdatedUnsubscribe()
  }
  if (groupDeletedUnsubscribe) {
    groupDeletedUnsubscribe()
  }
  if (itemCreatedUnsubscribe) {
    itemCreatedUnsubscribe()
  }
  if (itemUpdatedUnsubscribe) {
    itemUpdatedUnsubscribe()
  }
  if (itemDeletedUnsubscribe) {
    itemDeletedUnsubscribe()
  }
  if (settingsChangedUnsubscribe) {
    settingsChangedUnsubscribe()
  }
  if (globalSettingsChangedUnsubscribe) {
    globalSettingsChangedUnsubscribe()
  }
  
  // 断开 SSE 连接
  disconnectSSE()
  if (sseUnsubscribe) {
    sseUnsubscribe()
  }
})
</script>

<style scoped>
.item-card {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>