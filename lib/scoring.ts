/**
 * Deterministic Execution Scoring Engine
 * No LLM. No randomness. Pure math.
 *
 * Score = 0.30*Velocity + 0.25*Scope + 0.20*Review + 0.15*Fragmentation + 0.10*Drift
 */

import type { PullRequest, RiskItem, ScoreBreakdown } from '../types/database'

// ── Individual Metrics ────────────────────────────────────────────────────────

export function computeVelocityScore(prs: PullRequest[]): { score: number; risk: RiskItem | null } {
    if (prs.length === 0) return { score: 50, risk: null }

    // Group PRs by ISO week number
    const weekly: Record<number, number> = {}
    for (const pr of prs) {
        if (!pr.created_at) continue
        const d = new Date(pr.created_at)
        const week = getISOWeek(d)
        weekly[week] = (weekly[week] ?? 0) + 1
    }

    const counts = Object.values(weekly)
    if (counts.length < 2) return { score: 80, risk: null }

    const mean = counts.reduce((a, b) => a + b, 0) / counts.length
    const variance = counts.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / counts.length
    const stdDev = Math.sqrt(variance)

    // Normalize: 0 std_dev → 100, ≥10 → 0
    const normalized = Math.min(stdDev / 10, 1)
    const score = Math.round((1 - normalized) * 100)

    const risk: RiskItem | null =
        score < 50
            ? { type: 'velocity', severity: 'high', message: `PR shipping is highly erratic (std dev: ${stdDev.toFixed(1)} PRs/week). Enforce a regular cadence.` }
            : score < 70
                ? { type: 'velocity', severity: 'medium', message: `PR velocity is inconsistent (std dev: ${stdDev.toFixed(1)} PRs/week). Monitor for blockers.` }
                : null

    return { score, risk }
}

export function computeScopeScore(
    prs: PullRequest[],
    alignedCount: number,
): { score: number; risk: RiskItem | null } {
    if (prs.length === 0) return { score: 75, risk: null }

    const misaligned = prs.length - alignedCount
    const ratio = misaligned / prs.length
    const score = Math.round(Math.max(0, 100 - ratio * 100))

    const risk: RiskItem | null =
        score < 50
            ? { type: 'scope', severity: 'high', message: `${misaligned}/${prs.length} PRs are outside the roadmap. Significant scope drift.` }
            : score < 70
                ? { type: 'scope', severity: 'medium', message: `${misaligned}/${prs.length} PRs show partial misalignment. Review roadmap adherence.` }
                : null

    return { score, risk }
}

export function computeReviewScore(prs: PullRequest[]): { score: number; risk: RiskItem | null } {
    const times = prs
        .filter((p) => p.review_time_seconds != null && p.review_time_seconds > 0)
        .map((p) => p.review_time_seconds! / 3600) // convert to hours

    if (times.length === 0) return { score: 70, risk: null }

    const avgHours = times.reduce((a, b) => a + b, 0) / times.length
    // Normalize to 0-48h window
    const normalized = Math.min(avgHours / 48, 1)
    const score = Math.round((1 - normalized) * 100)

    const risk: RiskItem | null =
        avgHours > 24
            ? { type: 'review', severity: 'high', message: `Average PR review time is ${avgHours.toFixed(1)}h. Reviews are bottlenecking delivery.` }
            : avgHours > 12
                ? { type: 'review', severity: 'medium', message: `Average PR review time is ${avgHours.toFixed(1)}h. Consider setting review SLAs.` }
                : null

    return { score, risk }
}

export function computeFragmentationScore(prs: PullRequest[]): { score: number; risk: RiskItem | null } {
    if (prs.length === 0) return { score: 80, risk: null }

    const smallPrs = prs.filter((p) => (p.additions ?? 0) + (p.deletions ?? 0) < 50)
    const ratio = smallPrs.length / prs.length
    const score = Math.round(Math.max(0, 100 - ratio * 100))

    const risk: RiskItem | null =
        ratio > 0.6
            ? { type: 'fragmentation', severity: 'high', message: `${smallPrs.length}/${prs.length} PRs are <50 LOC. High micro-task overhead.` }
            : ratio > 0.4
                ? { type: 'fragmentation', severity: 'medium', message: `${smallPrs.length}/${prs.length} PRs are very small. Monitor for excessive task splitting.` }
                : null

    return { score, risk }
}

export function computeDriftScore(driftRatio: number): { score: number; risk: RiskItem | null } {
    const score = Math.round(Math.max(0, 100 - driftRatio * 100))

    const risk: RiskItem | null =
        driftRatio > 0.4
            ? { type: 'drift', severity: 'high', message: `${Math.round(driftRatio * 100)}% of PR themes are outside the roadmap. Major scope drift.` }
            : driftRatio > 0.2
                ? { type: 'drift', severity: 'medium', message: `${Math.round(driftRatio * 100)}% of PR themes are off-roadmap. Review prioritization.` }
                : null

    return { score, risk }
}

// ── Aggregate ─────────────────────────────────────────────────────────────────

export function computeExecutionScore(breakdown: ScoreBreakdown): number {
    return Math.round(
        0.30 * breakdown.velocity +
        0.25 * breakdown.scope +
        0.20 * breakdown.review +
        0.15 * breakdown.fragmentation +
        0.10 * breakdown.drift
    )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getISOWeek(d: Date): number {
    const date = new Date(d)
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7))
    const week1 = new Date(date.getFullYear(), 0, 4)
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
}
