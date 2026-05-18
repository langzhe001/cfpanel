-- SunPanel Cloudflare D1 数据库迁移脚本
-- 版本: 1.1.0
-- 执行: wrangler d1 migrations apply sunpanel-db
-- 描述: 添加全局设置表，支持多语言网站标题和页面文本

-- 全局设置表 (多语言)
CREATE TABLE IF NOT EXISTS global_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    language TEXT NOT NULL DEFAULT 'zh-CN',
    website_title TEXT DEFAULT 'SunPanel',
    website_description TEXT,
    page_texts TEXT NOT NULL DEFAULT '{}',
    footer_text TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(language)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_global_settings_language ON global_settings(language);
