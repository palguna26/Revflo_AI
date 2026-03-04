// ============================================================
// RevFlo Demo Data — Complete dataset for YC demo
// Works without any API keys
// ============================================================

export const DEMO_ORG = {
    id: 'demo-org-acme',
    name: 'Acme AI',
    plan: 'pro',
}

export const DEMO_SCORE = {
    overall: 74,
    velocity: 81,
    alignment: 68,
    review: 77,
    fragmentation: 72,
    drift: 61,
    trend: +5, // up 5 points vs last week
}

export const DEMO_PRS = [
    { id: 'pr-1', title: 'feat: AI chat interface for onboarding', author: 'sarah_dev', state: 'merged', additions: 312, deletions: 45, created_at: daysAgo(2), merged_at: daysAgo(1), review_time_h: 6.2, labels: ['feature', 'ai'] },
    { id: 'pr-2', title: 'fix: token refresh race condition', author: 'marcus_eng', state: 'merged', additions: 28, deletions: 12, created_at: daysAgo(3), merged_at: daysAgo(2), review_time_h: 3.1, labels: ['bug', 'auth'] },
    { id: 'pr-3', title: 'chore: upgrade Next.js 14.2', author: 'sarah_dev', state: 'merged', additions: 89, deletions: 234, created_at: daysAgo(4), merged_at: daysAgo(3), review_time_h: 1.5, labels: ['chore'] },
    { id: 'pr-4', title: 'feat: Stripe webhook handler for upgrades', author: 'priya_pm_eng', state: 'merged', additions: 156, deletions: 34, created_at: daysAgo(5), merged_at: daysAgo(4), review_time_h: 8.7, labels: ['feature', 'billing'] },
    { id: 'pr-5', title: 'feat: dashboard analytics overview', author: 'marcus_eng', state: 'open', additions: 445, deletions: 67, created_at: daysAgo(1), merged_at: null, review_time_h: null, labels: ['feature', 'dashboard'] },
    { id: 'pr-6', title: 'fix: onboarding step 3 broken on mobile', author: 'alex_frontend', state: 'merged', additions: 34, deletions: 18, created_at: daysAgo(6), merged_at: daysAgo(5), review_time_h: 2.0, labels: ['bug', 'mobile'] },
    { id: 'pr-7', title: 'feat: CSV export for reports', author: 'priya_pm_eng', state: 'merged', additions: 123, deletions: 22, created_at: daysAgo(7), merged_at: daysAgo(6), review_time_h: 4.3, labels: ['feature'] },
    { id: 'pr-8', title: 'refactor: extract scoring engine', author: 'sarah_dev', state: 'merged', additions: 201, deletions: 188, created_at: daysAgo(8), merged_at: daysAgo(7), review_time_h: 5.1, labels: ['refactor'] },
    { id: 'pr-9', title: 'feat: email digest notifications', author: 'marcus_eng', state: 'open', additions: 287, deletions: 12, created_at: daysAgo(2), merged_at: null, review_time_h: null, labels: ['feature', 'notifications'] },
    { id: 'pr-10', title: 'fix: memory leak in WebSocket handler', author: 'alex_frontend', state: 'merged', additions: 15, deletions: 8, created_at: daysAgo(10), merged_at: daysAgo(9), review_time_h: 1.2, labels: ['bug'] },
    { id: 'pr-11', title: 'feat: team collaboration — shared workspaces', author: 'sarah_dev', state: 'draft', additions: 532, deletions: 23, created_at: daysAgo(1), merged_at: null, review_time_h: null, labels: ['feature', 'collab'] },
    { id: 'pr-12', title: 'chore: add GitHub Actions CI', author: 'marcus_eng', state: 'merged', additions: 67, deletions: 0, created_at: daysAgo(12), merged_at: daysAgo(11), review_time_h: 0.8, labels: ['chore', 'devops'] },
    { id: 'pr-13', title: 'feat: Linear integration OAuth flow', author: 'priya_pm_eng', state: 'merged', additions: 198, deletions: 45, created_at: daysAgo(9), merged_at: daysAgo(8), review_time_h: 6.0, labels: ['feature', 'integration'] },
    { id: 'pr-14', title: 'feat: Dark mode toggle', author: 'alex_frontend', state: 'merged', additions: 88, deletions: 34, created_at: daysAgo(13), merged_at: daysAgo(12), review_time_h: 2.4, labels: ['feature', 'ui'] },
    { id: 'pr-15', title: 'fix: Jira API rate limit handling', author: 'sarah_dev', state: 'merged', additions: 45, deletions: 23, created_at: daysAgo(14), merged_at: daysAgo(13), review_time_h: 1.9, labels: ['bug', 'integration'] },
    { id: 'pr-16', title: 'feat: AI feature spec generator', author: 'priya_pm_eng', state: 'open', additions: 378, deletions: 12, created_at: daysAgo(1), merged_at: null, review_time_h: null, labels: ['feature', 'ai'] },
    { id: 'pr-17', title: 'refactor: database query optimization', author: 'marcus_eng', state: 'merged', additions: 134, deletions: 267, created_at: daysAgo(15), merged_at: daysAgo(14), review_time_h: 7.2, labels: ['refactor', 'perf'] },
    { id: 'pr-18', title: 'feat: user invite flow', author: 'alex_frontend', state: 'merged', additions: 221, deletions: 56, created_at: daysAgo(16), merged_at: daysAgo(15), review_time_h: 3.8, labels: ['feature'] },
    { id: 'pr-19', title: 'chore: dependency security patches', author: 'sarah_dev', state: 'merged', additions: 0, deletions: 12, created_at: daysAgo(17), merged_at: daysAgo(16), review_time_h: 0.4, labels: ['chore', 'security'] },
    { id: 'pr-20', title: 'feat: real-time collaboration cursors', author: 'priya_pm_eng', state: 'draft', additions: 612, deletions: 34, created_at: daysAgo(2), merged_at: null, review_time_h: null, labels: ['feature', 'collab'] },
]

