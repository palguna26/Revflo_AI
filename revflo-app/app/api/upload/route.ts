import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ensureWorkspace } from '@/lib/workspace'

// File upload handler for CSV/JSON/TXT customer feedback.
// Only processes real uploaded files — no demo data fallback.

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const workspace = await ensureWorkspace(supabase)

        const contentType = req.headers.get('content-type') ?? ''

        if (!contentType.includes('multipart/form-data')) {
            return NextResponse.json(
                { error: 'A file upload is required. Send a multipart/form-data request with a "file" field.' },
                { status: 400 }
            )
        }

        const formData = await req.formData()
        const file = formData.get('file') as File | null

        if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

        const text = await file.text()
        let entries: { content: string; category?: string }[] = []

        if (file.name.endsWith('.csv')) {
            const lines = text.split('\n').filter(Boolean)
            if (lines.length < 2) {
                return NextResponse.json({ error: 'CSV must have at least a header row and one data row.' }, { status: 400 })
            }
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
            // Plain text — one line per entry
            entries = text.split('\n').filter(l => l.trim()).map(line => ({ content: line.trim() }))
        }

        const signals = entries
            .filter(e => e.content?.trim().length > 3)
            .slice(0, 500) // cap at 500 per upload
            .map(entry => ({
                workspace_id: workspace.id,
                signal_type: 'feature_request',
                source: 'csv_upload',
                content: String(entry.content).slice(0, 1000),
                metadata: { category: entry.category ?? 'general', file: file.name },
                timestamp: new Date().toISOString(),
            }))

        if (signals.length === 0) {
            return NextResponse.json({ error: 'No valid entries found in file. Ensure your file has a content/feedback/text column.' }, { status: 400 })
        }

        // Insert signals — accumulates (does not replace) existing rows
        const { error } = await supabase.from('product_signals').insert(signals)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        // Update the CSV integration tracking row (or create it)
        // Using upsert keyed on (workspace_id, provider) in workspace_integrations
        await supabase.from('workspace_integrations').upsert(
            {
                workspace_id: workspace.id,
                provider: 'csv',
                connected_at: new Date().toISOString(),
                last_synced_at: new Date().toISOString(),
                signal_count: signals.length,
            },
            { onConflict: 'workspace_id,provider' }
        )

        return NextResponse.json({ success: true, count: signals.length })
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
