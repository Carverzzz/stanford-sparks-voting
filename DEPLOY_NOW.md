# 🚀 立即部署到 Vercel

## ✅ 你的账号信息

- **GitHub**: https://github.com/Carverzzz
- **Vercel**: https://vercel.com/carverzs-projects
- ✅ 账号已关联

## 📋 部署步骤

### 第一步：在 GitHub 创建仓库并推送代码

1. **在 GitHub 创建新仓库**
   - 访问 https://github.com/new
   - Repository name: `stanford-sparks-voting` (或你喜欢的名字)
   - 选择 **Public** 或 **Private**
   - **不要**勾选 "Initialize this repository with a README"
   - 点击 **Create repository**

2. **推送代码到 GitHub**
   
   在终端运行：
   ```bash
   cd /Users/carverz/Downloads/251203_Stanford_Spark_SCPA/stanford-sparks---two-truths-one-lie
   
   # 初始化 Git（如果还没有）
   git init
   
   # 添加所有文件
   git add .
   
   # 提交
   git commit -m "Initial commit: Stanford Sparks voting system"
   
   # 添加远程仓库（替换 YOUR_REPO_NAME 为你的仓库名）
   git remote add origin https://github.com/Carverzzz/YOUR_REPO_NAME.git
   
   # 推送代码
   git branch -M main
   git push -u origin main
   ```

### 第二步：在 Vercel 部署

1. **访问 Vercel Dashboard**
   - 打开 https://vercel.com/carverzs-projects
   - 点击 **Add New...** → **Project**

2. **导入 GitHub 仓库**
   - 在仓库列表中找到你刚创建的仓库
   - 点击 **Import**

3. **配置项目**
   - **Framework Preset**: 选择 **Vite**（应该会自动检测）
   - **Root Directory**: 如果项目在子目录，填写 `stanford-sparks---two-truths-one-lie`，否则留空
   - **Build Command**: `npm run build`（默认）
   - **Output Directory**: `dist`（默认）
   - **Install Command**: `npm install`（默认）

4. **添加环境变量** ⚠️ 重要！
   
   在 **Environment Variables** 部分，点击 **Add** 添加：
   
   **变量 1:**
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://fcnwowdnjpkcfxmtceqw.supabase.co`
   - Environment: ✅ Production ✅ Preview ✅ Development（全部勾选）
   
   **变量 2:**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbndvd2RuanBrY2Z4bXRjZXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTIzOTEsImV4cCI6MjA4MDMyODM5MX0.VeyjA4zEfbNpPTd719l8nSYHrGg7ocGq51e-oj71-Z4`
   - Environment: ✅ Production ✅ Preview ✅ Development（全部勾选）

5. **部署**
   - 点击 **Deploy** 按钮
   - 等待 1-2 分钟，部署完成

### 第三步：获取部署 URL

部署完成后，你会看到：
- **Production URL**: `https://your-project.vercel.app`
- 这个 URL 就是你的应用地址

## 📱 访问地址

部署完成后，访问：

- **投票界面（默认）**: `https://your-project.vercel.app/`
- **后台控制**: `https://your-project.vercel.app/#/host`
- **大屏幕**: `https://your-project.vercel.app/#/display`

## ✅ 部署后检查

1. ✅ 访问根路径，应该直接进入投票界面
2. ✅ 访问 `/host`，应该打开后台控制界面
3. ✅ 访问 `/display`，应该显示大屏幕和二维码
4. ✅ 扫描二维码，应该直接进入投票界面

## 🔄 更新代码

以后更新代码时：
1. 修改代码
2. 提交并推送到 GitHub：
   ```bash
   git add .
   git commit -m "Update description"
   git push
   ```
3. Vercel 会自动检测并重新部署

## 🎯 快速命令

如果需要快速推送代码，可以使用：

```bash
cd /Users/carverz/Downloads/251203_Stanford_Spark_SCPA/stanford-sparks---two-truths-one-lie
git add .
git commit -m "Update"
git push
```

---

**现在就开始部署吧！** 🚀

