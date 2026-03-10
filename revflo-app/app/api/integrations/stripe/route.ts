import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ensureWorkspace } from '@/lib/workspace'

// NOTE: Stripe integration is deprecated in v2. Stripe does not have an OAuth flow in Revflo.
// This route is kept for backwards compatibility but no longer uses mock/demo data.

export async function POST(req: NextRequest) {
    try {
        const { key } = await req.json()
        const supabase = await createClient()
        const workspace = await ensureWorkspace(supabase)

        // Without a real key, return an error — never use mock data
        if (!key) {
            return NextResponse.json(
                { error: 'Stripe API key is required to fetch events.' },
                { status: 400 }
            )
        }

        const since = Math.floor((Date.now() - 30 * 86400000) / 1000)
        const res = await fetch(
            `https://api.stripe.com/v1/events?types[]=customer.subscription.deleted&types[]=customer.subscription.updated&types[]=customer.subscription.created&created[gte]=${since}&limit=100`,
            { headers: { Authorization: `Bearer ${key}` } }
        )

        if (!res.ok) {
            return NextResponse.json({ error: 'Failed to fetch from Stripe API. Check your API key.' }, { status: 422 })
        }

        const { data: events = [] } = await res.json()

        const signals = events.map((event: Record<string, unknown>) => ({
            workspace_id: workspace.id,
            signal_type: String(event.type).includes('deleted') ? 'churn_event' : 'revenue_event',
            source: 'stripe',
            content: `Stripe event: ${event.type}`,
            metadata: {
                stripe_event_id: event.id,
                type: event.type,
                customer: (event.data as Record<string, unknown>)?.object
                    ? ((event.data as Record<string, unknown>).object as Record<string, unknown>)?.customer
                    : null,
            },
            timestamp: new Date((event.created as number) * 1000).toISOString(),
        }))

        if (signals.length > 0) {
            const { error } = await supabase.from('product_signals').insert(signals)
            if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        }

        await supabase.from('integrations').upsert(
            {
                workspace_id: workspace.id,
                type: 'stripe',
                config: { source: 'api_key' },
                status: 'active',
                signal_count: signals.length,
                last_synced_at: new Date().toISOString(),
            },
            { onConflict: 'workspace_id,type' }
        )

        return NextResponse.json({ success: true, events: events.length, signals: signals.length })
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
