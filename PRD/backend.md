Perfect.

Below is a **backend-only PRD** for **RevFlo MVP**.
Implementation-ready.
No frontend.
No Antigravity scaffolding.
Just backend architecture and logic.

---

# 🚀 RevFlo Backend PRD (MVP)

## Product: RevFlo

## Scope: Backend Only

## Stack:

* **Supabase** (Postgres + Auth + RLS + Edge Functions + Cron)
* **Groq API**
* **Llama-3.3-70b-versatile** (via Groq)

---

# 1️⃣ System Architecture

## High-Level Architecture

```
Client
   ↓
Supabase Auth (JWT)
   ↓
Supabase Postgres (RLS enforced)
   ↓
Supabase Edge Functions
   ↓
Groq API (Llama 3.3 70B)
```

---

## Component-Level Architecture

### A. Supabase Auth

* Handles user authentication
* Issues JWT tokens
* Multi-tenant isolation via RLS

### B. Postgres Database

Stores:

* Users
* Organizations
* GitHub repositories
* Pull requests
* Commits
* Roadmaps
* Execution reports
* Drift detections

### C. Edge Functions

Responsible for:

* GitHub OAuth callback
* GitHub webhook ingestion
* Execution scoring computation
* Drift detection analysis
* LLM calls
* Report generation

### D. Groq LLM Layer

* Used only for:

  * Semantic roadmap alignment
  * Executive summary generation
* NOT used for scoring math

---

# 2️⃣ Database Schema

## 2.1 users (Supabase auth.users)

Use built-in table.

---

## 2.2 organizations

```sql
create table organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id),
  name text not null,
  created_at timestamptz default now()
);
```

---

## 2.3 repositories

```sql
create table repositories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  github_repo_id bigint not null,
  name text not null,
  default_branch text,
  installed boolean default false,
  created_at timestamptz default now()
);
```

Index:

```sql
create index idx_repo_org on repositories(organization_id);
create index idx_github_repo_id on repositories(github_repo_id);
```

---

## 2.4 pull_requests

```sql
create table pull_requests (
  id uuid primary key default gen_random_uuid(),
  repository_id uuid references repositories(id) on delete cascade,
  github_pr_id bigint not null,
  title text,
  body text,
  author text,
  state text,
  additions int,
  deletions int,
  changed_files int,
  created_at timestamptz,
  merged_at timestamptz,
  closed_at timestamptz,
  review_time_seconds bigint,
  created_at_db timestamptz default now()
);
```

Indexes:

```sql
create index idx_pr_repo on pull_requests(repository_id);
create index idx_pr_created on pull_requests(created_at);
```

---

## 2.5 commits

```sql
create table commits (
  id uuid primary key default gen_random_uuid(),
  repository_id uuid references repositories(id) on delete cascade,
  github_commit_sha text,
  author text,
  message text,
  additions int,
  deletions int,
  committed_at timestamptz,
  created_at_db timestamptz default now()
);
```

---

## 2.6 roadmaps

```sql
create table roadmaps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  raw_text text not null,
  embedding vector(4096),
  created_at timestamptz default now()
);
```

---

## 2.7 execution_reports

```sql
create table execution_reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  score numeric,
  velocity_score numeric,
  scope_score numeric,
  review_score numeric,
  fragmentation_score numeric,
  drift_score numeric,
  summary text,
  created_at timestamptz default now()
);
```

---

# 3️⃣ Row Level Security (RLS)

Enable RLS on all tables:

```sql
alter table organizations enable row level security;
alter table repositories enable row level security;
alter table pull_requests enable row level security;
alter table commits enable row level security;
alter table roadmaps enable row level security;
alter table execution_reports enable row level security;
```

Policy Example:

```sql
create policy "org access"
on organizations
for all
using (owner_id = auth.uid());
```

Repositories:

```sql
create policy "repo access"
on repositories
for all
using (
  organization_id in (
    select id from organizations where owner_id = auth.uid()
  )
);
```

Apply similar chained policy to PRs, commits, reports.

---

# 4️⃣ GitHub OAuth Flow

## Flow:

