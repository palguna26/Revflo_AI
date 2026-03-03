// Core TypeScript interfaces for RevFlo

export interface Organization {
    id: string
    name: string
}

export interface Repository {
    id: string
    name: string
    full_name: string
    private: boolean
    organization_id: string
    installed: boolean
}

export interface ScoreBreakdown {
    velocity: number
    scope: number
    review: number
    fragmentation: number
    drift: number
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

export interface ExecutionReport {
    id: string
    organization_id: string
    repository_id: string | null
    score: number
    breakdown: ScoreBreakdown
    summary: string
    summary_status: 'ok' | 'failed'
    risks: RiskItem[]
    misaligned_prs: MisalignedPR[]
    new_clusters: string[]
    created_at: string
}

export interface UserProfile {
    user_id: string
    email: string | null
    organization: Organization | null
}
