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