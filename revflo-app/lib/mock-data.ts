/**
 * Realistic mock data for demo mode.
 * Simulates signals from GitHub, Linear, and Stripe.
 */

export interface MockSignal {
    signal_type: string
    source: string
    content: string
    metadata: Record<string, unknown>
    timestamp: string
}

function daysAgo(n: number) {
    return new Date(Date.now() - n * 86400000).toISOString()
}

export const GITHUB_MOCK_SIGNALS: MockSignal[] = [
    {
        signal_type: 'feature_shipped',
        source: 'github',
        content: 'feat: Add OAuth2 authentication flow with Google and GitHub providers',
        metadata: { pr_number: 142, state: 'merged', author: 'sarah-dev', url: '#' },
        timestamp: daysAgo(1),
    },
    {
        signal_type: 'feature_request',
        source: 'github',
        content: 'feat: Self-serve onboarding wizard for new users [WIP]',
        metadata: { pr_number: 148, state: 'open', author: 'priya-pm', url: '#' },
        timestamp: daysAgo(2),
    },
    {
        signal_type: 'bug_report',
        source: 'github',
        content: 'fix: Dashboard charts fail to render when signal count exceeds 500',
        metadata: { pr_number: 145, state: 'merged', author: 'alex-eng', url: '#' },
        timestamp: daysAgo(3),
    },
    {
        signal_type: 'feature_shipped',
        source: 'github',
        content: 'feat: CSV bulk upload for customer feedback with category tagging',
        metadata: { pr_number: 139, state: 'merged', author: 'sarah-dev', url: '#' },
        timestamp: daysAgo(4),
    },
    {
        signal_type: 'feature_request',
        source: 'github',
        content: 'feat: Slack integration — post insights automatically to #product channel',
        metadata: { pr_number: 151, state: 'open', author: 'james-growth', url: '#' },
        timestamp: daysAgo(1),
    },
    {
        signal_type: 'feature_request',
        source: 'github',
        content: 'feat: Export PRDs to Notion and Confluence',
        metadata: { pr_number: 153, state: 'draft', author: 'priya-pm', url: '#' },
        timestamp: daysAgo(0),
    },
    {
        signal_type: 'bug_report',
        source: 'github',
        content: 'fix: Linear integration token expiry causes silent fetch failure',
        metadata: { pr_number: 147, state: 'open', author: 'alex-eng', url: '#' },
        timestamp: daysAgo(2),
    },
    {
        signal_type: 'feature_shipped',
        source: 'github',
        content: 'feat: AI-powered insight engine with Groq LLM integration',
        metadata: { pr_number: 135, state: 'merged', author: 'sarah-dev', url: '#' },
        timestamp: daysAgo(7),
    },
]

export const LINEAR_MOCK_SIGNALS: MockSignal[] = [
    {
        signal_type: 'feature_request',
        source: 'linear',
        content: 'Self-serve onboarding: 38% of new users churn in week 1 due to poor onboarding',
        metadata: { linear_id: 'LIN-201', priority: 1, state: 'In Progress' },
        timestamp: daysAgo(5),
    },
    {
        signal_type: 'feature_request',
        source: 'linear',
        content: 'Mobile app: 12 enterprise customers requested native iOS/Android app this month',
        metadata: { linear_id: 'LIN-198', priority: 1, state: 'Backlog' },
        timestamp: daysAgo(6),
    },
    {
        signal_type: 'feature_request',
        source: 'linear',
        content: 'Team collaboration: Users want to share PRDs and assign engineering tasks to teammates',
        metadata: { linear_id: 'LIN-195', priority: 2, state: 'Todo' },
        timestamp: daysAgo(8),
    },
    {
        signal_type: 'bug_report',
        source: 'linear',
        content: 'Analysis pipeline timeout: Large signal batches (>1000) cause 30s timeout errors',
        metadata: { linear_id: 'LIN-207', priority: 1, state: 'In Progress' },
        timestamp: daysAgo(1),
    },
    {
        signal_type: 'feature_request',
        source: 'linear',
        content: 'API access: Enterprise customers requesting REST API for custom integrations',
        metadata: { linear_id: 'LIN-189', priority: 2, state: 'Todo' },
        timestamp: daysAgo(10),
    },
    {
        signal_type: 'feature_shipped',
        source: 'linear',
        content: 'Stripe integration: Revenue signal ingestion from subscription events',
        metadata: { linear_id: 'LIN-181', priority: 2, state: 'Done' },
        timestamp: daysAgo(12),
    },
    {
        signal_type: 'feature_request',
        source: 'linear',
        content: 'Automated weekly digest: Email summary of top insights sent every Monday',
        metadata: { linear_id: 'LIN-210', priority: 3, state: 'Backlog' },
        timestamp: daysAgo(3),
    },
]

