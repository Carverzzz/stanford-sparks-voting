# ✅ 设置检查清单 / Setup Checklist

## 第一步：Supabase 数据库设置

- [ ] 1. 登录 Supabase Dashboard: https://app.supabase.com/project/fcnwowdnjpkcfxmtceqw
- [ ] 2. 打开 **SQL Editor** → **New query**
- [ ] 3. 复制 `supabase_schema.sql` 的全部内容
- [ ] 4. 粘贴到 SQL Editor 并点击 **Run**
- [ ] 5. 确认看到 "Success" 消息
- [ ] 6. 打开 **Database** → **Replication**
- [ ] 7. 确认 `rounds` 和 `votes` 表的 Realtime 开关已打开

## 第二步：本地环境配置

- [x] 1. `.env` 文件已创建（包含你的 Supabase 配置）
- [ ] 2. 运行 `npm install` 安装依赖
- [ ] 3. 运行 `npm run dev` 启动开发服务器
- [ ] 4. 访问 http://localhost:3000 测试界面

## 第三步：测试功能

- [ ] 1. 访问 http://localhost:3000/#/host - 后台控制界面
- [ ] 2. 访问 http://localhost:3000/#/display - 大屏幕界面（应该显示二维码）
- [ ] 3. 访问 http://localhost:3000/#/vote - 投票界面
- [ ] 4. 在后台控制界面，上传一个测试 Excel 文件
- [ ] 5. 选择一个参与者，创建投票轮次
- [ ] 6. 点击 "Start Timer" 开始投票
- [ ] 7. 在投票界面测试投票功能

## 第四步：Vercel 部署

- [ ] 1. 将代码推送到 GitHub
- [ ] 2. 在 Vercel 导入项目
- [ ] 3. 在 Vercel Settings → Environment Variables 添加：
  - `VITE_SUPABASE_URL` = `https://fcnwowdnjpkcfxmtceqw.supabase.co`
  - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（完整密钥）
- [ ] 4. 部署项目
- [ ] 5. 测试部署后的 URL

## 📝 Excel 文件格式

准备一个测试 Excel 文件，格式如下：

| Name | Statement 1 | Statement 2 | Statement 3 | Lie Index |
|------|-------------|-------------|-------------|-----------|
| 张三 | 我今年25岁 | 我喜欢吃苹果 | 我会说5种语言 | 3 |

**注意**: `Lie Index` 必须是 1、2 或 3，表示哪个陈述是谎言。

## 🆘 遇到问题？

查看 `CONFIG.md` 获取详细配置说明，或查看 `DEPLOYMENT_GUIDE.md` 获取完整部署指南。

