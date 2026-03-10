import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ensureWorkspace } from '@/lib/workspace'
import { randomUUID, createHash } from 'crypto'

export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const workspace = await ensureWorkspace(supabase)

        const { data: keys, error } = await supabase
            .from('api_keys')
            .select('id, name, key_prefix, created_at, last_used_at')
            .eq('workspace_id', workspace.id)
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ keys: keys || [] })
    } catch (err: unknown) {
        console.error('API Keys GET Error:', err)
        return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const workspace = await ensureWorkspace(supabase)

        const body = await request.json()
        const { name } = body

        if (!name || typeof name !== 'string') {
            return NextResponse.json({ error: 'Key name is required' }, { status: 400 })
        }

        // Generate key using crypto
        const rawToken = randomUUID().replace(/-/g, '')
        const fullKey = `rflo_${rawToken}`

        // Hash for storage
        const hash = createHash('sha256').update(fullKey).digest('hex')

        // Extract prefix for UI display
        const keyPrefix = fullKey.substring(0, 9) // "rflo_XXXX"

        const { data, error } = await supabase
            .from('api_keys')
            .insert({
                workspace_id: workspace.id,
                name,
                key_prefix: keyPrefix,
                key_hash: hash
            })
            .select('id, name, key_prefix, created_at, last_used_at')
            .single()

        if (error) throw error

        return NextResponse.json({ success: true, keyRecord: data, plainTextKey: fullKey })
    } catch (err: unknown) {
        console.error('API Keys POST Error:', err)
        return NextResponse.json({ error: 'Failed to generate API key' }, { status: 500 })
    }
}
