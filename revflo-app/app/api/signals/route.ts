import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ensureWorkspace } from '@/lib/workspace'

export async function GET() {
    try {
        const supabase = await createClient()
        const workspace = await ensureWorkspace(supabase)

        const { data, error } = await supabase
            .from('product_signals')
            .select('*')
            .eq('workspace_id', workspace.id)
            .order('timestamp', { ascending: false })
            .limit(200)

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ signals: data ?? [] })
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
