# SunPanel - Cloudflare 导航面板

专为 Cloudflare Workers 免费环境优化的个人导航面板应用。

## 功能特性

### 前台功能

- **分组管理** - 支持多层级分组，清晰组织您的网站链接
- **图标自定义** - 集成 Iconify 图标库，丰富的图标选择
- **主题切换** - 支持浅色、深色、自动三种主题模式
- **智能搜索** - 内置搜索功能，支持自定义搜索引擎
- **响应式设计** - 完美适配桌面端和移动端设备

### 后台管理

- **个人信息管理** - 管理账号信息和头像
- **个性化设置** - 自定义主题、壁纸、布局样式
- **分组管理** - 创建、编辑、删除分组结构
- **网站管理** - 添加、编辑、删除导航链接
- **图库管理** - 支持图片上传和管理
- **数据迁移** - 导出/导入配置数据
- **API 管理** - 提供 RESTful API 接口
- **公共图库** - 共享图片资源

## 快速部署

### 前置条件

- Node.js 18+
- Cloudflare 账号
- Wrangler CLI (`npm install -g wrangler`)

### 部署步骤

1. **登录 Cloudflare**
   ```bash
   wrangler login
   ```

2. **创建 D1 数据库**
   ```bash
   wrangler d1 create sunpanel-db
   ```
   复制返回的 `database_id`。

3. **创建 KV 命名空间**
   ```bash
   wrangler kv:namespace create IMAGES_KV
   ```
   复制返回的 `id`。

4. **配置 wrangler.toml**
   ```toml
   name = "sunpanel"
   main = "worker/index.ts"
   compatibility_date = "2024-01-01"
   compatibility_flags = ["nodejs_compat"]

   [[d1_databases]]
   binding = "SUNPANEL_DB"
   database_name = "sunpanel-db"
   database_id = "您的 database_id"

   [[kv_namespaces]]
   binding = "IMAGES_KV"
   id = "您的 kv_id"

   [vars]
   ENVIRONMENT = "production"

   [assets]
   directory = "./frontend/dist"
   binding = "ASSETS"
   not_found_handling = "single-page-application"
   ```

5. **设置管理员密码**
   ```bash
   wrangler secret put ADMIN_PASSWORD
   ```

6. **安装依赖并构建**
   ```bash
   npm install
   cd frontend && npm install && cd ..
   npm run build
   ```

7. **执行数据库迁移**
   ```bash
   wrangler d1 migrations apply sunpanel-db
   ```

8. **部署到 Cloudflare**
   ```bash
   wrangler deploy
   ```

### 访问应用

部署成功后，访问 `https://您的名字.您的账号.workers.dev`，使用：
- 用户名：`admin`
- 密码：您设置的 `ADMIN_PASSWORD`

## 本地开发

```bash
# 启动前端开发服务器
npm run dev

# 启动 Workers 本地预览
npm run dev:worker
```

## 项目结构

| 目录/文件 | 说明 |
|-----------|------|
| `frontend/` | Vue 3 前端源码 |
| `worker/` | Cloudflare Workers 后端代码 |
| `migrations/` | D1 数据库迁移脚本 |
| `wrangler.toml` | Cloudflare 配置文件 |

## 技术栈

- **前端**: Vue 3 + Vite + TypeScript + TailwindCSS
- **后端**: Cloudflare Workers (TypeScript)
- **数据库**: Cloudflare D1

## 常见问题

**Q: 部署后显示 500 错误？**
- 检查 `wrangler.toml` 中的 D1 数据库 id 是否正确
- 确认已执行 `wrangler login` 登录

**Q: 登录显示账号密码错误？**
- 默认用户名：`admin`
- 密码通过 `wrangler secret put ADMIN_PASSWORD` 设置

**Q: 如何修改管理员密码？**
- 运行 `wrangler secret put ADMIN_PASSWORD` 设置新密码
- 重新部署：`wrangler deploy`

**Q: 免费版有什么限制？**
- Workers: 100,000 请求/天
- D1: 1GB 存储、100,000 读取/天、1,000 写入/天

## 许可证

MIT License