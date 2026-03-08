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

    let finalWorkspace: { id: string; name: string; owner_id: string } | null = existing

    if (!finalWorkspace) {
        if (membership?.workspace_id) {
            const { data: ws } = await supabase
                .from('workspaces')
                .select('id, name, owner_id')
                .eq('id', membership.workspace_id)
                .single()
            if (ws) finalWorkspace = ws
        }
    }

    if (!finalWorkspace) {
        const { data: result, error } = await supabase.rpc('create_workspace_for_user', {
            workspace_name: workspaceName,
            user_id_param: user.id,
        })

        if (error) throw new Error(`Failed to create workspace: ${error.message}`)
        if (!result) throw new Error('Workspace creation returned no data')

        finalWorkspace = result as { id: string; name: string; owner_id: string }
    }

    if (!finalWorkspace) throw new Error('Failed to resolve workspace')

    // Seed mock integrations and signals if they don't exist
    const { count } = await supabase
        .from('integrations')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', finalWorkspace.id)

    if (count === 0) {
        // Insert dummy integrations
        const integrationsToInsert = [
            { workspace_id: finalWorkspace.id, type: 'github', status: 'connected', config: { mode: 'demo' } },
            { workspace_id: finalWorkspace.id, type: 'linear', status: 'connected', config: { mode: 'demo' } },
            { workspace_id: finalWorkspace.id, type: 'stripe', status: 'connected', config: { mode: 'demo' } },
            { workspace_id: finalWorkspace.id, type: 'feedback', status: 'connected', config: { mode: 'demo' } }
        ];

        await supabase.from('integrations').insert(integrationsToInsert)

        // Seed mock signals using our exact dataset
        const { GITHUB_MOCK_SIGNALS, LINEAR_MOCK_SIGNALS, STRIPE_MOCK_SIGNALS, FEEDBACK_MOCK_SIGNALS } = await import('./mock-data')

        // Take a predefined set of 10 signals ensuring representation from all sources
        const selectedSignals = [
            ...GITHUB_MOCK_SIGNALS.slice(0, 3),   // 3 from GitHub
            ...LINEAR_MOCK_SIGNALS.slice(0, 3),   // 3 from Linear
            ...STRIPE_MOCK_SIGNALS.slice(0, 2),   // 2 from Stripe
            ...FEEDBACK_MOCK_SIGNALS.slice(0, 2)  // 2 from Feedback
        ];

        const signalsToInsert = selectedSignals.map(s => ({
            workspace_id: finalWorkspace.id!,
            signal_type: s.signal_type,
            source: s.source,
            content: s.content,
            metadata: s.metadata,
            timestamp: s.timestamp
        }));

        await supabase.from('product_signals').insert(signalsToInsert)

        // Update signal counts in integrations
        await Promise.all(['github', 'linear', 'stripe', 'feedback'].map(async (type) => {
            const count = signalsToInsert.filter(s => s.source === type).length;
            await supabase
                .from('integrations')
                .update({ signal_count: count, last_synced_at: new Date().toISOString() })
                .eq('workspace_id', finalWorkspace.id)
                .eq('type', type);
        }));
    }

    return finalWorkspace
}
