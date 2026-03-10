import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ensureWorkspace } from '@/lib/workspace'

export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        // Ensure user is authenticated and has a workspace before redirecting
        await ensureWorkspace(supabase)

        const clientId = process.env.GITHUB_CLIENT_ID
        if (!clientId) {
            return new NextResponse('GITHUB_CLIENT_ID is not configured', { status: 500 })
        }

        const url = new URL('https://github.com/login/oauth/authorize')
        url.searchParams.set('client_id', clientId)
        url.searchParams.set('scope', 'repo')

        return NextResponse.redirect(url.toString())
    } catch (err: unknown) {
        console.error('GitHub Connect Error:', err)
        return new NextResponse('Unauthorized', { status: 401 })
    }
}
