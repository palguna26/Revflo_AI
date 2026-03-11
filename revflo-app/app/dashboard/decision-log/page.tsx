'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { ListItem } from '@/components/ui/ListItem'
import { Search, History, Filter, ChevronDown, ChevronRight, User, Calendar, MessageSquare, Scale } from 'lucide-react'
import { type DecisionRecord } from '../analysis/page'

interface DecisionRecordWithContext extends DecisionRecord {
    feature: { feature_name: string }
}

export default function DecisionLogPage() {
    const [records, setRecords] = useState<DecisionRecordWithContext[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [expanded, setExpanded] = useState<string | null>(null)

    useEffect(() => {
        fetch('/api/decisions')
            .then(r => r.json())
            .then(d => setRecords(d.decision_records ?? []))
            .finally(() => setLoading(false))
    }, [])

    const filteredRecords = records.filter(r => {
        const lowerSearch = searchTerm.toLowerCase()
        return (
            (r.feature?.feature_name ?? '').toLowerCase().includes(lowerSearch) ||
            r.decision.toLowerCase().includes(lowerSearch)
        )
    })

    const decisionVariant = (decision: string) => {
        if (decision === 'Approve') return 'success'
        if (decision === 'Deprioritize') return 'error'
        return 'info'
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <History size={14} className="text-indigo-400" />
                        <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest">Archive</span>
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Decision Log</h1>
                    <p className="text-[var(--text-tertiary)] text-sm mt-1 max-w-xl">
                        Revflo's institutional memory of all product decisions. Essential for long-term product continuity.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                        <input 
                            type="text" 
                            placeholder="Find decision..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] w-40 md:w-60"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg animate-pulse" />
                    ))}
                </div>
            ) : records.length === 0 ? (
                <div className="border border-dashed border-[var(--border-subtle)] rounded-xl py-20 flex flex-col items-center justify-center bg-[var(--bg-secondary)]/30">
                    <div className="h-14 w-14 rounded-full bg-[var(--bg-hover)] flex items-center justify-center mb-4 text-[var(--text-tertiary)]">
                        <History size={24} strokeWidth={1} />
                    </div>
                    <h2 className="text-base font-medium text-[var(--text-primary)]">No decisions logged yet</h2>
                    <p className="text-[var(--text-tertiary)] text-xs mt-1">Make your first decision from the Build Decisions page.</p>
                    <a href="/dashboard/analysis" className="mt-4 text-xs font-medium text-[var(--accent)] hover:underline flex items-center gap-1">
                        Build Decisions <ChevronRight size={12} />
                    </a>
                </div>
            ) : filteredRecords.length === 0 ? (
                <div className="border border-dashed border-[var(--border-subtle)] rounded-xl py-20 flex flex-col items-center justify-center bg-[var(--bg-secondary)]/30">
                    <h2 className="text-base font-medium text-[var(--text-primary)]">No matching records</h2>
                    <p className="text-[var(--text-tertiary)] text-xs mt-1">Try adjusting your search query.</p>
                </div>
            ) : (
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg overflow-hidden divide-y divide-[var(--border-subtle)]">
                    {filteredRecords.map(record => {
                        const isExpanded = expanded === record.id;
                        
                        return (
                            <div key={record.id}>
                                <ListItem
                                    onClick={() => setExpanded(isExpanded ? null : record.id)}
                                    icon={
                                        <div className={`p-1 rounded border ${
                                            record.decision === 'Approve' ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' :
                                            record.decision === 'Deprioritize' ? 'bg-rose-400/10 border-rose-400/20 text-rose-400' :
                                            'bg-blue-400/10 border-blue-400/20 text-blue-400'
                                        }`}>
                                            <History size={12} />
                                        </div>
                                    }
                                    title={
                                        <div className="flex items-center gap-2">
                                            <span>{record.feature?.feature_name ?? 'Unknown Feature'}</span>
                                            <Badge variant={decisionVariant(record.decision)} className="text-[9px] uppercase h-4 px-1">
                                                {record.decision}
                                            </Badge>
                                        </div>
                                    }
                                    subtitle={record.reason}
                                    meta={
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-4 text-right">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] text-[var(--text-secondary)] font-medium">{record.decided_by}</span>
                                                    <span className="text-[10px] text-[var(--text-tertiary)]">{new Date(record.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="text-[var(--text-tertiary)]">
                                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                            </div>
                                        </div>
                                    }
                                />
                                {isExpanded && (
                                    <div className="border-t border-white/5 bg-black/10 p-5">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex items-center gap-1.5 text-[var(--text-tertiary)] uppercase text-[10px] font-bold tracking-wider mb-2">
                                                        <MessageSquare size={12} />
                                                        Reasoning
                                                    </div>
                                                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{record.reason}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex items-center gap-1.5 text-indigo-400 uppercase text-[10px] font-bold tracking-wider mb-2">
                                                        <Scale size={12} />
                                                        Trade-Offs
                                                    </div>
                                                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                                        {record.trade_offs || "No trade-offs recorded for this decision."}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-1.5 text-[var(--text-tertiary)] uppercase text-[10px] font-bold tracking-wider mb-2">
                                                            <User size={12} />
                                                            Consulted
                                                        </div>
                                                        <p className="text-xs text-[var(--text-secondary)]">{record.consulted || "None"}</p>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-1.5 text-[var(--text-tertiary)] uppercase text-[10px] font-bold tracking-wider mb-2">
                                                            <Calendar size={12} />
                                                            Confidence
                                                        </div>
                                                        <p className="text-xs text-[var(--text-secondary)]">{record.confidence_level}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
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