export const DEMO_LINEAR_ISSUES = [
    { id: 'lin-1', title: 'Improve onboarding completion rate', status: 'In Progress', priority: 'urgent', assignee: 'Sarah', labels: ['growth', 'onboarding'], description: 'Only 34% of users complete step 3. Need to redesign the flow.' },
    { id: 'lin-2', title: 'Add AI-powered feature suggestions', status: 'In Progress', priority: 'high', assignee: 'Priya', labels: ['ai', 'product'], description: 'PM teams want AI to suggest next features based on user signals.' },
    { id: 'lin-3', title: 'Mobile responsive dashboard', status: 'Todo', priority: 'medium', assignee: 'Alex', labels: ['mobile', 'ui'], description: 'Dashboard breaks on <768px screens.' },
    { id: 'lin-4', title: 'Stripe billing portal integration', status: 'Done', priority: 'high', assignee: 'Priya', labels: ['billing'], description: 'Users need to manage subscriptions in-app.' },
    { id: 'lin-5', title: 'GitHub webhook reliability', status: 'Done', priority: 'urgent', assignee: 'Marcus', labels: ['infra', 'github'], description: 'Fix dropped webhook events under load.' },
    { id: 'lin-6', title: 'Team workspace sharing', status: 'In Progress', priority: 'high', assignee: 'Sarah', labels: ['collaboration'], description: 'Multiple users per organization.' },
    { id: 'lin-7', title: 'CSV/PDF report export', status: 'Done', priority: 'medium', assignee: 'Priya', labels: ['reporting'], description: 'Export execution reports for stakeholders.' },
    { id: 'lin-8', title: 'Email digest — weekly insights', status: 'In Progress', priority: 'medium', assignee: 'Marcus', labels: ['notifications'], description: 'Send weekly product health digest to founders.' },
    { id: 'lin-9', title: 'Jira epic mapping to roadmap', status: 'Todo', priority: 'high', assignee: 'Alex', labels: ['integration', 'jira'], description: 'Map Jira epics to RevFlo roadmap themes automatically.' },
    { id: 'lin-10', title: 'User feedback sentiment analysis', status: 'Todo', priority: 'medium', assignee: 'Sarah', labels: ['ai', 'feedback'], description: 'Parse Intercom/Zendesk tickets for product signals.' },
    { id: 'lin-11', title: 'API rate limit alerts', status: 'Done', priority: 'low', assignee: 'Marcus', labels: ['infra'], description: 'Alert when approaching GitHub/Linear API limits.' },
    { id: 'lin-12', title: 'Onboarding checklist widget', status: 'In Progress', priority: 'high', assignee: 'Alex', labels: ['onboarding', 'ui'], description: 'Interactive checklist to guide new users.' },
    { id: 'lin-13', title: 'Custom scoring weights', status: 'Todo', priority: 'low', assignee: 'Priya', labels: ['customization'], description: 'Let teams adjust metric weights for their context.' },
    { id: 'lin-14', title: 'Slack integration for alerts', status: 'Todo', priority: 'medium', assignee: 'Sarah', labels: ['integration', 'notifications'], description: 'Push drift/risk alerts to Slack channels.' },
    { id: 'lin-15', title: 'ISO week velocity normalization', status: 'Done', priority: 'medium', assignee: 'Marcus', labels: ['scoring'], description: 'Handle holiday weeks in velocity calculation.' },
]

