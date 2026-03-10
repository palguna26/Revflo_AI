import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ensureWorkspace } from '@/lib/workspace'

// NOTE: This is a LEGACY route from v1. New OAuth-based sync uses:
// GET  /api/integrations/linear/connect     (initiates OAuth flow)
// GET  /api/integrations/linear/callback    (stores encrypted token)
// POST /api/integrations/sync               (syncs data using stored token)
// This route is kept only for backwards compatibility.
// It no longer uses mock data under any condition.

export async function POST(req: NextRequest) {
    try {
        const { token } = await req.json()
        const supabase = await createClient()
        const workspace = await ensureWorkspace(supabase)

        // Without a real token, return an error — never use mock data
        if (!token) {
            return NextResponse.json(
                { error: 'Linear access token is required. Use the Integrations page to connect via OAuth.' },
                { status: 400 }
            )
        }

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

        if (!res.ok) {
            return NextResponse.json({ error: 'Failed to fetch from Linear API. Check your access token.' }, { status: 422 })
        }

        const { data } = await res.json()
        const issues = data?.issues?.nodes ?? []

        const signals = issues.map((issue: Record<string, unknown>) => ({
            workspace_id: workspace.id,
            signal_type: (issue.state as Record<string, unknown>)?.name === 'Done' ? 'feature_shipped' : 'feature_request',
            source: 'linear',
            content: String(issue.title) + (issue.description ? ': ' + String(issue.description).slice(0, 200) : ''),
            metadata: { linear_id: issue.id, priority: issue.priority, state: (issue.state as Record<string, unknown>)?.name },
            timestamp: issue.createdAt as string,
        }))

        if (signals.length > 0) {
            const { error } = await supabase.from('product_signals').insert(signals)
            if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        }

        await supabase.from('integrations').upsert(
            {
                workspace_id: workspace.id,
                type: 'linear',
                config: { source: 'oauth' },
                status: 'active',
                signal_count: signals.length,
                last_synced_at: new Date().toISOString(),
            },
            { onConflict: 'workspace_id,type' }
        )

        return NextResponse.json({ success: true, issues: issues.length, signals: signals.length })
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
