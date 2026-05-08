-- SunPanel Cloudflare D1 数据库迁移脚本
-- 添加响应式布局设置字段

-- 为现有记录添加移动端、平板端、电脑端每行显示数量字段
ALTER TABLE settings ADD COLUMN IF NOT EXISTS mobile_items_per_row INTEGER DEFAULT 2;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS tablet_items_per_row INTEGER DEFAULT 3;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS desktop_items_per_row INTEGER DEFAULT 6;

-- 更新现有记录的默认值（如果字段为空）
UPDATE settings SET mobile_items_per_row = 2 WHERE mobile_items_per_row IS NULL;
UPDATE settings SET tablet_items_per_row = 3 WHERE tablet_items_per_row IS NULL;
UPDATE settings SET desktop_items_per_row = 6 WHERE desktop_items_per_row IS NULL;

-- 更新默认搜索引擎为 Bing
UPDATE settings SET search_engine = 'https://www.bing.com/search?q=' WHERE search_engine = 'baidu' OR search_engine IS NULL;

-- 更新默认 items_per_row 为 6
UPDATE settings SET items_per_row = 6 WHERE items_per_row IS NULL;

-- 更新默认壁纸为深色主题
UPDATE settings SET wallpaper = '#1e293b' WHERE wallpaper IS NULL;

-- 添加 user_id 唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_user_id_unique ON settings(user_id);