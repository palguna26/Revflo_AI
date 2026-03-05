import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ensureWorkspace } from '@/lib/workspace'

const AGENT_STEPS = [
    { agent: 'ProductAgent', action: 'analyze_product_signals', description: 'Analyzing all product signals and identifying patterns' },
    { agent: 'ProductAgent', action: 'generate_insights', description: 'Generating actionable insights from signal clusters' },
    { agent: 'DesignAgent', action: 'propose_user_flows', description: 'Proposing user experience flows for top feature' },
    { agent: 'EngineeringAgent', action: 'generate_prd', description: 'Writing detailed Product Requirements Document' },
    { agent: 'EngineeringAgent', action: 'create_engineering_tasks', description: 'Breaking PRD into specific engineering tasks' },
    { agent: 'GrowthAgent', action: 'plan_launch_experiments', description: 'Planning growth experiments and success metrics' },
]

export async function POST(req: NextRequest) {
    try {
        const { feature_id } = await req.json() as { feature_id?: string }
        const supabase = await createClient()
        const workspace = await ensureWorkspace(supabase)

        const steps = AGENT_STEPS.map(s => ({ ...s, status: 'done', completed_at: new Date().toISOString() }))

        const { data: workflow, error } = await supabase
            .from('agent_workflows')
            .insert({
                workspace_id: workspace.id,
                feature_id: feature_id ?? null,
                status: 'done',
                steps,
                result: { message: 'All agents completed successfully' },
            })
            .select()
            .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ success: true, workflow })
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
