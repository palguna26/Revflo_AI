-- Supabase Migration: 20260309_decision_records.sql

-- 1. Add new columns to workspaces table
ALTER TABLE workspaces 
ADD COLUMN IF NOT EXISTS last_analyzed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS new_signals_count INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS workspace_settings JSONB NOT NULL DEFAULT '{}';

-- 2. Create decision_records table
CREATE TABLE IF NOT EXISTS decision_records (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id     UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  feature_id       UUID NOT NULL REFERENCES feature_recommendations(id) ON DELETE CASCADE,
  decision         TEXT NOT NULL, -- 'Approve' | 'Deprioritize' | 'Needs Research'
  reason           TEXT NOT NULL,
  consulted        TEXT,
  confidence_level TEXT NOT NULL, -- 'High Conviction' | 'Informed Bet' | 'Experiment'
  trade_offs       TEXT,          -- for "What you're not building"
  decided_by       TEXT NOT NULL, -- Email or Name of the authenticated user
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS decision_records_workspace_id ON decision_records(workspace_id);
CREATE INDEX IF NOT EXISTS decision_records_feature_id ON decision_records(feature_id);

-- 3. Row Level Security for decision_records
ALTER TABLE decision_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_decision_records" ON decision_records;
CREATE POLICY "tenant_decision_records" ON decision_records
  FOR ALL USING (workspace_id IN (SELECT public.get_user_workspace_ids()));
