import { computed, toRef, watch } from 'vue'
import { useGlobalSettingsStore } from '@/stores/globalSettings'
import { eventBus, EVENTS } from '@/composables/useEventBus'

const defaultTexts: Record<string, Record<string, string>> = {
  'zh-CN': {
    'admin.migrateFromSunPanel': '从 sun-panel 迁移',
    'admin.migrateFromSunPanelDesc': '支持从官方 sun-panel 导出数据迁移到本系统。',
    'admin.selectFileMigrate': '选择文件迁移',
    'admin.exportToSunPanel': '导出到 sun-panel',
    'admin.exportToSunPanelDesc': '将当前数据导出为 sun-panel 兼容格式。',
    'admin.exportCompatible': '导出兼容格式',
    'admin.migrationInstructions': '迁移说明',
    'admin.migrationStep1': '1. 从 sun-panel 导出配置（设置 -> 导出数据）',
    'admin.migrationStep2': '2. 使用上方工具导入到本系统',
    'admin.migrationStep3': '3. 迁移完成后请检查数据完整性',
    'admin.migrationStep4': '4. 图片资源需要单独迁移',
    'admin.dataMigration': '数据迁移',
    'admin.exportData': '导出数据',
    'admin.exportDescription': '导出您的所有配置数据，包括分组、网站和设置。',
    'admin.exportConfig': '导出配置',
    'admin.exporting': '导出中...',
    'admin.importData': '导入数据',
    'admin.importDescription': '从之前导出的备份文件中恢复配置。',
    'admin.selectFile': '选择文件',
    'admin.importInstructions': '导入说明',
    'admin.supportJson': '• 支持导入 .json 格式的备份文件',
    'admin.importOverwrite': '• 导入将覆盖现有配置，请谨慎操作',
    'admin.backupBeforeImport': '• 建议在导入前先导出当前配置作为备份',
    'admin.imagesSeparate': '• 图片文件需要单独上传',
    'admin.confirmImport': '确认导入',
    'admin.importConfirmMessage': '导入将覆盖现有配置，此操作不可撤销。确定继续吗？',
    'admin.openAPI': 'Open API',
    'admin.apiExamples': 'API 使用示例',
    'admin.getGroups': '获取分组列表',
    'admin.getItems': '获取网站列表',
    'admin.createGroup': '创建分组',
    'admin.apiEndpoints': 'API 端点',
    'admin.createNewGroup': '创建新分组',
    'admin.updateGroup': '更新分组',
    'admin.deleteGroup': '删除分组',
    'admin.createNewItem': '创建新网站',
    'admin.updateItem': '更新网站',
    'admin.deleteItem': '删除网站',
    'admin.noAPIToken': '未生成 API Token',
    'admin.securityWarning': '安全警告',
    'admin.keepTokenSecure': '请妥善保管您的 API Token，不要泄露给他人',
    'admin.tokenFullAccess': 'Token 拥有完整的账户权限，请谨慎使用',
    'admin.regularTokenRegen': '建议定期重新生成 Token 以增强安全性',
    'admin.revokeIfLeaked': '如发现 Token 泄露，请立即撤销',
    'admin.tokenExpire90Days': 'Token 将在 90 天后自动过期',
    'admin.generateToken': '生成 Token',
    'admin.regenerate': '重新生成',
    'admin.revoke': '撤销',
    'admin.users': '账号管理',
    'admin.addAccount': '添加账号',
    'admin.editAccount': '编辑账号',
    'admin.loadingUsers': '加载用户列表...',
    'admin.noAccounts': '暂无账号',
    'admin.clickAddAccount': '点击上方按钮添加账号',
    'admin.username': '用户名',
    'admin.nickname': '昵称',
    'admin.email': '邮箱',
    'admin.password': '密码',
    'admin.role': '角色',
    'admin.admin': '管理员',
    'admin.user': '用户',
    'admin.aboutProject': '关于项目',
    'admin.projectDescription': 'SunPanel Cloudflare 是一个专为 Cloudflare 优化的开源导航面板项目。',
    'admin.inspiredBy': '本项目受',
    'admin.andAdapted': '启发并进行适配优化。',
    'admin.techStack': '技术栈',
    'admin.license': '许可证',
    'admin.mitLicense': '本项目基于 MIT 许可证开源。',
    'admin.freeUse': '您可以自由使用、修改和分发本项目。',
    'admin.cloudflareNavigation': '基于 Cloudflare 部署的导航面板',
    'admin.version': '版本',
    'admin.frontendFramework': '前端框架',
    'admin.deploymentPlatform': '部署平台',
    'admin.backendService': '后端服务',
    'admin.database': '数据库',
    'admin.personalization': '个性化设置',
    'admin.personalization.theme': '主题设置',
    'admin.personalization.themeMode': '主题模式',
    'admin.personalization.background': '背景设置',
    'admin.personalization.backgroundType': '背景类型',
    'admin.personalization.solidColor': '纯色背景',
    'admin.personalization.imageBackground': '图片背景',
    'admin.personalization.selectColor': '选择颜色',
    'admin.personalization.backgroundImage': '背景图片',
    'admin.personalization.removeImage': '移除图片',
    'admin.personalization.display': '显示设置',
    'admin.personalization.showSearchBar': '显示搜索栏',
    'admin.personalization.searchBarDesc': '在顶部显示搜索框',
    'admin.personalization.showGroupNames': '显示分组名称',
    'admin.personalization.groupNamesDesc': '在分组上方显示名称',
    'admin.personalization.mobileItems': '移动端每行显示数量',
    'admin.personalization.tabletItems': '平板端每行显示数量',
    'admin.personalization.desktopItems': '电脑端每行显示数量',
    'admin.personalization.customCode': '自定义代码',
    'admin.personalization.customCSS': '自定义 CSS',
    'admin.personalization.selectBackground': '选择背景图片',
    'admin.personalization.selectFromGallery': '从图库选择',
    'admin.personalization.orEnterURL': '或输入URL',
    'admin.personalization.light': '浅色',
    'admin.personalization.dark': '深色',
    'admin.personalization.auto': '跟随系统',
    'admin.personalization.loadingImages': '加载图片中...',
    'admin.dashboard': '仪表盘',
    'admin.profile': '个人信息',
    'admin.gallery': '图库',
    'admin.settings': '全局设置',
    'admin.publicGallery': '公共图库',
    'admin.groups': '分组管理',
    'admin.exportImport': '导出/导入',
    'admin.about': '关于',
    'admin.management': '管理',
    'admin.confirmClose': '确认关闭',
    'admin.closeConfirm': '确定要关闭管理后台吗？所有未保存的更改将丢失。',
    'admin.confirmRegenerate': '重新生成 Token',
    'admin.regenerateConfirmMessage': '重新生成将导致之前的 Token 立即失效，是否继续？',
    'admin.confirmRevoke': '撤销 Token',
    'admin.revokeConfirmMessage': '确定要撤销当前的 API Token 吗？撤销后将无法使用该 Token 访问 API。',
    'admin.confirmDeleteAccount': '确定要删除这个账号吗？此操作不可撤销。',
    'admin.fetchUsersFailed': '获取用户列表失败',
    'admin.createSuccess': '用户创建成功',
    'admin.updateSuccess': '用户更新成功',
    'admin.saveFailed': '保存失败',
    'admin.deleteSuccess': '用户删除成功',
    'admin.deleteFailed': '删除失败',
    'admin.exportSuccess': '导出成功',
    'admin.exportFailed': '导出失败，请重试',
    'admin.exportError': '无效的响应格式',
    'admin.importSuccess': '导入成功',
    'admin.importFailed': '导入失败，请检查文件格式',
    'admin.migrationSuccess': '迁移成功！',
    'admin.migrationFileError': '文件格式错误，请检查文件内容',
    'admin.tokenExpired': 'Token 已过期，请重新生成',
    'admin.tokenGeneratedSuccess': 'Token 生成成功！请妥善保管，有效期 90 天',
    'admin.tokenGenerateFailed': '生成失败，请重试',
    'admin.tokenRevoked': 'Token 已撤销',
    'admin.tokenCopied': 'Token 已复制到剪贴板',
    'admin.copyFailed': '复制失败，请手动复制',
    'common.cancel': '取消',
    'common.save': '保存',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.add': '添加',
    'common.loading': '加载中...',
    'common.error': '发生错误',
    'common.success': '操作成功',
    'common.confirm': '确认',
    'common.yes': '是',
    'common.no': '否',
    'common.search': '搜索',
    'common.submit': '提交',
    'common.close': '关闭',
    'common.refresh': '刷新',
    'common.retry': '重试',
    'common.saving': '保存中...',
    'common.processing': '处理中...',
    'common.generating': '生成中...',
    'common.noImages': '暂无图片',
    'common.uploadImagesFirst': '请先上传图片到图库',
    'common.reset': '重置',
    'nav.darkMode': '切换到深色模式',
    'nav.lightMode': '切换到浅色模式',
    'nav.logout': '退出',
    'nav.admin': '管理后台',
    'nav.backToHome': '返回首页',
    'nav.home': '首页',
    'home.welcome': '欢迎使用 SunPanel',
    'home.searchPlaceholder': '输入关键词搜索...',
    'home.addFirstGroup': '开始添加您的第一个分组和网站',
    'home.addFirstGroupDesc': '开始添加您的第一个分组和网站吧',
    'home.goAdmin': '前往管理后台',
    'home.loginToConfigure': '登录后开始配置',
    'home.title': '首页',
    'login.username': '用户名',
    'login.password': '密码',
    'login.nickname': '昵称',
    'login.confirmPassword': '确认密码',
    'login.submit': '提交',
    'login.register': '注册',
    'login.loading': '加载中...',
    'login.haveAccount': '已有账号，去登录',
    'login.noAccount': '没有账号，去注册',
    'login.backToHome': '返回首页',
    'login.title': '登录',
    'login.registerSuccess': '注册成功，请登录',
    'login.loginFailed': '登录失败，请重试',
    'login.enterNickname': '请输入昵称',
    'login.passwordMismatch': '两次输入的密码不一致',
    'login.enterUsername': '请输入用户名',
    'login.enterPassword': '请输入密码',
    'login.passwordTooShort': '密码长度至少为8位',
    'login.passwordRequirements': '密码需包含大小写字母、数字和特殊字符(@$!%*?&)',
    'login.usernameRequirements': '用户名只能包含字母、数字和下划线，长度3-50位',
    'login.tooManyRequests': '请求过于频繁，请稍后再试',
    'login.invalidCredentials': '用户名或密码错误',
    'login.serverError': '服务器内部错误，请稍后重试',
    'login.operationFailed': '操作失败，请重试',
    'login.rateLimitWait': '剩余等待时间',
    'login.seconds': '秒',
    'profile.title': '个人信息',
    'profile.username': '用户名',
    'profile.nickname': '昵称',
    'profile.email': '邮箱',
    'profile.language': '语言',
    'profile.save': '保存',
    'profile.cancel': '取消',
    'profile.password': '密码',
    'profile.currentPassword': '当前密码',
    'profile.newPassword': '新密码',
    'profile.confirmNewPassword': '确认新密码',
    'profile.changePassword': '修改密码',
    'profile.uploading': '上传中...',
    'profile.uploadSuccess': '上传成功',
    'profile.uploadError': '上传失败',
    'profile.saveSuccess': '保存成功',
    'groups.title': '分组管理',
    'groups.addGroup': '添加分组',
    'groups.editGroup': '编辑分组',
    'groups.deleteConfirm': '确定要删除这个分组吗？该分组下的所有网站也将被删除。',
    'groups.name': '名称',
    'groups.icon': '图标',
    'groups.websites': '网站数',
    'groups.noGroups': '暂无分组',
    'groups.addFirstGroup': '点击上方按钮添加第一个分组',
    'groups.websiteTitle': '网站管理',
    'groups.addWebsite': '添加网站',
    'groups.editWebsite': '编辑网站',
    'groups.deleteWebsiteConfirm': '确定要删除这个网站吗？',
    'groups.url': '网址',
    'groups.description': '描述',
    'groups.color': '图标颜色',
    'groups.group': '分组',
    'groups.openInNewTab': '新标签页打开',
    'groups.showAsWindow': '小窗口模式',
    'groups.selectGroup': '请选择分组',
    'groups.noWebsites': '暂无网站',
    'groups.addFirstWebsite': '点击上方按钮添加第一个网站',
    'groups.namePlaceholder': '请输入分组名称',
    'groups.nameEmpty': '分组名称不能为空',
    'groups.nameContainsIllegal': '分组名称包含非法字符',
    'groups.saveFailed': '保存分组失败',
    'groups.deleteFailed': '删除分组失败',
    'groups.websiteNameRequired': '网站名称不能为空',
    'groups.websiteUrlRequired': '网站地址不能为空',
    'groups.websiteNameIllegal': '网站名称包含非法字符',
    'groups.websiteDescIllegal': '网站描述包含非法字符',
    'groups.websiteUrlUnsafe': '网站地址格式不安全',
    'groups.saveWebsiteFailed': '保存网站失败',
    'groups.deleteWebsiteFailed': '删除网站失败',
    'dashboard.title': '仪表盘',
    'dashboard.groupCount': '分组数量',
    'dashboard.websiteCount': '网站数量',
    'dashboard.imageCount': '图片数量',
    'dashboard.userCount': '用户数量',
    'dashboard.quickActions': '快捷操作',
    'dashboard.recentWebsites': '最近添加的网站',
    'dashboard.recentGroups': '最近添加的分组',
    'dashboard.noWebsites': '暂无网站',
    'dashboard.noWebsitesDesc': '还没有添加任何网站',
    'dashboard.noGroups': '暂无分组',
    'dashboard.noGroupsDesc': '还没有添加任何分组',
    'dashboard.addGroup': '添加分组',
    'dashboard.addWebsite': '添加网站',
    'dashboard.uploadImage': '上传图片',
    'dashboard.changeTheme': '切换主题',
    'dashboard.exportData': '导出数据',
    'dashboard.viewApi': '查看API',
    'dashboard.websites': '个网站',
    'globalSettings.title': '全局设置',
    'globalSettings.websiteTitle': '网站标题',
    'globalSettings.websiteDescription': '网站描述',
    'globalSettings.language': '语言',
    'globalSettings.footerText': '页脚文字',
    'globalSettings.save': '保存',
    'globalSettings.resetCache': '重置缓存',
    'globalSettings.cacheResetSuccess': '缓存已重置',
    'globalSettings.saveSuccess': '设置保存成功！',
    'globalSettings.saveError': '保存失败',
    'globalSettings.loadError': '加载失败',
    'globalSettings.resetConfirm': '确定要重置为默认设置吗？',
    'globalSettings.languageManagement': '语言管理',
    'globalSettings.selectLanguage': '选择语言',
    'globalSettings.addLanguage': '添加语言',
    'globalSettings.noLanguages': '暂无语言设置',
    'globalSettings.cacheManagement': '缓存管理',
    'globalSettings.clearCache': '清除所有缓存',
    'globalSettings.clearCacheDesc': '清除浏览器缓存，强制重新加载所有设置',
    'globalSettings.websiteTitlePlaceholder': '输入网站标题',
    'globalSettings.websiteDescriptionPlaceholder': '输入网站描述',
    'globalSettings.footerTextPlaceholder': '输入页脚文字',
    'globalSettings.pageTexts': '页面文本'
  },
  'en-US': {
    'admin.migrateFromSunPanel': 'Migrate from sun-panel',
    'admin.migrateFromSunPanelDesc': 'Supports importing data exported from official sun-panel to this system.',
    'admin.selectFileMigrate': 'Select file to migrate',
    'admin.exportToSunPanel': 'Export to sun-panel',
    'admin.exportToSunPanelDesc': 'Export current data in sun-panel compatible format.',
    'admin.exportCompatible': 'Export Compatible Format',
    'admin.migrationInstructions': 'Migration Instructions',
    'admin.migrationStep1': '1. Export configuration from sun-panel (Settings -> Export Data)',
    'admin.migrationStep2': '2. Use the tool above to import to this system',
    'admin.migrationStep3': '3. Verify data integrity after migration',
    'admin.migrationStep4': '4. Image resources need to be migrated separately',
    'admin.dataMigration': 'Data Migration',
    'admin.exportData': 'Export Data',
    'admin.exportDescription': 'Export all your configuration data, including groups, websites, and settings.',
    'admin.exportConfig': 'Export Configuration',
    'admin.exporting': 'Exporting...',
    'admin.importData': 'Import Data',
    'admin.importDescription': 'Restore configuration from a previously exported backup file.',
    'admin.selectFile': 'Select File',
    'admin.importInstructions': 'Import Instructions',
    'admin.supportJson': '• Supports importing .json format backup files',
    'admin.importOverwrite': '• Import will overwrite existing configuration, please proceed with caution',
    'admin.backupBeforeImport': '• It is recommended to export current configuration as backup before importing',
    'admin.imagesSeparate': '• Image files need to be uploaded separately',
    'admin.confirmImport': 'Confirm Import',
    'admin.importConfirmMessage': 'Import will overwrite existing configuration, this action cannot be undone. Continue?',
    'admin.openAPI': 'Open API',
    'admin.apiExamples': 'API Examples',
    'admin.getGroups': 'Get groups list',
    'admin.getItems': 'Get items list',
    'admin.createGroup': 'Create group',
    'admin.apiEndpoints': 'API Endpoints',
    'admin.createNewGroup': 'Create new group',
    'admin.updateGroup': 'Update group',
    'admin.deleteGroup': 'Delete group',
    'admin.createNewItem': 'Create new item',
    'admin.updateItem': 'Update item',
    'admin.deleteItem': 'Delete item',
    'admin.noAPIToken': 'No API Token generated',
    'admin.securityWarning': 'Security Warning',
    'admin.keepTokenSecure': 'Keep your API Token secure, do not share it with others',
    'admin.tokenFullAccess': 'Token has full account permissions, use with caution',
    'admin.regularTokenRegen': 'It is recommended to regenerate Token regularly to enhance security',
    'admin.revokeIfLeaked': 'If you suspect Token leakage, revoke it immediately',
    'admin.tokenExpire90Days': 'Token expires automatically after 90 days',
    'admin.generateToken': 'Generate Token',
    'admin.regenerate': 'Regenerate',
    'admin.revoke': 'Revoke',
    'admin.users': 'Accounts',
    'admin.addAccount': 'Add Account',
    'admin.editAccount': 'Edit Account',
    'admin.loadingUsers': 'Loading users...',
    'admin.noAccounts': 'No accounts',
    'admin.clickAddAccount': 'Click the button above to add an account',
    'admin.username': 'Username',
    'admin.nickname': 'Nickname',
    'admin.email': 'Email',
    'admin.password': 'Password',
    'admin.role': 'Role',
    'admin.admin': 'Admin',
    'admin.user': 'User',
    'admin.aboutProject': 'About Project',
    'admin.projectDescription': 'SunPanel Cloudflare is an open-source navigation panel optimized for Cloudflare.',
    'admin.inspiredBy': 'This project is inspired by',
    'admin.andAdapted': 'and adapted for optimization.',
    'admin.techStack': 'Tech Stack',
    'admin.license': 'License',
    'admin.mitLicense': 'This project is open source under the MIT License.',
    'admin.freeUse': 'You are free to use, modify, and distribute this project.',
    'admin.cloudflareNavigation': 'Navigation panel deployed on Cloudflare',
    'admin.version': 'Version',
    'admin.frontendFramework': 'Frontend Framework',
    'admin.deploymentPlatform': 'Deployment Platform',
    'admin.backendService': 'Backend Service',
    'admin.database': 'Database',
    'admin.personalization': 'Personalization',
    'admin.personalization.theme': 'Theme Settings',
    'admin.personalization.themeMode': 'Theme Mode',
    'admin.personalization.background': 'Background Settings',
    'admin.personalization.backgroundType': 'Background Type',
    'admin.personalization.solidColor': 'Solid Color',
    'admin.personalization.imageBackground': 'Image Background',
    'admin.personalization.selectColor': 'Select Color',
    'admin.personalization.backgroundImage': 'Background Image',
    'admin.personalization.removeImage': 'Remove Image',
    'admin.personalization.display': 'Display Settings',
    'admin.personalization.showSearchBar': 'Show Search Bar',
    'admin.personalization.searchBarDesc': 'Show search box at the top',
    'admin.personalization.showGroupNames': 'Show Group Names',
    'admin.personalization.groupNamesDesc': 'Show names above groups',
    'admin.personalization.mobileItems': 'Items per row (Mobile)',
    'admin.personalization.tabletItems': 'Items per row (Tablet)',
    'admin.personalization.desktopItems': 'Items per row (Desktop)',
    'admin.personalization.customCode': 'Custom Code',
    'admin.personalization.customCSS': 'Custom CSS',
    'admin.personalization.selectBackground': 'Select Background Image',
    'admin.personalization.selectFromGallery': 'Select from Gallery',
    'admin.personalization.orEnterURL': 'Or enter URL',
    'admin.personalization.light': 'Light',
    'admin.personalization.dark': 'Dark',
    'admin.personalization.auto': 'System',
    'admin.personalization.loadingImages': 'Loading images...',
    'admin.dashboard': 'Dashboard',
    'admin.profile': 'Profile',
    'admin.gallery': 'Gallery',
    'admin.settings': 'Settings',
    'admin.publicGallery': 'Public Gallery',
    'admin.groups': 'Groups',
    'admin.exportImport': 'Export/Import',
    'admin.about': 'About',
    'admin.management': 'Management',
    'admin.confirmClose': 'Confirm Close',
    'admin.closeConfirm': 'Are you sure you want to close the admin panel? All unsaved changes will be lost.',
    'admin.confirmRegenerate': 'Regenerate Token',
    'admin.regenerateConfirmMessage': 'Regenerating will immediately invalidate the previous Token. Continue?',
    'admin.confirmRevoke': 'Revoke Token',
    'admin.revokeConfirmMessage': 'Are you sure you want to revoke the current API Token? You will not be able to access the API with this Token after revocation.',
    'admin.confirmDeleteAccount': 'Are you sure you want to delete this account? This action cannot be undone.',
    'admin.fetchUsersFailed': 'Failed to fetch user list',
    'admin.createSuccess': 'User created successfully',
    'admin.updateSuccess': 'User updated successfully',
    'admin.saveFailed': 'Save failed',
    'admin.deleteSuccess': 'User deleted successfully',
    'admin.deleteFailed': 'Delete failed',
    'admin.exportSuccess': 'Export successful',
    'admin.exportFailed': 'Export failed, please try again',
    'admin.exportError': 'Invalid response format',
    'admin.importSuccess': 'Import successful',
    'admin.importFailed': 'Import failed, please check file format',
    'admin.migrationSuccess': 'Migration successful!',
    'admin.migrationFileError': 'File format error, please check file content',
    'admin.tokenExpired': 'Token expired, please regenerate',
    'admin.tokenGeneratedSuccess': 'Token generated successfully! Please keep it safe, valid for 90 days',
    'admin.tokenGenerateFailed': 'Generation failed, please try again',
    'admin.tokenRevoked': 'Token revoked',
    'admin.tokenCopied': 'Token copied to clipboard',
    'admin.copyFailed': 'Copy failed, please copy manually',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.loading': 'Loading...',
    'common.error': 'Error occurred',
    'common.success': 'Operation successful',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.search': 'Search',
    'common.submit': 'Submit',
    'common.close': 'Close',
    'common.refresh': 'Refresh',
    'common.retry': 'Retry',
    'common.saving': 'Saving...',
    'common.processing': 'Processing...',
    'common.generating': 'Generating...',
    'common.noImages': 'No images',
    'common.uploadImagesFirst': 'Please upload images to gallery first',
    'common.reset': 'Reset',
    'nav.darkMode': 'Switch to dark mode',
    'nav.lightMode': 'Switch to light mode',
    'nav.logout': 'Logout',
    'nav.admin': 'Admin Panel',
    'nav.backToHome': 'Back to Home',
    'nav.home': 'Home',
    'home.welcome': 'Welcome to SunPanel',
    'home.searchPlaceholder': 'Search...',
    'home.addFirstGroup': 'Start adding your first group and websites',
    'home.addFirstGroupDesc': 'Start adding your first group and websites',
    'home.goAdmin': 'Go to Admin',
    'home.loginToConfigure': 'Login to configure',
    'home.title': 'Home',
    'login.username': 'Username',
    'login.password': 'Password',
    'login.nickname': 'Nickname',
    'login.confirmPassword': 'Confirm Password',
    'login.submit': 'Submit',
    'login.register': 'Register',
    'login.loading': 'Loading...',
    'login.haveAccount': 'Already have an account, login',
    'login.noAccount': 'No account, register',
    'login.backToHome': 'Back to Home',
    'login.title': 'Login',
    'login.registerSuccess': 'Registration successful, please login',
    'login.loginFailed': 'Login failed, please try again',
    'login.enterNickname': 'Please enter nickname',
    'login.passwordMismatch': 'Passwords do not match',
    'login.enterUsername': 'Please enter username',
    'login.enterPassword': 'Please enter password',
    'login.passwordTooShort': 'Password must be at least 8 characters',
    'login.passwordRequirements': 'Password must contain uppercase, lowercase, numbers and special characters (@$!%*?&)',
    'login.usernameRequirements': 'Username can only contain letters, numbers and underscores, 3-50 characters',
    'login.tooManyRequests': 'Too many requests, please try again later',
    'login.invalidCredentials': 'Invalid username or password',
    'login.serverError': 'Server error, please try again later',
    'login.operationFailed': 'Operation failed, please try again',
    'login.rateLimitWait': 'Remaining wait time',
    'login.seconds': 'seconds',
    'profile.title': 'Profile',
    'profile.username': 'Username',
    'profile.nickname': 'Nickname',
    'profile.email': 'Email',
    'profile.language': 'Language',
    'profile.save': 'Save',
    'profile.cancel': 'Cancel',
    'profile.password': 'Password',
    'profile.currentPassword': 'Current Password',
    'profile.newPassword': 'New Password',
    'profile.confirmNewPassword': 'Confirm New Password',
    'profile.changePassword': 'Change Password',
    'profile.uploading': 'Uploading...',
    'profile.uploadSuccess': 'Upload successful',
    'profile.uploadError': 'Upload failed',
    'profile.saveSuccess': 'Save successful',
    'groups.title': 'Groups',
    'groups.addGroup': 'Add Group',
    'groups.editGroup': 'Edit Group',
    'groups.deleteConfirm': 'Are you sure you want to delete this group? All websites in this group will also be deleted.',
    'groups.name': 'Name',
    'groups.icon': 'Icon',
    'groups.websites': 'Websites',
    'groups.noGroups': 'No groups',
    'groups.addFirstGroup': 'Click the button above to add your first group',
    'groups.websiteTitle': 'Website Management',
    'groups.addWebsite': 'Add Website',
    'groups.editWebsite': 'Edit Website',
    'groups.deleteWebsiteConfirm': 'Are you sure you want to delete this website?',
    'groups.url': 'URL',
    'groups.description': 'Description',
    'groups.color': 'Icon Color',
    'groups.group': 'Group',
    'groups.openInNewTab': 'Open in new tab',
    'groups.showAsWindow': 'Open as widget',
    'groups.selectGroup': 'Please select a group',
    'groups.noWebsites': 'No websites',
    'groups.addFirstWebsite': 'Click the button above to add your first website',
    'groups.namePlaceholder': 'Enter group name',
    'groups.nameEmpty': 'Group name cannot be empty',
    'groups.nameContainsIllegal': 'Group name contains illegal characters',
    'groups.saveFailed': 'Failed to save group',
    'groups.deleteFailed': 'Failed to delete group',
    'groups.websiteNameRequired': 'Website name cannot be empty',
    'groups.websiteUrlRequired': 'Website URL cannot be empty',
    'groups.websiteNameIllegal': 'Website name contains illegal characters',
    'groups.websiteDescIllegal': 'Website description contains illegal characters',
    'groups.websiteUrlUnsafe': 'Website URL format is unsafe',
    'groups.saveWebsiteFailed': 'Failed to save website',
    'groups.deleteWebsiteFailed': 'Failed to delete website',
    'dashboard.title': 'Dashboard',
    'dashboard.groupCount': 'Groups',
    'dashboard.websiteCount': 'Websites',
    'dashboard.imageCount': 'Images',
    'dashboard.userCount': 'Users',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.recentWebsites': 'Recently Added Websites',
    'dashboard.recentGroups': 'Recently Added Groups',
    'dashboard.noWebsites': 'No websites',
    'dashboard.noWebsitesDesc': 'No websites added yet',
    'dashboard.noGroups': 'No groups',
    'dashboard.noGroupsDesc': 'No groups added yet',
    'dashboard.addGroup': 'Add Group',
    'dashboard.addWebsite': 'Add Website',
    'dashboard.uploadImage': 'Upload Image',
    'dashboard.changeTheme': 'Change Theme',
    'dashboard.exportData': 'Export Data',
    'dashboard.viewApi': 'View API',
    'dashboard.websites': 'websites',
    'globalSettings.title': 'Global Settings',
    'globalSettings.websiteTitle': 'Website Title',
    'globalSettings.websiteDescription': 'Website Description',
    'globalSettings.language': 'Language',
    'globalSettings.footerText': 'Footer Text',
    'globalSettings.save': 'Save',
    'globalSettings.resetCache': 'Reset Cache',
    'globalSettings.cacheResetSuccess': 'Cache reset successfully',
    'globalSettings.saveSuccess': 'Settings saved successfully!',
    'globalSettings.saveError': 'Save failed',
    'globalSettings.loadError': 'Load failed',
    'globalSettings.resetConfirm': 'Are you sure you want to reset to default settings?',
    'globalSettings.languageManagement': 'Language Management',
    'globalSettings.selectLanguage': 'Select Language',
    'globalSettings.addLanguage': 'Add Language',
    'globalSettings.noLanguages': 'No languages configured',
    'globalSettings.cacheManagement': 'Cache Management',
    'globalSettings.clearCache': 'Clear All Cache',
    'globalSettings.clearCacheDesc': 'Clear browser cache and force reload all settings',
    'globalSettings.websiteTitlePlaceholder': 'Enter website title',
    'globalSettings.websiteDescriptionPlaceholder': 'Enter website description',
    'globalSettings.footerTextPlaceholder': 'Enter footer text',
    'globalSettings.pageTexts': 'Page Texts'
  }
}

