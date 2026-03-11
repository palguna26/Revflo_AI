'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Rocket, BarChart3, Lightbulb, Zap, Share2, ArrowRight, RefreshCw, AlertCircle, CheckCircle2, Inbox } from 'lucide-react'

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
    last_analyzed_at: string | null
    new_signals_count: number
    workspace_settings: any
}

const INSIGHT_TYPE_ICON: Record<string, any> = {
    opportunity: Rocket,
    risk: AlertCircle,
    trend: BarChart3,
}

const INSIGHT_TYPE_STYLE: Record<string, string> = {
    opportunity: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    risk: 'text-red-400 bg-red-400/10 border-red-400/20',
    trend: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
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
            setMessage('Analysis complete')
            await fetchStats()
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Analysis failed'
            setMessage(msg)
        } finally {
            setRunning(false)
        }
    }

    useEffect(() => { fetchStats() }, [])

    if (loading && !stats) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="h-64 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg animate-pulse" />
                    <div className="h-64 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg animate-pulse" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Run Analysis Alert */}
            {stats && stats.new_signals_count >= 5 && (
                <div className="bg-[var(--bg-secondary)] border border-indigo-500/30 rounded-lg p-5 flex items-center justify-between shadow-sm animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                            <Zap size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">New intelligence available</p>
                            <p className="text-xs text-[var(--text-tertiary)]">{stats.new_signals_count} new product signals processed. Re-analyze to refresh insights.</p>
                        </div>
                    </div>
                    <Button 
                        onClick={runAnalysis}
                        disabled={running}
                        variant="primary"
                        className="gap-2"
                    >
                        {running ? <RefreshCw className="animate-spin" size={14} /> : <Zap size={14} />}
                        Run Analysis
                    </Button>
                </div>
            )}

            {/* Status Message */}
            {message && (
                <div className={`px-4 py-3 rounded-lg border flex items-center gap-3 animate-in slide-in-from-top-1 duration-300 ${
                    message.includes('failed') ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                    {message.includes('failed') ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                    <span className="text-sm">{message}</span>
                    <button onClick={() => setMessage('')} className="ml-auto text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
                        <span className="text-xs">Dismiss</span>
                    </button>
                </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Signals', value: stats?.signal_count, icon: BarChart3, color: 'text-indigo-400' },
                    { label: 'Insights', value: stats?.insight_count, icon: Lightbulb, color: 'text-amber-400' },
                    { label: 'Decisions', value: stats?.recommendation_count, icon: Zap, color: 'text-blue-400' },
                    { label: 'PRDs', value: stats?.prd_count, icon: Rocket, color: 'text-emerald-400' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg p-5 hover:border-[var(--border-strong)] transition-all group">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-widest">{stat.label}</span>
                            <stat.icon size={16} className={`${stat.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
                        </div>
                        <div className="text-3xl font-semibold tracking-tighter text-[var(--text-primary)]">{stat.value || 0}</div>
                    </div>
                ))}
            </div>

            {/* Main Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Insights */}
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg overflow-hidden flex flex-col shadow-sm">
                    <div className="px-5 py-4 flex items-center justify-between bg-[var(--bg-secondary)]">
                        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Recent Insights</h3>
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            className="text-xs h-7 gap-1"
                            onClick={() => window.location.href = '/dashboard/insights'}
                        >
                            View all <ArrowRight size={12} />
                        </Button>
                    </div>
                    <div className="flex-1 p-2 border-t border-[var(--border-subtle)]">
                        {stats?.top_insights && stats.top_insights.length > 0 ? (
                            <div className="space-y-0.5">
                                {stats.top_insights.map(insight => {
                                    return (
                                        <div key={insight.id} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--bg-hover)] transition-colors group cursor-pointer">
                                            <Badge variant={insight.insight_type as any} className="capitalize w-20 justify-center">
                                                {insight.insight_type}
                                            </Badge>
                                            <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors truncate flex-1">
                                                {insight.title}
                                            </span>
                                            <span className="text-[11px] text-[var(--text-tertiary)] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                                {insight.confidence_score}% Match
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="h-40 flex flex-col items-center justify-center text-[var(--text-tertiary)] text-sm border border-dashed border-[var(--border-subtle)] m-2 rounded">
                                <Lightbulb size={24} className="mb-2 opacity-20" />
                                No insights generated yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Build Decisions */}
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg overflow-hidden flex flex-col shadow-sm">
                    <div className="px-5 py-4 flex items-center justify-between bg-[var(--bg-secondary)]">
                        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Priority Features</h3>
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            className="text-xs h-7 gap-1"
                            onClick={() => window.location.href = '/dashboard/analysis'}
                        >
                            View all <ArrowRight size={12} />
                        </Button>
                    </div>
                    <div className="flex-1 p-2 border-t border-[var(--border-subtle)]">
                        {stats?.top_recommendations && stats.top_recommendations.length > 0 ? (
                            <div className="space-y-0.5">
                                {stats.top_recommendations.map((rec, i) => (
                                    <div key={rec.id} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--bg-hover)] transition-colors group cursor-pointer">
                                        <div className="flex flex-col items-center justify-center w-6 h-6 rounded bg-[var(--bg-tertiary)] group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors">
                                            <span className="text-[10px] font-mono leading-none">{i + 1}</span>
                                        </div>
                                        <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors truncate flex-1 leading-tight">
                                            {rec.feature_name}
                                        </span>
                                        <div className="h-1 w-16 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${rec.priority_score}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-40 flex flex-col items-center justify-center text-[var(--text-tertiary)] text-sm border border-dashed border-[var(--border-subtle)] m-2 rounded">
                                <Zap size={24} className="mb-2 opacity-20" />
                                No build decisions available.
                            </div>
                        )}
                    </div>
                </div>

                {/* Sources & Integrations */}
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg overflow-hidden flex flex-col shadow-sm lg:col-span-2">
                    <div className="px-5 py-4 flex items-center justify-between bg-[var(--bg-secondary)]">
                        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Connected Data Ingestion</h3>
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            className="text-xs h-7 gap-1"
                            onClick={() => window.location.href = '/dashboard/integrations'}
                        >
                            Manage Sources <ArrowRight size={12} />
                        </Button>
                    </div>
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 border-t border-[var(--border-subtle)]">
                        {stats?.integrations && stats.integrations.length > 0 ? (
                            stats.integrations.map(intg => (
                                <div key={intg.type} className="flex flex-col gap-2 p-3 rounded-lg bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] hover:border-blue-500/30 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold capitalize text-[var(--text-primary)] tracking-tight">{intg.type}</span>
                                        <Badge variant="success" className="h-4 px-1.5 text-[8px] uppercase tracking-tighter">
                                            Active
                                        </Badge>
                                    </div>
                                    <div className="flex items-baseline gap-1 mt-1">
                                        <span className="text-xl font-bold tracking-tighter text-[var(--text-primary)]">{intg.signal_count}</span>
                                        <span className="text-[10px] text-[var(--text-tertiary)] font-medium">signals</span>
                                    </div>
                                    <div className="h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden mt-2">
                                        <div className="h-full bg-blue-500/40 rounded-full" style={{ width: '65%' }}></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="md:col-span-2 lg:col-span-4 h-32 flex flex-col items-center justify-center text-[var(--text-tertiary)] text-sm border border-dashed border-[var(--border-subtle)] rounded-lg m-2">
                                <Share2 size={32} className="mb-2 opacity-10" />
                                No signal sources connected.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
