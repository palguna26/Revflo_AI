import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ensureWorkspace } from '@/lib/workspace'
import { decryptToken } from '@/lib/encryption'

async function syncGithub(supabase: any, workspaceId: string, accessToken: string, lastSyncedAt: string | null) {
    const sinceParams = lastSyncedAt ? `?since=${lastSyncedAt}` : ''
    // Limit to 90 days if no lastSyncedAt
    const cutoffDate = lastSyncedAt ? new Date(lastSyncedAt) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
    }

    // Get user
    const userRes = await fetch('https://api.github.com/user', { headers })
    if (!userRes.ok) throw new Error('GitHub token invalid')
    const user = await userRes.json()

    // Get repos
    const reposRes = await fetch('https://api.github.com/user/repos?sort=updated&per_page=10', { headers })
    if (!reposRes.ok) throw new Error('Failed to fetch repos')
    const repos = await reposRes.json()

    const newSignals: any[] = []

    for (const repo of repos) {
        // Issues
        const issuesRes = await fetch(`https://api.github.com/repos/${repo.full_name}/issues${sinceParams}`, { headers })
        if (issuesRes.ok) {
            const issues = await issuesRes.json()
            for (const issue of issues) {
                // If the issue was updated before cutoff date, ignore
                if (new Date(issue.updated_at) < cutoffDate) continue
                // PRs are returned in issues endpoint too, handle them slightly differently
                const isPR = !!issue.pull_request

                if (!isPR) {
                    const labels = issue.labels.map((l: any) => l.name.toLowerCase())
                    let signalType = 'feature_request'
                    if (labels.some((l: string) => l.includes('bug'))) signalType = 'bug'

                    newSignals.push({
                        workspace_id: workspaceId,
                        source: 'github',
                        signal_type: signalType,
                        content: `[${repo.name}] Issue #${issue.number}: ${issue.title}\n\n${issue.body || ''}`,
                        created_at: new Date().toISOString()
                    })
                }
            }
        }

        // Pull Requests (merged)
        const pullsRes = await fetch(`https://api.github.com/repos/${repo.full_name}/pulls?state=closed&sort=updated&direction=desc`, { headers })
        if (pullsRes.ok) {
            const pulls = await pullsRes.json()
            for (const pr of pulls) {
                if (!pr.merged_at) continue
                if (new Date(pr.merged_at) < cutoffDate) continue

                newSignals.push({
                    workspace_id: workspaceId,
                    source: 'github',
                    signal_type: 'engineering_activity',
                    content: `[${repo.name}] Merged PR #${pr.number}: ${pr.title}`,
                    created_at: new Date().toISOString()
                })
            }
        }

        // Commits (basic fetch)
        const commitsRes = await fetch(`https://api.github.com/repos/${repo.full_name}/commits${sinceParams}`, { headers })
        if (commitsRes.ok) {
            const commits = await commitsRes.json()
            for (const commit of commits) {
                const commitDate = commit.commit?.author?.date
                if (commitDate && new Date(commitDate) < cutoffDate) continue
                newSignals.push({
                    workspace_id: workspaceId,
                    source: 'github',
                    signal_type: 'engineering_activity',
                    content: `[${repo.name}] Commit ${commit.sha.substring(0, 7)}: ${commit.commit.message}`,
                    created_at: new Date().toISOString()
                })
            }
        }
    }

    return newSignals
}

