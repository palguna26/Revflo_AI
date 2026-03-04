// Database TypeScript types matching the Supabase schema

export interface Organization {
    id: string
    owner_id: string
    name: string
    created_at: string
}

export interface Repository {
    id: string
    organization_id: string
    github_repo_id: number
    name: string
    full_name: string
    default_branch: string | null
    installed: boolean
    created_at: string
}

export interface PullRequest {
    id: string
    repository_id: string
    github_pr_id: number
    title: string | null
    body: string | null
    author: string | null
    state: string | null
    additions: number | null
    deletions: number | null
    changed_files: number | null
    created_at: string | null
    merged_at: string | null
    closed_at: string | null
    review_time_seconds: number | null
    created_at_db: string
}

export interface Commit {
    id: string
    repository_id: string
    github_commit_sha: string | null
    author: string | null
    message: string | null
    additions: number | null
    deletions: number | null
    committed_at: string | null
    created_at_db: string
}

export interface Roadmap {
    id: string
    organization_id: string
    raw_text: string
    embedding: number[] | null
    created_at: string
}

export interface ExecutionReport {
    id: string
    organization_id: string
    score: number
    velocity_score: number
    scope_score: number
    review_score: number
    fragmentation_score: number
    drift_score: number
    summary: string
    risks: RiskItem[]
    misaligned_prs: MisalignedPR[]
    new_clusters: string[]
    created_at: string
}

export interface GitHubConnection {
    id: string
    organization_id: string
    access_token: string
    github_user: string
    created_at: string
}

export interface RiskItem {
    type: string
    severity: 'low' | 'medium' | 'high'
    message: string
}

export interface MisalignedPR {
    pr_id: string
    title: string
    similarity: number
}

export interface ScoreBreakdown {
    velocity: number
    scope: number
    review: number
    fragmentation: number
    drift: number
}
