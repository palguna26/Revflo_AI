'use client'

import { useEffect, useState, useRef } from 'react'

interface Integration {
    provider: string
    status?: string
    signal_count?: number
    last_synced_at?: string | null
}

const INTEGRATION_LABELS: Record<string, { name: string; icon: string; description: string; color: string }> = {
    github: { name: 'GitHub', icon: '◈', description: 'PRs, commits, and engineering activity', color: 'indigo' },
    linear: { name: 'Linear', icon: '◆', description: 'Issues, roadmap items, and priorities', color: 'violet' },
    csv: { name: 'Customer Feedback', icon: '◎', description: 'Upload raw CSV feedback files', color: 'amber' },
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
        if (type === 'csv') return // Handled via upload
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

    const colorMap: Record<string, string> = {
        indigo: 'border-indigo-500/30 bg-indigo-500/5',
        violet: 'border-violet-500/30 bg-violet-500/5',
        amber: 'border-amber-500/30 bg-amber-500/5',
    }

    const iconColorMap: Record<string, string> = {
        indigo: 'text-indigo-400',
        violet: 'text-violet-400',
        amber: 'text-amber-400',
    }

    return (
        <div className={`rounded-xl border p-5 ${colorMap[cfg.color]}`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                    <span className={`text-lg ${iconColorMap[cfg.color]}`}>{cfg.icon}</span>
                    <div>
                        <h3 className="text-sm font-semibold text-white">{cfg.name}</h3>
                        <p className="text-xs text-neutral-500">{cfg.description}</p>
                    </div>
                </div>
                {existing && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Total {existing.signal_count} signals
                    </span>
                )}
            </div>

            {/* Inputs / Upload */}
            {type === 'csv' && (
                <div className="mb-4">
                    <input
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        disabled={loading}
                        className="w-full text-xs text-neutral-400 file:mr-2 file:text-xs file:bg-white/10 file:text-white file:border-0 file:rounded file:px-3 file:py-1.5 file:cursor-pointer file:hover:bg-white/20 transition-colors"
                    />
                </div>
            )}

            {message && (
                <p className={`text-xs mb-3 font-medium ${message.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>{message}</p>
            )}

            <div className="flex items-center gap-3">
                {type === 'csv' ? null : existing ? (
                    <button
                        onClick={handleSync}
                        disabled={loading}
                        className="w-full py-1.5 rounded-lg border text-xs font-medium transition-colors bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {loading ? '⟳ Syncing...' : '⟳ Sync Now'}
                    </button>
                ) : (
                    <button
                        onClick={handleConnect}
                        disabled={loading}
                        className={`w-full py-1.5 rounded-lg text-xs font-medium transition-colors text-white ${type === 'github' ? 'bg-[#24292e] hover:bg-[#2f363d]' : 'bg-[#5e6ad2] hover:bg-[#6c78e6]'
                            }`}
                    >
                        ⊕ Connect {cfg.name}
                    </button>
                )}
            </div>

            {existing?.last_synced_at && (
                <p className="text-[10px] text-neutral-500 mt-2.5 text-center">
                    Last activity: {new Date(existing.last_synced_at).toLocaleString()}
                </p>
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
            setLoading(false)
        }
    }

    useEffect(() => {
        loadIntegrations()

        // Handle OAuth success/error callbacks in URL
        const params = new URLSearchParams(window.location.search)
        const error = params.get('error')
        const success = params.get('success')

        if (error) {
            setTimeout(() => alert(`Integration error: ${error}`), 100)
            window.history.replaceState({}, '', '/dashboard/integrations')
        } else if (success) {
            setTimeout(() => alert(`Successfully integrated ${success.split('_')[0]}!`), 100)
            window.history.replaceState({}, '', '/dashboard/integrations')
        }
    }, [])

    const totalSignals = integrations.reduce((sum, i) => sum + (i.signal_count ?? 0), 0)

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-white">Integrations</h1>
                <p className="text-sm text-neutral-500 mt-0.5">
                    Connect your tools to collect product signals.
                    {totalSignals > 0 && <span className="text-indigo-400 ml-1">{totalSignals} signals collected.</span>}
                </p>
            </div>

            {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="rounded-xl border border-white/5 bg-white/5 h-40 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(['github', 'linear', 'csv']).map(type => (
                        <IntegrationCard
                            key={type}
                            type={type}
                            existing={integrations.find(i => i.provider === type) ?? null}
                            onSync={loadIntegrations}
                        />
                    ))}
                </div>
            )}

            {totalSignals > 0 && (
                <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-center mt-6">
                    <p className="text-sm text-neutral-300">
                        <span className="text-indigo-400 font-semibold">{totalSignals} signals</span> collected.{' '}
                        <a href="/dashboard" className="text-indigo-400 hover:text-indigo-300 underline-offset-2 hover:underline">
                            Go to Dashboard to run AI analysis →
                        </a>
                    </p>
                </div>
            )}
        </div>
    )
}
