-- 修复中文语言数据
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.migrateFromSunPanel', '从 sun-panel 迁移') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.migrateFromSunPanelDesc', '支持从官方 sun-panel 导出数据迁移到本系统。') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.selectFileMigrate', '选择文件迁移') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.exportToSunPanel', '导出到 sun-panel') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.exportToSunPanelDesc', '将当前数据导出为 sun-panel 兼容格式。') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.exportCompatible', '导出兼容格式') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.migrationInstructions', '迁移说明') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.migrationStep1', '1. 从 sun-panel 导出配置（设置 -> 导出数据）') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.migrationStep2', '2. 使用上方工具导入到本系统') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.migrationStep3', '3. 迁移完成后请检查数据完整性') WHERE language = 'zh-CN';
UPDATE global_settings SET page_texts = JSON_INSERT(page_texts, '$.admin.migrationStep4', '4. 图片资源需要单独迁移') WHERE language = 'zh-CN';
