/**
 * /api/integrations/linear
 * Linear integration placeholder — connect and sync issues.
 * Full implementation: OAuth with Linear, sync issues to DB.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyJwt } from '../../lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'OPTIONS') return res.status(200).end()

    try {
        await verifyJwt(req.headers.authorization)

        // TODO: Implement Linear OAuth + issue sync
        // 1. POST /api/integrations/linear  → trigger OAuth flow
        // 2. GET  /api/integrations/linear  → list synced issues

        return res.status(200).json({
            status: 'not_implemented',
            message: 'Linear integration coming soon. Requires LINEAR_CLIENT_ID env var.',
        })
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized' })
    }
}
