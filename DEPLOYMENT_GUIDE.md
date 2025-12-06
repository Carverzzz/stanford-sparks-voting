# 部署指南 / Deployment Guide

## 📋 项目功能总结

这是一个**"两真一假"（Two Truths One Lie）实时投票系统**，包含三个核心场景：

1. **手机投票界面** (`/vote`) - 50个参与者扫描二维码进入，选择哪个陈述是谎言
2. **大屏幕显示界面** (`/display`) - 实时显示投票结果，哪个选项被选最多，流式更新
3. **后台控制界面** (`/host`) - 管理员控制投票流程：开启/关闭投票，选择参与者开始游戏

## 🚀 快速开始

### 第一步：Supabase 设置

1. **登录 Supabase**
   - 访问 https://app.supabase.com
   - 使用你的账号登录（如果没有账号，免费注册）

2. **创建新项目**
   - 点击 "New Project"
   - 填写项目名称（例如：`stanford-sparks`）
   - 选择区域（建议选择离你最近的）
   - 设置数据库密码（**请保存好这个密码**）
   - 点击 "Create new project"（等待2-3分钟创建完成）

3. **运行数据库 Schema**
   - 在 Supabase Dashboard 中，点击左侧菜单的 **SQL Editor**
   - 点击 "New query"
   - 打开项目中的 `supabase_schema.sql` 文件
   - 复制全部内容，粘贴到 SQL Editor
   - 点击 "Run" 执行（应该看到 "Success. No rows returned"）

4. **获取 API 密钥**
   - 在 Supabase Dashboard 中，点击左侧菜单的 **Settings** → **API**
   - 找到以下信息：
     - **Project URL**: `https://xxxxx.supabase.co`
     - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **保存这两个值，下一步需要用到**

5. **启用 Realtime（重要！）**
   - 在 Supabase Dashboard 中，点击左侧菜单的 **Database** → **Replication**
   - 确保 `rounds` 和 `votes` 表都启用了 Realtime
   - 如果未启用，点击表名旁边的开关启用

### 第二步：本地开发环境设置

1. **安装依赖**
   ```bash
   cd stanford-sparks---two-truths-one-lie
   npm install
   ```

2. **配置环境变量**
   - 在项目根目录创建 `.env` 文件（注意：文件名前面有个点）
   - 添加以下内容：
     ```
     VITE_SUPABASE_URL=https://你的项目ID.supabase.co
     VITE_SUPABASE_ANON_KEY=你的anon密钥
     ```
   - 将 `你的项目ID` 和 `你的anon密钥` 替换为第一步获取的值

3. **启动开发服务器**
   ```bash
   npm run dev
   ```
   - 浏览器打开 http://localhost:3000
   - 测试三个界面：
     - http://localhost:3000/#/host - 后台控制
     - http://localhost:3000/#/display - 大屏幕
     - http://localhost:3000/#/vote - 手机投票

### 第三步：Vercel 部署

1. **准备代码仓库**
   - 将代码推送到 GitHub（如果还没有）
   - 确保 `.env` 文件**不要**提交到 Git（应该已经在 `.gitignore` 中）

2. **在 Vercel 部署**
   - 访问 https://vercel.com
   - 使用你的账号登录（如果没有，用 GitHub 账号注册）
   - 点击 "Add New..." → "Project"
   - 导入你的 GitHub 仓库
   - 在 "Configure Project" 页面：
     - **Framework Preset**: Vite
     - **Root Directory**: `stanford-sparks---two-truths-one-lie`（如果项目在子目录）
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

3. **设置环境变量**
   - 在 Vercel 项目设置中，点击 **Settings** → **Environment Variables**
   - 添加两个环境变量：
     - `VITE_SUPABASE_URL` = 你的 Supabase Project URL
     - `VITE_SUPABASE_ANON_KEY` = 你的 Supabase anon key
   - 点击 "Save"

4. **部署**
   - 点击 "Deploy" 按钮
   - 等待部署完成（通常1-2分钟）
   - 部署完成后，你会得到一个 URL，例如：`https://your-project.vercel.app`

5. **更新二维码 URL**
   - 部署完成后，访问 `https://your-project.vercel.app/#/display`
   - 大屏幕会自动显示正确的二维码（使用部署后的 URL）

## 📱 使用流程

### 管理员操作（后台控制界面）

1. **准备 Excel 文件**
   - Excel 格式要求：
     | Name | Statement 1 | Statement 2 | Statement 3 | Lie Index |
     |------|-------------|-------------|-------------|-----------|
     | 张三 | 我今年25岁 | 我喜欢吃苹果 | 我会说5种语言 | 3 |
   - `Lie Index` 列：1、2 或 3，表示哪个陈述是谎言

2. **开始游戏**
   - 打开后台控制界面：`https://your-app.vercel.app/#/host`
   - 点击 "Import Excel" 上传参与者文件
   - 点击参与者名字创建投票轮次
   - 点击 "Start Timer" 开始投票
   - 点击 "Lock Vote" 锁定投票
   - 点击 "Reveal" 揭示答案
   - 点击 "End Round" 结束当前轮次

### 参与者操作（手机投票）

1. **扫描二维码**
   - 在大屏幕上显示二维码
   - 用手机扫描
   - 自动跳转到投票界面

2. **投票**
   - 看到三个陈述选项
   - 选择你认为的**谎言**
   - 投票后等待结果

### 大屏幕显示

- 自动显示当前投票状态
- 实时更新投票统计
- 显示哪个选项被选最多
- 揭示答案时高亮显示正确答案

## 🔧 需要的 API 和账号信息清单

### ✅ 你已经有的：
- [x] Supabase 账号
- [x] Vercel 账号

### 📝 你需要提供的：

1. **Supabase 项目信息**
   - Project URL: `https://xxxxx.supabase.co`
   - Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - （在 Supabase Dashboard → Settings → API 获取）

2. **部署后的 URL**
   - Vercel 会自动生成，例如：`https://your-project.vercel.app`
   - 这个 URL 会用于生成二维码

### 🔑 不需要额外的 API：
- ✅ 二维码生成：使用免费的 QR Server API（无需账号）
- ✅ 实时通信：使用 Supabase Realtime（已包含）
- ✅ 数据库：使用 Supabase PostgreSQL（已包含）

## 🐛 常见问题

### 1. 投票不实时更新？
- 检查 Supabase Realtime 是否启用（Database → Replication）
- 检查浏览器控制台是否有错误

### 2. 二维码无法扫描？
- 确保部署后的 URL 是 HTTPS（Vercel 默认提供）
- 检查手机网络连接

### 3. 50人同时投票会卡吗？
- Supabase 免费版支持足够的并发连接
- 如果遇到性能问题，考虑升级 Supabase 计划

### 4. 环境变量不生效？
- Vercel 部署后需要重新部署才能应用新的环境变量
- 检查环境变量名称是否正确（`VITE_` 前缀）

## 📞 技术支持

如果遇到问题：
1. 检查浏览器控制台错误信息
2. 检查 Supabase Dashboard 的 Logs
3. 检查 Vercel 的 Deployment Logs

---

**最后更新**: 2025-01-03

