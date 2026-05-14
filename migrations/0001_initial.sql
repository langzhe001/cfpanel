-- SunPanel Cloudflare D1 数据库迁移脚本
-- 版本: 1.0.0
-- 执行: wrangler d1 migrations apply sunpanel-db

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    language TEXT DEFAULT 'zh-CN',
    nickname TEXT,
    avatar TEXT,
    email TEXT,
    role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 分组表
CREATE TABLE IF NOT EXISTS `groups` (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT,
    user_id INTEGER NOT NULL,
    parent_id INTEGER,
    order_index INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES `groups`(id) ON DELETE SET NULL
);

-- 项目表 (网站)
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    description TEXT,
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    order_index INTEGER DEFAULT 0,
    open_in_new_tab INTEGER DEFAULT 1,
    show_as_window INTEGER DEFAULT 0,
    window_width INTEGER DEFAULT 800,
    window_height INTEGER DEFAULT 600,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 图片表
CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    filename TEXT NOT NULL,
    user_id INTEGER,
    is_public INTEGER DEFAULT 0,
    data TEXT,
    content_type TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 会话表
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    role TEXT NOT NULL,
    csrf_token TEXT,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 速率限制表
CREATE TABLE IF NOT EXISTS rate_limits (
    ip TEXT PRIMARY KEY,
    count INTEGER DEFAULT 1,
    timestamp INTEGER NOT NULL
);

-- 审计日志表
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    user_id INTEGER,
    username TEXT,
    ip_address TEXT,
    user_agent TEXT,
    resource TEXT,
    action TEXT,
    result TEXT,
    details TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 设置表
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    theme TEXT DEFAULT 'light',
    language TEXT DEFAULT 'zh-CN',
    wallpaper TEXT DEFAULT '#1e293b',
    wallpaper_type TEXT DEFAULT 'color',
    show_search_bar INTEGER DEFAULT 1,
    search_engine TEXT DEFAULT 'https://www.bing.com/search?q=',
    items_per_row INTEGER DEFAULT 6,
    mobile_items_per_row INTEGER DEFAULT 2,
    tablet_items_per_row INTEGER DEFAULT 3,
    desktop_items_per_row INTEGER DEFAULT 6,
    show_group_names INTEGER DEFAULT 1,
    custom_css TEXT,
    custom_js TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_groups_user_id ON `groups`(user_id);
CREATE INDEX IF NOT EXISTS idx_items_group_id ON items(group_id);
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_images_user_id ON images(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_timestamp ON rate_limits(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON settings(user_id);