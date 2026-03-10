import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ensureWorkspace } from '@/lib/workspace'

export async function GET() {
    try {
        const supabase = await createClient()
        const workspace = await ensureWorkspace(supabase)

        const { data: integrations, error } = await supabase
            .from('workspace_integrations')
            .select('id, provider, connected_at, last_synced_at, signal_count')
            .eq('workspace_id', workspace.id)

        if (error) {
            console.error('Error fetching integrations:', error)
            return NextResponse.json({ error: 'Failed to fetch integrations' }, { status: 500 })
        }

        return NextResponse.json({ integrations: integrations ?? [] })
    } catch (err: unknown) {
        console.error('Integrations GET Error:', err)
        return NextResponse.json({ error: 'Unknown error' }, { status: 500 })
    }
}
