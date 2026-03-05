'use client'

import { useEffect, useState } from 'react'

interface Integration {
    type: string
    status: string
    signal_count: number
    last_synced_at: string | null
}

const INTEGRATION_LABELS: Record<string, { name: string; icon: string; description: string; color: string }> = {
    github: { name: 'GitHub', icon: '◈', description: 'PRs, commits, and engineering activity', color: 'indigo' },
    linear: { name: 'Linear', icon: '◆', description: 'Issues, roadmap items, and priorities', color: 'violet' },
    stripe: { name: 'Stripe', icon: '◇', description: 'Revenue events, upgrades, and churn', color: 'emerald' },
    feedback: { name: 'Customer Feedback', icon: '◎', description: 'CSV/JSON feedback files', color: 'amber' },
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
    const [token, setToken] = useState('')
    const [repo, setRepo] = useState('')
    const [file, setFile] = useState<File | null>(null)

    async function connect() {
        setLoading(true)
        setMessage('')
        try {
            let res: Response

            if (type === 'feedback') {
                if (file) {
                    const fd = new FormData()
                    fd.append('file', file)
                    res = await fetch('/api/upload', { method: 'POST', body: fd })
                } else {
                    // Load demo feedback
                    res = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
                }
            } else if (type === 'github') {
                res = await fetch('/api/integrations/github', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: token || 'demo', repo: repo || 'demo' }),
                })
            } else if (type === 'linear') {
                res = await fetch('/api/integrations/linear', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: token || 'demo' }),
                })
            } else {
                res = await fetch('/api/integrations/stripe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: token || 'demo' }),
                })
            }

            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setMessage(`✓ ${data.signals ?? data.count ?? 'Demo'} signals synced!`)
            onSync()
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Failed'
            setMessage('✗ ' + msg)
        } finally {
            setLoading(false)
        }
    }

    const colorMap: Record<string, string> = {
        indigo: 'border-indigo-500/30 bg-indigo-500/5',
        violet: 'border-violet-500/30 bg-violet-500/5',
        emerald: 'border-emerald-500/30 bg-emerald-500/5',
        amber: 'border-amber-500/30 bg-amber-500/5',
    }

    const iconColorMap: Record<string, string> = {
        indigo: 'text-indigo-400',
        violet: 'text-violet-400',
        emerald: 'text-emerald-400',
        amber: 'text-amber-400',
    }

    return (
        <div className={`rounded-xl border p-5 ${colorMap[cfg.color]}`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                    <span className={`text-lg ${iconColorMap[cfg.color]}`}>{cfg.icon}</span>
                    <div>
                        <h3 className="text-sm font-semibold text-white">{cfg.name}</h3>
                        <p className="text-xs text-neutral-500">{cfg.description}</p>
                    </div>
                </div>
                {existing && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        ✓ {existing.signal_count} signals
                    </span>
                )}
            </div>

            {/* Inputs */}
            <div className="space-y-2 mb-3">
                {type === 'feedback' ? (
                    <div>
                        <label className="text-xs text-neutral-500 block mb-1">Upload file (CSV/JSON/TXT) or load demo data</label>
                        <input
                            type="file"
                            accept=".csv,.json,.txt"
                            onChange={e => setFile(e.target.files?.[0] ?? null)}
                            className="w-full text-xs text-neutral-400 file:mr-2 file:text-xs file:bg-white/10 file:text-white file:border-0 file:rounded file:px-2 file:py-1 file:cursor-pointer"
                        />
                    </div>
                ) : (
                    <>
                        <div>
                            <label className="text-xs text-neutral-500 block mb-1">
                                {type === 'stripe' ? 'Stripe Secret Key' : `${INTEGRATION_LABELS[type]?.name} API Token`}
                                <span className="text-neutral-600 ml-1">(optional — leave blank for demo data)</span>
                            </label>
                            <input
                                type="password"
                                value={token}
                                onChange={e => setToken(e.target.value)}
                                placeholder={type === 'stripe' ? 'sk_live_... or sk_test_...' : type === 'github' ? 'ghp_...' : 'lin_api_...'}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50"
                            />
                        </div>
                        {type === 'github' && (
                            <div>
                                <label className="text-xs text-neutral-500 block mb-1">Repository (owner/name)</label>
                                <input
                                    type="text"
                                    value={repo}
                                    onChange={e => setRepo(e.target.value)}
                                    placeholder="e.g. vercel/next.js"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50"
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {message && (
                <p className={`text-xs mb-2 ${message.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>{message}</p>
            )}

            <button
                onClick={connect}
                disabled={loading}
                className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-neutral-300 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {loading ? '⟳ Syncing...' : existing ? '↻  Re-sync' : `⊕ Connect ${cfg.name}`}
            </button>

            {existing?.last_synced_at && (
                <p className="text-[10px] text-neutral-600 mt-1.5 text-right">
                    Last synced: {new Date(existing.last_synced_at).toLocaleString()}
                </p>
            )}
        </div>
    )
}

export default function IntegrationsPage() {
    const [integrations, setIntegrations] = useState<Integration[]>([])
    const [loading, setLoading] = useState(true)

    async function loadIntegrations() {
        const res = await fetch('/api/integrations/status')
        const data = await res.json()
        setIntegrations(data.integrations ?? [])
        setLoading(false)
    }

    useEffect(() => { loadIntegrations() }, [])

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
                <div className="grid sm:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="rounded-xl border border-white/5 bg-white/5 h-40 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                    {(['github', 'linear', 'stripe', 'feedback'] as const).map(type => (
                        <IntegrationCard
                            key={type}
                            type={type}
                            existing={integrations.find(i => i.type === type) ?? null}
                            onSync={loadIntegrations}
                        />
                    ))}
                </div>
            )}

            {totalSignals > 0 && (
                <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-center">
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