export interface PageTexts {
  home: {
    welcome?: string
    searchPlaceholder?: string
    addFirstGroup?: string
    addFirstGroupDesc?: string
    goAdmin?: string
    loginToConfigure?: string
    title?: string
  }
  nav: {
    admin?: string
    logout?: string
    backToHome?: string
    home?: string
    darkMode?: string
    lightMode?: string
  }
  admin: {
    dashboard?: string
    profile?: string
    personalization?: string
    groups?: string
    gallery?: string
    settings?: string
    users?: string
    api?: string
    openAPI?: string
    about?: string
    migration?: string
    dataMigration?: string
    publicGallery?: string
    exportImport?: string
    user?: string
    management?: string
    confirmClose?: string
    closeConfirm?: string
  }
  login: {
    username?: string
    password?: string
    nickname?: string
    confirmPassword?: string
    submit?: string
    register?: string
    loading?: string
    haveAccount?: string
    noAccount?: string
    backToHome?: string
    title?: string
    registerSuccess?: string
    loginFailed?: string
    enterNickname?: string
    passwordMismatch?: string
    enterUsername?: string
    enterPassword?: string
    passwordTooShort?: string
    passwordRequirements?: string
    usernameRequirements?: string
    tooManyRequests?: string
    invalidCredentials?: string
    serverError?: string
    operationFailed?: string
    rateLimitWait?: string
    seconds?: string
  }
  profile: {
    title?: string
    username?: string
    nickname?: string
    email?: string
    language?: string
    save?: string
    cancel?: string
    password?: string
    currentPassword?: string
    newPassword?: string
    confirmNewPassword?: string
    changePassword?: string
    uploading?: string
    uploadSuccess?: string
    uploadError?: string
    saveSuccess?: string
  }
  groups: {
    title?: string
    addGroup?: string
    editGroup?: string
    deleteConfirm?: string
    name?: string
    icon?: string
    websites?: string
    noGroups?: string
    addFirstGroup?: string
    websiteTitle?: string
    addWebsite?: string
    editWebsite?: string
    deleteWebsiteConfirm?: string
    url?: string
    description?: string
    color?: string
    group?: string
    openInNewTab?: string
    showAsWindow?: string
    noWebsites?: string
    addFirstWebsite?: string
  }
  dashboard: {
    title?: string
    groupCount?: string
    websiteCount?: string
    imageCount?: string
    userCount?: string
    quickActions?: string
    recentWebsites?: string
    recentGroups?: string
    noWebsites?: string
    noWebsitesDesc?: string
    noGroups?: string
    noGroupsDesc?: string
    addGroup?: string
    addWebsite?: string
    uploadImage?: string
    changeTheme?: string
    exportData?: string
    viewApi?: string
    websites?: string
  }
  globalSettings: {
    title?: string
    websiteTitle?: string
    websiteDescription?: string
    language?: string
    footerText?: string
    save?: string
    resetCache?: string
    cacheResetSuccess?: string
    saveSuccess?: string
    saveError?: string
    loadError?: string
    resetConfirm?: string
    languageManagement?: string
    selectLanguage?: string
    addLanguage?: string
    noLanguages?: string
    cacheManagement?: string
    clearCache?: string
    clearCacheDesc?: string
    websiteTitlePlaceholder?: string
    websiteDescriptionPlaceholder?: string
    footerTextPlaceholder?: string
    pageTexts?: string
  }
  common: {
    cancel?: string
    save?: string
    delete?: string
    edit?: string
    add?: string
    loading?: string
    error?: string
    success?: string
    confirm?: string
    yes?: string
    no?: string
    search?: string
    submit?: string
    close?: string
    refresh?: string
    retry?: string
    saving?: string
    processing?: string
    generating?: string
    noImages?: string
    uploadImagesFirst?: string
    reset?: string
  }
}

