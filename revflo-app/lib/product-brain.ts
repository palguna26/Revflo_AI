/**
 * Product Brain — merges signals from GitHub, Linear/Jira, Stripe, feedback
 * to produce actionable product intelligence.
 */

import type { DEMO_PRS, DEMO_LINEAR_ISSUES, DEMO_STRIPE_EVENTS } from '../data/demo-data'

type PR = typeof DEMO_PRS[0]
type Issue = typeof DEMO_LINEAR_ISSUES[0]
type StripeEvent = typeof DEMO_STRIPE_EVENTS[0]

export interface ProductSignal {
    source: 'github' | 'linear' | 'jira' | 'stripe'
    type: 'velocity' | 'scope' | 'revenue' | 'planning'
    value: string
    weight: number
}

export interface ProductInsight {
    id: string
    type: 'opportunity' | 'risk' | 'health' | 'trend'
    severity: 'high' | 'medium' | 'low'
    title: string
    description: string
    signal_sources: string[]
    impact: 'high' | 'medium' | 'low'
    effort: 'high' | 'medium' | 'low'
}

// ── Signal Collection ─────────────────────────────────────────────────────────

export function collectSignals(
    prs: PR[],
    issues: Issue[],
    stripeEvents: StripeEvent[],
): ProductSignal[] {
    const signals: ProductSignal[] = []

    // GitHub: Recent PR themes
    const openPRThemes = prs.filter(p => p.state === 'open' || p.state === 'draft')
    for (const pr of openPRThemes) {
        signals.push({ source: 'github', type: 'scope', value: pr.title, weight: 0.8 })
    }

    // Linear: Urgent issues that have no active PR
    const urgentUnstarted = issues.filter(i => i.priority === 'urgent' && i.status === 'Todo')
    for (const issue of urgentUnstarted) {
        signals.push({ source: 'linear', type: 'planning', value: issue.title, weight: 1.0 })
    }

    // Stripe: Revenue trends
    const upgrades = stripeEvents.filter(e => e.type === 'subscription.upgraded' || e.type.includes('created'))
    const churn = stripeEvents.filter(e => e.type === 'subscription.cancelled')
    if (upgrades.length > churn.length * 2) {
        signals.push({ source: 'stripe', type: 'revenue', value: 'Strong growth signal', weight: 0.9 })
    }

    return signals
}

// ── Insight Generation (Deterministic) ───────────────────────────────────────

export function generateInsights(
    prs: PR[],
    issues: Issue[],
    stripeEvents: StripeEvent[],
): ProductInsight[] {
    const insights: ProductInsight[] = []

    // Detect scope drift: large PRs not tied to planned issues
    const largeDraftPRs = prs.filter(p => (p.state === 'draft' || p.state === 'open') && p.additions > 400)
    if (largeDraftPRs.length > 0) {
        insights.push({
            id: 'auto-drift-1',
            type: 'risk',
            severity: 'medium',
            title: `${largeDraftPRs.length} large unplanned PR(s) detected`,
            description: `${largeDraftPRs.map(p => `"${p.title}"`).join(', ')} — ${largeDraftPRs.reduce((s, p) => s + p.additions, 0)} LOC total. Verify these are roadmap-aligned.`,
            signal_sources: ['GitHub'],
            impact: 'medium',
            effort: 'high',
        })
    }

    // Detect urgent issues with no engineering activity
    const urgentNoAction = issues.filter(i =>
        i.priority === 'urgent' && i.status === 'Todo' &&
        !prs.some(p => p.title.toLowerCase().includes(i.title.toLowerCase().split(' ').slice(0, 2).join(' ').toLowerCase()))
    )
    if (urgentNoAction.length > 0) {
        insights.push({
            id: 'auto-urgent-1',
            type: 'risk',
            severity: 'high',
            title: `${urgentNoAction.length} urgent issue(s) have no active engineering work`,
            description: urgentNoAction.map(i => `"${i.title}"`).join(', '),
            signal_sources: ['Linear'],
            impact: 'high',
            effort: 'medium',
        })
    }

    // Revenue growth opportunity
    const recentUpgrades = stripeEvents.filter(e =>
        e.type === 'subscription.upgraded' &&
        new Date(e.date) > new Date(Date.now() - 30 * 86400000)
    )
    if (recentUpgrades.length > 0) {
        insights.push({
            id: 'auto-stripe-1',
            type: 'opportunity',
            severity: 'high',
            title: `${recentUpgrades.length} enterprise upgrade(s) in last 30 days`,
            description: 'Enterprise customers are upgrading. Check their support tickets for feature gaps that could accelerate expansion revenue.',
            signal_sources: ['Stripe'],
            impact: 'high',
            effort: 'medium',
        })
    }

    return insights
}

// ── Feature Scoring ───────────────────────────────────────────────────────────

export function scoreFeatureOpportunity(
    featureName: string,
    signals: ProductSignal[],
): number {
    let score = 50
    for (const signal of signals) {
        if (signal.value.toLowerCase().includes(featureName.toLowerCase())) {
            score += signal.weight * 10
        }
    }
    return Math.min(Math.round(score), 100)
}
