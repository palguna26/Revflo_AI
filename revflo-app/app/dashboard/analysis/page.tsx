'use client'

import { useEffect, useState } from 'react'

interface EngineeringPlan {
    id: string
    backend_tasks: string[]
    frontend_tasks: string[]
    database_tasks: string[]
}

interface PRD {
    id: string
    problem: string
    solution: string
    user_flows: string
    technical_considerations: string
    success_metrics: string
    engineering_plans?: EngineeringPlan | EngineeringPlan[] | null
}

interface Recommendation {
    id: string
    feature_name: string
    description: string
    reasoning: string
    expected_impact: string
    priority_score: number
    status: string
    created_at: string
    prds: PRD | PRD[] | null
}

function getPRD(rec: Recommendation): PRD | null {
    if (!rec.prds) return null
    return Array.isArray(rec.prds) ? (rec.prds[0] ?? null) : rec.prds
}

function getEngPlan(rec: Recommendation): EngineeringPlan | null {
    const prd = getPRD(rec)
    if (!prd || !prd.engineering_plans) return null
    return Array.isArray(prd.engineering_plans)
        ? (prd.engineering_plans[0] ?? null)
        : prd.engineering_plans
}

function priorityColor(score: number) {
    if (score >= 80) return 'text-red-400 bg-red-400/10 border-red-400/20'
    if (score >= 60) return 'text-amber-400 bg-amber-400/10 border-amber-400/20'
    return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
}

function priorityLabel(score: number) {
    if (score >= 80) return 'P0 Critical'
    if (score >= 60) return 'P1 High'
    return 'P2 Medium'
}

