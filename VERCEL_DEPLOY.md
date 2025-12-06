# Vercel 部署指南 / Vercel Deployment Guide

## 🚀 快速部署步骤

### 第一步：准备代码仓库

1. **初始化 Git（如果还没有）**
   ```bash
   cd stanford-sparks---two-truths-one-lie
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **推送到 GitHub**
   - 在 GitHub 创建新仓库
   - 推送代码：
     ```bash
     git remote add origin https://github.com/你的用户名/你的仓库名.git
     git branch -M main
     git push -u origin main
     ```

### 第二步：在 Vercel 部署

1. **登录 Vercel**
   - 访问 https://vercel.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 **Add New...** → **Project**
   - 选择你的 GitHub 仓库
   - 点击 **Import**

3. **配置项目**
   - **Framework Preset**: 选择 **Vite**
   - **Root Directory**: 如果项目在子目录，填写 `stanford-sparks---two-truths-one-lie`，否则留空
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **设置环境变量**
   - 在 **Environment Variables** 部分，添加：
     - **Name**: `VITE_SUPABASE_URL`
     - **Value**: `https://fcnwowdnjpkcfxmtceqw.supabase.co`
     - **Environment**: Production, Preview, Development（全部勾选）
   
   - 再添加：
     - **Name**: `VITE_SUPABASE_ANON_KEY`
     - **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbndvd2RuanBrY2Z4bXRjZXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTIzOTEsImV4cCI6MjA4MDMyODM5MX0.VeyjA4zEfbNpPTd719l8nSYHrGg7ocGq51e-oj71-Z4`
     - **Environment**: Production, Preview, Development（全部勾选）

5. **部署**
   - 点击 **Deploy** 按钮
   - 等待部署完成（通常 1-2 分钟）

### 第三步：获取部署 URL

部署完成后，你会得到一个 URL，例如：
- `https://your-project.vercel.app`

## 📱 访问地址

部署后，各个界面的访问地址：

- **投票界面（默认）**: `https://your-project.vercel.app/`
- **后台控制**: `https://your-project.vercel.app/#/host`
- **大屏幕**: `https://your-project.vercel.app/#/display`

## 🔗 二维码功能

- **二维码会自动生成**，指向根路径（投票界面）
- 扫描二维码后**直接进入投票界面**，无需选择
- 大屏幕界面 (`/display`) 会自动显示正确的二维码

## ✅ 部署后检查清单

- [ ] 环境变量已正确设置
- [ ] 部署成功，没有错误
- [ ] 访问根路径 `/` 直接进入投票界面
- [ ] 访问 `/host` 可以打开后台控制
- [ ] 访问 `/display` 可以打开大屏幕
- [ ] 大屏幕上的二维码可以正常扫描
- [ ] 扫描二维码后直接进入投票界面

## 🔄 更新部署

每次推送代码到 GitHub 后，Vercel 会自动重新部署。

也可以手动触发：
- 在 Vercel Dashboard 中，点击项目
- 点击 **Deployments** 标签
- 点击 **Redeploy**

## 🐛 常见问题

### 1. 环境变量不生效？

- 确保变量名是 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`（注意 `VITE_` 前缀）
- 重新部署项目（环境变量更改后需要重新部署）

### 2. 构建失败？

- 检查 `package.json` 中的依赖是否正确
- 查看 Vercel 的构建日志
- 确保 Node.js 版本兼容（Vercel 默认使用 Node.js 18+）

### 3. 路由不工作？

- 确认 `vercel.json` 文件存在且配置正确
- 使用 HashRouter（`#/`）而不是 BrowserRouter，这样 Vercel 路由才能正常工作

### 4. 二维码指向错误？

- 大屏幕界面会自动检测当前 URL 并生成二维码
- 如果二维码不正确，检查浏览器地址栏的完整 URL

## 📝 自定义域名（可选）

如果需要使用自定义域名：

1. 在 Vercel Dashboard 中，进入项目设置
2. 点击 **Domains**
3. 添加你的域名
4. 按照提示配置 DNS 记录

---

**部署完成后，就可以开始使用了！** 🎉

