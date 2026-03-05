import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ensureWorkspace } from '@/lib/workspace'

export async function GET() {
    try {
        const supabase = await createClient()
        const workspace = await ensureWorkspace(supabase)

        // Correct join chain: feature_recommendations → prds → engineering_plans
        // (engineering_plans.prd_id references prds.id, NOT feature_recommendations.id)
        const { data, error } = await supabase
            .from('feature_recommendations')
            .select(`
        *,
        prds (
          *,
          engineering_plans ( * )
        )
      `)
            .eq('workspace_id', workspace.id)
            .order('priority_score', { ascending: false })

        if (error) {
            console.error('Recommendations query error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ recommendations: data ?? [] })
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