1. User clicks "Connect GitHub"
2. Redirect to GitHub OAuth
3. GitHub returns code
4. Edge Function exchanges code for access token
5. Store token encrypted in DB

Table:

```sql
create table github_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  access_token text,
  created_at timestamptz default now()
);
```

---

# 5️⃣ Data Ingestion Pipeline

## GitHub Webhooks

Events:

* pull_request
* push
* pull_request_review

Flow:

Webhook → Edge Function → Normalize → Insert into DB

---

## PR Ingestion Logic

For each PR:

* Compute:

  * PR size = additions + deletions
  * Review time = merged_at - created_at
  * Rework ratio

---

# 6️⃣ Execution Score Algorithm

Final Score = Weighted composite:

```
Score = 
  (0.30 * Velocity Stability)
+ (0.25 * Scope Control)
+ (0.20 * Review Efficiency)
+ (0.15 * Fragmentation Risk)
+ (0.10 * Drift Risk)
```

---

## Velocity Stability

Measure std deviation of PR frequency.

```
velocity_score = 100 - normalized_std_dev(prs_per_week)
```

---

## Scope Control

Detect % of PRs without roadmap alignment.

```
scope_score = 100 - (unlinked_pr_ratio * 100)
```

---

## Review Efficiency

```
review_score = 100 - normalized_avg_review_time
```

---

## Fragmentation Risk

Measure small PR clustering.

```
fragmentation_score = 100 - normalized_small_pr_burst_ratio
```

---

## Drift Risk

Based on new keyword clusters outside roadmap.

---

# 7️⃣ Scope Drift Detection

Process:

1. Extract keywords from PR titles.
2. Cluster via cosine similarity.
3. Compare to roadmap embedding.
4. If similarity < threshold (0.75) → mark drift.

---

# 8️⃣ Roadmap Alignment

Step 1: Generate embedding via Llama.
Step 2: Store vector.
Step 3: For each PR:

```
similarity = cosine(pr_embedding, roadmap_embedding)
```

If similarity < 0.65 → misaligned.

---

# 9️⃣ Background Jobs

Use Supabase Cron:

* Daily execution score recalculation
* Weekly full analysis
* Drift recalculation

Edge Function triggered by cron.

---

# 🔟 API Design

## POST /api/github/callback

Request:

```
{ code }
```

Response:

```
{ success: true }
```

---

## POST /api/webhook/github

Receives GitHub events.

---

## POST /api/run-analysis

```
{ organization_id }
```

Returns:

```
{ report_id }
```

---

## GET /api/report/:id

Returns full execution report.

---

# 1️⃣1️⃣ Caching Strategy

* Cache embeddings
* Cache score computation for 24h
* Store summary text in DB

Avoid repeated LLM calls.

---

# 1️⃣2️⃣ Rate Limiting

* 1 analysis per org per hour
* 100 webhook events per minute max

---

# 1️⃣3️⃣ Error Handling

* Retry GitHub ingestion 3 times
* Fallback if LLM fails → generate rule-based summary
* Store failure logs in table:

```sql
create table error_logs (
  id uuid primary key default gen_random_uuid(),
  context text,
  error_message text,
  created_at timestamptz default now()
);
```

---

# 1️⃣4️⃣ Observability

Log:

* LLM latency
* API response time
* Score calculation duration

Use:

* Supabase logs
* Custom log table

---

# 1️⃣5️⃣ Cost Optimization Strategy

* Only embed roadmap once
* Only embed PRs once
* Use LLM only for:

  * Embeddings
  * Final summary
* Use math for scoring

---

# 1️⃣6️⃣ Security Model

* JWT validated automatically by Supabase
* Edge Functions verify org ownership
* Store GitHub tokens encrypted
* Never expose service role key publicly

---

# 1️⃣7️⃣ Multi-Tenant Model

Tenant = organization

Isolation via:

* org_id foreign keys
* RLS chained to auth.uid()

---

# 🎯 MVP Backend Outcome

After full flow:

1. GitHub connected
2. PRs ingested
3. Roadmap stored
4. Execution score computed
5. Drift detected
6. Summary generated
7. Report stored

Fully backend-driven.

