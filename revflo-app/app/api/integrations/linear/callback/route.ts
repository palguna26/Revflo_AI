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

        const clientId = process.env.LINEAR_CLIENT_ID
        const clientSecret = process.env.LINEAR_CLIENT_SECRET
        const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin}/api/integrations/linear/callback`

        if (!clientId || !clientSecret) {
            return NextResponse.redirect(new URL('/dashboard/integrations?error=config_missing', request.url))
        }

        // Exchange code for token
        const tokenResponse = await fetch('https://api.linear.app/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                code: code,
                grant_type: 'authorization_code'
            }),
        })

        const tokenData = await tokenResponse.json()
        const accessToken = tokenData.access_token

        if (!accessToken) {
            console.error('Linear token exchange failed:', tokenData)
            return NextResponse.redirect(new URL('/dashboard/integrations?error=token_exchange_failed', request.url))
        }

        const encryptedToken = encryptToken(accessToken)

        // Upsert integration
        const { error: upsertError } = await supabase
            .from('workspace_integrations')
            .upsert({
                workspace_id: workspace.id,
                provider: 'linear',
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
                'Cookie': request.headers.get('cookie') || ''
            },
            body: JSON.stringify({ provider: 'linear' })
        }).catch(console.error)

        return NextResponse.redirect(new URL('/dashboard/integrations?success=linear_connected', request.url))

    } catch (err: unknown) {
        console.error('Linear Callback Error:', err)
        return NextResponse.redirect(new URL('/dashboard/integrations?error=unknown', request.url))
    }
}
