-- Stanford Sparks: Two Truths One Lie - Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Rounds table: Stores each voting round
CREATE TABLE IF NOT EXISTS rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id TEXT,
  participant_name TEXT NOT NULL,
  options TEXT[] NOT NULL, -- Array of 3 statements
  correct_option_index INTEGER NOT NULL CHECK (correct_option_index >= 0 AND correct_option_index <= 2),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VOTING', 'LOCKED', 'REVEALED', 'COMPLETED')),
  voting_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Votes table: Stores individual votes
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL CHECK (option_index >= 0 AND option_index <= 2),
  user_session_id TEXT NOT NULL, -- Anonymous session identifier
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(round_id, user_session_id) -- Prevent duplicate votes per user per round
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rounds_status ON rounds(status);
CREATE INDEX IF NOT EXISTS idx_rounds_created_at ON rounds(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_votes_round_id ON votes(round_id);
CREATE INDEX IF NOT EXISTS idx_votes_created_at ON votes(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow public read access to active rounds
CREATE POLICY "Allow public read access to rounds"
  ON rounds FOR SELECT
  USING (true);

-- RLS Policies: Allow public insert access to votes
CREATE POLICY "Allow public insert access to votes"
  ON votes FOR INSERT
  WITH CHECK (true);

-- RLS Policies: Allow public read access to votes
CREATE POLICY "Allow public read access to votes"
  ON votes FOR SELECT
  USING (true);

-- RLS Policies: Allow service role to update rounds (for admin operations)
-- Note: In production, you might want to add authentication for admin operations
CREATE POLICY "Allow public update access to rounds"
  ON rounds FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- RLS Policies: Allow public insert access to rounds (for admin operations)
CREATE POLICY "Allow public insert access to rounds"
  ON rounds FOR INSERT
  WITH CHECK (true);

-- Enable Realtime for rounds and votes tables
ALTER PUBLICATION supabase_realtime ADD TABLE rounds;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_rounds_updated_at
  BEFORE UPDATE ON rounds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- View for aggregated vote counts per round
CREATE OR REPLACE VIEW round_vote_counts AS
SELECT 
  r.id as round_id,
  r.participant_name,
  r.options,
  r.correct_option_index,
  r.status,
  r.created_at,
  COALESCE(COUNT(CASE WHEN v.option_index = 0 THEN 1 END), 0) as votes_0,
  COALESCE(COUNT(CASE WHEN v.option_index = 1 THEN 1 END), 0) as votes_1,
  COALESCE(COUNT(CASE WHEN v.option_index = 2 THEN 1 END), 0) as votes_2,
  COUNT(v.id) as total_votes
FROM rounds r
LEFT JOIN votes v ON r.id = v.round_id
GROUP BY r.id, r.participant_name, r.options, r.correct_option_index, r.status, r.created_at;
