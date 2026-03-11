'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ListItem } from '@/components/ui/ListItem'
import { 
    Zap, 
    TrendingUp, 
    AlertTriangle, 
    Target, 
    BarChart3, 
    ArrowRight,
    Search,
    Filter,
    ArrowUpRight,
    MoreHorizontal,
    MessageSquare
} from 'lucide-react'

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
    opportunity: { 
        label: 'Opportunity', 
        icon: Target,
        color: 'text-emerald-400',
        bg: 'bg-emerald-400/10',
        border: 'border-emerald-400/20'
    },
    risk: { 
        label: 'Risk', 
        icon: AlertTriangle,
        color: 'text-rose-400',
        bg: 'bg-rose-400/10',
        border: 'border-rose-400/20'
    },
    trend: { 
        label: 'Trend', 
        icon: TrendingUp,
        color: 'text-blue-400',
        bg: 'bg-blue-400/10',
        border: 'border-blue-400/20'
    },
}

export default function InsightsPage() {
    const [insights, setInsights] = useState<Insight[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'opportunity' | 'risk' | 'trend'>('all')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetch('/api/insights')
            .then(r => r.json())
            .then(d => setInsights(d.insights ?? []))
            .finally(() => setLoading(false))
    }, [])

    const filtered = (filter === 'all' ? insights : insights.filter(i => i.insight_type === filter))
        .filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                     i.description.toLowerCase().includes(searchQuery.toLowerCase()))

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Zap size={14} className="text-amber-400" />
                        <span className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">Growth Intelligence</span>
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Product Insights</h1>
                    <p className="text-[var(--text-tertiary)] text-sm mt-1 max-w-xl">
                        AI-synthesized patterns from across your product signals. High confidence signals are ready for execution.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                        <input 
                            type="text" 
                            placeholder="Find insight..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] w-40 md:w-60"
                        />
                    </div>
                </div>
            </div>

            {/* Filter Tabs & Content */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)]">
                    <div className="flex gap-1">
                        {(['all', 'opportunity', 'risk', 'trend'] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => setFilter(type)}
                                className={`px-4 py-2 text-[13px] font-medium transition-all relative ${
                                    filter === type
                                    ? 'text-[var(--text-primary)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[var(--accent)]'
                                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                                }`}
                            >
                                <span className="capitalize">{type}</span>
                                <span className="ml-1.5 text-[10px] opacity-70">
                                    ({type === 'all' ? insights.length : insights.filter(i => i.insight_type === type).length})
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-28 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="border border-dashed border-[var(--border-subtle)] rounded-xl py-20 flex flex-col items-center justify-center bg-[var(--bg-secondary)]/30">
                        <div className="h-14 w-14 rounded-full bg-[var(--bg-hover)] flex items-center justify-center mb-4 text-[var(--text-tertiary)]">
                            <Filter size={24} strokeWidth={1} />
                        </div>
                        <h2 className="text-base font-medium text-[var(--text-primary)]">No matching insights found</h2>
                        <p className="text-[var(--text-tertiary)] text-xs mt-1">Try adjusting your filters or search query.</p>
                    </div>
                ) : (
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg overflow-hidden divide-y divide-[var(--border-subtle)]">
                        {filtered.map(insight => {
                            const cfg = TYPE_CONFIG[insight.insight_type] ?? TYPE_CONFIG.opportunity
                            const Icon = cfg.icon
                            
                            return (
                                <ListItem
                                    key={insight.id}
                                    icon={<div className={`p-1 rounded ${cfg.bg} ${cfg.color}`}><Icon size={12} /></div>}
                                    title={
                                        <div className="flex items-center gap-2">
                                            <span>{insight.title}</span>
                                            <Badge variant={insight.insight_type as any} className="text-[9px] uppercase h-4 px-1">
                                                {insight.insight_type}
                                            </Badge>
                                        </div>
                                    }
                                    subtitle={insight.description}
                                    meta={
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
                                                <MessageSquare size={12} />
                                                <span>{insight.signal_count}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1 rounded-full bg-[var(--bg-hover)] overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${
                                                            insight.confidence_score >= 80 ? 'bg-emerald-500' :
                                                            insight.confidence_score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                                        }`}
                                                        style={{ width: `${insight.confidence_score}%` }}
                                                    />
                                                </div>
                                                <span className="font-mono text-[var(--text-secondary)]">{insight.confidence_score}%</span>
                                            </div>
                                            <button className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                                                <MoreHorizontal size={14} />
                                            </button>
                                        </div>
                                    }
                                />
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Bottom CTA */}
            {!loading && insights.length > 0 && filter === 'all' && (
                <p className="text-center text-[10px] text-[var(--text-tertiary)] uppercase tracking-[0.2em] pt-4">
                    Showing all synthesized patterns from your roadmap and feedback sources
                </p>
            )}
        </div>
    )
}
