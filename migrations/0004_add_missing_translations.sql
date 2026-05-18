-- SunPanel Cloudflare D1 数据库迁移脚本
-- 版本: 1.3.0
-- 执行: wrangler d1 migrations apply sunpanel-db
-- 描述: 补充缺失的翻译键

-- 更新中文语言数据
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.personalization', '{
  "theme": "主题设置",
  "themeMode": "主题模式",
  "background": "背景设置",
  "backgroundType": "背景类型",
  "solidColor": "纯色背景",
  "imageBackground": "图片背景",
  "selectColor": "选择颜色",
  "backgroundImage": "背景图片",
  "removeImage": "移除图片",
  "display": "显示设置",
  "showSearchBar": "显示搜索栏",
  "searchBarDesc": "在顶部显示搜索框",
  "showGroupNames": "显示分组名称",
  "groupNamesDesc": "在分组上方显示名称",
  "mobileItems": "移动端每行显示数量",
  "tabletItems": "平板端每行显示数量",
  "desktopItems": "电脑端每行显示数量",
  "customCode": "自定义代码",
  "customCSS": "自定义 CSS",
  "selectBackground": "选择背景图片",
  "selectFromGallery": "从图库选择",
  "orEnterURL": "或输入URL",
  "light": "浅色",
  "dark": "深色",
  "auto": "跟随系统"
}') WHERE language = 'zh-CN';

UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.revoke', '撤销') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.migrateFromSunPanel', '从 sun-panel 迁移') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.migrateFromSunPanelDesc', '支持从官方 sun-panel 导出数据迁移到本系统。') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.selectFileMigrate', '选择文件迁移') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.exportToSunPanel', '导出到 sun-panel') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.exportToSunPanelDesc', '将当前数据导出为 sun-panel 兼容格式。') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.exportCompatible', '导出兼容格式') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.migrationInstructions', '迁移说明') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.migrationStep1', '1. 从 sun-panel 导出配置（设置 → 导出数据）') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.migrationStep2', '2. 使用上方工具导入到本系统') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.migrationStep3', '3. 迁移完成后请检查数据完整性') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.migrationStep4', '4. 图片资源需要单独迁移') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.cloudflareNavigation', '基于 Cloudflare 部署的导航面板') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.aboutProject', '关于项目') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.projectDescription', 'SunPanel Cloudflare 是一个专为 Cloudflare 优化的开源导航面板项目。') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.inspiredBy', '本项目受') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.andAdapted', '启发并进行适配优化。') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.techStack', '技术栈') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.license', '许可证') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.mitLicense', '本项目基于 MIT 许可证开源。') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.freeUse', '您可以自由使用、修改和分发本项目。') WHERE language = 'zh-CN';

UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.addAccount', '添加账号') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.editAccount', '编辑账号') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.loadingUsers', '加载用户列表...') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.noAccounts', '暂无账号') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.clickAddAccount', '点击上方按钮添加账号') WHERE language = 'zh-CN';

UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.noAPIToken', '未生成 API Token') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.securityWarning', '安全警告') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.keepTokenSecure', '请妥善保管您的 API Token，不要泄露给他人') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.tokenFullAccess', 'Token 拥有完整的账户权限，请谨慎使用') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.regularTokenRegen', '建议定期重新生成 Token 以增强安全性') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.revokeIfLeaked', '如发现 Token 泄露，请立即撤销') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.tokenExpire90Days', 'Token 将在 90 天后自动过期') WHERE language = 'zh-CN';

UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.apiExamples', 'API 使用示例') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.getGroups', '获取分组列表') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.getItems', '获取网站列表') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.createGroup', '创建分组') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.apiEndpoints', 'API 端点') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.createNewGroup', '创建新分组') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.updateGroup', '更新分组') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.deleteGroup', '删除分组') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.createNewItem', '创建新网站') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.updateItem', '更新网站') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.deleteItem', '删除网站') WHERE language = 'zh-CN';

UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.exportData', '导出数据') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.exportDescription', '导出您的所有配置数据，包括分组、网站和设置。') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.exporting', '导出中...') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.exportConfig', '导出配置') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.importData', '导入数据') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.importDescription', '从之前导出的备份文件中恢复配置。') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.selectFile', '选择文件') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.importInstructions', '导入说明') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.supportJson', '• 支持导入 .json 格式的备份文件') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.importOverwrite', '• 导入将覆盖现有配置，请谨慎操作') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.backupBeforeImport', '• 建议在导入前先导出当前配置作为备份') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.imagesSeparate', '• 图片文件需要单独上传') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.confirmImport', '确认导入') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.importConfirmMessage', '导入将覆盖现有配置，此操作不可撤销。确定继续吗？') WHERE language = 'zh-CN';

UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.common.noImages', '暂无图片') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.common.uploadImagesFirst', '请先上传图片到图库') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.common.processing', '处理中...') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.common.generating', '生成中...') WHERE language = 'zh-CN';

UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.username', '用户名') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.nickname', '昵称') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.password', '密码') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.role', '角色') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.email', '邮箱') WHERE language = 'zh-CN';

UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.generateToken', '生成 Token') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.regenerate', '重新生成') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.confirmRegenerate', '重新生成 Token') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.regenerateConfirmMessage', '重新生成将导致之前的 Token 立即失效，是否继续？') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.confirmRevoke', '撤销 Token') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.revokeConfirmMessage', '确定要撤销当前的 API Token 吗？撤销后将无法使用该 Token 访问 API。') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.confirmDeleteAccount', '确定要删除这个账号吗？此操作不可撤销。') WHERE language = 'zh-CN';

UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.fetchUsersFailed', '获取用户列表失败') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.createSuccess', '用户创建成功') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.updateSuccess', '用户更新成功') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.saveFailed', '保存失败') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.deleteSuccess', '用户删除成功') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.deleteFailed', '删除失败') WHERE language = 'zh-CN';

UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.exportSuccess', '导出成功') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.exportFailed', '导出失败，请重试') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.exportError', '无效的响应格式') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.importSuccess', '导入成功') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.importFailed', '导入失败，请检查文件格式') WHERE language = 'zh-CN';

UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.migrationSuccess', '迁移成功！') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.migrationFileError', '文件格式错误，请检查文件内容') WHERE language = 'zh-CN';

UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.tokenExpired', 'Token 已过期，请重新生成') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.tokenGeneratedSuccess', 'Token 生成成功！请妥善保管，有效期 90 天') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.tokenGenerateFailed', '生成失败，请重试') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.tokenRevoked', 'Token 已撤销') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.tokenCopied', 'Token 已复制到剪贴板') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.copyFailed', '复制失败，请手动复制') WHERE language = 'zh-CN';

UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.personalization.loadingImages', '加载图片中...') WHERE language = 'zh-CN';

-- 更新英文语言数据
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.personalization', '{
  "theme": "Theme Settings",
  "themeMode": "Theme Mode",
  "background": "Background Settings",
  "backgroundType": "Background Type",
  "solidColor": "Solid Color",
  "imageBackground": "Image Background",
  "selectColor": "Select Color",
  "backgroundImage": "Background Image",
  "removeImage": "Remove Image",
  "display": "Display Settings",
  "showSearchBar": "Show Search Bar",
  "searchBarDesc": "Show search box at the top",
  "showGroupNames": "Show Group Names",
  "groupNamesDesc": "Show names above groups",
  "mobileItems": "Items per row (Mobile)",
  "tabletItems": "Items per row (Tablet)",
  "desktopItems": "Items per row (Desktop)",
  "customCode": "Custom Code",
  "customCSS": "Custom CSS",
  "selectBackground": "Select Background Image",
  "selectFromGallery": "Select from Gallery",
  "orEnterURL": "Or enter URL",
  "light": "Light",
  "dark": "Dark",
  "auto": "System"
}') WHERE language = 'en-US';

UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.revoke', 'Revoke') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.migrateFromSunPanel', 'Migrate from sun-panel') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.migrateFromSunPanelDesc', 'Supports importing data exported from official sun-panel to this system.') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.selectFileMigrate', 'Select file to migrate') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.exportToSunPanel', 'Export to sun-panel') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.exportToSunPanelDesc', 'Export current data in sun-panel compatible format.') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.exportCompatible', 'Export Compatible Format') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.migrationInstructions', 'Migration Instructions') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.migrationStep1', '1. Export configuration from sun-panel (Settings → Export Data)') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.migrationStep2', '2. Use the tool above to import to this system') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.migrationStep3', '3. Verify data integrity after migration') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.migrationStep4', '4. Image resources need to be migrated separately') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.cloudflareNavigation', 'Navigation panel deployed on Cloudflare') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.aboutProject', 'About Project') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.projectDescription', 'SunPanel Cloudflare is an open-source navigation panel optimized for Cloudflare.') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.inspiredBy', 'This project is inspired by') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.andAdapted', 'and adapted for optimization.') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.techStack', 'Tech Stack') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.license', 'License') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.mitLicense', 'This project is open source under the MIT License.') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.freeUse', 'You are free to use, modify, and distribute this project.') WHERE language = 'en-US';

UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.addAccount', 'Add Account') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.editAccount', 'Edit Account') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.loadingUsers', 'Loading users...') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.noAccounts', 'No accounts') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.clickAddAccount', 'Click the button above to add an account') WHERE language = 'en-US';

UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.noAPIToken', 'No API Token generated') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.securityWarning', 'Security Warning') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.keepTokenSecure', 'Keep your API Token secure, do not share it with others') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.tokenFullAccess', 'Token has full account permissions, use with caution') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.regularTokenRegen', 'It is recommended to regenerate Token regularly to enhance security') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.revokeIfLeaked', 'If you suspect Token leakage, revoke it immediately') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.tokenExpire90Days', 'Token expires automatically after 90 days') WHERE language = 'en-US';

UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.apiExamples', 'API Examples') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.getGroups', 'Get groups list') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.getItems', 'Get items list') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.createGroup', 'Create group') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.apiEndpoints', 'API Endpoints') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.createNewGroup', 'Create new group') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.updateGroup', 'Update group') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.deleteGroup', 'Delete group') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.createNewItem', 'Create new item') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.updateItem', 'Update item') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.deleteItem', 'Delete item') WHERE language = 'en-US';

UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.exportData', 'Export Data') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.exportDescription', 'Export all your configuration data, including groups, websites, and settings.') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.exporting', 'Exporting...') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.exportConfig', 'Export Configuration') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.importData', 'Import Data') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.importDescription', 'Restore configuration from a previously exported backup file.') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.selectFile', 'Select File') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.importInstructions', 'Import Instructions') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.supportJson', '• Supports importing .json format backup files') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.importOverwrite', '• Import will overwrite existing configuration, please proceed with caution') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.backupBeforeImport', '• It is recommended to export current configuration as backup before importing') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.imagesSeparate', '• Image files need to be uploaded separately') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.confirmImport', 'Confirm Import') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.importConfirmMessage', 'Import will overwrite existing configuration, this action cannot be undone. Continue?') WHERE language = 'en-US';

UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.common.noImages', 'No images') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.common.uploadImagesFirst', 'Please upload images to gallery first') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.common.processing', 'Processing...') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.common.generating', 'Generating...') WHERE language = 'en-US';

UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.username', 'Username') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.nickname', 'Nickname') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.password', 'Password') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.role', 'Role') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.email', 'Email') WHERE language = 'en-US';

UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.generateToken', 'Generate Token') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.regenerate', 'Regenerate') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.confirmRegenerate', 'Regenerate Token') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.regenerateConfirmMessage', 'Regenerating will immediately invalidate the previous Token. Continue?') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.confirmRevoke', 'Revoke Token') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.revokeConfirmMessage', 'Are you sure you want to revoke the current API Token? You will not be able to access the API with this Token after revocation.') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.confirmDeleteAccount', 'Are you sure you want to delete this account? This action cannot be undone.') WHERE language = 'en-US';

UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.fetchUsersFailed', 'Failed to fetch user list') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.createSuccess', 'User created successfully') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.updateSuccess', 'User updated successfully') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.saveFailed', 'Save failed') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.deleteSuccess', 'User deleted successfully') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.deleteFailed', 'Delete failed') WHERE language = 'en-US';

UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.exportSuccess', 'Export successful') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.exportFailed', 'Export failed, please try again') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.exportError', 'Invalid response format') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.importSuccess', 'Import successful') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.importFailed', 'Import failed, please check file format') WHERE language = 'en-US';

UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.migrationSuccess', 'Migration successful!') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.migrationFileError', 'File format error, please check file content') WHERE language = 'en-US';

UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.tokenExpired', 'Token expired, please regenerate') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.tokenGeneratedSuccess', 'Token generated successfully! Please keep it safe, valid for 90 days') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.tokenGenerateFailed', 'Generation failed, please try again') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.tokenRevoked', 'Token revoked') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.tokenCopied', 'Token copied to clipboard') WHERE language = 'en-US';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.copyFailed', 'Copy failed, please copy manually') WHERE language = 'en-US';

UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.personalization.loadingImages', 'Loading images...') WHERE language = 'en-US';

-- 更新时间戳
UPDATE global_settings SET updated_at = datetime('now');
