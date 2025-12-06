-- Stanford Sparks: Participants Table
-- 运行这个 SQL 来创建参与者表
-- 用于存储从 CSV/Excel 导入的参与者数据

-- Participants table: Stores participant data imported from CSV/Excel
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  statement_1 TEXT NOT NULL,
  statement_2 TEXT NOT NULL,
  statement_3 TEXT NOT NULL,
  lie_index INTEGER NOT NULL CHECK (lie_index >= 0 AND lie_index <= 2),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(name, session_id) -- 同一活动内不能有重名
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_participants_session_id ON participants(session_id);
CREATE INDEX IF NOT EXISTS idx_participants_name ON participants(name);
CREATE INDEX IF NOT EXISTS idx_participants_created_at ON participants(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow public read access
CREATE POLICY "Allow public read access to participants"
  ON participants FOR SELECT
  USING (true);

-- RLS Policies: Allow public insert access (for importing)
CREATE POLICY "Allow public insert access to participants"
  ON participants FOR INSERT
  WITH CHECK (true);

-- RLS Policies: Allow public update access
CREATE POLICY "Allow public update access to participants"
  ON participants FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- RLS Policies: Allow public delete access
CREATE POLICY "Allow public delete access to participants"
  ON participants FOR DELETE
  USING (true);

-- Enable Realtime for participants table
DO $$ 
BEGIN
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE participants';
EXCEPTION WHEN OTHERS THEN
  -- 忽略错误，表可能已经在 publication 中
  NULL;
END $$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_participants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_participants_updated_at ON participants;
CREATE TRIGGER update_participants_updated_at
  BEFORE UPDATE ON participants
  FOR EACH ROW
  EXECUTE FUNCTION update_participants_updated_at();

