import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ensureWorkspace } from '@/lib/workspace'

export async function GET() {
    try {
        const supabase = await createClient()
        const workspace = await ensureWorkspace(supabase)
        const wid = workspace.id

        const [signalsRes, insightsRes, recsRes, prdsRes, integrationsRes] = await Promise.all([
            supabase
                .from('product_signals')
                .select('signal_type, source', { count: 'exact', head: false })
                .eq('workspace_id', wid),
            supabase
                .from('insights')
                .select('id, title, confidence_score, insight_type, created_at')
                .eq('workspace_id', wid)
                .order('created_at', { ascending: false })
                .limit(5),
            supabase
                .from('feature_recommendations')
                .select('id, feature_name, priority_score, status, created_at')
                .eq('workspace_id', wid)
                .order('priority_score', { ascending: false })
                .limit(5),
            supabase
                .from('prds')
                .select('id', { count: 'exact', head: true })
                .eq('workspace_id', wid),
            supabase
                .from('integrations')
                .select('type, status, signal_count, last_synced_at')
                .eq('workspace_id', wid),
        ])

        // Signal breakdown by source
        const signalBreakdown: Record<string, number> = {}
        for (const row of signalsRes.data ?? []) {
            signalBreakdown[row.source] = (signalBreakdown[row.source] ?? 0) + 1
        }

        return NextResponse.json({
            workspace: { id: workspace.id, name: workspace.name },
            signal_count: signalsRes.data?.length ?? 0,
            signal_breakdown: signalBreakdown,
            insight_count: insightsRes.data?.length ?? 0,
            recommendation_count: recsRes.data?.length ?? 0,
            prd_count: prdsRes.count ?? 0,
            top_insights: insightsRes.data ?? [],
            top_recommendations: recsRes.data ?? [],
            integrations: integrationsRes.data ?? [],
        })
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
