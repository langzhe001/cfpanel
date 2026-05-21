PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    nickname TEXT,
    avatar TEXT,
    email TEXT,
    role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
CREATE TABLE `groups` (
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
CREATE TABLE items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    description TEXT,
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    order_index INTEGER DEFAULT 0,
    open_in_new_tab INTEGER DEFAULT 1,
    show_as_window INTEGER DEFAULT 0,
    window_width INTEGER DEFAULT 800,
    window_height INTEGER DEFAULT 600,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL, color TEXT,
    FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    filename TEXT NOT NULL,
    user_id INTEGER,
    is_public INTEGER DEFAULT 0,
    created_at TEXT NOT NULL, data TEXT, content_type TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    role TEXT NOT NULL,
    csrf_token TEXT,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE rate_limits (
    ip TEXT PRIMARY KEY,
    count INTEGER DEFAULT 1,
    timestamp INTEGER NOT NULL
);
CREATE TABLE audit_logs (
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
CREATE TABLE settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    theme TEXT DEFAULT 'light',
    language TEXT DEFAULT 'zh-CN',
    wallpaper TEXT,
    wallpaper_type TEXT DEFAULT 'color',
    show_search_bar INTEGER DEFAULT 1,
    search_engine TEXT DEFAULT 'baidu',
    items_per_row INTEGER DEFAULT 4,
    show_group_names INTEGER DEFAULT 1,
    custom_css TEXT,
    custom_js TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL, card_opacity TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE d1_migrations(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE global_settings (
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
DELETE FROM sqlite_sequence;
CREATE INDEX idx_groups_user_id ON `groups`(user_id);
CREATE INDEX idx_items_group_id ON items(group_id);
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_images_user_id ON images(user_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_rate_limits_timestamp ON rate_limits(timestamp);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_settings_user_id ON settings(user_id);
CREATE INDEX idx_global_settings_language ON global_settings(language);