export const useI18n = () => {
  const globalSettingsStore = useGlobalSettingsStore()

  const t = (key: string, fallback?: string): string => {
    return globalSettingsStore.getText(key, fallback || key)
  }

  const currentLanguage = computed(() => globalSettingsStore.currentLanguage)

  const availableLanguages = [
    { code: 'zh-CN', name: '简体中文', native: '简体中文' },
    { code: 'en-US', name: 'English', native: 'English' },
    { code: 'ja-JP', name: 'Japanese', native: '日本語' },
    { code: 'ko-KR', name: 'Korean', native: '한국어' }
  ]

  const changeLanguage = async (language: string) => {
    await globalSettingsStore.setLanguage(language)
  }

  return {
    t,
    currentLanguage,
    availableLanguages,
    changeLanguage,
    websiteTitle: computed(() => globalSettingsStore.websiteTitle),
    websiteDescription: computed(() => globalSettingsStore.websiteDescription),
    footerText: computed(() => globalSettingsStore.footerText),
    settings: toRef(globalSettingsStore, 'settings')
  }
}

export const usePageTexts = () => {
  const globalSettingsStore = useGlobalSettingsStore()

  const language = computed(() => globalSettingsStore.currentLanguage || 'zh-CN')

  // 获取自定义页面文本
  const customPageTexts = computed(() => globalSettingsStore.settings.pageTexts || {})

  // 辅助函数：获取合并后的文本
  const getText = (key: string): string | undefined => {
    const lang = language.value
    const defaults = defaultTexts[lang] || {}
    const custom = customPageTexts.value

    // 从自定义文本中查找 (支持嵌套路径如 'home.welcome')
    const customKeys = key.split('.')
    let customValue: any = custom
    for (const k of customKeys) {
      if (customValue && typeof customValue === 'object' && k in customValue) {
        customValue = customValue[k]
      } else {
        customValue = undefined
        break
      }
    }

    if (customValue !== undefined && customValue !== '') {
      return customValue
    }

    // 回退到默认文本
    return defaults[key]
  }

  const pageTexts = computed<PageTexts>(() => {
    return {
      home: {
        welcome: getText('home.welcome'),
        searchPlaceholder: getText('home.searchPlaceholder'),
        addFirstGroup: getText('home.addFirstGroup'),
        addFirstGroupDesc: getText('home.addFirstGroupDesc'),
        goAdmin: getText('home.goAdmin'),
        loginToConfigure: getText('home.loginToConfigure'),
        title: getText('home.title')
      },
      nav: {
        admin: getText('nav.admin'),
        logout: getText('nav.logout'),
        backToHome: getText('nav.backToHome'),
        home: getText('nav.home'),
        darkMode: getText('nav.darkMode'),
        lightMode: getText('nav.lightMode')
      },
      admin: {
        dashboard: getText('admin.dashboard'),
        profile: getText('admin.profile'),
        personalization: getText('admin.personalization'),
        groups: getText('admin.groups'),
        gallery: getText('admin.gallery'),
        settings: getText('admin.settings'),
        users: getText('admin.users'),
        api: getText('admin.api'),
        openAPI: getText('admin.openAPI'),
        about: getText('admin.about'),
        migration: getText('admin.migration'),
        dataMigration: getText('admin.dataMigration'),
        publicGallery: getText('admin.publicGallery'),
        exportImport: getText('admin.exportImport'),
        user: getText('admin.user'),
        management: getText('admin.management'),
        confirmClose: getText('admin.confirmClose'),
        closeConfirm: getText('admin.closeConfirm'),
        migrateFromSunPanel: getText('admin.migrateFromSunPanel'),
        migrateFromSunPanelDesc: getText('admin.migrateFromSunPanelDesc'),
        selectFileMigrate: getText('admin.selectFileMigrate'),
        exportToSunPanel: getText('admin.exportToSunPanel'),
        exportToSunPanelDesc: getText('admin.exportToSunPanelDesc'),
        exportCompatible: getText('admin.exportCompatible'),
        migrationInstructions: getText('admin.migrationInstructions'),
        migrationStep1: getText('admin.migrationStep1'),
        migrationStep2: getText('admin.migrationStep2'),
        migrationStep3: getText('admin.migrationStep3'),
        migrationStep4: getText('admin.migrationStep4'),
        exportData: getText('admin.exportData'),
        exportDescription: getText('admin.exportDescription'),
        exportConfig: getText('admin.exportConfig'),
        exporting: getText('admin.exporting'),
        importData: getText('admin.importData'),
        importDescription: getText('admin.importDescription'),
        selectFile: getText('admin.selectFile'),
        importInstructions: getText('admin.importInstructions'),
        supportJson: getText('admin.supportJson'),
        importOverwrite: getText('admin.importOverwrite'),
        backupBeforeImport: getText('admin.backupBeforeImport'),
        imagesSeparate: getText('admin.imagesSeparate'),
        confirmImport: getText('admin.confirmImport'),
        importConfirmMessage: getText('admin.importConfirmMessage'),
        apiExamples: getText('admin.apiExamples'),
        getGroups: getText('admin.getGroups'),
        getItems: getText('admin.getItems'),
        createGroup: getText('admin.createGroup'),
        apiEndpoints: getText('admin.apiEndpoints'),
        createNewGroup: getText('admin.createNewGroup'),
        updateGroup: getText('admin.updateGroup'),
        deleteGroup: getText('admin.deleteGroup'),
        createNewItem: getText('admin.createNewItem'),
        updateItem: getText('admin.updateItem'),
        deleteItem: getText('admin.deleteItem'),
        noAPIToken: getText('admin.noAPIToken'),
        securityWarning: getText('admin.securityWarning'),
        keepTokenSecure: getText('admin.keepTokenSecure'),
        tokenFullAccess: getText('admin.tokenFullAccess'),
        regularTokenRegen: getText('admin.regularTokenRegen'),
        revokeIfLeaked: getText('admin.revokeIfLeaked'),
        tokenExpire90Days: getText('admin.tokenExpire90Days'),
        generateToken: getText('admin.generateToken'),
        regenerate: getText('admin.regenerate'),
        revoke: getText('admin.revoke'),
        addAccount: getText('admin.addAccount'),
        editAccount: getText('admin.editAccount'),
        loadingUsers: getText('admin.loadingUsers'),
        noAccounts: getText('admin.noAccounts'),
        clickAddAccount: getText('admin.clickAddAccount'),
        username: getText('admin.username'),
        nickname: getText('admin.nickname'),
        email: getText('admin.email'),
        password: getText('admin.password'),
        role: getText('admin.role'),
        admin: getText('admin.admin'),
        aboutProject: getText('admin.aboutProject'),
        projectDescription: getText('admin.projectDescription'),
        inspiredBy: getText('admin.inspiredBy'),
        andAdapted: getText('admin.andAdapted'),
        techStack: getText('admin.techStack'),
        license: getText('admin.license'),
        mitLicense: getText('admin.mitLicense'),
        freeUse: getText('admin.freeUse'),
        cloudflareNavigation: getText('admin.cloudflareNavigation'),
        confirmRegenerate: getText('admin.confirmRegenerate'),
        regenerateConfirmMessage: getText('admin.regenerateConfirmMessage'),
        confirmRevoke: getText('admin.confirmRevoke'),
        revokeConfirmMessage: getText('admin.revokeConfirmMessage'),
        confirmDeleteAccount: getText('admin.confirmDeleteAccount'),
        fetchUsersFailed: getText('admin.fetchUsersFailed'),
        createSuccess: getText('admin.createSuccess'),
        updateSuccess: getText('admin.updateSuccess'),
        saveFailed: getText('admin.saveFailed'),
        deleteSuccess: getText('admin.deleteSuccess'),
        deleteFailed: getText('admin.deleteFailed'),
        exportSuccess: getText('admin.exportSuccess'),
        exportFailed: getText('admin.exportFailed'),
        exportError: getText('admin.exportError'),
        importSuccess: getText('admin.importSuccess'),
        importFailed: getText('admin.importFailed'),
        migrationSuccess: getText('admin.migrationSuccess'),
        migrationFileError: getText('admin.migrationFileError'),
        tokenExpired: getText('admin.tokenExpired'),
        tokenGeneratedSuccess: getText('admin.tokenGeneratedSuccess'),
        tokenGenerateFailed: getText('admin.tokenGenerateFailed'),
        tokenRevoked: getText('admin.tokenRevoked'),
        tokenCopied: getText('admin.tokenCopied'),
        copyFailed: getText('admin.copyFailed')
      },
      login: {
        username: getText('login.username'),
        password: getText('login.password'),
        nickname: getText('login.nickname'),
        confirmPassword: getText('login.confirmPassword'),
        submit: getText('login.submit'),
        register: getText('login.register'),
        loading: getText('login.loading'),
        haveAccount: getText('login.haveAccount'),
        noAccount: getText('login.noAccount'),
        backToHome: getText('login.backToHome'),
        title: getText('login.title'),
        registerSuccess: getText('login.registerSuccess'),
        loginFailed: getText('login.loginFailed'),
        enterNickname: getText('login.enterNickname'),
        passwordMismatch: getText('login.passwordMismatch'),
        enterUsername: getText('login.enterUsername'),
        enterPassword: getText('login.enterPassword'),
        passwordTooShort: getText('login.passwordTooShort'),
        passwordRequirements: getText('login.passwordRequirements'),
        usernameRequirements: getText('login.usernameRequirements'),
        tooManyRequests: getText('login.tooManyRequests'),
        invalidCredentials: getText('login.invalidCredentials'),
        serverError: getText('login.serverError'),
        operationFailed: getText('login.operationFailed'),
        rateLimitWait: getText('login.rateLimitWait'),
        seconds: getText('login.seconds')
      },
      profile: {
        title: getText('profile.title'),
        username: getText('profile.username'),
        nickname: getText('profile.nickname'),
        email: getText('profile.email'),
        language: getText('profile.language'),
        save: getText('profile.save'),
        cancel: getText('profile.cancel'),
        password: getText('profile.password'),
        currentPassword: getText('profile.currentPassword'),
        newPassword: getText('profile.newPassword'),
        confirmNewPassword: getText('profile.confirmNewPassword'),
        changePassword: getText('profile.changePassword'),
        uploading: getText('profile.uploading'),
        uploadSuccess: getText('profile.uploadSuccess'),
        uploadError: getText('profile.uploadError'),
        saveSuccess: getText('profile.saveSuccess')
      },
      groups: {
        title: getText('groups.title'),
        addGroup: getText('groups.addGroup'),
        editGroup: getText('groups.editGroup'),
        deleteConfirm: getText('groups.deleteConfirm'),
        name: getText('groups.name'),
        icon: getText('groups.icon'),
        websites: getText('groups.websites'),
        noGroups: getText('groups.noGroups'),
        addFirstGroup: getText('groups.addFirstGroup'),
        websiteTitle: getText('groups.websiteTitle'),
        addWebsite: getText('groups.addWebsite'),
        editWebsite: getText('groups.editWebsite'),
        deleteWebsiteConfirm: getText('groups.deleteWebsiteConfirm'),
        url: getText('groups.url'),
        description: getText('groups.description'),
        color: getText('groups.color'),
        group: getText('groups.group'),
        openInNewTab: getText('groups.openInNewTab'),
        showAsWindow: getText('groups.showAsWindow'),
        selectGroup: getText('groups.selectGroup'),
        noWebsites: getText('groups.noWebsites'),
        addFirstWebsite: getText('groups.addFirstWebsite'),
        namePlaceholder: getText('groups.namePlaceholder')
      },
      dashboard: {
        title: getText('dashboard.title'),
        groupCount: getText('dashboard.groupCount'),
        websiteCount: getText('dashboard.websiteCount'),
        imageCount: getText('dashboard.imageCount'),
        userCount: getText('dashboard.userCount'),
        quickActions: getText('dashboard.quickActions'),
        recentWebsites: getText('dashboard.recentWebsites'),
        recentGroups: getText('dashboard.recentGroups'),
        noWebsites: getText('dashboard.noWebsites'),
        noWebsitesDesc: getText('dashboard.noWebsitesDesc'),
        noGroups: getText('dashboard.noGroups'),
        noGroupsDesc: getText('dashboard.noGroupsDesc'),
        addGroup: getText('dashboard.addGroup'),
        addWebsite: getText('dashboard.addWebsite'),
        uploadImage: getText('dashboard.uploadImage'),
        changeTheme: getText('dashboard.changeTheme'),
        exportData: getText('dashboard.exportData'),
        viewApi: getText('dashboard.viewApi'),
        websites: getText('dashboard.websites')
      },
      globalSettings: {
        title: getText('globalSettings.title'),
        websiteTitle: getText('globalSettings.websiteTitle'),
        websiteDescription: getText('globalSettings.websiteDescription'),
        language: getText('globalSettings.language'),
        footerText: getText('globalSettings.footerText'),
        save: getText('globalSettings.save'),
        resetCache: getText('globalSettings.resetCache'),
        cacheResetSuccess: getText('globalSettings.cacheResetSuccess'),
        saveSuccess: getText('globalSettings.saveSuccess'),
        saveError: getText('globalSettings.saveError'),
        loadError: getText('globalSettings.loadError'),
        resetConfirm: getText('globalSettings.resetConfirm'),
        languageManagement: getText('globalSettings.languageManagement'),
        selectLanguage: getText('globalSettings.selectLanguage'),
        addLanguage: getText('globalSettings.addLanguage'),
        noLanguages: getText('globalSettings.noLanguages'),
        cacheManagement: getText('globalSettings.cacheManagement'),
        clearCache: getText('globalSettings.clearCache'),
        clearCacheDesc: getText('globalSettings.clearCacheDesc'),
        websiteTitlePlaceholder: getText('globalSettings.websiteTitlePlaceholder'),
        websiteDescriptionPlaceholder: getText('globalSettings.websiteDescriptionPlaceholder'),
        footerTextPlaceholder: getText('globalSettings.footerTextPlaceholder'),
        pageTexts: getText('globalSettings.pageTexts')
      },
      common: {
        cancel: getText('common.cancel'),
        save: getText('common.save'),
        delete: getText('common.delete'),
        edit: getText('common.edit'),
        add: getText('common.add'),
        loading: getText('common.loading'),
        error: getText('common.error'),
        success: getText('common.success'),
        confirm: getText('common.confirm'),
        yes: getText('common.yes'),
        no: getText('common.no'),
        search: getText('common.search'),
        submit: getText('common.submit'),
        close: getText('common.close'),
        refresh: getText('common.refresh'),
        retry: getText('common.retry'),
        saving: getText('common.saving'),
        processing: getText('common.processing'),
        generating: getText('common.generating'),
        noImages: getText('common.noImages'),
        uploadImagesFirst: getText('common.uploadImagesFirst'),
        reset: getText('common.reset')
      }
    }
  })

  const t = (key: string, fallback?: string): string => {
    const lang = language.value
    return defaultTexts[lang]?.[key] || fallback || key
  }

  const home = computed(() => pageTexts.value.home)
  const nav = computed(() => pageTexts.value.nav)
  const admin = computed(() => pageTexts.value.admin)
  const login = computed(() => pageTexts.value.login)
  const profile = computed(() => pageTexts.value.profile)
  const groups = computed(() => pageTexts.value.groups)
  const dashboard = computed(() => pageTexts.value.dashboard)
  const globalSettings = computed(() => pageTexts.value.globalSettings)
  const common = computed(() => pageTexts.value.common)

  return {
    t,
    pageTexts,
    home,
    nav,
    admin,
    login,
    profile,
    groups,
    dashboard,
    globalSettings,
    common
  }
}

export const useCommonTexts = () => {
  const { common } = usePageTexts()
  return computed(() => ({
    cancel: common.value.cancel || '取消',
    save: common.value.save || '保存',
    delete: common.value.delete || '删除',
    edit: common.value.edit || '编辑',
    add: common.value.add || '添加',
    loading: common.value.loading || '加载中...',
    error: common.value.error || '发生错误',
    success: common.value.success || '操作成功',
    confirm: common.value.confirm || '确认',
    yes: common.value.yes || '是',
    no: common.value.no || '否',
    search: common.value.search || '搜索',
    submit: common.value.submit || '提交',
    close: common.value.close || '关闭',
    refresh: common.value.refresh || '刷新',
    retry: common.value.retry || '重试'
  }))
}