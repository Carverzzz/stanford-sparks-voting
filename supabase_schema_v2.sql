-- Stanford Sparks: Two Truths One Lie - Database Schema V2
-- 运行这个 SQL 来更新数据库结构
-- 如果已经运行过 v1，只需要运行这个文件来添加活动表

-- =====================================================
-- 新增：活动/会话表
-- =====================================================

-- Sessions table: Stores each event/session
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- Add session_id to rounds table (如果列不存在)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rounds' AND column_name = 'session_id') THEN
    ALTER TABLE rounds ADD COLUMN session_id UUID REFERENCES sessions(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rounds' AND column_name = 'voting_ends_at') THEN
    ALTER TABLE rounds ADD COLUMN voting_ends_at TIMESTAMPTZ;
  END IF;
END $$;

-- Poster mode flag on sessions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'poster_mode') THEN
    ALTER TABLE sessions ADD COLUMN poster_mode BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- Index for sessions
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_rounds_session_id ON rounds(session_id);

-- RLS for sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to sessions" ON sessions FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to sessions" ON sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to sessions" ON sessions FOR UPDATE USING (true) WITH CHECK (true);

-- Enable Realtime for sessions
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;

-- =====================================================
-- 确保 Realtime 启用
-- =====================================================

-- 重新确保 rounds 和 votes 的 Realtime 启用
-- (如果已经存在会报错，可以忽略)
DO $$ 
BEGIN
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE rounds';
EXCEPTION WHEN OTHERS THEN
  -- 忽略错误，表可能已经在 publication 中
  NULL;
END $$;

DO $$ 
BEGIN
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE votes';
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- =====================================================
-- 创建默认活动（如果不存在）
-- =====================================================

INSERT INTO sessions (id, name, is_active)
SELECT 
  '00000000-0000-0000-0000-000000000001'::UUID,
  'Default Session',
  true
WHERE NOT EXISTS (SELECT 1 FROM sessions WHERE id = '00000000-0000-0000-0000-000000000001');

-- 更新现有的 rounds，关联到默认活动
UPDATE rounds 
SET session_id = '00000000-0000-0000-0000-000000000001'
WHERE session_id IS NULL;

