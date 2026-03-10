'use client'

import { useEffect, useState } from 'react'
import { DecisionRecord } from '../analysis/page'

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

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-5">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Decision Log</h1>
                    <p className="text-sm text-neutral-500 mt-0.5">Revflo's institutional memory of all product decisions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Search feature or decision..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder:text-neutral-600"
                    />
                    <span className="text-xs text-neutral-500 bg-white/5 border border-white/10 px-2 py-1.5 rounded">
                        {filteredRecords.length} records
                    </span>
                </div>
            </div>

            {loading && (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="rounded-xl border border-white/5 bg-white/5 h-16 animate-pulse" />
                    ))}
                </div>
            )}

            {!loading && records.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/10 p-12 text-center">
                    <p className="text-neutral-400 text-sm">No decisions logged yet.</p>
                    <p className="text-neutral-600 text-xs mt-1">Make your first decision from the Build Decisions page.</p>
                    <a href="/dashboard/analysis" className="mt-4 inline-block text-indigo-400 text-sm hover:text-indigo-300">
                        → Go to Build Decisions
                    </a>
                </div>
            )}

            {!loading && records.length > 0 && filteredRecords.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-neutral-400 text-sm">No decisions found matching "{searchTerm}".</p>
                </div>
            )}

            {!loading && filteredRecords.length > 0 && (
                <div className="space-y-3">
                    {filteredRecords.map(record => {
                        const isExpanded = expanded === record.id;

                        return (
                            <div key={record.id} className="rounded-xl border border-white/5 bg-white/5 overflow-hidden transition-colors hover:bg-white/[0.03]">
                                <div
                                    className="p-4 cursor-pointer flex items-center justify-between gap-4"
                                    onClick={() => setExpanded(isExpanded ? null : record.id)}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-32 shrink-0">
                                            <span className={`text-[10px] px-2 py-1 rounded border uppercase font-bold tracking-wider
                                                ${record.decision === 'Approve' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : ''}
                                                ${record.decision === 'Deprioritize' ? 'text-red-400 bg-red-400/10 border-red-400/20' : ''}
                                                ${record.decision === 'Needs Research' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' : ''}
                                            `}>
                                                {record.decision}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">
                                                {record.feature?.feature_name ?? 'Unknown Feature'}
                                            </p>
                                            <p className="text-xs text-neutral-500 truncate mt-0.5">
                                                {record.reason}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 shrink-0">
                                        <div className="text-right">
                                            <p className="text-xs text-neutral-300">{record.decided_by}</p>
                                            <p className="text-[10px] text-neutral-600">{new Date(record.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <span className="text-neutral-600 text-xs">{isExpanded ? '▲' : '▼'}</span>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="p-5 border-t border-white/5 bg-black/20">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-[10px] text-neutral-600 font-medium uppercase tracking-wider mb-1">Reason for Decision</p>
                                                    <p className="text-sm text-neutral-300">{record.reason}</p>
                                                </div>

                                                {record.trade_offs && (
                                                    <div>
                                                        <p className="text-[10px] text-indigo-400 font-medium uppercase tracking-wider mb-1">Trade-Offs</p>
                                                        <p className="text-sm text-neutral-300">{record.trade_offs}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-[10px] text-neutral-600 font-medium uppercase tracking-wider mb-1">Confidence</p>
                                                    <span className="text-xs text-neutral-300 bg-white/5 px-2 py-1 rounded inline-block">
                                                        {record.confidence_level}
                                                    </span>
                                                </div>

                                                {record.consulted && (
                                                    <div>
                                                        <p className="text-[10px] text-neutral-600 font-medium uppercase tracking-wider mb-1">Consulted</p>
                                                        <p className="text-sm text-neutral-300">{record.consulted}</p>
                                                    </div>
                                                )}
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
