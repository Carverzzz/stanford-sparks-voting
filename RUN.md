# 运行指南 / How to Run

## 🚀 快速开始

### 第一步：检查环境变量

`.env` 文件已经创建好了，包含你的 Supabase 配置。确认一下：

```bash
cd stanford-sparks---two-truths-one-lie
cat .env
```

应该看到：
```
VITE_SUPABASE_URL=https://fcnwowdnjpkcfxmtceqw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 第二步：安装依赖

```bash
npm install
```

### 第三步：运行数据库 Schema（如果还没运行）

1. 打开 Supabase Dashboard: https://app.supabase.com/project/fcnwowdnjpkcfxmtceqw
2. 点击左侧菜单 **SQL Editor**
3. 点击 **New query**
4. 打开项目中的 `supabase_schema.sql` 文件
5. 复制全部内容，粘贴到 SQL Editor
6. 点击 **Run** 执行

### 第四步：启动开发服务器

```bash
npm run dev
```

应该看到类似输出：
```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 第五步：访问界面

打开浏览器访问：

- **后台控制**: http://localhost:3000/#/host
- **大屏幕**: http://localhost:3000/#/display  
- **投票界面**: http://localhost:3000/#/vote

## 📝 测试流程

### 1. 准备测试数据

**方式一：直接插入数据库**
- 打开 Supabase SQL Editor
- 运行 `test_data.sql` 文件

**方式二：使用 Excel 文件**
- 在后台控制界面 (`/host`) 点击 "Import Excel"
- 上传 `test_data_excel.csv`（需要先转换为 .xlsx 格式）

### 2. 开始游戏

1. 打开后台控制界面: http://localhost:3000/#/host
2. 选择一个参与者（如"张三"）
3. 点击 "Start Timer" 开始投票
4. 打开投票界面: http://localhost:3000/#/vote
5. 选择一个选项投票
6. 在大屏幕界面查看实时结果: http://localhost:3000/#/display
7. 在后台控制界面点击 "Reveal" 揭示答案

## 🔧 常见问题

### 端口被占用？

如果 3000 端口被占用，Vite 会自动使用下一个可用端口（如 3001）。查看终端输出确认实际端口。

### 环境变量不生效？

- 确保 `.env` 文件在项目根目录
- 确保变量名是 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`
- 重启开发服务器（Ctrl+C 然后重新运行 `npm run dev`）

### 数据库连接失败？

- 检查 `.env` 文件中的 Supabase URL 和 Key 是否正确
- 确认 Supabase 项目是否正常运行
- 检查网络连接

### 看不到实时更新？

- 确认 Supabase Realtime 已启用（Database → Replication）
- 检查浏览器控制台是否有错误
- 确认数据库 schema 已正确运行

## 📦 生产环境部署

部署到 Vercel 时：

1. 在 Vercel 项目设置中添加环境变量：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. 重新部署项目

详细步骤见 `DEPLOYMENT_GUIDE.md`

---

**现在就可以运行了！** 🎉


