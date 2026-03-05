import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ensureWorkspace } from '@/lib/workspace'
import { GITHUB_MOCK_SIGNALS } from '@/lib/mock-data'

export async function POST(req: NextRequest) {
    try {
        const { token, repo } = await req.json()
        const supabase = await createClient()
        const workspace = await ensureWorkspace(supabase)

        let signals = GITHUB_MOCK_SIGNALS.map(s => ({ ...s, workspace_id: workspace.id }))
        let source = 'demo'
        let prCount = 6
        let commitCount = 8

        // If real token provided, attempt real API
        if (token && repo && token !== 'demo') {
            try {
                const headers = { Authorization: `token ${token}`, 'User-Agent': 'RevFlo/1.0' }
                const prsRes = await fetch(`https://api.github.com/repos/${repo}/pulls?state=all&per_page=50`, { headers })
                const commitsRes = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=50`, { headers })

                if (prsRes.ok && commitsRes.ok) {
                    const prs = await prsRes.json()
                    const commits = await commitsRes.json()
                    prCount = prs.length
                    commitCount = commits.length

                    signals = [
                        ...prs.map((pr: Record<string, unknown>) => ({
                            workspace_id: workspace.id,
                            signal_type: ((pr.state === 'closed' && pr.merged_at) ? 'feature_shipped' : 'feature_request') as string,
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
                    source = 'real'
                }
            } catch {
                // Fall back to demo data
            }
        }

        // Upsert integration record
        await supabase.from('integrations').upsert(
            {
                workspace_id: workspace.id,
                type: 'github',
                config: repo ? { repo } : { mode: 'demo' },
                status: 'active',
                signal_count: signals.length,
                last_synced_at: new Date().toISOString(),
            },
            { onConflict: 'workspace_id,type' }
        )

        // Insert signals
        const { error } = await supabase.from('product_signals').insert(signals)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({
            success: true,
            source,
            prs: prCount,
            commits: commitCount,
            signals: signals.length,
        })
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
