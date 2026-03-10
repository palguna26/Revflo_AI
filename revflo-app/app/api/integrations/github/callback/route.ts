import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ensureWorkspace } from '@/lib/workspace'
import { encryptToken } from '@/lib/encryption'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const code = searchParams.get('code')

        if (!code) {
            return NextResponse.redirect(new URL('/dashboard/integrations?error=no_code', request.url))
        }

        const supabase = await createClient()
        const workspace = await ensureWorkspace(supabase)

        const clientId = process.env.GITHUB_CLIENT_ID
        const clientSecret = process.env.GITHUB_CLIENT_SECRET

        if (!clientId || !clientSecret) {
            return NextResponse.redirect(new URL('/dashboard/integrations?error=config_missing', request.url))
        }

        // Exchange code for token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code,
            }),
        })

        const tokenData = await tokenResponse.json()
        const accessToken = tokenData.access_token

        if (!accessToken) {
            console.error('GitHub token exchange failed:', tokenData)
            return NextResponse.redirect(new URL('/dashboard/integrations?error=token_exchange_failed', request.url))
        }

        const encryptedToken = encryptToken(accessToken)

        // Upsert integration
        const { error: upsertError } = await supabase
            .from('workspace_integrations')
            .upsert({
                workspace_id: workspace.id,
                provider: 'github',
                access_token: encryptedToken,
                connected_at: new Date().toISOString()
            }, {
                onConflict: 'workspace_id, provider'
            })

        if (upsertError) {
            console.error('DB Upsert Error:', upsertError)
            return NextResponse.redirect(new URL('/dashboard/integrations?error=db_error', request.url))
        }

        // Trigger an initial sync in the background
        fetch(new URL('/api/integrations/sync', request.url).toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // We pass cookies so it can authenticate as the user
                'Cookie': request.headers.get('cookie') || ''
            },
            body: JSON.stringify({ provider: 'github' })
        }).catch(console.error) // Fire and forget

        // Redirect back to integrations page
        return NextResponse.redirect(new URL('/dashboard/integrations?success=github_connected', request.url))

    } catch (err: unknown) {
        console.error('GitHub Callback Error:', err)
        return NextResponse.redirect(new URL('/dashboard/integrations?error=unknown', request.url))
    }
}
