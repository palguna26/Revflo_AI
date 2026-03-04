**RevFlo Frontend PRD (MVP)**.

Stack:

* **React**
* **TypeScript**
* **Tailwind**
* Supabase client for Auth + DB
* Calls Edge Functions for analysis

This is **implementation-ready frontend architecture**.

No backend repetition.

---

# 🚀 RevFlo Frontend PRD (MVP)

## Goal

Within 10 minutes:

1. User signs up
2. Connects GitHub
3. Selects repository
4. Pastes roadmap
5. Runs analysis
6. Sees Execution Score + Risks + AI Brief

Simple.
Fast.
Opinionated.

---

# 1️⃣ Frontend Architecture

```text
App
 ├── AuthProvider
 ├── Routes
 │    ├── /login
 │    ├── /signup
 │    ├── /dashboard
 │    ├── /repo/:id
 │    └── /report/:id
 └── API Layer
```

---

# 2️⃣ Folder Structure

```bash
src/
 ├── app/
 │    ├── routes.tsx
 │    ├── layout.tsx
 │
 ├── components/
 │    ├── ui/
 │    ├── charts/
 │    ├── score/
 │    ├── risks/
 │
 ├── pages/
 │    ├── Login.tsx
 │    ├── Signup.tsx
 │    ├── Dashboard.tsx
 │    ├── RepoDetails.tsx
 │    ├── Report.tsx
 │
 ├── hooks/
 │    ├── useAuth.ts
 │    ├── useRepositories.ts
 │    ├── useReports.ts
 │
 ├── lib/
 │    ├── supabase.ts
 │    ├── api.ts
 │
 ├── types/
 │    ├── index.ts
 │
 └── utils/
```

---

# 3️⃣ State Management

Use:

* React Query (TanStack Query)
* Supabase session listener

Why:

* Backend-driven app
* Heavy async state
* Needs caching
* Needs invalidation

No Redux needed.

---

# 4️⃣ Authentication Flow

## Auth Provider

```tsx
<AuthProvider>
   <App />
</AuthProvider>
```

Handles:

* Session tracking
* Auto refresh token
* Route protection

---

## Protected Route Pattern

```tsx
if (!session) return <Navigate to="/login" />
```

---

# 5️⃣ Pages Breakdown

---

## 🟢 1. Login Page

Fields:

* Email
* Password

Calls:

```ts
supabase.auth.signInWithPassword()
```

---

## 🟢 2. Signup Page

Same logic with signUp()

---

## 🟢 3. Dashboard Page

Purpose:

* Show connected repositories
* Show last execution report
* Button: “Connect GitHub”
* Button: “Run Analysis”

Components:

```text
Dashboard
 ├── OrgHeader
 ├── RepoList
 ├── LastScoreCard
 └── ConnectGitHubButton
```

---

## 🟢 4. Repo Details Page

Route: `/repo/:id`

Displays:

* PR velocity graph
* Drift warnings
* Review efficiency
* Run Analysis button

Components:

```text
RepoDetails
 ├── ExecutionScoreCard
 ├── VelocityChart
 ├── DriftPanel
 ├── RiskList
 └── RoadmapInput
```

---

## 🟢 5. Report Page

Route: `/report/:id`

Displays:

* Final score
* Breakdown
* AI founder summary
* Share button

---

# 6️⃣ Core UI Components

---

## ExecutionScoreCard

Props:

```ts
{
  score: number
  breakdown: {
    velocity: number
    scope: number
    review: number
    fragmentation: number
    drift: number
  }
}
```

Visual:

* Circular score
* Colored segments
* Green / Yellow / Red states

---

## RiskList

```ts
{
  risks: Array<{
    type: string
    severity: "low" | "medium" | "high"
    message: string
  }>
}
```

---

## DriftPanel

Displays:

* Misaligned PRs
* Similarity score
* Tags extracted

---

## RoadmapInput

Textarea + Save button

Saves roadmap → triggers embedding backend

---

# 7️⃣ API Layer

Centralized API file:

```ts
export async function runAnalysis(orgId: string) {
  return fetch("/api/run-analysis", {
    method: "POST",
    body: JSON.stringify({ organization_id: orgId })
  })
}
```

Other calls:

* getRepositories()
* getReport(reportId)
* connectGitHub()
* saveRoadmap()

All wrapped with React Query.

---

# 8️⃣ Data Fetching Strategy

Use React Query:

```ts
const { data, isLoading } = useQuery({
  queryKey: ["report", id],
  queryFn: () => getReport(id)
})
```

Advantages:

* Auto caching
* Refetch control
* Optimistic updates

---

# 9️⃣ UI/UX Design Principles

Minimal.
Sharp.
Dark mode default.

Inspiration:

* Cursor
* Linear
* Vercel Dashboard

Use Tailwind:

* `bg-zinc-900`
* `border-zinc-800`
* `text-zinc-100`

---

# 🔟 Loading States

Every async section must have:

* Skeleton loader
* Spinner
* Error state

Never blank screen.

---

# 1️⃣1️⃣ GitHub Connect Button

On click:

Redirect:

```ts
window.location.href = backend_github_oauth_url
```

After callback:
Redirect back to dashboard.

---

# 1️⃣2️⃣ Share Mechanic (Viral Loop)

On Report page:

Generate share card:

```
Execution Score: 72/100
Velocity: 80
Scope: 65
Drift Risk: Medium
```

Button:
“Share on LinkedIn”

Generates prefilled URL.

---

# 1️⃣3️⃣ Error Handling

If backend fails:

Show:

```text
⚠ Analysis Failed
Try again or check repo permissions.
```

Never show raw errors.

---

# 1️⃣4️⃣ Performance Optimization

* Lazy load heavy charts
* Memoize components
* Use React Query staleTime: 5 min
* Avoid re-render loops

---

# 1️⃣5️⃣ Security

* Never store tokens in localStorage manually
* Use Supabase session
* Never expose service keys
* Validate org ownership before UI actions

---

# 1️⃣6️⃣ Types (Core Interfaces)

```ts
export interface Organization {
  id: string
  name: string
}

export interface Repository {
  id: string
  name: string
  installed: boolean
}

export interface ExecutionReport {
  id: string
  score: number
  breakdown: {
    velocity: number
    scope: number
    review: number
    fragmentation: number
    drift: number
  }
  summary: string
}
```

---

# 1️⃣7️⃣ MVP Frontend Deliverables

✔ Auth Flow
✔ Dashboard
✔ Repo Page
✔ Report Page
✔ Roadmap Input
✔ GitHub Connect
✔ Run Analysis
✔ Share Result

No:

* Team management
* Settings page
* Billing
* Notifications
* Multi-role access

---

# 🎯 End Result

Founder logs in.

Connects repo.

Runs analysis.

Sees:

```
Execution Score: 68
Scope Drift Detected
Review Time Increasing
Velocity Stable
```

Feels:

“Oh. This actually understands my team.”

That’s the hook.

---
