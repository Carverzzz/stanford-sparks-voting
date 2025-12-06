# 配置说明 / Configuration Guide

## ✅ 你的 Supabase 配置信息

```
URL: https://fcnwowdnjpkcfxmtceqw.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbndvd2RuanBrY2Z4bXRjZXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTIzOTEsImV4cCI6MjA4MDMyODM5MX0.VeyjA4zEfbNpPTd719l8nSYHrGg7ocGq51e-oj71-Z4
```

## 📝 本地开发配置

### 1. 创建 `.env` 文件

在项目根目录 `stanford-sparks---two-truths-one-lie/` 创建 `.env` 文件，内容如下：

```env
VITE_SUPABASE_URL=https://fcnwowdnjpkcfxmtceqw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbndvd2RuanBrY2Z4bXRjZXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTIzOTEsImV4cCI6MjA4MDMyODM5MX0.VeyjA4zEfbNpPTd719l8nSYHrGg7ocGq51e-oj71-Z4
```

### 2. 运行数据库 Schema

1. 打开 Supabase Dashboard: https://app.supabase.com/project/fcnwowdnjpkcfxmtceqw
2. 点击左侧菜单 **SQL Editor**
3. 点击 **New query**
4. 打开项目中的 `supabase_schema.sql` 文件
5. 复制全部内容，粘贴到 SQL Editor
6. 点击 **Run** 执行

### 3. 启用 Realtime

1. 在 Supabase Dashboard，点击 **Database** → **Replication**
2. 确保 `rounds` 和 `votes` 表都启用了 Realtime（开关打开）

### 4. 启动开发服务器

```bash
cd stanford-sparks---two-truths-one-lie
npm install
npm run dev
```

访问 http://localhost:3000

## 🚀 Vercel 部署配置

### 在 Vercel 设置环境变量

1. 登录 Vercel Dashboard
2. 选择你的项目
3. 进入 **Settings** → **Environment Variables**
4. 添加以下两个环境变量：

**变量 1:**
- Name: `VITE_SUPABASE_URL`
- Value: `https://fcnwowdnjpkcfxmtceqw.supabase.co`
- Environment: Production, Preview, Development (全部勾选)

**变量 2:**
- Name: `VITE_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbndvd2RuanBrY2Z4bXRjZXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTIzOTEsImV4cCI6MjA4MDMyODM5MX0.VeyjA4zEfbNpPTd719l8nSYHrGg7ocGq51e-oj71-Z4`
- Environment: Production, Preview, Development (全部勾选)

5. 保存后，重新部署项目（Redeploy）

## ✅ 验证配置

配置完成后，访问：
- 后台控制: `http://localhost:3000/#/host` (本地) 或 `https://your-app.vercel.app/#/host` (部署后)
- 大屏幕: `http://localhost:3000/#/display`
- 投票界面: `http://localhost:3000/#/vote`

如果看到界面正常加载，说明配置成功！

