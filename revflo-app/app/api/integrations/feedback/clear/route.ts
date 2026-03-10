import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ensureWorkspace } from '@/lib/workspace'

export async function DELETE(request: Request) {
    try {
        const supabase = await createClient()
        const workspace = await ensureWorkspace(supabase)

        // Delete all signals associated with CSV upload
        const { error: signalsError } = await supabase
            .from('product_signals')
            .delete()
            .eq('workspace_id', workspace.id)
            .eq('source', 'csv_upload')

        if (signalsError) throw signalsError

        // Also delete the integration record so it's fresh for next upload
        const { error: integrationError } = await supabase
            .from('workspace_integrations')
            .delete()
            .eq('workspace_id', workspace.id)
            .eq('provider', 'csv')

        // We don't throw if integration doesn't exist, mainly care about signals.

        return NextResponse.json({ success: true })
    } catch (err: unknown) {
        console.error('CSV Clear Error:', err)
        return NextResponse.json({ error: 'Failed to clear CSV data' }, { status: 500 })
    }
}
