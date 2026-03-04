/**
 * GitHub API helper functions used across serverless routes.
 */

const GITHUB_API = 'https://api.github.com'
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token'

// ── OAuth ─────────────────────────────────────────────────────────────────────

export async function exchangeCodeForToken(code: string): Promise<string> {
    const res = await fetch(GITHUB_TOKEN_URL, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
            client_id: process.env.GITHUB_CLIENT_ID!,
            client_secret: process.env.GITHUB_CLIENT_SECRET!,
            code,
        }),
    })

    const data = await res.json() as Record<string, string>

    if (data.error) {
        throw new Error(`GitHub OAuth error: ${data.error_description ?? data.error}`)
    }

    return data.access_token
}

export async function getGitHubUser(token: string): Promise<{ login: string; id: number }> {
    const res = await fetch(`${GITHUB_API}/user`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
    })
    if (!res.ok) throw new Error('Failed to fetch GitHub user')
    return res.json() as Promise<{ login: string; id: number }>
}

export async function getUserRepos(token: string): Promise<GitHubRepo[]> {
    const res = await fetch(`${GITHUB_API}/user/repos?per_page=100&sort=updated`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
    })
    if (!res.ok) throw new Error('Failed to fetch repositories')
    return res.json() as Promise<GitHubRepo[]>
}

export async function getRecentPRs(
    token: string,
    owner: string,
    repo: string,
    days = 30,
): Promise<GitHubPR[]> {
    const since = new Date(Date.now() - days * 86400000).toISOString()
    const prs: GitHubPR[] = []
    let page = 1

    while (true) {
        const res = await fetch(
            `${GITHUB_API}/repos/${owner}/${repo}/pulls?state=all&per_page=100&page=${page}&sort=created&direction=desc`,
            { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } },
        )
        if (!res.ok) break
        const batch = await res.json() as GitHubPR[]
        if (batch.length === 0) break

        for (const pr of batch) {
            if (pr.created_at < since) return prs
            prs.push(pr)
        }
        page++
    }

    return prs
}

// ── Webhook signature validation ──────────────────────────────────────────────

export async function validateWebhookSignature(
    rawBody: string,
    signature: string | undefined,
): Promise<boolean> {
    if (!signature?.startsWith('sha256=')) return false

    const secret = process.env.GITHUB_WEBHOOK_SECRET!
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const bodyData = encoder.encode(rawBody)

    const key = await crypto.subtle.importKey(
        'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
    )
    const sig = await crypto.subtle.sign('HMAC', key, bodyData)
    const expected = 'sha256=' + Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('')

    // Timing-safe comparison
    if (expected.length !== signature.length) return false
    let match = 0
    for (let i = 0; i < expected.length; i++) {
        match |= expected.charCodeAt(i) ^ signature.charCodeAt(i)
    }
    return match === 0
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GitHubRepo {
    id: number
    name: string
    full_name: string
    private: boolean
    default_branch: string
}

export interface GitHubPR {
    id: number
    number: number
    title: string
    body: string | null
    state: string
    user: { login: string }
    created_at: string
    merged_at: string | null
    closed_at: string | null
    additions: number
    deletions: number
    changed_files: number
}
