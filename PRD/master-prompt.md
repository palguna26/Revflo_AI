


You are building a production-ready MVP for a SaaS product called **RevFlo**.

All product documentation exists inside the `/PRD` folder. You must strictly follow it.

---

# 🎯 Product Summary

RevFlo is an AI-powered execution audit system for startup founders.

It:

* Connects to GitHub via OAuth
* Ingests pull requests + commits
* Computes execution metrics deterministically
* Detects scope drift via embeddings
* Generates an Execution Health Score
* Uses Groq (llama-3.3-70b-versatile) only for semantic tasks

This is not a project management tool.
This is not a chat app.

---

# 🧱 Tech Stack (Strict)

Frontend:

* React
* TypeScript
* Tailwind
* TanStack Query

Backend:

* Python 3.11+
* FastAPI
* Supabase (Postgres + Auth + RLS)
* psycopg or asyncpg for DB
* httpx for HTTP calls
* Groq API
* Uvicorn server

No Django.
No ORMs unless lightweight (SQLAlchemy optional).
No Celery.
No Redis initially.
No unnecessary libraries.

---

# 📁 Build Order (Mandatory)

---

## Phase 1 – Backend Infrastructure

### 1. Project Structure

Create:

```
backend/
 ├── app/
 │    ├── main.py
 │    ├── config.py
 │    ├── database.py
 │    ├── models/
 │    ├── services/
 │    │     ├── github_service.py
 │    │     ├── scoring_service.py
 │    │     ├── drift_service.py
 │    │     ├── llm_service.py
 │    ├── routes/
 │    │     ├── auth.py
 │    │     ├── github.py
 │    │     ├── analysis.py
 │    ├── utils/
 │    └── schemas/
 ├── requirements.txt
 └── .env
```

---

### 2. Database Connection

* Connect to Supabase Postgres directly.
* Use environment variable:
  DATABASE_URL

All queries must respect organization_id boundaries.

No business logic inside DB.

---

### 3. Implement Authentication

* Use Supabase JWT validation.
* Extract and verify JWT in FastAPI middleware.
* Reject invalid tokens.
* Attach user_id to request context.

---

### 4. GitHub OAuth

Implement:

POST /github/callback

Flow:

* Receive code
* Exchange for access_token
* Store token encrypted in DB
* Fetch repositories
* Store repositories

---

### 5. GitHub Webhook Endpoint

POST /github/webhook

* Validate X-Hub-Signature-256
* Parse events:

  * pull_request
  * push
* Normalize data
* Insert into pull_requests + commits tables

---

### 6. Deterministic Scoring Engine

Inside scoring_service.py:

Implement:

Score =
0.30 Velocity

* 0.25 Scope
* 0.20 Review
* 0.15 Fragmentation
* 0.10 Drift

No LLM here.

---

### 7. Drift Detection Engine

In drift_service.py:

* Generate roadmap embedding
* Generate PR embeddings
* Compute cosine similarity
* Flag misaligned PRs
* Detect new keyword clusters

---

### 8. Groq Integration

In llm_service.py:

* Implement function:
  generate_embedding(text)
* Implement function:
  generate_summary(metrics, risks)

Use:

* llama-3.3-70b-versatile
* httpx for API calls
* Cache embeddings in DB

LLM must not be used for metric computation.

---

### 9. Analysis Endpoint

POST /analysis/run

Flow:

1. Fetch PRs
2. Compute metrics
3. Compute drift
4. Compute score
5. Generate summary
6. Store execution_report
7. Return report_id

---

## Phase 2 – Frontend

Only after backend endpoints are complete.

Implement:

* Auth
* Dashboard
* GitHub connect
* Run analysis
* Report page

Follow frontend.md strictly.

---

# 🔐 Security Requirements

* Validate JWT on every protected route.
* Validate GitHub webhook signature.
* Never expose GitHub token to frontend.
* Never expose Groq API key.
* Use org-level multi-tenancy enforcement.

---

# 🧠 Constraints

Do NOT:

* Add Celery
* Add Redis
* Add Docker (unless necessary)
* Add microservices
* Add background workers initially

Keep architecture simple.

---

# 🧪 Definition of Done

The system is complete when:

1. User signs up
2. Connects GitHub
3. PR appears in DB
4. Run analysis endpoint works
5. Score computed correctly
6. Drift detected
7. Summary generated
8. Report stored
9. Frontend displays report

---

Work step-by-step.

After completing backend phase:

* Summarize implementation.
* Confirm alignment with PRD.
* Then proceed to frontend.

Do not skip steps.

---

END OF INSTRUCTIONS.

---

