'use client'

import { useEffect, useState, useRef } from 'react'
import { Github, Layout, FileText, CheckCircle2, AlertCircle, RefreshCw, Plus, ArrowRight, Share2, Globe } from 'lucide-react'

interface Integration {
    provider: string
    status?: string
    signal_count?: number
    last_synced_at?: string | null
}

const INTEGRATION_LABELS: Record<string, { name: string; icon: any; description: string; color: string }> = {
    github: { name: 'GitHub', icon: Github, description: 'Import PRs, commits, and engineering velocity metrics.', color: 'text-indigo-400' },
    linear: { name: 'Linear', icon: Layout, description: 'Import issues, roadmap progress, and team sentiment.', color: 'text-blue-400' },
    csv: { name: 'Customer Feedback', icon: FileText, description: 'Upload raw CSV feedback from surveys or support logs.', color: 'text-amber-400' },
}

function IntegrationCard({
    type,
    existing,
    onSync,
}: {
    type: string
    existing: Integration | null
    onSync: () => void
}) {
    const cfg = INTEGRATION_LABELS[type]!
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    async function handleConnect() {
        if (type === 'github') {
            window.location.href = '/api/integrations/github/connect'
        } else if (type === 'linear') {
            window.location.href = '/api/integrations/linear/connect'
        }
    }

    async function handleSync() {
        if (type === 'csv') return
        setLoading(true)
        setMessage('')
        try {
            const res = await fetch('/api/integrations/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider: type })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to sync')
            setMessage(`✓ ${data.count} new signals synced!`)
            onSync()
        } catch (e: any) {
            setMessage('✗ ' + (e.message || 'Sync failed'))
        } finally {
            setLoading(false)
        }
    }

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setLoading(true)
        setMessage('')
        try {
            const fd = new FormData()
            fd.append('file', file)
            const res = await fetch('/api/integrations/feedback/upload', {
                method: 'POST',
                body: fd
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Upload failed')
            setMessage(`✓ ${data.count} records ingested!`)
            onSync()
        } catch (err: any) {
            setMessage('✗ ' + (err.message || 'Upload failed'))
        } finally {
            setLoading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const Icon = cfg.icon

    return (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg p-5 hover:border-[var(--border-strong)] transition-all flex flex-col group">
            <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-[var(--bg-hover)] flex items-center justify-center border border-[var(--border-subtle)] group-hover:bg-[var(--bg-secondary)] transition-colors">
                    <Icon size={20} className={cfg.color} />
                </div>
                {existing && (
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Connected
                        </span>
                        <span className="text-[10px] text-[var(--text-tertiary)] mt-1">{existing.signal_count} signals</span>
                    </div>
                )}
            </div>

            <div className="mb-6 flex-1">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{cfg.name}</h3>
                <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">{cfg.description}</p>
            </div>

            {type === 'csv' && (
                <div className="mb-4">
                    <input
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        disabled={loading}
                        className="hidden"
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        className="w-full py-1.5 px-3 rounded text-[11px] font-medium border border-dashed border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-colors text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                    >
                        {loading ? 'Ingesting...' : 'Select CSV file'}
                    </button>
                </div>
            )}

            {message && (
                <div className={`flex items-center gap-2 mb-4 p-2 rounded text-[11px] font-medium ${
                    message.startsWith('✓') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'bg-red-500/10 text-red-400 border border-red-500/10'
                }`}>
                    {message.startsWith('✓') ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    {message}
                </div>
            )}

            <div className="flex items-center gap-2">
                {existing ? (
                    <>
                        <button
                            onClick={handleSync}
                            disabled={loading}
                            className="linear-button-secondary flex-1 py-1 px-2 h-8 text-[11px]"
                        >
                            {loading ? <RefreshCw className="animate-spin" size={12} /> : <RefreshCw size={12} />}
                            Sync Now
                        </button>
                        <button className="h-8 w-8 rounded flex items-center justify-center border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)]">
                            <Globe size={13} />
                        </button>
                    </>
                ) : (
                    <button
                        onClick={handleConnect}
                        disabled={loading}
                        className="linear-button-primary flex-1 py-1 px-2 h-8 text-[11px]"
                    >
                        <Plus size={12} />
                        Connect
                    </button>
                )}
            </div>

            {existing?.last_synced_at && (
                <span className="text-[10px] text-[var(--text-tertiary)] mt-3 text-center opacity-60">
                    Synced {new Date(existing.last_synced_at).toLocaleDateString()}
                </span>
            )}
        </div>
    )
}

export default function IntegrationsPage() {
    const [integrations, setIntegrations] = useState<Integration[]>([])
    const [loading, setLoading] = useState(true)

    async function loadIntegrations() {
        try {
            const res = await fetch('/api/integrations')
            const data = await res.json()
            setIntegrations(data.integrations ?? [])
        } catch (e) {
            console.error('Failed to load integrations')
        } finally {
            setIntegrations(prev => prev) // Trigger re-render even if empty
            setLoading(false)
        }
    }

    useEffect(() => {
        loadIntegrations()
    }, [])

    const totalSignals = integrations.reduce((sum, i) => sum + (i.signal_count ?? 0), 0)

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Integrations</h1>
                    <p className="text-[var(--text-tertiary)] text-sm mt-1 max-w-xl">
                        RevFlo parses raw signals from your existing tools to identify product gaps and growth opportunities.
                    </p>
                </div>
                {totalSignals > 0 && (
                    <div className="flex items-center gap-2 text-[var(--text-tertiary)] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-full">
                        <Share2 size={13} className="text-blue-400" />
                        <span className="text-xs font-medium"><span className="text-[var(--text-primary)]">{totalSignals}</span> Signals Indexed</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="h-64 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg animate-pulse" />
                    ))
                ) : (
                    (['github', 'linear', 'csv']).map(type => (
                        <IntegrationCard
                            key={type}
                            type={type}
                            existing={integrations.find(i => i.provider === type) ?? null}
                            onSync={loadIntegrations}
                        />
                    ))
                )}
            </div>

            {/* Empty state / CTA */}
            {!loading && integrations.length === 0 && (
                <div className="border border-dashed border-[var(--border-subtle)] rounded-xl py-20 flex flex-col items-center justify-center bg-[var(--bg-secondary)]/30">
                    <div className="h-16 w-16 rounded-2xl bg-[var(--bg-hover)] flex items-center justify-center mb-6 border border-[var(--border-subtle)] text-[var(--text-tertiary)]">
                        <Plus size={32} strokeWidth={1} />
                    </div>
                    <h2 className="text-lg font-medium text-[var(--text-primary)] mb-2">No tools connected</h2>
                    <p className="text-[var(--text-tertiary)] text-sm max-w-xs text-center mb-8">
                        Connect at least one tool to start collecting product signals for AI analysis.
                    </p>
                    <div className="flex items-center gap-3">
                        <button onClick={() => window.location.href = '#'} className="linear-button-primary">Browse All Integrations</button>
                    </div>
                </div>
            )}

            {/* Analysis CTA */}
            {totalSignals > 0 && (
                <div className="bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-indigo-500/10 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">Signals are ready for processing</h3>
                        <p className="text-[var(--text-tertiary)] text-sm">Your connected tools have provided {totalSignals} signals. Start your AI analysis to reveal growth insights.</p>
                    </div>
                    <button 
                        onClick={() => window.location.href = '/dashboard'}
                        className="linear-button-primary"
                    >
                        Go to Overview <ArrowRight size={14} className="ml-1" />
                    </button>
                </div>
            )}
        </div>
    )
}
