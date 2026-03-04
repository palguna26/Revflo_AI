/**
 * /api/integrations/jira
 * Jira integration placeholder — connect and sync issues.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyJwt } from '../../lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'OPTIONS') return res.status(200).end()

    try {
        await verifyJwt(req.headers.authorization)

        // TODO: Implement Jira OAuth + issue sync
        // Requires JIRA_CLIENT_ID env var

        return res.status(200).json({
            status: 'not_implemented',
            message: 'Jira integration coming soon. Requires JIRA_CLIENT_ID env var.',
        })
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized' })
    }
}
