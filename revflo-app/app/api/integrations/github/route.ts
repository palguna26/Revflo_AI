import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ensureWorkspace } from '@/lib/workspace'

// NOTE: This is a LEGACY route from v1. New OAuth-based sync uses:
// GET  /api/integrations/github/connect     (initiates OAuth flow)
// GET  /api/integrations/github/callback    (stores encrypted token)
// POST /api/integrations/sync               (syncs data using stored token)
// This route is kept only for backwards compatibility.
// It no longer uses mock data under any condition.

export async function POST(req: NextRequest) {
    try {
        const { token, repo } = await req.json()
        const supabase = await createClient()
        const workspace = await ensureWorkspace(supabase)

        // Without a real token and repo, return an error — never use mock data
        if (!token || !repo) {
            return NextResponse.json(
                { error: 'GitHub token and repository are required. Use the Integrations page to connect via OAuth.' },
                { status: 400 }
            )
        }

        const headers = { Authorization: `token ${token}`, 'User-Agent': 'RevFlo/1.0' }
        const prsRes = await fetch(`https://api.github.com/repos/${repo}/pulls?state=all&per_page=100`, { headers })
        const commitsRes = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=100`, { headers })

        if (!prsRes.ok || !commitsRes.ok) {
            return NextResponse.json({ error: 'Failed to fetch from GitHub API. Check your token and repository.' }, { status: 422 })
        }

        const prs = await prsRes.json()
        const commits = await commitsRes.json()

        const signals = [
            ...prs.map((pr: Record<string, unknown>) => ({
                workspace_id: workspace.id,
                signal_type: (pr.state === 'closed' && pr.merged_at) ? 'feature_shipped' : 'feature_request',
                source: 'github',
                content: String(pr.title) + (pr.body ? ': ' + String(pr.body).slice(0, 200) : ''),
                metadata: { pr_number: pr.number, state: pr.state, author: (pr.user as Record<string, unknown>)?.login, url: pr.html_url },
                timestamp: pr.created_at as string,
            })),
            ...commits.map((c: Record<string, unknown>) => ({
                workspace_id: workspace.id,
                signal_type: 'feature_shipped',
                source: 'github',
                content: String((c.commit as Record<string, unknown>)?.message ?? '').slice(0, 300),
                metadata: { sha: c.sha, author: ((c.commit as Record<string, unknown>)?.author as Record<string, unknown>)?.name, url: c.html_url },
                timestamp: String(((c.commit as Record<string, unknown>)?.author as Record<string, unknown>)?.date ?? new Date().toISOString()),
            })),
        ]

        // Insert signals
        if (signals.length > 0) {
            const { error } = await supabase.from('product_signals').insert(signals)
            if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Upsert integration record with real data
        await supabase.from('integrations').upsert(
            {
                workspace_id: workspace.id,
                type: 'github',
                config: { repo },
                status: 'active',
                signal_count: signals.length,
                last_synced_at: new Date().toISOString(),
            },
            { onConflict: 'workspace_id,type' }
        )

        return NextResponse.json({
            success: true,
            prs: prs.length,
            commits: commits.length,
            signals: signals.length,
        })
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
