-- Initial RevFlo Database Schema

-- 1. Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User-Org Mapping (for multi-tenant RLS)
CREATE TABLE user_organizations (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  PRIMARY KEY (user_id, org_id)
);

-- 2. Repositories
CREATE TABLE repositories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  github_repo_id BIGINT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Pull Requests
CREATE TABLE pull_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repo_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
  github_pr_id BIGINT UNIQUE NOT NULL,
  number INT NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  state TEXT NOT NULL,
  diff_url TEXT NOT NULL,
  merged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Commits
CREATE TABLE commits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pr_id UUID REFERENCES pull_requests(id) ON DELETE CASCADE,
  sha TEXT UNIQUE NOT NULL,
  message TEXT NOT NULL,
  author TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Execution Reports (The Analysis Output)
CREATE TABLE execution_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  score_overall INT NOT NULL,
  score_velocity INT,
  score_alignment INT,
  score_review INT,
  score_drift INT,
  score_fragmentation INT,
  ai_summary TEXT,
  ai_insights_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Setup

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE pull_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE commits ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_reports ENABLE ROW LEVEL SECURITY;

-- Create policy functions
CREATE OR REPLACE FUNCTION public.get_user_orgs()
RETURNS SETOF UUID
LANGUAGE sql SECURITY DEFINER SET search_path = public
STABLE
AS $$
  SELECT org_id FROM user_organizations WHERE user_id = auth.uid()
$$;

-- Apply Policies

-- Organizations: Users can view their own orgs
CREATE POLICY "View own orgs" ON organizations
  FOR SELECT USING (id IN (SELECT get_user_orgs()));

-- User Organizations: Users can view their own mappings
CREATE POLICY "View own user_org map" ON user_organizations
  FOR SELECT USING (user_id = auth.uid());

-- Repositories: Org members can view
CREATE POLICY "View org repos" ON repositories
  FOR SELECT USING (org_id IN (SELECT get_user_orgs()));

-- Pull Requests: View if through Repo -> Org
CREATE POLICY "View org PRs" ON pull_requests
  FOR SELECT USING (repo_id IN (SELECT id FROM repositories WHERE org_id IN (SELECT get_user_orgs())));

-- Commits: View if through PR -> Repo -> Org
CREATE POLICY "View org commits" ON commits
  FOR SELECT USING (pr_id IN (SELECT id FROM pull_requests WHERE repo_id IN (SELECT id FROM repositories WHERE org_id IN (SELECT get_user_orgs()))));

-- Execution Reports: View if Org member
CREATE POLICY "View org execution reports" ON execution_reports
  FOR SELECT USING (org_id IN (SELECT get_user_orgs()));
