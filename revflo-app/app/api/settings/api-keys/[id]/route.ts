import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ensureWorkspace } from '@/lib/workspace'

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // In Next.js App Router, params must be awaited in dynamic routes
) {
    try {
        const supabase = await createClient()
        const workspace = await ensureWorkspace(supabase)
        const id = (await params).id

        if (!id) {
            return NextResponse.json({ error: 'Key ID is required' }, { status: 400 })
        }

        const { error } = await supabase
            .from('api_keys')
            .delete()
            .eq('id', id)
            .eq('workspace_id', workspace.id) // Authorization double-check

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (err: unknown) {
        console.error('API Key DELETE Error:', err)
        return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 })
    }
}
