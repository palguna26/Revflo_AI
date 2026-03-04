/**
 * POST /api/integrations/github
 * List connected repositories for the authenticated org.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyJwt, verifyOrgOwnership, supabase } from '../../lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'OPTIONS') return res.status(200).end()

    try {
        const { userId } = await verifyJwt(req.headers.authorization)

        if (req.method === 'GET') {
            // Get org for user
            const { data: org } = await supabase
                .from('organizations')
                .select('id')
                .eq('owner_id', userId)
                .single()

            if (!org) return res.status(404).json({ error: 'Organization not found' })

            const { data: repos } = await supabase
                .from('repositories')
                .select('*')
                .eq('organization_id', org.id)
                .order('name')

            return res.status(200).json({ repositories: repos ?? [] })
        }

        return res.status(405).json({ error: 'Method not allowed' })
    } catch (err) {
        const msg = err instanceof Error ? err.message : 'Internal error'
        return res.status(500).json({ error: msg })
    }
}
