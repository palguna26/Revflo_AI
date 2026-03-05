import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Ensures a workspace exists for the current user.
 * Uses RPC (SECURITY DEFINER function) to bypass RLS on INSERT —
 * required because auth.uid() is not reliably available in the
 * Postgres context when called from Next.js server-side routes.
 */
export async function ensureWorkspace(supabase: SupabaseClient) {
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // 1. Try to find existing workspace by owner
    const { data: existing } = await supabase
        .from('workspaces')
        .select('id, name, owner_id')
        .eq('owner_id', user.id)
        .limit(1)
        .maybeSingle()

    if (existing) return existing

    // 2. Try to find via membership
    const { data: membership } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()

    if (membership?.workspace_id) {
        const { data: ws } = await supabase
            .from('workspaces')
            .select('id, name, owner_id')
            .eq('id', membership.workspace_id)
            .single()
        if (ws) return ws
    }

    // 3. Create via SECURITY DEFINER RPC (bypasses RLS safely)
    const workspaceName =
        (user.user_metadata?.full_name as string | undefined) ??
        (user.email?.split('@')[0] ?? 'My') + "'s Workspace"

    const { data: result, error } = await supabase.rpc('create_workspace_for_user', {
        workspace_name: workspaceName,
        user_id_param: user.id,
    })

    if (error) throw new Error(`Failed to create workspace: ${error.message}`)
    if (!result) throw new Error('Workspace creation returned no data')

    return result as { id: string; name: string; owner_id: string }
}
