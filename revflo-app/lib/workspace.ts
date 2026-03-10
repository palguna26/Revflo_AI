import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Ensures a workspace exists for the current user in an idempotent way.
 * Handles the creation race condition silently.
 */
export async function ensureWorkspace(supabase: SupabaseClient) {
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    try {
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

        if (error) {
            // If it's a constraint violation or concurrent creation, it's fine, we will just return graceful error
            throw new Error(`Failed to create workspace: ${error.message}`)
        }

        if (!result) throw new Error('Workspace creation returned no data')

        const finalWorkspace = result as { id: string; name: string; owner_id: string }

        // Seed mock data for development demonstration
        try {
            await supabase.from('integrations').insert([
                { workspace_id: finalWorkspace.id, type: 'github', status: 'connected', config: { mode: 'demo' } },
                { workspace_id: finalWorkspace.id, type: 'linear', status: 'connected', config: { mode: 'demo' } },
                { workspace_id: finalWorkspace.id, type: 'stripe', status: 'connected', config: { mode: 'demo' } },
                { workspace_id: finalWorkspace.id, type: 'feedback', status: 'connected', config: { mode: 'demo' } }
            ])

            const { GITHUB_MOCK_SIGNALS, LINEAR_MOCK_SIGNALS, STRIPE_MOCK_SIGNALS, FEEDBACK_MOCK_SIGNALS } = await import('./mock-data')
            const selectedSignals = [
                ...GITHUB_MOCK_SIGNALS.slice(0, 3),
                ...LINEAR_MOCK_SIGNALS.slice(0, 3),
                ...STRIPE_MOCK_SIGNALS.slice(0, 2),
                ...FEEDBACK_MOCK_SIGNALS.slice(0, 2)
            ];

            const signalsToInsert = selectedSignals.map(s => ({
                workspace_id: finalWorkspace.id,
                signal_type: s.signal_type,
                source: s.source,
                content: s.content,
                metadata: s.metadata,
                timestamp: s.timestamp
            }));

            await supabase.from('product_signals').insert(signalsToInsert)

            // Update signal counts
            await Promise.all(['github', 'linear', 'stripe', 'feedback'].map(async (type) => {
                const count = signalsToInsert.filter(s => s.source === type).length;
                await supabase
                    .from('integrations')
                    .update({ signal_count: count, last_synced_at: new Date().toISOString() })
                    .eq('workspace_id', finalWorkspace.id)
                    .eq('type', type);
            }));
        } catch (seedError) {
            console.error('Error seeding mock data:', seedError)
            // don't fail workspace creation on seed failure
        }

        return finalWorkspace
    } catch (e) {
        console.error('ensureWorkspace encountered an error (likely a race condition). Delaying and throwing for reload.', e)
        // If workspace creation fails or hits a race condition, return an error that prompts a retry
        // Next.js will catch this in the page level and ideally re-trigger data loading or show a pending state
        throw new Error('Setting up your workspace... please wait a moment.')
    }
}
