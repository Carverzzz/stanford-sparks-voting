// 快速测试 Supabase 连接
// 运行: node test-connection.js

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { parse } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取 .env 文件
const envPath = join(__dirname, '.env');
let envVars = {};
try {
  const envFile = readFileSync(envPath, 'utf-8');
  envVars = parse(envFile);
} catch (err) {
  console.log('⚠️ 无法读取 .env 文件，使用硬编码的值');
  envVars = {
    VITE_SUPABASE_URL: 'https://fcnwowdnjpkcfxmtceqw.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbndvd2RuanBrY2Z4bXRjZXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTIzOTEsImV4cCI6MjA4MDMyODM5MX0.VeyjA4zEfbNpPTd719l8nSYHrGg7ocGq51e-oj71-Z4'
  };
}

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

console.log('🔗 测试 Supabase 连接...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // 测试 1: 检查 rounds 表是否存在
    console.log('\n📊 测试 1: 检查 rounds 表...');
    const { data: rounds, error: roundsError } = await supabase
      .from('rounds')
      .select('count')
      .limit(1);
    
    if (roundsError) {
      if (roundsError.code === 'PGRST116') {
        console.log('❌ rounds 表不存在！请先运行 supabase_schema.sql');
        return;
      }
      throw roundsError;
    }
    console.log('✅ rounds 表存在');

    // 测试 2: 检查 votes 表是否存在
    console.log('\n📊 测试 2: 检查 votes 表...');
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('count')
      .limit(1);
    
    if (votesError) {
      if (votesError.code === 'PGRST116') {
        console.log('❌ votes 表不存在！请先运行 supabase_schema.sql');
        return;
      }
      throw votesError;
    }
    console.log('✅ votes 表存在');

    // 测试 3: 检查 Realtime 是否启用
    console.log('\n📡 测试 3: 检查 Realtime 连接...');
    const channel = supabase.channel('test-channel');
    await channel.subscribe();
    console.log('✅ Realtime 连接正常');

    console.log('\n🎉 所有测试通过！Supabase 配置正确。');
    console.log('\n下一步:');
    console.log('1. 运行 npm run dev 启动开发服务器');
    console.log('2. 访问 http://localhost:3000/#/host 测试后台控制界面');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 连接失败:', error.message);
    console.error('\n请检查:');
    console.error('1. Supabase URL 和 Key 是否正确');
    console.error('2. 是否已运行 supabase_schema.sql');
    console.error('3. 网络连接是否正常');
    process.exit(1);
  }
}

testConnection();