export const DEMO_STRIPE_EVENTS = [
    { id: 'st-1', type: 'subscription.created', amount: 199, plan: 'pro', customer: 'TechCorp', date: daysAgo(30) },
    { id: 'st-2', type: 'subscription.created', amount: 99, plan: 'starter', customer: 'BootstrapSaaS', date: daysAgo(28) },
    { id: 'st-3', type: 'subscription.upgraded', amount: 399, plan: 'enterprise', customer: 'TechCorp', date: daysAgo(20) },
    { id: 'st-4', type: 'subscription.created', amount: 199, plan: 'pro', customer: 'AIStartup', date: daysAgo(15) },
    { id: 'st-5', type: 'subscription.created', amount: 199, plan: 'pro', customer: 'DevAgency', date: daysAgo(12) },
    { id: 'st-6', type: 'subscription.cancelled', amount: -99, plan: 'starter', customer: 'SmallCo', date: daysAgo(10) },
    { id: 'st-7', type: 'subscription.created', amount: 99, plan: 'starter', customer: 'NewFounder', date: daysAgo(7) },
    { id: 'st-8', type: 'subscription.created', amount: 399, plan: 'enterprise', customer: 'BigCorp', date: daysAgo(5) },
    { id: 'st-9', type: 'subscription.created', amount: 199, plan: 'pro', customer: 'PMTools', date: daysAgo(3) },
    { id: 'st-10', type: 'subscription.created', amount: 99, plan: 'starter', customer: 'EarlyStage', date: daysAgo(1) },
]

export const DEMO_ROADMAP_THEMES = [
    { id: 'rt-1', theme: 'AI-powered insights', quarter: 'Q1 2025', status: 'in_progress', alignment: 92 },
    { id: 'rt-2', theme: 'Onboarding optimization', quarter: 'Q1 2025', status: 'in_progress', alignment: 78 },
    { id: 'rt-3', theme: 'Team collaboration', quarter: 'Q2 2025', status: 'planned', alignment: 65 },
    { id: 'rt-4', theme: 'Enterprise integrations', quarter: 'Q1 2025', status: 'in_progress', alignment: 84 },
    { id: 'rt-5', theme: 'Mobile experience', quarter: 'Q2 2025', status: 'planned', alignment: 45 },
]

