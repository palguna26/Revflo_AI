'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ListItem } from '@/components/ui/ListItem'
import { 
    CheckCircle2, 
    Circle, 
    FileText, 
    Hammer, 
    MessageSquare, 
    ChevronDown, 
    ChevronRight,
    Play,
    Clock,
    MoreHorizontal
} from 'lucide-react'

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

export interface DecisionRecord {
    id: string
    decision: string
    reason: string
    consulted: string | null
    confidence_level: string
    trade_offs: string | null
    decided_by: string
    created_at: string
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
    decision_records?: DecisionRecord[] | null
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

function priorityVariant(score: number): any {
    if (score >= 80) return 'risk'
    if (score >= 60) return 'trend'
    return 'opportunity'
}

export default function AnalysisPage() {
    const [recs, setRecs] = useState<Recommendation[]>([])
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<Record<string, 'prd' | 'tasks' | 'decision'>>({})

    // Form state for new decisions
    const [decisionForm, setDecisionForm] = useState<{
        [id: string]: {
            decision?: string;
            reason?: string;
            consulted?: string;
            confidenceLevel?: string;
            tradeOffs?: string;
            submitting?: boolean;
        }
    }>({})

    useEffect(() => {
        fetch('/api/recommendations')
            .then(r => r.json())
            .then(d => setRecs(d.recommendations ?? []))
            .finally(() => setLoading(false))
    }, [])

    function toggleExpand(id: string) {
        setExpanded(prev => prev === id ? null : id)
        setActiveTab(prev => ({ ...prev, [id]: prev[id] ?? 'decision' }))
    }

    function setTab(id: string, tab: 'prd' | 'tasks' | 'decision') {
        setActiveTab(prev => ({ ...prev, [id]: tab }))
    }

    function updateForm(id: string, updates: any) {
        setDecisionForm(prev => ({
            ...prev,
            [id]: { ...(prev[id] || {}), ...updates }
        }))
    }

    async function submitDecision(recId: string) {
        const form = decisionForm[recId]
        if (!form || !form.decision || !form.reason || !form.confidenceLevel) {
            alert('Please fill out the decision, reason, and confidence level.')
            return
        }

        updateForm(recId, { submitting: true })
        try {
            const res = await fetch('/api/decisions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    feature_id: recId,
                    decision: form.decision,
                    reason: form.reason,
                    consulted: form.consulted || '',
                    confidence_level: form.confidenceLevel,
                    trade_offs: form.decision === 'Approve' ? (form.tradeOffs || '') : ''
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            // Update local state with the new decision record
            setRecs(prev => prev.map(rec => {
                if (rec.id === recId) {
                    return {
                        ...rec,
                        decision_records: [data.decision_record, ...(rec.decision_records || [])]
                    }
                }
                return rec
            }))

            // Reset form
            updateForm(recId, { decision: '', reason: '', consulted: '', confidenceLevel: '', tradeOffs: '', submitting: false })

        } catch (e: any) {
            alert(e.message || 'Failed to submit decision')
            updateForm(recId, { submitting: false })
        }
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-5">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Build Decisions</h1>
                    <p className="text-sm text-neutral-500 mt-0.5">AI-supported decisions on what to build next.</p>
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
                    <p className="text-neutral-400 text-sm">No build decisions yet.</p>
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
                        const tab = activeTab[rec.id] ?? 'decision'
                        const form = decisionForm[rec.id] || {}
                        const hasDecisions = rec.decision_records && rec.decision_records.length > 0

                        return (
                            <div key={rec.id} className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg overflow-hidden">
                                <ListItem
                                    onClick={() => toggleExpand(rec.id)}
                                    icon={
                                        <div className="flex items-center justify-center w-5 h-5 rounded border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] group-hover:bg-[var(--bg-active)] transition-colors">
                                            {hasDecisions ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Circle size={12} className="text-[var(--text-tertiary)]" />}
                                        </div>
                                    }
                                    title={
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{rec.feature_name}</span>
                                            <Badge variant={priorityVariant(rec.priority_score)} className="text-[9px] uppercase h-4 px-1">
                                                P{Math.floor((100 - rec.priority_score) / 20)}
                                            </Badge>
                                        </div>
                                    }
                                    subtitle={rec.description}
                                    meta={
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-3">
                                                {prd && (
                                                    <div className="flex items-center gap-1 text-[var(--text-tertiary)]">
                                                        <FileText size={12} />
                                                        <span className="text-[10px]">PRD</span>
                                                    </div>
                                                )}
                                                {engPlan && (
                                                    <div className="flex items-center gap-1 text-[var(--text-tertiary)]">
                                                        <Hammer size={12} />
                                                        <span className="text-[10px]">Tasks</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="w-[1px] h-3 bg-[var(--border-subtle)]" />
                                            <div className="flex items-center gap-1.5 text-[var(--text-secondary)] font-mono text-xs">
                                                {rec.priority_score}
                                            </div>
                                            <div className="text-[var(--text-tertiary)]">
                                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                            </div>
                                        </div>
                                    }
                                />

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

                                        {/* Tabs */}
                                        <div className="flex gap-1 mb-3 bg-white/5 p-1 rounded-lg w-fit">
                                            <button
                                                onClick={() => setTab(rec.id, 'decision')}
                                                className={`px-3 py-1.5 text-xs rounded transition-colors font-medium ${tab === 'decision' ? 'bg-indigo-600 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                                            >
                                                ✓ Decision
                                            </button>
                                            {prd && (
                                                <button
                                                    onClick={() => setTab(rec.id, 'prd')}
                                                    className={`px-3 py-1.5 text-xs rounded transition-colors font-medium ${tab === 'prd' ? 'bg-indigo-600 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                                                >
                                                    📄 PRD
                                                </button>
                                            )}
                                            {engPlan && (
                                                <button
                                                    onClick={() => setTab(rec.id, 'tasks')}
                                                    className={`px-3 py-1.5 text-xs rounded transition-colors font-medium ${tab === 'tasks' ? 'bg-violet-600 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                                                >
                                                    🔧 Engineering Plan
                                                </button>
                                            )}
                                        </div>

                                        {tab === 'decision' && (
                                            <div className="space-y-4">
                                                {/* History of decisions */}
                                                {hasDecisions && (
                                                    <div className="space-y-2 mb-4">
                                                        <h4 className="text-xs font-medium text-white mb-2 uppercase tracking-wider">Decision History</h4>
                                                        {rec.decision_records!.map((dr) => (
                                                            <div key={dr.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div className="flex gap-2 items-center">
                                                                        <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold
                                                                            ${dr.decision === 'Approve' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : ''}
                                                                            ${dr.decision === 'Deprioritize' ? 'text-red-400 bg-red-400/10 border-red-400/20' : ''}
                                                                            ${dr.decision === 'Needs Research' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' : ''}
                                                                        `}>
                                                                            {dr.decision}
                                                                        </span>
                                                                        <span className="text-[10px] text-neutral-500 bg-white/5 px-2 py-0.5 rounded">
                                                                            {dr.confidence_level}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-[10px] text-neutral-500">
                                                                        {new Date(dr.created_at).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-neutral-300 mb-1"><span className="text-neutral-500">Reason:</span> {dr.reason}</p>
                                                                <p className="text-[10px] text-neutral-500">Decided by: <span className="text-neutral-400">{dr.decided_by}</span></p>
                                                                {dr.consulted && <p className="text-[10px] text-neutral-500">Consulted: {dr.consulted}</p>}
                                                                {dr.trade_offs && (
                                                                    <div className="mt-2 text-xs border-l-2 border-indigo-500 pl-2">
                                                                        <span className="text-indigo-400 font-medium block mb-0.5">Trade-offs</span>
                                                                        <span className="text-neutral-300">{dr.trade_offs}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Decision Form */}
                                                <div className="bg-white/5 border border-indigo-500/30 rounded-lg p-4">
                                                    <h4 className="text-sm font-semibold text-white mb-4">Make Your Decision</h4>

                                                    <div className="flex gap-2 mb-4">
                                                        {['Approve', 'Deprioritize', 'Needs Research'].map(dType => (
                                                            <button
                                                                key={dType}
                                                                onClick={() => updateForm(rec.id, { decision: dType })}
                                                                className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors flex-1
                                                                    ${form.decision === dType
                                                                        ? dType === 'Approve' ? 'bg-emerald-600 border-emerald-500 text-white'
                                                                            : dType === 'Deprioritize' ? 'bg-red-600 border-red-500 text-white'
                                                                                : 'bg-blue-600 border-blue-500 text-white'
                                                                        : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10'
                                                                    }`}
                                                            >
                                                                {dType === 'Approve' && '✅ '}
                                                                {dType === 'Deprioritize' && '⏸ '}
                                                                {dType === 'Needs Research' && '🔍 '}
                                                                {dType}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-1">Reason for Decision <span className="text-red-400">*</span></label>
                                                            <input
                                                                type="text"
                                                                value={form.reason || ''}
                                                                onChange={e => updateForm(rec.id, { reason: e.target.value })}
                                                                placeholder="One-line reason..."
                                                                className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                                                            />
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-1">Confidence Level <span className="text-red-400">*</span></label>
                                                                <select
                                                                    value={form.confidenceLevel || ''}
                                                                    onChange={e => updateForm(rec.id, { confidenceLevel: e.target.value })}
                                                                    className="w-full bg-black/20 border border-white/10 rounded px-2 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                                                                >
                                                                    <option value="" disabled>Select...</option>
                                                                    <option value="High Conviction">High Conviction</option>
                                                                    <option value="Informed Bet">Informed Bet</option>
                                                                    <option value="Experiment">Experiment</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-1">Consulted (Optional)</label>
                                                                <input
                                                                    type="text"
                                                                    value={form.consulted || ''}
                                                                    onChange={e => updateForm(rec.id, { consulted: e.target.value })}
                                                                    placeholder="Names (comma-separated)"
                                                                    className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                                                                />
                                                            </div>
                                                        </div>

                                                        {form.decision === 'Approve' && (
                                                            <div>
                                                                <label className="block text-[10px] font-medium text-indigo-400 uppercase tracking-wider mb-1">What are we choosing NOT to do instead?</label>
                                                                <input
                                                                    type="text"
                                                                    value={form.tradeOffs || ''}
                                                                    onChange={e => updateForm(rec.id, { tradeOffs: e.target.value })}
                                                                    placeholder="Document the trade-offs of this approval..."
                                                                    className="w-full bg-indigo-500/5 border border-indigo-500/20 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="flex justify-end pt-2">
                                                            <button
                                                                onClick={() => submitDecision(rec.id)}
                                                                disabled={!form.decision || !form.reason || !form.confidenceLevel || form.submitting}
                                                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium rounded transition-colors"
                                                            >
                                                                {form.submitting ? 'Saving...' : 'Save Decision Component'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

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
