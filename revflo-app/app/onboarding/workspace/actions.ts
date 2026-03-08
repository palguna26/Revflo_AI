'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createWorkspace(formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        redirect('/login')
    }

    if (!name || !slug) {
        return // Handle error case later, or use form validation
    }

    // Insert workspace into DB
    const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
            name,
            slug,
            owner_id: user.id
        })
        .select()
        .single()

    if (workspaceError) {
        // Handle unique constraint error if slug is taken, etc.
        console.error("Workspace creation error:", workspaceError)
        redirect('/onboarding?error=slug_taken')
        return
    }

    // Add user as a member
    const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
            workspace_id: workspace.id,
            user_id: user.id,
            role: 'owner'
        })

    if (memberError) {
        console.error("Workspace member error:", memberError)
    }

    // Move to next onboarding step
    redirect('/onboarding')
}
