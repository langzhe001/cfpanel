# SunPanel Cloudflare - 导航面板

专为 Cloudflare Workers 免费环境优化的导航面板。

## 功能特性

### 前台功能
- 分组显示功能 - 支持多层级分组管理
- 图标自定义显示 - 支持 Iconify 图标库
- 主题个性化 - 浅色/深色/自动模式
- 搜索栏 - 可自定义搜索引擎
- 响应式布局 - 适配各种设备

### 后台功能
- 个人信息管理
- 个性化设置（主题、壁纸、布局）
- 分组管理
- 网站项目管理
- 图库管理（支持图片上传）
- 导出/导入配置
- API
- 公共图库

## 免费部署详细教程

### 第一步：准备工作

1. **注册 Cloudflare 账号**
   - 访问 https://dash.cloudflare.com/
   - 使用邮箱注册（支持 Gmail、QQ邮箱等）

2. **安装 Wrangler CLI**
   - 打开终端（Windows 用户建议使用 PowerShell 或 Git Bash）
   - 运行以下命令：
   ```bash
   npm install -g wrangler
   ```

3. **登录 Cloudflare**
   ```bash
   wrangler login
   ```
   - 浏览器会自动打开 Cloudflare 登录页面
   - 完成登录授权

### 第二步：创建 D1 数据库

1. **创建 D1 数据库**
   ```bash
   wrangler d1 create sunpanel-db
   ```
   - 会返回类似 `database_id = "xxxxxxxxxxxxxxxx"` 的结果
   - **复制这个 id，后面会用到**

### 第三步：修改配置文件

1. **编辑 wrangler.toml 文件**

   打开项目根目录下的 `wrangler.toml`，修改以下内容：

   ```toml
   name = "sunpanel"  # 改成你喜欢的名字，会成为你的 worker URL 前缀
   main = "worker/index.ts"
   compatibility_date = "2024-01-01"
   compatibility_flags = ["nodejs_compat"]

   [[d1_databases]]
   binding = "SUNPANEL_DB"
   database_name = "sunpanel-db"
   id = "这里粘贴第二步复制的database_id"

   [vars]
   ENVIRONMENT = "production"
   ```

2. **设置管理员密码**
   
   通过环境变量设置密码（不建议在配置文件中明文存储）：
   ```bash
   wrangler secret put ADMIN_PASSWORD
   ```
   按提示输入你想要的密码

### 第四步：安装依赖

```bash
# 在项目根目录运行
npm install

# 安装前端依赖
cd frontend
npm install
cd ..
```

### 第五步：执行数据库迁移

```bash
wrangler d1 migrations apply sunpanel-db
```

### 第六步：构建前端

```bash
npm run build
```

这会生成 `frontend/dist` 文件夹，里面是静态网站文件。

### 第七步：部署到 Cloudflare

```bash
wrangler deploy
```

如果成功，你会看到类似：
```
Successfully deployed to https://sunpanel.xxx.workers.dev
```

### 第八步：开始使用

1. 打开你获得的 URL（格式：`https://你的名字.你的账号.workers.dev`）
2. 点击右上角「登录」
3. 用户名：`admin`
4. 密码：你通过 `wrangler secret put ADMIN_PASSWORD` 设置的密码

### 进阶：绑定自定义域名（可选）

如果你有自己的域名：

1. 在 Cloudflare Dashboard 添加域名
2. 进入 Workers & Pages
3. 选择你的 Worker
4. 点击「触发器」→ 「自定义域」
5. 输入你的域名

## 本地开发

```bash
# 启动前端开发服务器（会自动代理 API 请求）
npm run dev

# 启动 Workers 本地预览
npm run dev:worker
```

## 文件说明

| 文件/文件夹 | 说明 |
|------------|------|
| `frontend/` | Vue 3 前端源码 |
| `worker/` | Cloudflare Workers 后端代码 |
| `wrangler.toml` | Cloudflare 配置文件 |
| `migrations/` | 数据库迁移脚本 |

## 常见问题

### Q: 部署后显示 500 错误？
检查 `wrangler.toml` 中的 D1 数据库 id 是否正确，以及是否登录了 wrangler。

### Q: 登录显示账号密码错误？
默认管理员：
- 用户名：`admin`
- 密码：通过 `wrangler secret put ADMIN_PASSWORD` 设置的密码

### Q: 如何修改管理员密码？
运行 `wrangler secret put ADMIN_PASSWORD` 设置新密码，然后重新部署。

### Q: 可以在本地运行吗？
可以，但需要使用 Wrangler 模拟环境。运行 `npm run dev:worker` 启动预览。

### Q: 数据存储在哪里？
所有数据存储在 Cloudflare D1 数据库中。

### Q: 免费版有什么限制？
- Workers 有 100,000 请求/天
- D1 有 1GB 存储、100,000 次读取/天、1,000 次写入/天

### Q: Docker 功能在哪里？
Docker 管理功能在 Cloudflare Workers 环境中不可用（需要直接访问 Docker API）。

## 技术栈

- **前端**: Vue 3 + Vite + TypeScript + TailwindCSS
- **后端**: Cloudflare Workers (TypeScript)
- **数据库**: Cloudflare D1

## 许可证

MIT