import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ensureWorkspace } from '@/lib/workspace'
import { FEEDBACK_MOCK_SIGNALS } from '@/lib/mock-data'

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const workspace = await ensureWorkspace(supabase)

        const contentType = req.headers.get('content-type') ?? ''

        // Handle multipart file upload
        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData()
            const file = formData.get('file') as File | null

            if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

            const text = await file.text()
            let entries: { content: string; category?: string }[] = []

            if (file.name.endsWith('.csv')) {
                const lines = text.split('\n').filter(Boolean)
                const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
                entries = lines.slice(1).map(line => {
                    const vals = line.split(',')
                    const obj: Record<string, string> = {}
                    headers.forEach((h, i) => { obj[h] = (vals[i] ?? '').trim().replace(/^"|"$/g, '') })
                    return {
                        content: obj.content ?? obj.feedback ?? obj.text ?? obj.message ?? line,
                        category: obj.category ?? obj.type ?? obj.label ?? 'general',
                    }
                })
            } else if (file.name.endsWith('.json')) {
                const parsed = JSON.parse(text)
                entries = Array.isArray(parsed) ? parsed : [parsed]
            } else {
                entries = text.split('\n').filter(l => l.trim()).map(line => ({ content: line.trim() }))
            }

            const signals = entries
                .filter(e => e.content?.trim().length > 3)
                .slice(0, 500) // cap at 500 per upload
                .map(entry => ({
                    workspace_id: workspace.id,
                    signal_type: 'feature_request',
                    source: 'feedback',
                    content: String(entry.content).slice(0, 1000),
                    metadata: { category: entry.category ?? 'general', file: file.name },
                    timestamp: new Date().toISOString(),
                }))

            if (signals.length === 0) return NextResponse.json({ error: 'No valid entries found in file' }, { status: 400 })

            const { error } = await supabase.from('product_signals').insert(signals)
            if (error) return NextResponse.json({ error: error.message }, { status: 500 })

            // Update or create feedback integration record
            await supabase.from('integrations').upsert(
                {
                    workspace_id: workspace.id,
                    type: 'feedback',
                    config: { source: 'upload', filename: file.name },
                    status: 'active',
                    signal_count: signals.length,
                    last_synced_at: new Date().toISOString(),
                },
                { onConflict: 'workspace_id,type' }
            )

            return NextResponse.json({ success: true, count: signals.length })
        }

        // Demo mode — load mock feedback signals
        const signals = FEEDBACK_MOCK_SIGNALS.map(s => ({ ...s, workspace_id: workspace.id }))

        await supabase.from('integrations').upsert(
            {
                workspace_id: workspace.id,
                type: 'feedback',
                config: { mode: 'demo' },
                status: 'active',
                signal_count: signals.length,
                last_synced_at: new Date().toISOString(),
            },
            { onConflict: 'workspace_id,type' }
        )

        const { error } = await supabase.from('product_signals').insert(signals)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ success: true, source: 'demo', count: signals.length })
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
