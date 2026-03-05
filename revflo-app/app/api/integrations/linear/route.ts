import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ensureWorkspace } from '@/lib/workspace'
import { LINEAR_MOCK_SIGNALS } from '@/lib/mock-data'

export async function POST(req: NextRequest) {
    try {
        const { token } = await req.json()
        const supabase = await createClient()
        const workspace = await ensureWorkspace(supabase)

        let signals = LINEAR_MOCK_SIGNALS.map(s => ({ ...s, workspace_id: workspace.id }))
        let source = 'demo'
        let issueCount = LINEAR_MOCK_SIGNALS.length

        // If real token provided, attempt Linear GraphQL API
        if (token && token !== 'demo') {
            try {
                const query = `{
          issues(first: 100) {
            nodes {
              id title description priority
              state { name }
              createdAt updatedAt
            }
          }
        }`
                const res = await fetch('https://api.linear.app/graphql', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: token },
                    body: JSON.stringify({ query }),
                })

                if (res.ok) {
                    const { data } = await res.json()
                    const issues = data?.issues?.nodes ?? []
                    issueCount = issues.length

                    signals = issues.map((issue: Record<string, unknown>) => ({
                        workspace_id: workspace.id,
                        signal_type: (issue.state as Record<string, unknown>)?.name === 'Done' ? 'feature_shipped' : 'feature_request',
                        source: 'linear',
                        content: String(issue.title) + (issue.description ? ': ' + String(issue.description).slice(0, 200) : ''),
                        metadata: { linear_id: issue.id, priority: issue.priority, state: (issue.state as Record<string, unknown>)?.name },
                        timestamp: issue.createdAt as string,
                    }))
                    source = 'real'
                }
            } catch {
                // Fall back to demo data
            }
        }

        await supabase.from('integrations').upsert(
            {
                workspace_id: workspace.id,
                type: 'linear',
                config: { mode: source },
                status: 'active',
                signal_count: signals.length,
                last_synced_at: new Date().toISOString(),
            },
            { onConflict: 'workspace_id,type' }
        )

        const { error } = await supabase.from('product_signals').insert(signals)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ success: true, source, issues: issueCount, signals: signals.length })
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
