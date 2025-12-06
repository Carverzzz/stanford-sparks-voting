# 🚀 命令行部署到 Vercel

## 步骤 1: 完成 Vercel 登录

如果还没有登录，运行：

```bash
cd /Users/carverz/Downloads/251203_Stanford_Spark_SCPA/stanford-sparks---two-truths-one-lie
vercel login
```

然后在浏览器中完成授权。

## 步骤 2: 部署（两种方式）

### 方式一：使用部署脚本（推荐）

```bash
cd /Users/carverz/Downloads/251203_Stanford_Spark_SCPA/stanford-sparks---two-truths-one-lie
./deploy.sh
```

### 方式二：手动部署

```bash
cd /Users/carverz/Downloads/251203_Stanford_Spark_SCPA/stanford-sparks---two-truths-one-lie

# 添加环境变量
vercel env add VITE_SUPABASE_URL production
# 输入: https://fcnwowdnjpkcfxmtceqw.supabase.co

vercel env add VITE_SUPABASE_URL preview
# 输入: https://fcnwowdnjpkcfxmtceqw.supabase.co

vercel env add VITE_SUPABASE_URL development
# 输入: https://fcnwowdnjpkcfxmtceqw.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# 输入: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbndvd2RuanBrY2Z4bXRjZXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTIzOTEsImV4cCI6MjA4MDMyODM5MX0.VeyjA4zEfbNpPTd719l8nSYHrGg7ocGq51e-oj71-Z4

vercel env add VITE_SUPABASE_ANON_KEY preview
# 输入: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbndvd2RuanBrY2Z4bXRjZXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTIzOTEsImV4cCI6MjA4MDMyODM5MX0.VeyjA4zEfbNpPTd719l8nSYHrGg7ocGq51e-oj71-Z4

vercel env add VITE_SUPABASE_ANON_KEY development
# 输入: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbndvd2RuanBrY2Z4bXRjZXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTIzOTEsImV4cCI6MjA4MDMyODM5MX0.VeyjA4zEfbNpPTd719l8nSYHrGg7ocGq51e-oj71-Z4

# 部署
vercel --yes --prod
```

## ✅ 部署完成后

你会得到一个 URL，例如：
- `https://stanford-sparks-voting.vercel.app`

访问地址：
- **投票界面**: `https://your-project.vercel.app/`
- **后台控制**: `https://your-project.vercel.app/#/host`
- **大屏幕**: `https://your-project.vercel.app/#/display`

## 🔄 更新部署

以后更新代码时：

```bash
git add .
git commit -m "Update"
git push
vercel --prod
```

---

**现在先完成 `vercel login`，然后运行 `./deploy.sh` 即可！**

