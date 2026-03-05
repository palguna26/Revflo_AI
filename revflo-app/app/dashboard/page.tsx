'use client'

import { useEffect, useState } from 'react'

interface Stats {
    workspace: { id: string; name: string }
    signal_count: number
    signal_breakdown: Record<string, number>
    insight_count: number
    recommendation_count: number
    prd_count: number
    top_insights: Array<{ id: string; title: string; confidence_score: number; insight_type: string }>
    top_recommendations: Array<{ id: string; feature_name: string; priority_score: number }>
    integrations: Array<{ type: string; status: string; signal_count: number; last_synced_at: string }>
}

const INSIGHT_TYPE_COLOR: Record<string, string> = {
    opportunity: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    risk: 'text-red-400 bg-red-400/10 border-red-400/20',
    trend: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
}

const SOURCE_ICON: Record<string, string> = {
    github: '◈',
    linear: '◆',
    stripe: '◇',
    feedback: '◎',
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [running, setRunning] = useState(false)
    const [message, setMessage] = useState('')

    async function fetchStats() {
        setLoading(true)
        try {
            const res = await fetch('/api/dashboard')
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setStats(data)
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Error loading stats'
            setMessage(msg)
        } finally {
            setLoading(false)
        }
    }

    async function runAnalysis() {
        setRunning(true)
        setMessage('')
        try {
            const res = await fetch('/api/analysis/run', { method: 'POST' })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setMessage('✓ Analysis complete — insights and recommendations generated!')
            await fetchStats()
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Analysis failed'
            setMessage('✗ ' + msg)
        } finally {
            setRunning(false)
        }
    }

    useEffect(() => { fetchStats() }, [])

    const statCards = stats ? [
        { label: 'Product Signals', value: stats.signal_count, color: 'from-indigo-500/20 to-purple-500/20', border: 'border-indigo-500/30' },
        { label: 'Insights Generated', value: stats.insight_count, color: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30' },
        { label: 'Recommendations', value: stats.recommendation_count, color: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30' },
        { label: 'PRDs Created', value: stats.prd_count, color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30' },
    ] : []

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Product Intelligence</h1>
                    <p className="text-sm text-neutral-500 mt-0.5">
                        {stats?.workspace.name ?? 'Loading workspace...'}
                    </p>
                </div>
                <button
                    onClick={runAnalysis}
                    disabled={running || !stats || stats.signal_count === 0}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                >
                    {running ? (
                        <>
                            <span className="animate-spin">◌</span>
                            Running Analysis...
                        </>
                    ) : (
                        <>◆ Run AI Analysis</>
                    )}
                </button>
            </div>

            {/* Status message */}
            {message && (
                <div className={`px-4 py-2.5 rounded-lg text-sm border ${message.startsWith('✓') ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                    {message}
                </div>
            )}

            {/* No signals CTA */}
            {!loading && stats && stats.signal_count === 0 && (
                <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
                    <p className="text-neutral-400 text-sm">No signals yet. Connect integrations to start analyzing your product.</p>
                    <a href="/dashboard/integrations" className="mt-3 inline-flex items-center gap-1.5 text-indigo-400 text-sm hover:text-indigo-300">
                        ⊕ Connect Integrations →
                    </a>
                </div>
            )}

            {/* Stat Cards */}
            {!loading && stats && stats.signal_count > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map(card => (
                        <div key={card.label} className={`rounded-xl border ${card.border} bg-gradient-to-br ${card.color} p-4`}>
                            <p className="text-xs text-neutral-500 font-medium">{card.label}</p>
                            <p className="text-3xl font-bold text-white mt-1">{card.value}</p>
                        </div>
                    ))}
                </div>
            )}

            {loading && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="rounded-xl border border-white/5 bg-white/5 p-4 h-20 animate-pulse" />
                    ))}
                </div>
            )}

            {/* Main Content */}
            {stats && stats.signal_count > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Signal Breakdown */}
                    <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                        <h2 className="text-sm font-semibold text-white mb-3">Signal Sources</h2>
                        <div className="space-y-2">
                            {Object.entries(stats.signal_breakdown).map(([source, count]) => {
                                const pct = Math.round((count / stats.signal_count) * 100)
                                return (
                                    <div key={source}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-neutral-400 capitalize">{SOURCE_ICON[source] ?? '○'} {source}</span>
                                            <span className="text-neutral-500">{count} signals</span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Integrations */}
                    <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                        <h2 className="text-sm font-semibold text-white mb-3">Connected Sources</h2>
                        {stats.integrations.length === 0 ? (
                            <p className="text-xs text-neutral-500">No integrations connected yet.</p>
                        ) : (
                            <div className="space-y-2">
                                {stats.integrations.map(intg => (
                                    <div key={intg.type} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-indigo-400 text-sm">{SOURCE_ICON[intg.type] ?? '○'}</span>
                                            <span className="text-sm text-neutral-300 capitalize">{intg.type}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-neutral-500">{intg.signal_count} signals</span>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">active</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Top Insights */}
                    {stats.top_insights.length > 0 && (
                        <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-semibold text-white">Recent Insights</h2>
                                <a href="/dashboard/insights" className="text-xs text-indigo-400 hover:text-indigo-300">View all →</a>
                            </div>
                            <div className="space-y-2">
                                {stats.top_insights.map(insight => (
                                    <div key={insight.id} className="flex items-center gap-2">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${INSIGHT_TYPE_COLOR[insight.insight_type] ?? 'text-neutral-400 bg-neutral-400/10 border-neutral-400/20'}`}>
                                            {insight.insight_type}
                                        </span>
                                        <span className="text-sm text-neutral-300 truncate">{insight.title}</span>
                                        <span className="text-xs text-neutral-500 ml-auto shrink-0">{insight.confidence_score}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Top Recommendations */}
                    {stats.top_recommendations.length > 0 && (
                        <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-semibold text-white">Top Features to Build</h2>
                                <a href="/dashboard/analysis" className="text-xs text-indigo-400 hover:text-indigo-300">View all →</a>
                            </div>
                            <div className="space-y-2">
                                {stats.top_recommendations.map((rec, i) => (
                                    <div key={rec.id} className="flex items-center gap-2">
                                        <span className="text-xs text-neutral-600 w-4">#{i + 1}</span>
                                        <span className="text-sm text-neutral-300 truncate">{rec.feature_name}</span>
                                        <span className="text-xs text-amber-400 ml-auto shrink-0">{rec.priority_score}/100</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
