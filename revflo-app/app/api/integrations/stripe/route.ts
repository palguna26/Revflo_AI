import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ensureWorkspace } from '@/lib/workspace'
import { STRIPE_MOCK_SIGNALS } from '@/lib/mock-data'

export async function POST(req: NextRequest) {
    try {
        const { key } = await req.json()
        const supabase = await createClient()
        const workspace = await ensureWorkspace(supabase)

        let signals = STRIPE_MOCK_SIGNALS.map(s => ({ ...s, workspace_id: workspace.id }))
        let source = 'demo'
        let eventCount = STRIPE_MOCK_SIGNALS.length

        // If real key provided, attempt Stripe API
        if (key && key !== 'demo') {
            try {
                const since = Math.floor((Date.now() - 30 * 86400000) / 1000)
                const res = await fetch(
                    `https://api.stripe.com/v1/events?types[]=customer.subscription.deleted&types[]=customer.subscription.updated&types[]=customer.subscription.created&created[gte]=${since}&limit=100`,
                    { headers: { Authorization: `Bearer ${key}` } }
                )

                if (res.ok) {
                    const { data: events = [] } = await res.json()
                    eventCount = events.length

                    signals = events.map((event: Record<string, unknown>) => ({
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
                    source = 'real'
                }
            } catch {
                // Fall back to demo data
            }
        }

        await supabase.from('integrations').upsert(
            {
                workspace_id: workspace.id,
                type: 'stripe',
                config: { mode: source },
                status: 'active',
                signal_count: signals.length,
                last_synced_at: new Date().toISOString(),
            },
            { onConflict: 'workspace_id,type' }
        )

        const { error } = await supabase.from('product_signals').insert(signals)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ success: true, source, events: eventCount, signals: signals.length })
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
