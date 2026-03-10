import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ensureWorkspace } from '@/lib/workspace'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const workspace = await ensureWorkspace(supabase)

        const body = await request.json()
        const { auto_analyze } = body

        // Fetch current settings
        const { data: wsData, error: wsError } = await supabase
            .from('workspaces')
            .select('workspace_settings')
            .eq('id', workspace.id)
            .single()

        if (wsError) throw new Error(wsError.message)

        const currentSettings = wsData?.workspace_settings || {}

        // Update settings
        const { data, error } = await supabase
            .from('workspaces')
            .update({
                workspace_settings: {
                    ...currentSettings,
                    auto_analyze: !!auto_analyze
                }
            })
            .eq('id', workspace.id)
            .select()
            .single()

        if (error) {
            throw new Error(`Update error: ${error.message}`)
        }

        return NextResponse.json({ success: true, settings: data.workspace_settings })
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        console.error('Settings API error:', msg)
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
