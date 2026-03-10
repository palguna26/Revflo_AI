'use client'

import { useEffect, useState } from 'react'

interface Insight {
    id: string
    title: string
    description: string
    insight_type: 'opportunity' | 'risk' | 'trend'
    confidence_score: number
    signal_count?: number
    source_count?: number
    created_at: string
}

const TYPE_CONFIG = {
    opportunity: { label: 'Opportunity', classes: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
    risk: { label: 'Risk', classes: 'text-red-400 bg-red-400/10 border-red-400/20' },
    trend: { label: 'Trend', classes: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
}

export default function InsightsPage() {
    const [insights, setInsights] = useState<Insight[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'opportunity' | 'risk' | 'trend'>('all')

    useEffect(() => {
        fetch('/api/insights')
            .then(r => r.json())
            .then(d => setInsights(d.insights ?? []))
            .finally(() => setLoading(false))
    }, [])

    const filtered = filter === 'all' ? insights : insights.filter(i => i.insight_type === filter)

    function confidenceColor(score: number) {
        if (score >= 80) return 'bg-emerald-500'
        if (score >= 60) return 'bg-amber-500'
        return 'bg-red-500'
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-5">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Insights</h1>
                    <p className="text-sm text-neutral-500 mt-0.5">AI-generated patterns from your product signals</p>
                </div>
                <span className="text-xs text-neutral-500 bg-white/5 border border-white/10 px-2 py-1 rounded">
                    {insights.length} total
                </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1.5">
                {(['all', 'opportunity', 'risk', 'trend'] as const).map(type => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${filter === type
                            ? 'bg-indigo-600 text-white'
                            : 'text-neutral-500 hover:text-neutral-300 bg-white/5 hover:bg-white/10'
                            }`}
                    >
                        {type}
                        {type !== 'all' && (
                            <span className="ml-1.5 text-[10px] opacity-70">
                                {insights.filter(i => i.insight_type === type).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Loading */}
            {loading && (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="rounded-xl border border-white/5 bg-white/5 p-5 h-28 animate-pulse" />
                    ))}
                </div>
            )}

            {/* Empty */}
            {!loading && filtered.length === 0 && (
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-10 text-center">
                    <p className="text-white font-medium mb-2">No insights yet.</p>
                    <p className="text-neutral-400 text-sm">
                        {insights.length === 0
                            ? 'Run AI Analysis from the Overview to generate patterns from your signals.'
                            : `No ${filter} insights found.`}
                    </p>
                    {insights.length === 0 && (
                        <a href="/dashboard" className="mt-4 inline-block px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
                            ◆ Go to Overview
                        </a>
                    )}
                </div>
            )}

            {/* Insight Cards */}
            {!loading && filtered.length > 0 && (
                <div className="space-y-3">
                    {filtered.map(insight => {
                        const cfg = TYPE_CONFIG[insight.insight_type] ?? TYPE_CONFIG.opportunity
                        return (
                            <div
                                key={insight.id}
                                className="rounded-xl border border-white/5 bg-white/5 hover:bg-white/[0.07] transition-colors p-5"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${cfg.classes}`}>
                                                {cfg.label}
                                            </span>
                                            <time className="text-[10px] text-neutral-600">
                                                {new Date(insight.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </time>
                                        </div>
                                        <h3 className="text-sm font-semibold text-white mb-1.5">{insight.title}</h3>
                                        <p className="text-xs text-neutral-400 leading-relaxed">{insight.description}</p>
                                    </div>
                                    {/* Signal Source Evidence Label */}
                                    <div className="flex flex-col items-end shrink-0">
                                        <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-right">
                                            <p className="text-xs text-neutral-300 font-medium">Based on {insight.signal_count || 0} signals</p>
                                            <p className="text-[10px] text-neutral-500">from {insight.source_count || 0} sources</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
