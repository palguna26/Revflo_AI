import { DEMO_SCORE, DEMO_INSIGHTS, DEMO_PRS, DEMO_LINEAR_ISSUES, DEMO_VELOCITY_CHART } from "@/data/demo-data";
import { AIChat } from "@/components/ai/AIChat";
import { ScoreRing } from "@/components/dashboard/ScoreRing";
import { InsightCard } from "@/components/dashboard/InsightCard";

export default function DashboardOverview() {
    const topInsights = DEMO_INSIGHTS.filter(i => i.severity === 'high').slice(0, 3);

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Product Intelligence</p>
                    <h1 className="text-2xl font-bold">Acme AI · Overview</h1>
                </div>
                <div className="text-right">
                    <p className="text-xs text-neutral-500">Last analysis</p>
                    <p className="text-sm text-neutral-300">2 minutes ago</p>
                </div>
            </div>

            {/* Score + key metrics */}
            <div className="grid grid-cols-12 gap-4">
                {/* Score ring */}
                <div className="col-span-4 glass p-6 flex flex-col items-center justify-center">
                    <ScoreRing score={DEMO_SCORE.overall} />
                    <p className="text-sm text-neutral-400 mt-4">Execution Health Score</p>
                    <p className="text-xs text-emerald-400 mt-1">↑ +{DEMO_SCORE.trend} pts vs last week</p>
                </div>

                {/* Metric cards */}
                <div className="col-span-8 grid grid-cols-2 gap-4">
                    <MetricCard label="Velocity Stability" value={DEMO_SCORE.velocity} color="indigo" />
                    <MetricCard label="Roadmap Alignment" value={DEMO_SCORE.alignment} color="purple" />
                    <MetricCard label="Review Efficiency" value={DEMO_SCORE.review} color="blue" />
                    <MetricCard label="Drift Risk" value={DEMO_SCORE.drift} color={DEMO_SCORE.drift < 70 ? "amber" : "indigo"} />
                </div>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard label="Active PRs" value={DEMO_PRS.filter(p => p.state === 'open' || p.state === 'draft').length} unit="open" />
                <StatCard label="Linear Issues" value={DEMO_LINEAR_ISSUES.filter(i => i.status === 'In Progress').length} unit="in progress" />
                <StatCard label="Avg Review Time" value="3.8h" unit="healthy ✓" />
                <StatCard label="Scope Drift" value="Medium" unit="2 themes off-plan" isText />
            </div>

            {/* Insights */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-neutral-300">Top Signals</h2>
                    <a href="/dashboard/insights" className="text-xs text-indigo-400 hover:text-indigo-300">View all →</a>
                </div>
                <div className="space-y-3">
                    {topInsights.map(ins => (
                        <InsightCard key={ins.id} insight={ins} />
                    ))}
                </div>
            </div>

            {/* AI Chat */}
            <AIChat />
        </div>
    );
}

function MetricCard({ label, value, color }: { label: string; value: number; color: string }) {
    const pct = `${value}%`;
    const trackColor = { indigo: '#6366f1', purple: '#a855f7', blue: '#3b82f6', amber: '#f59e0b' }[color] || '#6366f1';
    return (
        <div className="glass p-4">
            <p className="text-xs text-neutral-500 mb-2">{label}</p>
            <p className="text-2xl font-bold mb-2" style={{ color: trackColor }}>{value}</p>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: pct, background: trackColor }} />
            </div>
        </div>
    );
}

function StatCard({ label, value, unit, isText }: { label: string; value: string | number; unit: string; isText?: boolean }) {
    return (
        <div className="glass p-4">
            <p className="text-xs text-neutral-500 mb-2">{label}</p>
            <p className={`text-xl font-bold ${isText ? 'text-amber-400' : ''}`}>{value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{unit}</p>
        </div>
    );
}
