import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ensureWorkspace } from '@/lib/workspace'

export async function GET() {
    try {
        const supabase = await createClient()
        const workspace = await ensureWorkspace(supabase)

        const { data, error } = await supabase
            .from('insights')
            .select('*')
            .eq('workspace_id', workspace.id)
            .order('created_at', { ascending: false })

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        const enrichedInsights = (data ?? []).map(insight => {
            let signal_count = 0
            let source_count = 0

            try {
                if (Array.isArray(insight.evidence_signals)) {
                    signal_count = insight.evidence_signals.length
                    const sources = new Set(insight.evidence_signals.map((s: any) => s.source))
                    source_count = sources.size
                }
            } catch (e) {
                // Ignore parse errors, default to 0
            }

            return {
                ...insight,
                signal_count,
                source_count
            }
        })

        return NextResponse.json({ insights: enrichedInsights })
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
