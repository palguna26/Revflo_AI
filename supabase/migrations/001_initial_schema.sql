-- RevFlo Initial Schema
-- Run this in your Supabase SQL Editor

-- ─────────────────────────────────────────────────────────
-- Enable UUID extension
-- ─────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────
-- 1. organizations
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organizations (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_owner_all" ON organizations
    FOR ALL USING (auth.uid() = owner_id);

-- ─────────────────────────────────────────────────────────
-- 2. repositories
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS repositories (
    id              TEXT PRIMARY KEY,        -- GitHub repo id (as string)
    name            TEXT NOT NULL,
    full_name       TEXT NOT NULL UNIQUE,
    private         BOOLEAN NOT NULL DEFAULT FALSE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    installed       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "repo_owner_all" ON repositories
    FOR ALL USING (
        organization_id IN (
            SELECT id FROM organizations WHERE owner_id = auth.uid()
        )
    );

-- ─────────────────────────────────────────────────────────
-- 3. pull_requests
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pull_requests (
    id               TEXT PRIMARY KEY,       -- GitHub PR id (as string)
    number           INTEGER NOT NULL,
    title            TEXT NOT NULL,
    body             TEXT,
    state            TEXT NOT NULL,          -- open | closed | merged
    author           TEXT NOT NULL,
    created_at       TIMESTAMPTZ,
    merged_at        TIMESTAMPTZ,
    closed_at        TIMESTAMPTZ,
    updated_at       TIMESTAMPTZ DEFAULT NOW(),
    additions        INTEGER NOT NULL DEFAULT 0,
    deletions        INTEGER NOT NULL DEFAULT 0,
    changed_files    INTEGER NOT NULL DEFAULT 0,
    review_time_hours FLOAT,
    repository_id    TEXT NOT NULL REFERENCES repositories(id) ON DELETE CASCADE
);

ALTER TABLE pull_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pr_owner_all" ON pull_requests
    FOR ALL USING (
        repository_id IN (
            SELECT r.id FROM repositories r
            JOIN organizations o ON o.id = r.organization_id
            WHERE o.owner_id = auth.uid()
        )
    );

-- ─────────────────────────────────────────────────────────
-- 4. commits
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS commits (
    sha              TEXT PRIMARY KEY,
    message          TEXT NOT NULL,
    author           TEXT NOT NULL,
    timestamp        TIMESTAMPTZ,
    repository_id    TEXT NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    pull_request_id  TEXT REFERENCES pull_requests(id) ON DELETE SET NULL
);

ALTER TABLE commits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "commit_owner_all" ON commits
    FOR ALL USING (
        repository_id IN (
            SELECT r.id FROM repositories r
            JOIN organizations o ON o.id = r.organization_id
            WHERE o.owner_id = auth.uid()
        )
    );

-- ─────────────────────────────────────────────────────────
-- 5. roadmaps
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roadmaps (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repository_id   TEXT NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    roadmap_text    TEXT NOT NULL,
    embedding       TEXT,                    -- JSON array of floats (cached embedding)
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roadmap_owner_all" ON roadmaps
    FOR ALL USING (
        organization_id IN (
            SELECT id FROM organizations WHERE owner_id = auth.uid()
        )
    );

-- ─────────────────────────────────────────────────────────
-- 6. execution_reports
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS execution_reports (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    repository_id   TEXT REFERENCES repositories(id) ON DELETE SET NULL,

    -- Scores
    score           FLOAT NOT NULL,
    velocity        FLOAT NOT NULL,
    scope           FLOAT NOT NULL,
    review          FLOAT NOT NULL,
    fragmentation   FLOAT NOT NULL,
    drift           FLOAT NOT NULL,

    -- AI output
    summary         TEXT NOT NULL,
    summary_status  TEXT NOT NULL DEFAULT 'ok',  -- ok | failed

    -- JSON arrays
    risks           TEXT,                -- JSON [RiskItem]
    misaligned_prs  TEXT,                -- JSON [{pr_id, title, similarity}]
    new_clusters    TEXT,                -- JSON [string]

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE execution_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "report_owner_all" ON execution_reports
    FOR ALL USING (
        organization_id IN (
            SELECT id FROM organizations WHERE owner_id = auth.uid()
        )
    );

-- ─────────────────────────────────────────────────────────
-- 7. github_connections
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS github_connections (
    organization_id  UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
    encrypted_token  TEXT NOT NULL,
    github_user      TEXT NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE github_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gh_conn_owner_all" ON github_connections
    FOR ALL USING (
        organization_id IN (
            SELECT id FROM organizations WHERE owner_id = auth.uid()
        )
    );

-- ─────────────────────────────────────────────────────────
-- 8. embedding_cache
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS embedding_cache (
    text_hash   TEXT PRIMARY KEY,       -- SHA256 of input text
    embedding   TEXT NOT NULL,          -- JSON array of floats
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Public read (embeddings are not sensitive), backend-only write via service role.
ALTER TABLE embedding_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "emb_cache_read" ON embedding_cache
    FOR SELECT USING (TRUE);

CREATE POLICY "emb_cache_insert" ON embedding_cache
    FOR INSERT WITH CHECK (TRUE);

-- ─────────────────────────────────────────────────────────
-- 9. error_logs
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS error_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    context     TEXT,
    message     TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Only service role writes error logs; no user-level access needed
CREATE POLICY "error_log_deny" ON error_logs
    FOR ALL USING (FALSE);

-- ─────────────────────────────────────────────────────────
-- Indexes for performance
-- ─────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_pr_repo_created ON pull_requests(repository_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pr_state ON pull_requests(state);
CREATE INDEX IF NOT EXISTS idx_commit_repo ON commits(repository_id);
CREATE INDEX IF NOT EXISTS idx_report_org ON execution_reports(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_roadmap_org ON roadmaps(organization_id, created_at DESC);
