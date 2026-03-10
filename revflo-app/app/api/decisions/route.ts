import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ensureWorkspace } from '@/lib/workspace'

export async function GET() {
    try {
        const supabase = await createClient()
        const workspace = await ensureWorkspace(supabase)

        const { data, error } = await supabase
            .from('decision_records')
            .select(`
                *,
                feature:feature_recommendations(feature_name)
            `)
            .eq('workspace_id', workspace.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Decision records query error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ decision_records: data ?? [] })
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const workspace = await ensureWorkspace(supabase)

        // Get authenticated user ID / email
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const decidedBy = user.email || user.id

        const body = await request.json()
        const { feature_id, decision, reason, consulted, confidence_level, trade_offs } = body

        if (!feature_id || !decision || !reason || !confidence_level) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('decision_records')
            .insert({
                workspace_id: workspace.id,
                feature_id,
                decision,
                reason,
                consulted,
                confidence_level,
                trade_offs,
                decided_by: decidedBy
            })
            .select()
            .single()

        if (error) {
            console.error('Insert decision record error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ decision_record: data })
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