export const DEMO_INSIGHTS = [
    {
        id: 'ins-1',
        type: 'opportunity',
        severity: 'high',
        title: 'Onboarding is your #1 growth lever',
        description: '34% of signups never reach the dashboard. Fixing onboarding step 3 could unlock 2x activation. 3 PRs and 2 Linear issues are actively working on this.',
        signal_sources: ['GitHub', 'Linear'],
        impact: 'high',
        effort: 'medium',
    },
    {
        id: 'ins-2',
        type: 'risk',
        severity: 'medium',
        title: 'Scope drift detected — real-time collaboration',
        description: '2 large PRs (612 LOC, 532 LOC) are building real-time cursors and shared workspaces. This theme is not in your Q1 roadmap.',
        signal_sources: ['GitHub'],
        impact: 'medium',
        effort: 'high',
    },
    {
        id: 'ins-3',
        type: 'opportunity',
        severity: 'high',
        title: 'Enterprise tier is gaining traction',
        description: '2 enterprise plan upgrades in the last 30 days. Teams want Jira mapping, team analytics, and SSO. Your Linear backlog has these items at "Todo".',
        signal_sources: ['Stripe', 'Linear'],
        impact: 'high',
        effort: 'high',
    },
    {
        id: 'ins-4',
        type: 'health',
        severity: 'low',
        title: 'Review efficiency is strong',
        description: 'Average PR review time is 3.8h — well within healthy range. Code quality appears high.',
        signal_sources: ['GitHub'],
        impact: 'low',
        effort: 'low',
    },
    {
        id: 'ins-5',
        type: 'risk',
        severity: 'medium',
        title: 'Mobile experience lagging',
        description: 'Mobile roadmap theme has 45% alignment. "Mobile responsive dashboard" is in Todo with no active PRs. Consider re-prioritizing.',
        signal_sources: ['Linear', 'GitHub'],
        impact: 'medium',
        effort: 'medium',
    },
]

export const DEMO_FEATURE_RECOMMENDATION = {
    feature: 'Smart Onboarding Assistant',
    reason: 'Your data shows 66% of users drop off during onboarding, while your highest-converting users complete all 4 setup steps. An AI-guided onboarding that adapts based on user role (PM, engineer, founder) could lift completion by 40-60%.',
    expected_impact: 'Estimated +40% trial-to-paid conversion, $18k additional MRR at current signup volume.',
    confidence: 92,
    supporting_signals: [
        '34% onboarding completion rate (Linear: lin-1)',
        '3 active PRs touching onboarding flow',
        'Enterprise customers cite "setup friction" in support tickets',
    ],
    tasks: [
        { id: 't-1', title: 'User role detection on signup', estimate: '2d', type: 'backend' },
        { id: 't-2', title: 'Role-adaptive onboarding flow (PM / Eng / Founder)', estimate: '4d', type: 'frontend' },
        { id: 't-3', title: 'AI step guidance prompts via Groq', estimate: '2d', type: 'ai' },
        { id: 't-4', title: 'Progress persistence & resumability', estimate: '1d', type: 'backend' },
        { id: 't-5', title: 'A/B test framework for flows', estimate: '3d', type: 'infra' },
    ],
    spec: `## Feature: Smart Onboarding Assistant

### Problem
66% of new users abandon onboarding before completing setup. The current one-size-fits-all approach fails different user archetypes (PMs, Engineers, Founders) who have different mental models and goals.

### Solution
An AI-guided onboarding that:
1. Detects user role at signup (or asks in 1 question)
2. Shows role-specific setup steps and terminology
3. Uses Groq LLM to generate personalized next-step suggestions
4. Remembers progress and allows resuming

### Success Metrics
- Onboarding completion rate: 34% → 70%+
- Time to first insight: <5 minutes
- Trial to paid: +40%

### Technical Approach
- Role detection via email domain heuristics + 1-question modal
- Conditional rendering of steps based on role_type
- Groq llama-3.3-70b for dynamic tip generation
- Redis/Supabase for progress state
`
}

export const DEMO_VELOCITY_CHART = [
    { week: 'Week 1', prs: 3 },
    { week: 'Week 2', prs: 7 },
    { week: 'Week 3', prs: 4 },
    { week: 'Week 4', prs: 6 },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
    const d = new Date()
    d.setDate(d.getDate() - n)
    return d.toISOString()
}
