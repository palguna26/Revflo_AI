import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ensureWorkspace } from '@/lib/workspace'

export async function PATCH(request: Request) {
    try {
        const supabase = await createClient()
        const workspace = await ensureWorkspace(supabase)

        const body = await request.json()
        const { name } = body

        if (!name || typeof name !== 'string') {
            return NextResponse.json({ error: 'Workspace name is required' }, { status: 400 })
        }

        const { error } = await supabase
            .from('workspaces')
            .update({ name })
            .eq('id', workspace.id)

        if (error) throw error

        return NextResponse.json({ success: true, name })
    } catch (err: unknown) {
        console.error('Workspace PATCH Error:', err)
        return NextResponse.json({ error: 'Failed to update workspace name' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const supabase = await createClient()
        const workspace = await ensureWorkspace(supabase)

        // Delete workspace (cascade removes related signals, integrations, keys, members)
        const { error } = await supabase
            .from('workspaces')
            .delete()
            .eq('id', workspace.id)

        if (error) throw error

        // Sign the user out
        await supabase.auth.signOut()

        // Returning a 200 tells the client to redirect
        return NextResponse.json({ success: true, redirect: '/register' })
    } catch (err: unknown) {
        console.error('Workspace DELETE Error:', err)
        return NextResponse.json({ error: 'Failed to delete workspace' }, { status: 500 })
    }
}