export const STRIPE_MOCK_SIGNALS: MockSignal[] = [
    {
        signal_type: 'revenue_event',
        source: 'stripe',
        content: 'Subscription created: customer@acmecorp.com — Enterprise plan ($499/mo)',
        metadata: { stripe_event_id: 'evt_001', type: 'customer.subscription.created', plan: 'enterprise' },
        timestamp: daysAgo(0),
    },
    {
        signal_type: 'revenue_event',
        source: 'stripe',
        content: 'Subscription upgraded: user@techco.io — Starter → Growth plan (+$150/mo)',
        metadata: { stripe_event_id: 'evt_002', type: 'customer.subscription.updated', from_plan: 'starter', to_plan: 'growth' },
        timestamp: daysAgo(1),
    },
    {
        signal_type: 'churn_event',
        source: 'stripe',
        content: 'Subscription cancelled: ops@startup.io — Growth plan. Reason: missing mobile app',
        metadata: { stripe_event_id: 'evt_003', type: 'customer.subscription.deleted', plan: 'growth', reason: 'missing_feature' },
        timestamp: daysAgo(2),
    },
    {
        signal_type: 'revenue_event',
        source: 'stripe',
        content: 'Subscription created: cto@fintech.com — Growth plan ($249/mo)',
        metadata: { stripe_event_id: 'evt_004', type: 'customer.subscription.created', plan: 'growth' },
        timestamp: daysAgo(3),
    },
    {
        signal_type: 'churn_event',
        source: 'stripe',
        content: 'Subscription cancelled: team@agency.co — Starter plan. Reason: too expensive for team size',
        metadata: { stripe_event_id: 'evt_005', type: 'customer.subscription.deleted', plan: 'starter', reason: 'pricing' },
        timestamp: daysAgo(4),
    },
    {
        signal_type: 'revenue_event',
        source: 'stripe',
        content: 'Subscription upgraded: dev@saas.io — Growth → Enterprise plan (+$250/mo)',
        metadata: { stripe_event_id: 'evt_006', type: 'customer.subscription.updated', from_plan: 'growth', to_plan: 'enterprise' },
        timestamp: daysAgo(5),
    },
    {
        signal_type: 'revenue_event',
        source: 'stripe',
        content: 'Subscription created: pm@b2b.com — Starter plan ($99/mo)',
        metadata: { stripe_event_id: 'evt_007', type: 'customer.subscription.created', plan: 'starter' },
        timestamp: daysAgo(6),
    },
    {
        signal_type: 'churn_event',
        source: 'stripe',
        content: 'Subscription cancelled: founder@indie.io — Starter plan. Reason: onboarding too complex',
        metadata: { stripe_event_id: 'evt_008', type: 'customer.subscription.deleted', plan: 'starter', reason: 'complexity' },
        timestamp: daysAgo(7),
    },
]

export const FEEDBACK_MOCK_SIGNALS: MockSignal[] = [
    {
        signal_type: 'feature_request',
        source: 'feedback',
        content: 'The onboarding flow is too long. I gave up after step 3.',
        metadata: { category: 'onboarding', sentiment: 'negative' },
        timestamp: daysAgo(0),
    },
    {
        signal_type: 'feature_request',
        source: 'feedback',
        content: 'I love the AI recommendations! But I need to share them with my team easily.',
        metadata: { category: 'collaboration', sentiment: 'mixed' },
        timestamp: daysAgo(1),
    },
    {
        signal_type: 'feature_request',
        source: 'feedback',
        content: 'Can you add a mobile app? I want to check insights on the go.',
        metadata: { category: 'mobile', sentiment: 'positive' },
        timestamp: daysAgo(2),
    },
    {
        signal_type: 'bug_report',
        source: 'feedback',
        content: 'The analysis takes too long (sometimes 30+ seconds). Please make it faster.',
        metadata: { category: 'performance', sentiment: 'negative' },
        timestamp: daysAgo(3),
    },
    {
        signal_type: 'feature_request',
        source: 'feedback',
        content: 'Need Slack integration — would save me checking RevFlo manually every day.',
        metadata: { category: 'integrations', sentiment: 'positive' },
        timestamp: daysAgo(4),
    },
    {
        signal_type: 'feature_request',
        source: 'feedback',
        content: 'The PRD output is great! I wish I could export it directly to Notion.',
        metadata: { category: 'export', sentiment: 'positive' },
        timestamp: daysAgo(5),
    },
    {
        signal_type: 'feature_request',
        source: 'feedback',
        content: 'We really need team accounts — right now only I can run analysis.',
        metadata: { category: 'collaboration', sentiment: 'negative' },
        timestamp: daysAgo(6),
    },
    {
        signal_type: 'feature_request',
        source: 'feedback',
        content: 'The onboarding should auto-connect to GitHub and show me something valuable immediately.',
        metadata: { category: 'onboarding', sentiment: 'negative' },
        timestamp: daysAgo(7),
    },
    {
        signal_type: 'feature_request',
        source: 'feedback',
        content: 'Please add API access so we can pull insights into our internal dashboard.',
        metadata: { category: 'api', sentiment: 'positive' },
        timestamp: daysAgo(8),
    },
    {
        signal_type: 'feature_request',
        source: 'feedback',
        content: 'Weekly email digest of top insights would be really useful.',
        metadata: { category: 'notifications', sentiment: 'positive' },
        timestamp: daysAgo(9),
    },
]
