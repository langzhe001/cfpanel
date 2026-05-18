import { computed, toRef } from 'vue'
import { useGlobalSettingsStore } from '@/stores/globalSettings'

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
    'nav.darkMode': '切换到深色模式',
    'nav.lightMode': '切换到浅色模式',
    'nav.logout': '退出',
    'nav.admin': '管理后台',
    'nav.backToHome': '返回首页',
    'nav.home': '首页',
    'home.welcome': '欢迎使用 SunPanel',
    'home.searchPlaceholder': '输入关键词搜索...',
    'home.addFirstGroup': '开始添加您的第一个分组和网站',
    'home.goAdmin': '前往管理后台',
    'home.loginToConfigure': '登录后开始配置',
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
    'dashboard.noGroups': '暂无分组',
    'dashboard.addGroup': '添加分组',
    'dashboard.addWebsite': '添加网站',
    'dashboard.uploadImage': '上传图片',
    'dashboard.changeTheme': '切换主题',
    'dashboard.exportData': '导出数据',
    'dashboard.viewApi': '查看API',
    'globalSettings.title': '全局设置',
    'globalSettings.websiteTitle': '网站标题',
    'globalSettings.websiteDescription': '网站描述',
    'globalSettings.language': '语言',
    'globalSettings.footerText': '页脚文字',
    'globalSettings.save': '保存',
    'globalSettings.resetCache': '重置缓存',
    'globalSettings.cacheResetSuccess': '缓存已重置'
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
    'nav.darkMode': 'Switch to dark mode',
    'nav.lightMode': 'Switch to light mode',
    'nav.logout': 'Logout',
    'nav.admin': 'Admin Panel',
    'nav.backToHome': 'Back to Home',
    'nav.home': 'Home',
    'home.welcome': 'Welcome to SunPanel',
    'home.searchPlaceholder': 'Search...',
    'home.addFirstGroup': 'Start adding your first group and websites',
    'home.goAdmin': 'Go to Admin',
    'home.loginToConfigure': 'Login to configure',
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
    'dashboard.noGroups': 'No groups',
    'dashboard.addGroup': 'Add Group',
    'dashboard.addWebsite': 'Add Website',
    'dashboard.uploadImage': 'Upload Image',
    'dashboard.changeTheme': 'Change Theme',
    'dashboard.exportData': 'Export Data',
    'dashboard.viewApi': 'View API',
    'globalSettings.title': 'Global Settings',
    'globalSettings.websiteTitle': 'Website Title',
    'globalSettings.websiteDescription': 'Website Description',
    'globalSettings.language': 'Language',
    'globalSettings.footerText': 'Footer Text',
    'globalSettings.save': 'Save',
    'globalSettings.resetCache': 'Reset Cache',
    'globalSettings.cacheResetSuccess': 'Cache reset successfully'
  }
}

