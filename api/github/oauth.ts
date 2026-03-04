/**
 * POST /api/github/oauth
 * GitHub OAuth callback — exchanges code for token, stores in Supabase.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase, verifyJwt, verifyOrgOwnership } from '../../lib/supabase'
import { exchangeCodeForToken, getGitHubUser, getUserRepos } from '../../lib/github'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { userId } = await verifyJwt(req.headers.authorization)
        const { code, organization_id } = req.body as { code: string; organization_id: string }

        if (!code || !organization_id) {
            return res.status(400).json({ error: 'Missing code or organization_id' })
        }

        await verifyOrgOwnership(userId, organization_id)

        // Exchange code for access token
        const accessToken = await exchangeCodeForToken(code)
        const ghUser = await getGitHubUser(accessToken)

        // Store (upsert) the connection
        await supabase.from('github_connections').upsert({
            organization_id,
            access_token: accessToken,
            github_user: ghUser.login,
        }, { onConflict: 'organization_id' })

        // Fetch and upsert repositories
        const repos = await getUserRepos(accessToken)
        for (const repo of repos) {
            await supabase.from('repositories').upsert({
                organization_id,
                github_repo_id: repo.id,
                name: repo.name,
                full_name: repo.full_name,
                default_branch: repo.default_branch,
                installed: false,
            }, { onConflict: 'github_repo_id' })
        }

        return res.status(200).json({ success: true, repos_found: repos.length })
    } catch (err) {
        const msg = err instanceof Error ? err.message : 'Internal error'
        const status = msg.includes('denied') || msg.includes('JWT') ? 403 : 500
        return res.status(status).json({ error: msg })
    }
}
