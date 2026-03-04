/**
 * POST /api/analysis/run
 * Orchestrates the full 7-step execution analysis pipeline.
 *
 * Steps:
 *  1. Fetch PRs from DB
 *  2. Fetch roadmap
 *  3. Run drift detection
 *  4. Compute deterministic scores
 *  5. Generate Groq executive summary
 *  6. Store execution_report
 *  7. Return report_id
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyJwt, verifyOrgOwnership, supabase } from '../../lib/supabase'
import {
    computeVelocityScore, computeScopeScore, computeReviewScore,
    computeFragmentationScore, computeDriftScore, computeExecutionScore,
} from '../../lib/scoring'
import { detectDrift } from '../../lib/drift'
import { generateEmbedding, generateSummary } from '../../lib/llm'
import type { PullRequest } from '../../types/database'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'OPTIONS') return res.status(200).end()
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    try {
        const { userId } = await verifyJwt(req.headers.authorization)
        const { organization_id, repository_id } = req.body as {
            organization_id: string
            repository_id?: string
        }

        if (!organization_id) return res.status(400).json({ error: 'Missing organization_id' })

        await verifyOrgOwnership(userId, organization_id)

        // ── Step 1: Fetch PRs from the last 30 days ───────────────────────────────
        const since = new Date(Date.now() - 30 * 86400000).toISOString()

        let prQuery = supabase
            .from('pull_requests')
            .select('*, repositories!inner(organization_id)')
            .eq('repositories.organization_id', organization_id)
            .gte('created_at', since)

        if (repository_id) {
            prQuery = prQuery.eq('repository_id', repository_id)
        }

        const { data: prRows } = await prQuery
        const prs = (prRows ?? []) as PullRequest[]

        // ── Step 2: Fetch roadmap ─────────────────────────────────────────────────
        const { data: roadmapRow } = await supabase
            .from('roadmaps')
            .select('raw_text')
            .eq('organization_id', organization_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        const roadmapText = roadmapRow?.raw_text ?? ''

        // ── Step 3: Drift detection ───────────────────────────────────────────────
        const drift = await detectDrift(prs, roadmapText, generateEmbedding)

        // ── Step 4: Deterministic scoring ─────────────────────────────────────────
        const { score: velocity, risk: vRisk } = computeVelocityScore(prs)
        const { score: scope, risk: sRisk } = computeScopeScore(prs, drift.alignedCount)
        const { score: review, risk: rRisk } = computeReviewScore(prs)
        const { score: fragmentation, risk: fRisk } = computeFragmentationScore(prs)
        const { score: driftScore, risk: dRisk } = computeDriftScore(drift.driftRatio)

        const breakdown = { velocity, scope, review, fragmentation, drift: driftScore }
        const finalScore = computeExecutionScore(breakdown)
        const risks = [vRisk, sRisk, rRisk, fRisk, dRisk].filter(Boolean)

        // ── Step 5: Generate AI summary ───────────────────────────────────────────
        const { summary } = await generateSummary(finalScore, breakdown, risks as any)

        // ── Step 6: Store report ───────────────────────────────────────────────────
        const { data: report, error: reportError } = await supabase
            .from('execution_reports')
            .insert({
                organization_id,
                repository_id: repository_id ?? null,
                score: finalScore,
                velocity_score: velocity,
                scope_score: scope,
                review_score: review,
                fragmentation_score: fragmentation,
                drift_score: driftScore,
                summary,
                risks: JSON.stringify(risks),
                misaligned_prs: JSON.stringify(drift.misalignedPrs),
                new_clusters: JSON.stringify(drift.newClusters),
            })
            .select('id')
            .single()

        if (reportError || !report) {
            throw new Error('Failed to store report: ' + reportError?.message)
        }

        // ── Step 7: Return report_id ──────────────────────────────────────────────
        return res.status(200).json({ report_id: report.id })

    } catch (err) {
        const msg = err instanceof Error ? err.message : 'Internal error'
        const status = msg.includes('denied') || msg.includes('JWT') ? 403 : 500
        console.error('Analysis error:', err)
        return res.status(status).json({ error: msg })
    }
}
