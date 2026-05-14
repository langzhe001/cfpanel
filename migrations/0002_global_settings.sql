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

-- 预设多语言数据: 中文 (zh-CN)
INSERT OR IGNORE INTO global_settings (language, website_title, website_description, page_texts, footer_text, created_at, updated_at)
VALUES (
    'zh-CN',
    'SunPanel - 个人导航面板',
    '简洁高效的个人导航面板',
    '{"home":{"title":"首页","welcome":"欢迎使用 SunPanel"},"nav":{"home":"首页","admin":"管理","login":"登录","logout":"退出"},"admin":{"dashboard":"仪表盘","settings":"设置","users":"用户管理","groups":"分组管理","items":"项目管理","personalization":"个性化"},"login":{"title":"登录","username":"用户名","password":"密码","submit":"登录","register":"注册","forgot":"忘记密码?","nickname":"请输入昵称","confirmPassword":"请再次输入密码","loading":"请稍候...","haveAccount":"已有账号？去登录","noAccount":"没有账号？去注册","backToHome":"返回首页"},"settings":{"title":"设置","theme":"主题","language":"语言","save":"保存","reset":"重置"}}',
    '© 2024 SunPanel. All rights reserved.',
    datetime('now'),
    datetime('now')
);

-- 预设多语言数据: 英文 (en-US)
INSERT OR IGNORE INTO global_settings (language, website_title, website_description, page_texts, footer_text, created_at, updated_at)
VALUES (
    'en-US',
    'SunPanel - Personal Navigation Dashboard',
    'Clean and efficient personal navigation dashboard',
    '{"home":{"title":"Home","welcome":"Welcome to SunPanel"},"nav":{"home":"Home","admin":"Admin","login":"Login","logout":"Logout"},"admin":{"dashboard":"Dashboard","settings":"Settings","users":"Users","groups":"Groups","items":"Items","personalization":"Personalization"},"login":{"title":"Login","username":"Username","password":"Password","submit":"Login","register":"Register","forgot":"Forgot password?","nickname":"Enter nickname","confirmPassword":"Confirm password","loading":"Please wait...","haveAccount":"Already have an account? Login","noAccount":"Don''t have an account? Register","backToHome":"Back to home"},"settings":{"title":"Settings","theme":"Theme","language":"Language","save":"Save","reset":"Reset"}}',
    '© 2024 SunPanel. All rights reserved.',
    datetime('now'),
    datetime('now')
);

-- 预设多语言数据: 日文 (ja-JP)
INSERT OR IGNORE INTO global_settings (language, website_title, website_description, page_texts, footer_text, created_at, updated_at)
VALUES (
    'ja-JP',
    'SunPanel - 個人ナビゲーションパネル',
    'シンプルで効率的な個人ナビゲーションパネル',
    '{"home":{"title":"ホーム","welcome":"SunPanelへようこそ"},"nav":{"home":"ホーム","admin":"管理","login":"ログイン","logout":"ログアウト"},"admin":{"dashboard":"ダッシュボード","settings":"設定","users":"ユーザー","groups":"グループ","items":"アイテム","personalization":"パーソナライズ"},"login":{"title":"ログイン","username":"ユーザー名","password":"パスワード","submit":"ログイン","register":"登録","forgot":"パスワードを忘れた?","nickname":"ニックネームを入力","confirmPassword":"パスワードを再入力","loading":"しばらくお待ちください...","haveAccount":"アカウントをお持ちですか？ログイン","noAccount":"アカウントをお持ちでないですか？登録","backToHome":"ホームに戻る"},"settings":{"title":"設定","theme":"テーマ","language":"言語","save":"保存","reset":"リセット"}}',
    '© 2024 SunPanel. All rights reserved.',
    datetime('now'),
    datetime('now')
);

-- 预设多语言数据: 韩文 (ko-KR)
INSERT OR IGNORE INTO global_settings (language, website_title, website_description, page_texts, footer_text, created_at, updated_at)
VALUES (
    'ko-KR',
    'SunPanel - 개인 내비게이션 패널',
    '간결하고 효율적인 개인 내비게이션 패널',
    '{"home":{"title":"홈","welcome":"SunPanel에 오신 것을 환영합니다"},"nav":{"home":"홈","admin":"관리","login":"로그인","logout":"로그아웃"},"admin":{"dashboard":"대시보드","settings":"설정","users":"사용자","groups":"그룹","items":"아이템","personalization":"개인화"},"login":{"title":"로그인","username":"사용자 이름","password":"비밀번호","submit":"로그인","register":"등록","forgot":"비밀번호를 잊으셨나요?","nickname":"별명을 입력하세요","confirmPassword":"비밀번호를 다시 입력하세요","loading":"잠시 기다려주세요...","haveAccount":"계정이 있으신가요? 로그인","noAccount":"계정이 없으신가요? 등록","backToHome":"홈으로 돌아가기"},"settings":{"title":"설정","theme":"테마","language":"언어","save":"저장","reset":"초기화"}}',
    '© 2024 SunPanel. All rights reserved.',
    datetime('now'),
    datetime('now')
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_global_settings_language ON global_settings(language);