async function syncLinear(supabase: any, workspaceId: string, accessToken: string, lastSyncedAt: string | null) {
    const headers = { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
    const cutoffDate = lastSyncedAt ? new Date(lastSyncedAt) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

    // Linear GraphQL Query
    const query = `
      query {
        issues(filter: { updatedAt: { gt: "${cutoffDate.toISOString()}" } }) {
          nodes {
            title
            description
            priority
            state {
              name
              type
            }
            labels {
              nodes { name }
            }
          }
        }
        projects(filter: { updatedAt: { gt: "${cutoffDate.toISOString()}" } }) {
          nodes { name state description }
        }
        cycles(filter: { updatedAt: { gt: "${cutoffDate.toISOString()}" } }) {
          nodes { name number endsAt }
        }
      }
    `

    // We can also fetch projects/cycles, but focusing on issues for signal generation
    const res = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers,
        body: JSON.stringify({ query })
    })

    if (!res.ok) throw new Error('Linear API error')
    const { data, errors } = await res.json()
    if (errors) throw new Error('Linear GraphQL error')

    const newSignals: any[] = []

    for (const issue of data.issues.nodes) {
        const labels = issue.labels.nodes.map((l: any) => l.name.toLowerCase())
        const stateName = issue.state.name.toLowerCase()
        const stateType = issue.state.type

        let signalType = 'feature_request' // default for backlog
        if (labels.some((l: string) => l.includes('bug'))) signalType = 'bug'
        // Blocked or overdue proxies:
        if (labels.some((l: string) => l.includes('blocked') || l.includes('risk'))) signalType = 'risk'
        if (stateName.includes('blocked')) signalType = 'risk'

        newSignals.push({
            workspace_id: workspaceId,
            source: 'linear',
            signal_type: signalType,
            content: `[Linear Issue] ${issue.title} (Priority: ${issue.priority || 'None'}, State: ${issue.state.name})\n\n${issue.description || ''}`,
            created_at: new Date().toISOString()
        })
    }

    if (data.projects && data.projects.nodes) {
        for (const project of data.projects.nodes) {
            newSignals.push({
                workspace_id: workspaceId,
                source: 'linear',
                signal_type: 'feature_request', // Project level tracking
                content: `[Linear Project] ${project.name} (State: ${project.state})\n\n${project.description || ''}`,
                created_at: new Date().toISOString()
            })
        }
    }

    if (data.cycles && data.cycles.nodes) {
        for (const cycle of data.cycles.nodes) {
            newSignals.push({
                workspace_id: workspaceId,
                source: 'linear',
                signal_type: 'engineering_activity', // Cycle/Sprint tracking
                content: `[Linear Cycle] ${cycle.name || `Cycle ${cycle.number}`} ends at ${cycle.endsAt}`,
                created_at: new Date().toISOString()
            })
        }
    }

    return newSignals
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const workspace = await ensureWorkspace(supabase)

        const body = await request.json()
        const provider = body.provider

        if (!provider || !['github', 'linear'].includes(provider)) {
            return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
        }

        const { data: extAuth, error: dbError } = await supabase
            .from('workspace_integrations')
            .select('access_token, last_synced_at, signal_count')
            .eq('workspace_id', workspace.id)
            .eq('provider', provider)
            .single()

        if (dbError || !extAuth || !extAuth.access_token) {
            return NextResponse.json({ error: 'Integration not connected' }, { status: 400 })
        }

        let newSignals: any[] = []
        try {
            const token = decryptToken(extAuth.access_token)
            if (provider === 'github') {
                newSignals = await syncGithub(supabase, workspace.id, token, extAuth.last_synced_at)
            } else if (provider === 'linear') {
                newSignals = await syncLinear(supabase, workspace.id, token, extAuth.last_synced_at)
            }
        } catch (e: any) {
            console.error(`Sync failed for ${provider}:`, e)

            // If unauthorized/revoked, we could mark the integration as disconnected
            // Let's just return a clean error to the UI
            return NextResponse.json({ error: 'Connection lost, please reconnect your account.' }, { status: 401 })
        }

        let insertedCount = 0
        if (newSignals.length > 0) {
            const { error: insertError } = await supabase
                .from('product_signals')
                .insert(newSignals)

            if (insertError) {
                console.error('Signal insert error:', insertError)
                return NextResponse.json({ error: 'Failed to save signals' }, { status: 500 })
            }
            insertedCount = newSignals.length
        }

        // Update last synced and new count
        const { error: updateError } = await supabase
            .from('workspace_integrations')
            .update({
                last_synced_at: new Date().toISOString(),
                signal_count: (extAuth.signal_count || 0) + insertedCount
            })
            .eq('workspace_id', workspace.id)
            .eq('provider', provider)

        if (updateError) {
            console.error('Failed to update integration details:', updateError)
        }

        return NextResponse.json({ success: true, count: insertedCount })

    } catch (err: unknown) {
        console.error('Sync POST Error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
