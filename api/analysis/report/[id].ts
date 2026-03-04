/**
 * GET /api/analysis/report/[id]
 * Returns a full execution report by ID.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyJwt, supabase } from '../../../lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'OPTIONS') return res.status(200).end()
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

    try {
        const { userId } = await verifyJwt(req.headers.authorization)
        const reportId = req.query.id as string

        if (!reportId) return res.status(400).json({ error: 'Missing report id' })

        const { data, error } = await supabase
            .from('execution_reports')
            .select('*, organizations!inner(owner_id)')
            .eq('id', reportId)
            .eq('organizations.owner_id', userId)
            .single()

        if (error || !data) {
            return res.status(404).json({ error: 'Report not found' })
        }

        const parse = (field: unknown) => {
            if (typeof field === 'string') {
                try { return JSON.parse(field) } catch { return [] }
            }
            return field ?? []
        }

        return res.status(200).json({
            id: data.id,
            score: data.score,
            breakdown: {
                velocity: data.velocity_score,
                scope: data.scope_score,
                review: data.review_score,
                fragmentation: data.fragmentation_score,
                drift: data.drift_score,
            },
            summary: data.summary,
            risks: parse(data.risks),
            misaligned_prs: parse(data.misaligned_prs),
            new_clusters: parse(data.new_clusters),
            organization_id: data.organization_id,
            repository_id: data.repository_id,
            created_at: data.created_at,
        })
    } catch (err) {
        const msg = err instanceof Error ? err.message : 'Internal error'
        return res.status(msg.includes('JWT') ? 401 : 500).json({ error: msg })
    }
}
