# 🚀 快速部署到 Vercel

## ✅ 已完成的配置

- ✅ 根路径 `/` 直接进入投票界面
- ✅ 二维码扫描后直接进入投票界面（无需选择）
- ✅ Vercel 配置文件已就绪

## 📋 部署步骤（3步）

### 1. 推送代码到 GitHub

```bash
cd stanford-sparks---two-truths-one-lie
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

### 2. 在 Vercel 部署

1. 访问 https://vercel.com，用 GitHub 登录
2. 点击 **Add New...** → **Project**
3. 选择你的仓库，点击 **Import**
4. **配置**：
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **添加环境变量**：
   - `VITE_SUPABASE_URL` = `https://fcnwowdnjpkcfxmtceqw.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（完整密钥）
6. 点击 **Deploy**

### 3. 获取 URL

部署完成后，你会得到类似这样的 URL：
- `https://your-project.vercel.app`

## 📱 访问地址

- **投票界面（默认）**: `https://your-project.vercel.app/`
- **后台控制**: `https://your-project.vercel.app/#/host`
- **大屏幕**: `https://your-project.vercel.app/#/display`

## 🎯 二维码功能

- 大屏幕上的二维码指向根路径
- 扫描后**直接进入投票界面**，无需选择
- 自动适配部署后的 URL

---

详细说明见 `VERCEL_DEPLOY.md`

