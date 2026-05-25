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