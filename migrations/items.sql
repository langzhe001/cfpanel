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