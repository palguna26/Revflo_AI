/**
 * /api/integrations/stripe
 * Stripe integration placeholder — billing and subscription management.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyJwt } from '../../lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'OPTIONS') return res.status(200).end()

    try {
        await verifyJwt(req.headers.authorization)

        // TODO: Implement Stripe webhook + subscription management
        // Requires STRIPE_SECRET env var

        return res.status(200).json({
            status: 'not_implemented',
            message: 'Stripe integration coming soon. Requires STRIPE_SECRET env var.',
        })
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized' })
    }
}
