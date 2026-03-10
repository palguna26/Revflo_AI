import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ensureWorkspace } from '@/lib/workspace'

export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        await ensureWorkspace(supabase)

        const clientId = process.env.LINEAR_CLIENT_ID
        if (!clientId) {
            return new NextResponse('LINEAR_CLIENT_ID is not configured', { status: 500 })
        }

        const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin}/api/integrations/linear/callback`

        const url = new URL('https://linear.app/oauth/authorize')
        url.searchParams.set('response_type', 'code')
        url.searchParams.set('client_id', clientId)
        url.searchParams.set('redirect_uri', redirectUri)
        url.searchParams.set('scope', 'read')
        // We could also pass a state parameter here and verify it in the callback for security

        return NextResponse.redirect(url.toString())
    } catch (err: unknown) {
        console.error('Linear Connect Error:', err)
        return new NextResponse('Unauthorized', { status: 401 })
    }
}