export default function AnalysisPage() {
    const [recs, setRecs] = useState<Recommendation[]>([])
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<Record<string, 'prd' | 'tasks'>>({})

    useEffect(() => {
        fetch('/api/recommendations')
            .then(r => r.json())
            .then(d => setRecs(d.recommendations ?? []))
            .finally(() => setLoading(false))
    }, [])

    function toggleExpand(id: string) {
        setExpanded(prev => prev === id ? null : id)
        setActiveTab(prev => ({ ...prev, [id]: prev[id] ?? 'prd' }))
    }

    function setTab(id: string, tab: 'prd' | 'tasks') {
        setActiveTab(prev => ({ ...prev, [id]: tab }))
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-5">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Feature Recommendations</h1>
                    <p className="text-sm text-neutral-500 mt-0.5">AI-ranked features with PRDs and engineering plans</p>
                </div>
                {recs.length > 0 && (
                    <span className="text-xs text-neutral-500 bg-white/5 border border-white/10 px-2 py-1 rounded">
                        {recs.length} features
                    </span>
                )}
            </div>

            {loading && (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="rounded-xl border border-white/5 bg-white/5 h-28 animate-pulse" />
                    ))}
                </div>
            )}

            {!loading && recs.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/10 p-12 text-center">
                    <p className="text-neutral-400 text-sm">No recommendations yet.</p>
                    <p className="text-neutral-600 text-xs mt-1">Connect integrations and run AI analysis first.</p>
                    <div className="flex gap-3 justify-center mt-4">
                        <a href="/dashboard/integrations" className="text-indigo-400 text-sm hover:text-indigo-300">⊕ Integrations</a>
                        <span className="text-neutral-700">·</span>
                        <a href="/dashboard" className="text-indigo-400 text-sm hover:text-indigo-300">◆ Run Analysis</a>
                    </div>
                </div>
            )}

            {!loading && recs.length > 0 && (
                <div className="space-y-3">
                    {recs.map((rec, i) => {
                        const prd = getPRD(rec)
                        const engPlan = getEngPlan(rec)
                        const isExpanded = expanded === rec.id
                        const tab = activeTab[rec.id] ?? 'prd'

                        return (
                            <div key={rec.id} className="rounded-xl border border-white/5 bg-white/5 overflow-hidden">
                                {/* Card Header */}
                                <button
                                    onClick={() => toggleExpand(rec.id)}
                                    className="w-full text-left p-5 hover:bg-white/[0.03] transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-xl text-neutral-600 font-bold shrink-0 w-6">#{i + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${priorityColor(rec.priority_score)}`}>
                                                    {priorityLabel(rec.priority_score)}
                                                </span>
                                                {prd && <span className="text-[10px] px-1.5 py-0.5 rounded border text-indigo-400 bg-indigo-400/10 border-indigo-400/20">PRD Ready</span>}
                                                {engPlan && <span className="text-[10px] px-1.5 py-0.5 rounded border text-violet-400 bg-violet-400/10 border-violet-400/20">Eng Plan Ready</span>}
                                            </div>
                                            <h3 className="text-sm font-semibold text-white">{rec.feature_name}</h3>
                                            <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{rec.description}</p>
                                        </div>
                                        <div className="flex flex-col items-end shrink-0 gap-1">
                                            <span className="text-lg font-bold text-white">{rec.priority_score}</span>
                                            <span className="text-[9px] text-neutral-600">/ 100</span>
                                            <span className="text-neutral-600 text-xs">{isExpanded ? '▲' : '▼'}</span>
                                        </div>
                                    </div>
                                </button>

                                {/* Expanded Detail */}
                                {isExpanded && (
                                    <div className="border-t border-white/5 px-5 pb-5">
                                        {/* Reasoning */}
                                        <div className="pt-4 grid sm:grid-cols-2 gap-3 mb-4">
                                            <div className="bg-white/5 rounded-lg p-3">
                                                <p className="text-[10px] text-neutral-600 font-medium uppercase tracking-wider mb-1">Reasoning</p>
                                                <p className="text-xs text-neutral-300 leading-relaxed">{rec.reasoning}</p>
                                            </div>
                                            <div className="bg-white/5 rounded-lg p-3">
                                                <p className="text-[10px] text-neutral-600 font-medium uppercase tracking-wider mb-1">Expected Impact</p>
                                                <p className="text-xs text-neutral-300 leading-relaxed">{rec.expected_impact}</p>
                                            </div>
                                        </div>

                                        {/* Tabs: PRD / Eng Plan */}
                                        {(prd || engPlan) && (
                                            <>
                                                <div className="flex gap-1 mb-3">
                                                    {prd && (
                                                        <button
                                                            onClick={() => setTab(rec.id, 'prd')}
                                                            className={`px-3 py-1 text-xs rounded transition-colors ${tab === 'prd' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-neutral-500 hover:text-neutral-300'}`}
                                                        >
                                                            📄 PRD
                                                        </button>
                                                    )}
                                                    {engPlan && (
                                                        <button
                                                            onClick={() => setTab(rec.id, 'tasks')}
                                                            className={`px-3 py-1 text-xs rounded transition-colors ${tab === 'tasks' ? 'bg-violet-600 text-white' : 'bg-white/5 text-neutral-500 hover:text-neutral-300'}`}
                                                        >
                                                            🔧 Engineering Plan
                                                        </button>
                                                    )}
                                                </div>

                                                {tab === 'prd' && prd && (
                                                    <div className="space-y-3">
                                                        {[
                                                            { label: 'Problem', value: prd.problem },
                                                            { label: 'Solution', value: prd.solution },
                                                            { label: 'User Flows', value: prd.user_flows },
                                                            { label: 'Technical Considerations', value: prd.technical_considerations },
                                                            { label: 'Success Metrics', value: prd.success_metrics },
                                                        ].map(({ label, value }) => (
                                                            <div key={label} className="bg-white/5 rounded-lg p-3">
                                                                <p className="text-[10px] text-neutral-600 font-medium uppercase tracking-wider mb-1">{label}</p>
                                                                <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line">{value}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {tab === 'tasks' && engPlan && (
                                                    <div className="grid sm:grid-cols-3 gap-3">
                                                        {[
                                                            { label: 'Backend', tasks: engPlan.backend_tasks, color: 'indigo' },
                                                            { label: 'Frontend', tasks: engPlan.frontend_tasks, color: 'violet' },
                                                            { label: 'Database', tasks: engPlan.database_tasks, color: 'emerald' },
                                                        ].map(({ label, tasks, color }) => (
                                                            <div key={label} className="bg-white/5 rounded-lg p-3">
                                                                <p className={`text-[10px] font-medium uppercase tracking-wider mb-2 text-${color}-400`}>{label}</p>
                                                                <ul className="space-y-1">
                                                                    {(tasks ?? []).map((task, j) => (
                                                                        <li key={j} className="text-xs text-neutral-400 flex gap-1.5">
                                                                            <span className="text-neutral-600 shrink-0">•</span>
                                                                            {task}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
