/**
 * POST /api/github/webhook
 * Receives GitHub webhook events, validates signature, ingests PR/commit data.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../../lib/supabase'
import { validateWebhookSignature } from '../../lib/github'

export const config = { api: { bodyParser: false } }

async function readRawBody(req: VercelRequest): Promise<string> {
    return new Promise((resolve, reject) => {
        let data = ''
        req.on('data', (chunk: Buffer) => { data += chunk.toString() })
        req.on('end', () => resolve(data))
        req.on('error', reject)
    })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const rawBody = await readRawBody(req)
        const signature = req.headers['x-hub-signature-256'] as string | undefined
        const event = req.headers['x-github-event'] as string | undefined

        // Validate HMAC-SHA256 signature
        const valid = await validateWebhookSignature(rawBody, signature)
        if (!valid) {
            return res.status(401).json({ error: 'Invalid webhook signature' })
        }

        const payload = JSON.parse(rawBody)
        const repoFullName: string = payload.repository?.full_name ?? ''

        // Look up repository in DB by github_repo_id
        const githubRepoId: number = payload.repository?.id
        if (!githubRepoId) return res.status(200).json({ status: 'ignored', reason: 'no repo id' })

        const { data: repoRow } = await supabase
            .from('repositories')
            .select('id')
            .eq('github_repo_id', githubRepoId)
            .single()

        if (!repoRow) {
            return res.status(200).json({ status: 'ignored', reason: `repo ${repoFullName} not registered` })
        }

        const repositoryId: string = repoRow.id

        // Handle pull_request events
        if (event === 'pull_request') {
            const pr = payload.pull_request
            const mergedAt = pr.merged_at ? new Date(pr.merged_at).toISOString() : null
            const createdAt = pr.created_at ? new Date(pr.created_at).toISOString() : null
            const reviewTimeSec = mergedAt && createdAt
                ? Math.round((new Date(mergedAt).getTime() - new Date(createdAt).getTime()) / 1000)
                : null

            await supabase.from('pull_requests').upsert({
                repository_id: repositoryId,
                github_pr_id: pr.id,
                title: pr.title ?? null,
                body: pr.body ?? null,
                author: pr.user?.login ?? null,
                state: pr.state ?? null,
                additions: pr.additions ?? 0,
                deletions: pr.deletions ?? 0,
                changed_files: pr.changed_files ?? 0,
                created_at: createdAt,
                merged_at: mergedAt,
                closed_at: pr.closed_at ? new Date(pr.closed_at).toISOString() : null,
                review_time_seconds: reviewTimeSec,
            }, { onConflict: 'github_pr_id' })
        }

        // Handle push events
        else if (event === 'push') {
            for (const commit of (payload.commits ?? [])) {
                await supabase.from('commits').upsert({
                    repository_id: repositoryId,
                    github_commit_sha: commit.id ?? commit.sha,
                    author: commit.author?.name ?? null,
                    message: commit.message ?? null,
                    committed_at: commit.timestamp ? new Date(commit.timestamp).toISOString() : null,
                }, { onConflict: 'github_commit_sha' })
            }
        }

        return res.status(200).json({ status: 'ok', event })
    } catch (err) {
        console.error('Webhook error:', err)
        return res.status(500).json({ error: 'Internal server error' })
    }
}
