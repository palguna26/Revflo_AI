-- RevFlo Schema Migration — Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- 1. Workspaces (multi-tenant root)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workspaces (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  owner_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 2. Workspace Members
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workspace_members (
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role         TEXT NOT NULL DEFAULT 'member',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (workspace_id, user_id)
);

-- ─────────────────────────────────────────────────────────────
-- 3. Integrations
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS integrations (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id   UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  type           TEXT NOT NULL, -- 'github' | 'linear' | 'stripe' | 'feedback'
  config         JSONB NOT NULL DEFAULT '{}',
  status         TEXT NOT NULL DEFAULT 'active',
  signal_count   INT NOT NULL DEFAULT 0,
  last_synced_at TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, type)
);

-- ─────────────────────────────────────────────────────────────
-- 4. Product Signals (normalized from all sources)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_signals (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  signal_type  TEXT NOT NULL, -- 'feature_request' | 'bug_report' | 'revenue_event' | 'churn_event' | 'feature_shipped' | 'usage_pattern'
  source       TEXT NOT NULL, -- 'github' | 'linear' | 'stripe' | 'feedback'
  content      TEXT NOT NULL,
  metadata     JSONB NOT NULL DEFAULT '{}',
  timestamp    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS product_signals_workspace_id ON product_signals(workspace_id);
CREATE INDEX IF NOT EXISTS product_signals_source ON product_signals(workspace_id, source);
CREATE INDEX IF NOT EXISTS product_signals_type ON product_signals(workspace_id, signal_type);

-- ─────────────────────────────────────────────────────────────
-- 5. Insights
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS insights (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id     UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT NOT NULL,
  insight_type     TEXT NOT NULL DEFAULT 'opportunity', -- 'opportunity' | 'risk' | 'trend'
  confidence_score INT NOT NULL DEFAULT 0,
  evidence_signals JSONB NOT NULL DEFAULT '[]',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS insights_workspace_id ON insights(workspace_id);

-- ─────────────────────────────────────────────────────────────
-- 6. Feature Recommendations
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feature_recommendations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  insight_id      UUID REFERENCES insights(id) ON DELETE SET NULL,
  feature_name    TEXT NOT NULL,
  description     TEXT NOT NULL,
  reasoning       TEXT NOT NULL,
  expected_impact TEXT NOT NULL,
  priority_score  INT NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'proposed', -- 'proposed' | 'accepted' | 'rejected'
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS feature_recommendations_workspace_id ON feature_recommendations(workspace_id);

-- ─────────────────────────────────────────────────────────────
-- 7. PRDs
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prds (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id             UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  feature_id               UUID REFERENCES feature_recommendations(id) ON DELETE CASCADE,
  problem                  TEXT NOT NULL,
  solution                 TEXT NOT NULL,
  user_flows               TEXT NOT NULL,
  technical_considerations TEXT NOT NULL,
  success_metrics          TEXT NOT NULL,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 8. Engineering Plans
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS engineering_plans (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id   UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  prd_id         UUID REFERENCES prds(id) ON DELETE CASCADE,
  backend_tasks  JSONB NOT NULL DEFAULT '[]',
  frontend_tasks JSONB NOT NULL DEFAULT '[]',
  database_tasks JSONB NOT NULL DEFAULT '[]',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 9. Agent Workflows
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_workflows (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  feature_id   UUID REFERENCES feature_recommendations(id) ON DELETE SET NULL,
  status       TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'running' | 'done' | 'failed'
  steps        JSONB NOT NULL DEFAULT '[]',
  result       JSONB NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────
ALTER TABLE workspaces          ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_signals     ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights            ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE prds                ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_plans   ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_workflows     ENABLE ROW LEVEL SECURITY;

-- Helper function: return workspace IDs accessible to current user
CREATE OR REPLACE FUNCTION public.get_user_workspace_ids()
RETURNS SETOF UUID
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$
  SELECT workspace_id
  FROM workspace_members
  WHERE user_id = auth.uid()
  UNION
  SELECT id FROM workspaces WHERE owner_id = auth.uid()
$$;

-- Workspace policies
DROP POLICY IF EXISTS "workspaces_select" ON workspaces;
CREATE POLICY "workspaces_select" ON workspaces
  FOR SELECT USING (id IN (SELECT get_user_workspace_ids()));

DROP POLICY IF EXISTS "workspaces_insert" ON workspaces;
CREATE POLICY "workspaces_insert" ON workspaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "workspaces_update" ON workspaces;
CREATE POLICY "workspaces_update" ON workspaces
  FOR UPDATE USING (owner_id = auth.uid());

-- Workspace members policies
DROP POLICY IF EXISTS "workspace_members_select" ON workspace_members;
CREATE POLICY "workspace_members_select" ON workspace_members
  FOR SELECT USING (workspace_id IN (SELECT get_user_workspace_ids()));

DROP POLICY IF EXISTS "workspace_members_insert" ON workspace_members;
CREATE POLICY "workspace_members_insert" ON workspace_members
  FOR INSERT WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids()));

-- Child table policies (full CRUD within workspace)
DROP POLICY IF EXISTS "tenant_integrations" ON integrations;
CREATE POLICY "tenant_integrations" ON integrations
  FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids()));

DROP POLICY IF EXISTS "tenant_signals" ON product_signals;
CREATE POLICY "tenant_signals" ON product_signals
  FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids()));

DROP POLICY IF EXISTS "tenant_insights" ON insights;
CREATE POLICY "tenant_insights" ON insights
  FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids()));

DROP POLICY IF EXISTS "tenant_recommendations" ON feature_recommendations;
CREATE POLICY "tenant_recommendations" ON feature_recommendations
  FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids()));

DROP POLICY IF EXISTS "tenant_prds" ON prds;
CREATE POLICY "tenant_prds" ON prds
  FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids()));

DROP POLICY IF EXISTS "tenant_eng_plans" ON engineering_plans;
CREATE POLICY "tenant_eng_plans" ON engineering_plans
  FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids()));

DROP POLICY IF EXISTS "tenant_agent_workflows" ON agent_workflows;
CREATE POLICY "tenant_agent_workflows" ON agent_workflows
  FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids()));
