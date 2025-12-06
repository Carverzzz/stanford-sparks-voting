# Stanford Sparks · Two Truths One Lie

A real-time interactive voting system built with React, Tailwind CSS, and Supabase.

## 🎯 项目功能 / Project Overview

这是一个**"两真一假"实时投票系统**，支持50+人同时参与投票：

- **手机投票界面** (`/vote`) - 参与者扫描二维码进入，选择哪个陈述是谎言
- **大屏幕显示界面** (`/display`) - 实时显示投票结果，流式更新，显示哪个选项被选最多
- **后台控制界面** (`/host`) - 管理员控制投票流程：开启/关闭投票，选择参与者开始游戏

**详细部署指南请查看**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 🚀 Getting Started

### 1. Prerequisites
- Node.js installed
- A [Supabase](https://supabase.com) account

### 2. Installation
```bash
npm install
```

### 3. Supabase Setup
1. Create a new Supabase project.
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Copy the contents of `supabase_schema.sql` and run it. This will:
   - Create tables (`users`, `rounds`, `votes`)
   - Enable Realtime
   - Set up Row Level Security (RLS)
4. Go to **Project Settings -> API**.
5. Copy the `Project URL` and `anon` public key.
6. Create a `.env` file in the root directory (copy `.env.example`) and fill in the values.

### 4. Running Locally
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### 5. Deployment (Vercel)
1. Push this repository to GitHub.
2. Import project into Vercel.
3. Add the Environment Variables (`REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`) in Vercel settings.
4. Deploy!

## 🎮 How to Play

### Host (Admin)
1. Go to `/admin` (e.g., `https://your-app.com/#/admin`).
2. Upload the Excel file (`.xlsx`) containing participants.
   - Format: `Name` | `Statement 1` | `Statement 2` | `Statement 3` | `Lie Index` (1-3)
3. Click a participant's name to prepare a round.
4. Click **Start Voting** to broadcast the round to all audience members.
5. Watch the live chart update as votes come in.
6. Click **Reveal Truth** to show the correct answer.

### Audience
1. Scan the QR code (pointing to `https://your-app.com/#/participant`).
2. The app automatically detects the current active round.
3. Vote for the statement you think is the LIE.
4. See the results revealed live!

## 🛠 Tech Stack
- **Frontend**: React, TailwindCSS, Framer Motion, Recharts
- **Backend**: Supabase (Database + Realtime)
- **Deployment**: Vercel