export interface PageTexts {
  home: {
    welcome?: string
    searchPlaceholder?: string
    addFirstGroup?: string
    goAdmin?: string
    loginToConfigure?: string
  }
  nav: {
    admin?: string
    logout?: string
    backToHome?: string
    home?: string
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
    noGroups?: string
    addGroup?: string
    addWebsite?: string
    uploadImage?: string
    changeTheme?: string
    exportData?: string
    viewApi?: string
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

  const pageTexts = computed<PageTexts>(() => {
    const lang = language.value
    const texts = defaultTexts[lang] || {}
    return {
      home: {
        welcome: texts['home.welcome'],
        searchPlaceholder: texts['home.searchPlaceholder'],
        addFirstGroup: texts['home.addFirstGroup'],
        goAdmin: texts['home.goAdmin'],
        loginToConfigure: texts['home.loginToConfigure']
      },
      nav: {
        admin: texts['nav.admin'],
        logout: texts['nav.logout'],
        backToHome: texts['nav.backToHome'],
        home: texts['nav.home'],
        darkMode: texts['nav.darkMode'],
        lightMode: texts['nav.lightMode']
      },
      admin: {
        dashboard: texts['admin.dashboard'],
        profile: texts['admin.profile'],
        personalization: texts['admin.personalization'],
        groups: texts['admin.groups'],
        gallery: texts['admin.gallery'],
        settings: texts['admin.settings'],
        users: texts['admin.users'],
        api: texts['admin.api'],
        openAPI: texts['admin.openAPI'],
        about: texts['admin.about'],
        migration: texts['admin.migration'],
        dataMigration: texts['admin.dataMigration'],
        publicGallery: texts['admin.publicGallery'],
        exportImport: texts['admin.exportImport'],
        user: texts['admin.user'],
        management: texts['admin.management'],
        confirmClose: texts['admin.confirmClose'],
        closeConfirm: texts['admin.closeConfirm'],
        migrateFromSunPanel: texts['admin.migrateFromSunPanel'],
        migrateFromSunPanelDesc: texts['admin.migrateFromSunPanelDesc'],
        selectFileMigrate: texts['admin.selectFileMigrate'],
        exportToSunPanel: texts['admin.exportToSunPanel'],
        exportToSunPanelDesc: texts['admin.exportToSunPanelDesc'],
        exportCompatible: texts['admin.exportCompatible'],
        migrationInstructions: texts['admin.migrationInstructions'],
        migrationStep1: texts['admin.migrationStep1'],
        migrationStep2: texts['admin.migrationStep2'],
        migrationStep3: texts['admin.migrationStep3'],
        migrationStep4: texts['admin.migrationStep4'],
        exportData: texts['admin.exportData'],
        exportDescription: texts['admin.exportDescription'],
        exportConfig: texts['admin.exportConfig'],
        exporting: texts['admin.exporting'],
        importData: texts['admin.importData'],
        importDescription: texts['admin.importDescription'],
        selectFile: texts['admin.selectFile'],
        importInstructions: texts['admin.importInstructions'],
        supportJson: texts['admin.supportJson'],
        importOverwrite: texts['admin.importOverwrite'],
        backupBeforeImport: texts['admin.backupBeforeImport'],
        imagesSeparate: texts['admin.imagesSeparate'],
        confirmImport: texts['admin.confirmImport'],
        importConfirmMessage: texts['admin.importConfirmMessage'],
        apiExamples: texts['admin.apiExamples'],
        getGroups: texts['admin.getGroups'],
        getItems: texts['admin.getItems'],
        createGroup: texts['admin.createGroup'],
        apiEndpoints: texts['admin.apiEndpoints'],
        createNewGroup: texts['admin.createNewGroup'],
        updateGroup: texts['admin.updateGroup'],
        deleteGroup: texts['admin.deleteGroup'],
        createNewItem: texts['admin.createNewItem'],
        updateItem: texts['admin.updateItem'],
        deleteItem: texts['admin.deleteItem'],
        noAPIToken: texts['admin.noAPIToken'],
        securityWarning: texts['admin.securityWarning'],
        keepTokenSecure: texts['admin.keepTokenSecure'],
        tokenFullAccess: texts['admin.tokenFullAccess'],
        regularTokenRegen: texts['admin.regularTokenRegen'],
        revokeIfLeaked: texts['admin.revokeIfLeaked'],
        tokenExpire90Days: texts['admin.tokenExpire90Days'],
        generateToken: texts['admin.generateToken'],
        regenerate: texts['admin.regenerate'],
        revoke: texts['admin.revoke'],
        addAccount: texts['admin.addAccount'],
        editAccount: texts['admin.editAccount'],
        loadingUsers: texts['admin.loadingUsers'],
        noAccounts: texts['admin.noAccounts'],
        clickAddAccount: texts['admin.clickAddAccount'],
        username: texts['admin.username'],
        nickname: texts['admin.nickname'],
        email: texts['admin.email'],
        password: texts['admin.password'],
        role: texts['admin.role'],
        admin: texts['admin.admin'],
        aboutProject: texts['admin.aboutProject'],
        projectDescription: texts['admin.projectDescription'],
        inspiredBy: texts['admin.inspiredBy'],
        andAdapted: texts['admin.andAdapted'],
        techStack: texts['admin.techStack'],
        license: texts['admin.license'],
        mitLicense: texts['admin.mitLicense'],
        freeUse: texts['admin.freeUse'],
        cloudflareNavigation: texts['admin.cloudflareNavigation'],
        confirmRegenerate: texts['admin.confirmRegenerate'],
        regenerateConfirmMessage: texts['admin.regenerateConfirmMessage'],
        confirmRevoke: texts['admin.confirmRevoke'],
        revokeConfirmMessage: texts['admin.revokeConfirmMessage'],
        confirmDeleteAccount: texts['admin.confirmDeleteAccount'],
        fetchUsersFailed: texts['admin.fetchUsersFailed'],
        createSuccess: texts['admin.createSuccess'],
        updateSuccess: texts['admin.updateSuccess'],
        saveFailed: texts['admin.saveFailed'],
        deleteSuccess: texts['admin.deleteSuccess'],
        deleteFailed: texts['admin.deleteFailed'],
        exportSuccess: texts['admin.exportSuccess'],
        exportFailed: texts['admin.exportFailed'],
        exportError: texts['admin.exportError'],
        importSuccess: texts['admin.importSuccess'],
        importFailed: texts['admin.importFailed'],
        migrationSuccess: texts['admin.migrationSuccess'],
        migrationFileError: texts['admin.migrationFileError'],
        tokenExpired: texts['admin.tokenExpired'],
        tokenGeneratedSuccess: texts['admin.tokenGeneratedSuccess'],
        tokenGenerateFailed: texts['admin.tokenGenerateFailed'],
        tokenRevoked: texts['admin.tokenRevoked'],
        tokenCopied: texts['admin.tokenCopied'],
        copyFailed: texts['admin.copyFailed']
      },
      login: {
        username: texts['login.username'],
        password: texts['login.password'],
        nickname: texts['login.nickname'],
        confirmPassword: texts['login.confirmPassword'],
        submit: texts['login.submit'],
        register: texts['login.register'],
        loading: texts['login.loading'],
        haveAccount: texts['login.haveAccount'],
        noAccount: texts['login.noAccount'],
        backToHome: texts['login.backToHome'],
        registerSuccess: texts['login.registerSuccess'],
        loginSuccess: texts['login.loginSuccess']
      },
      profile: {
        title: texts['profile.title'],
        username: texts['profile.username'],
        nickname: texts['profile.nickname'],
        email: texts['profile.email'],
        language: texts['profile.language'],
        save: texts['profile.save'],
        cancel: texts['profile.cancel'],
        password: texts['profile.password'],
        currentPassword: texts['profile.currentPassword'],
        newPassword: texts['profile.newPassword'],
        confirmNewPassword: texts['profile.confirmNewPassword'],
        changePassword: texts['profile.changePassword'],
        uploading: texts['profile.uploading'],
        uploadSuccess: texts['profile.uploadSuccess'],
        uploadError: texts['profile.uploadError'],
        saveSuccess: texts['profile.saveSuccess']
      },
      groups: {
        title: texts['groups.title'],
        addGroup: texts['groups.addGroup'],
        editGroup: texts['groups.editGroup'],
        deleteConfirm: texts['groups.deleteConfirm'],
        name: texts['groups.name'],
        icon: texts['groups.icon'],
        websites: texts['groups.websites'],
        noGroups: texts['groups.noGroups'],
        addFirstGroup: texts['groups.addFirstGroup'],
        websiteTitle: texts['groups.websiteTitle'],
        addWebsite: texts['groups.addWebsite'],
        editWebsite: texts['groups.editWebsite'],
        deleteWebsiteConfirm: texts['groups.deleteWebsiteConfirm'],
        url: texts['groups.url'],
        description: texts['groups.description'],
        color: texts['groups.color'],
        group: texts['groups.group'],
        openInNewTab: texts['groups.openInNewTab'],
        showAsWindow: texts['groups.showAsWindow'],
        selectGroup: texts['groups.selectGroup'],
        noWebsites: texts['groups.noWebsites'],
        addFirstWebsite: texts['groups.addFirstWebsite'],
        namePlaceholder: texts['groups.namePlaceholder']
      },
      dashboard: {
        title: texts['dashboard.title'],
        groupCount: texts['dashboard.groupCount'],
        websiteCount: texts['dashboard.websiteCount'],
        imageCount: texts['dashboard.imageCount'],
        userCount: texts['dashboard.userCount'],
        quickActions: texts['dashboard.quickActions'],
        recentWebsites: texts['dashboard.recentWebsites'],
        recentGroups: texts['dashboard.recentGroups'],
        noWebsites: texts['dashboard.noWebsites'],
        noGroups: texts['dashboard.noGroups'],
        addGroup: texts['dashboard.addGroup'],
        addWebsite: texts['dashboard.addWebsite'],
        uploadImage: texts['dashboard.uploadImage'],
        changeTheme: texts['dashboard.changeTheme'],
        exportData: texts['dashboard.exportData'],
        viewApi: texts['dashboard.viewApi']
      },
      globalSettings: {
        title: texts['globalSettings.title'],
        websiteTitle: texts['globalSettings.websiteTitle'],
        websiteDescription: texts['globalSettings.websiteDescription'],
        language: texts['globalSettings.language'],
        footerText: texts['globalSettings.footerText'],
        save: texts['globalSettings.save'],
        resetCache: texts['globalSettings.resetCache'],
        cacheResetSuccess: texts['globalSettings.cacheResetSuccess']
      },
      common: {
        cancel: texts['common.cancel'],
        save: texts['common.save'],
        delete: texts['common.delete'],
        edit: texts['common.edit'],
        add: texts['common.add'],
        loading: texts['common.loading'],
        error: texts['common.error'],
        success: texts['common.success'],
        confirm: texts['common.confirm'],
        yes: texts['common.yes'],
        no: texts['common.no'],
        search: texts['common.search'],
        submit: texts['common.submit'],
        close: texts['common.close'],
        refresh: texts['common.refresh'],
        retry: texts['common.retry'],
        saving: texts['common.saving'],
        processing: texts['common.processing'],
        generating: texts['common.generating'],
        noImages: texts['common.noImages'],
        uploadImagesFirst: texts['common.uploadImagesFirst']
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