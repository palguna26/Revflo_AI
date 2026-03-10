import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ensureWorkspace } from '@/lib/workspace'

// Basic CSV parser that handles quotes properly
function parseCSV(text: string): string[][] {
    const result: string[][] = []
    let row: string[] = []
    let val = ''
    let insideQuotes = false

    for (let i = 0; i < text.length; i++) {
        const char = text[i]
        const nextChar = text[i + 1]

        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                val += '"'
                i++ // skip next quote
            } else {
                insideQuotes = !insideQuotes
            }
        } else if (char === ',' && !insideQuotes) {
            row.push(val)
            val = ''
        } else if ((char === '\n' || char === '\r') && !insideQuotes) {
            if (char === '\r' && nextChar === '\n') {
                i++ // skip newline
            }
            row.push(val)
            result.push(row)
            row = []
            val = ''
        } else {
            val += char
        }
    }

    if (val || row.length > 0) {
        row.push(val)
        result.push(row)
    }

    return result.filter(r => r.length > 0 && r.some(c => c.trim() !== ''))
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const workspace = await ensureWorkspace(supabase)
        const formData = await request.formData()

        const file = formData.get('file') as File | null
        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        const text = await file.text()
        const rows = parseCSV(text)

        if (rows.length < 2) {
            return NextResponse.json({ error: 'CSV must contain headers and at least one row of data' }, { status: 400 })
        }

        const headers = rows[0].map(h => h.toLowerCase().trim())
        const dataRows = rows.slice(1)

        // Keywords to auto-detect feedback columns
        const targetKeywords = ['feedback', 'comment', 'request', 'description', 'issue', 'problem', 'note']

        // Find indices of columns that match our keywords
        let targetIndices: number[] = headers
            .map((h, i) => targetKeywords.some(kw => h.includes(kw)) ? i : -1)
            .filter(i => i !== -1)

        // If no matches, ingest all columns
        if (targetIndices.length === 0) {
            targetIndices = headers.map((_, i) => i)
        }

        const signalsToInsert = dataRows.map(row => {
            // Combine the targeted columns into a single content string
            const contentParts = targetIndices.map(idx => {
                const header = headers[idx]
                const value = row[idx] ? row[idx].trim() : ''
                return value ? `${header.charAt(0).toUpperCase() + header.slice(1)}: ${value}` : ''
            }).filter(Boolean)

            return {
                workspace_id: workspace.id,
                source: 'csv_upload',
                signal_type: 'feedback',
                content: contentParts.join('\n\n') || row.join(' | '),
                created_at: new Date().toISOString()
            }
        }).filter(s => s.content.trim() !== '')

        if (signalsToInsert.length === 0) {
            return NextResponse.json({ error: 'No valid data found in CSV to ingest' }, { status: 400 })
        }

        const { error: insertError } = await supabase
            .from('product_signals')
            .insert(signalsToInsert)

        if (insertError) {
            console.error('Signal insert error:', insertError)
            return NextResponse.json({ error: 'Failed to ingest signals into database' }, { status: 500 })
        }

        // Upsert CSV integration status to track total count / last used
        const { data: currentIntegrations } = await supabase
            .from('workspace_integrations')
            .select('signal_count')
            .eq('workspace_id', workspace.id)
            .eq('provider', 'csv')
            .single()

        const currentCount = currentIntegrations?.signal_count || 0

        const { error: upsertError } = await supabase
            .from('workspace_integrations')
            .upsert({
                workspace_id: workspace.id,
                provider: 'csv',
                access_token: null, // No token for CSV
                connected_at: new Date().toISOString(),
                last_synced_at: new Date().toISOString(),
                signal_count: currentCount + signalsToInsert.length
            }, {
                onConflict: 'workspace_id, provider'
            })

        if (upsertError) {
            console.error('Error updating workspace_integrations for CSV:', upsertError)
        }

        return NextResponse.json({
            success: true,
            message: `Successfully ingested ${signalsToInsert.length} signals`,
            count: signalsToInsert.length
        })

    } catch (err: unknown) {
        console.error('CSV Upload Error:', err)
        return NextResponse.json({ error: 'Internal server error processing CSV' }, { status: 500 })
    }
}
