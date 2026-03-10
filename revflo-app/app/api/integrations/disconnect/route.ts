import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ensureWorkspace } from '@/lib/workspace'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const workspace = await ensureWorkspace(supabase)

        const formData = await request.formData()
        const provider = formData.get('provider') as string

        if (!provider || typeof provider !== 'string') {
            return NextResponse.json({ error: 'Provider is required' }, { status: 400 })
        }

        const { error } = await supabase
            .from('workspace_integrations')
            .delete()
            .eq('workspace_id', workspace.id)
            .eq('provider', provider)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (err: unknown) {
        console.error('Integration Disconnect Error:', err)
        return NextResponse.json({ error: 'Failed to disconnect integration' }, { status: 500 })
    }
}
