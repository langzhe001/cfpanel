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
wrangler login
wrangler d1 create sunpanel-db
wrangler kv:namespace create IMAGES_KV
```

复制返回的 `database_id` 和 KV 的 `id`，更新 `wrangler.toml`：

```toml
[[d1_databases]]
binding = "SUNPANEL_DB"
database_name = "sunpanel-db"
database_id = "您的 database_id"

[[kv_namespaces]]
binding = "IMAGES_KV"
id = "您的 kv_id"
```

### 3. 设置环境变量

```bash
wrangler secret put ADMIN_PASSWORD
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

## 开发命令

```bash
# 前端开发服务器
cd frontend && npm run dev

# Workers 本地预览
npm run dev:worker
```

## 默认账号

- 用户名: `admin`
- 密码: 通过 `wrangler secret put ADMIN_PASSWORD` 设置

> ⚠️ 首次登录后请及时修改密码

## 功能状态

| 功能 | 状态 |
|------|------|
| 用户认证 | ✅ |
| 分组管理 | ✅ |
| 网站管理 | ✅ |
| 用户设置 | ✅ |
| 资料更新 | ✅ |
| 密码修改 | ✅ |
| 数据导入/导出 | ✅ |
| 图片上传 | ✅ |
| API 接口 | ✅ |
| 公共图库 | ✅ |

## 文档链接

完整文档: https://sun-panel-doc.enianteam.com/zh_cn