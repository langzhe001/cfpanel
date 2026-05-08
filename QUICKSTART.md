# 快速开始

## 前置要求

- Node.js 18+
- npm 或 pnpm
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare 账号

## 部署步骤

### 1. 安装依赖

```bash
npm install
cd frontend && npm install
```

### 2. 配置 Cloudflare

```bash
# 登录 Cloudflare
wrangler login

# 创建 D1 数据库
wrangler d1 create sunpanel-db
```

将返回的 `database_id` 填入 `wrangler.toml` 文件：

```toml
[[d1_databases]]
binding = "SUNPANEL_DB"
database_name = "sunpanel-db"
id = "你的database_id"
```

### 3. 设置环境变量

```bash
# 设置管理员密码
wrangler secret put ADMIN_PASSWORD

# 设置允许的来源（可选，默认允许本地开发）
wrangler secret put ALLOWED_ORIGINS
```

### 4. 执行数据库迁移

```bash
wrangler d1 migrations apply sunpanel-db
```

### 5. 构建前端

```bash
npm run build
```

### 6. 部署

```bash
wrangler deploy
```

## 开发

```bash
# 前端开发
cd frontend && npm run dev

# Workers 开发
npm run dev:worker
```

## 默认账号

- 用户名: `admin`
- 密码: 通过 `wrangler secret put ADMIN_PASSWORD` 设置

> ⚠️ 部署后请立即登录并修改密码！

## 功能说明

| 功能 | 状态 |
|------|------|
| 用户认证 | ✅ |
| 分组管理 | ✅ |
| 项目管理 | ✅ |
| 用户设置 | ✅ |
| 资料更新 | ✅ |
| 密码修改 | ✅ |
| 数据导入/导出 | ✅ |
| 图片上传 | ✅ |
| Docker 管理 | ❌（Cloudflare 不支持） |

## 文档

更多文档请访问: https://sun-panel-doc.enianteam.com/zh_cn