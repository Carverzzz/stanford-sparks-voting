#!/bin/bash

# Stanford Sparks 部署脚本
# 使用方法: ./deploy.sh

cd "$(dirname "$0")"

echo "🚀 开始部署到 Vercel..."
echo ""

# 检查是否已登录
if ! vercel whoami &>/dev/null; then
    echo "⚠️  需要先登录 Vercel"
    echo "   运行: vercel login"
    echo "   然后在浏览器中完成授权"
    exit 1
fi

echo "✅ Vercel 已登录"
echo ""

# 添加环境变量
echo "📝 添加环境变量..."
vercel env add VITE_SUPABASE_URL production <<< "https://fcnwowdnjpkcfxmtceqw.supabase.co"
vercel env add VITE_SUPABASE_URL preview <<< "https://fcnwowdnjpkcfxmtceqw.supabase.co"
vercel env add VITE_SUPABASE_URL development <<< "https://fcnwowdnjpkcfxmtceqw.supabase.co"

vercel env add VITE_SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbndvd2RuanBrY2Z4bXRjZXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTIzOTEsImV4cCI6MjA4MDMyODM5MX0.VeyjA4zEfbNpPTd719l8nSYHrGg7ocGq51e-oj71-Z4"
vercel env add VITE_SUPABASE_ANON_KEY preview <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbndvd2RuanBrY2Z4bXRjZXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTIzOTEsImV4cCI6MjA4MDMyODM5MX0.VeyjA4zEfbNpPTd719l8nSYHrGg7ocGq51e-oj71-Z4"
vercel env add VITE_SUPABASE_ANON_KEY development <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbndvd2RuanBrY2Z4bXRjZXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTIzOTEsImV4cCI6MjA4MDMyODM5MX0.VeyjA4zEfbNpPTd719l8nSYHrGg7ocGq51e-oj71-Z4"

echo ""
echo "🚀 开始部署..."
vercel --yes --prod

echo ""
echo "✅ 部署完成！"
echo "   访问你的项目: https://vercel.com/carverzs-projects"

