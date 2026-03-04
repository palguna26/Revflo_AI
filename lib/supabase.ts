import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables')
}

/**
 * Server-side Supabase client using service role key.
 * Used only in API routes — never exposed to the frontend.
 */
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
})

/**
 * Create a Supabase client that acts on behalf of the authenticated user
 * by passing their JWT token. RLS policies will apply.
 */
export function createUserClient(jwt: string) {
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false },
        global: { headers: { Authorization: `Bearer ${jwt}` } },
    })
}

/**
 * Extract and verify the Supabase JWT from an Authorization header.
 * Returns the user_id (sub) or throws if invalid.
 */
export async function verifyJwt(authHeader: string | undefined): Promise<{ userId: string; jwt: string }> {
    if (!authHeader?.startsWith('Bearer ')) {
        throw new Error('Missing or invalid Authorization header')
    }

    const jwt = authHeader.slice(7)
    const { data, error } = await supabase.auth.getUser(jwt)

    if (error || !data.user) {
        throw new Error('Invalid or expired JWT')
    }

    return { userId: data.user.id, jwt }
}

/**
 * Verify the user owns the given organization.
 * Throws if access denied.
 */
export async function verifyOrgOwnership(userId: string, orgId: string): Promise<void> {
    const { data, error } = await supabase
        .from('organizations')
        .select('id')
        .eq('id', orgId)
        .eq('owner_id', userId)
        .single()

    if (error || !data) {
        throw new Error('Organization not found or access denied')
    }
}
