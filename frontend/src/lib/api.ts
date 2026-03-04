import { supabase } from './supabase'
import type { Repository, ExecutionReport, UserProfile } from '../types'

// All API calls route through same-origin /api/* Vercel serverless functions.
const API_BASE = '/api'

async function getAuthHeader(): Promise<Record<string, string>> {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (!token) throw new Error('Not authenticated')
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    }
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const headers = await getAuthHeader()
    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: { ...headers, ...(options?.headers ?? {}) },
    })
    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: response.statusText }))
        throw new Error(error.detail || 'API request failed')
    }
    return response.json()
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const getMe = (): Promise<UserProfile> => apiFetch('/auth/me')

export const createOrg = (name: string): Promise<{ organization_id: string; name: string }> =>
    apiFetch('/auth/org', {
        method: 'POST',
        body: JSON.stringify({ name }),
    })

// ── GitHub ────────────────────────────────────────────────────────────────────

export const connectGitHub = (orgId: string): void => {
    const params = new URLSearchParams({
        client_id: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
        redirect_uri: `${window.location.origin}/github/callback`,
        scope: 'repo read:org',
        state: orgId,
    })
    window.location.href = `https://github.com/login/oauth/authorize?${params}`
}

export const githubCallback = (
    code: string,
    organizationId: string,
): Promise<{ status: string; repos_found: number }> =>
    apiFetch('/github/oauth', {
        method: 'POST',
        body: JSON.stringify({ code, organization_id: organizationId }),
    })

export const getRepositories = (): Promise<Repository[]> =>
    apiFetch('/integrations/github').then((r: any) => r.repositories ?? [])

// ── Analysis ──────────────────────────────────────────────────────────────────

export const runAnalysis = (
    organizationId: string,
    repositoryId?: string,
): Promise<{ report_id: string }> =>
    apiFetch('/analysis/run', {
        method: 'POST',
        body: JSON.stringify({ organization_id: organizationId, repository_id: repositoryId }),
    })

export const getReport = (reportId: string): Promise<ExecutionReport> =>
    apiFetch(`/analysis/report/${reportId}`)

export const saveRoadmap = (
    organizationId: string,
    repositoryId: string,
    roadmapText: string,
): Promise<{ roadmap_id: string; status: string }> =>
    apiFetch('/analysis/roadmap', {
        method: 'POST',
        body: JSON.stringify({
            organization_id: organizationId,
            repository_id: repositoryId,
            roadmap_text: roadmapText,
        }),
    })
