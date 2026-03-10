'use client'

import { useState } from 'react'

export function IntegrationsTab({
    githubStatus,
    linearStatus,
    csvUploadCount,
    csvSignalCount
}: {
    githubStatus: { connected: boolean, date?: string }
    linearStatus: { connected: boolean, date?: string }
    csvUploadCount: number
    csvSignalCount: number
}) {
    const [disconnecting, setDisconnecting] = useState('')
    const [clearingCsv, setClearingCsv] = useState(false)
    const [showCsvModal, setShowCsvModal] = useState(false)

    // Toast state
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    async function handleDisconnect(provider: string) {
        setDisconnecting(provider)
        try {
            const formData = new FormData()
            formData.append('provider', provider)
            const res = await fetch('/api/integrations/disconnect', {
                method: 'POST',
                body: formData
            })
            if (!res.ok) throw new Error('Failed to disconnect')
            window.location.reload() // Reload to capture upstream state syncs
        } catch (e) {
            showToast('Failed to disconnect integration', 'error')
            setDisconnecting('')
        }
    }

    async function handleClearCsv() {
        setClearingCsv(true)
        try {
            const res = await fetch('/api/integrations/feedback/clear', { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to clear CSV')
            window.location.reload()
        } catch (e) {
            showToast('Failed to clear CSV data', 'error')
            setClearingCsv(false)
            setShowCsvModal(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {toast && (
                <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg text-sm border z-50 ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {toast.message}
                </div>
            )}

            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Integrations</h1>
                <p className="text-sm text-neutral-400">Manage connections to external tools and data sources.</p>
            </div>

            <div className="space-y-4 max-w-2xl">
                {/* GitHub */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-[#111111]">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center text-white">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">GitHub</p>
                            <p className="text-xs text-neutral-400">
                                {githubStatus.connected ? `Connected ${githubStatus.date}` : 'Not Connected'}
                            </p>
                        </div>
                    </div>
                    {githubStatus.connected ? (
                        <button
                            onClick={() => handleDisconnect('github')}
                            disabled={disconnecting === 'github'}
                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium transition-colors"
                        >
                            {disconnecting === 'github' ? 'Disconnecting...' : 'Disconnect'}
                        </button>
                    ) : (
                        <a
                            href="/api/integrations/github/connect"
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                            Connect
                        </a>
                    )}
                </div>

                {/* Linear */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-[#111111]">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-white/10 text-white rounded-lg flex items-center justify-center font-bold">
                            L
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">Linear</p>
                            <p className="text-xs text-neutral-400">
                                {linearStatus.connected ? `Connected ${linearStatus.date}` : 'Not Connected'}
                            </p>
                        </div>
                    </div>
                    {linearStatus.connected ? (
                        <button
                            onClick={() => handleDisconnect('linear')}
                            disabled={disconnecting === 'linear'}
                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium transition-colors"
                        >
                            {disconnecting === 'linear' ? 'Disconnecting...' : 'Disconnect'}
                        </button>
                    ) : (
                        <a
                            href="/api/integrations/linear/connect"
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                            Connect
                        </a>
                    )}
                </div>

                {/* CSV */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-[#111111]">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-white/10 text-white rounded-lg flex items-center justify-center font-bold">
                            CSV
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">Customer Feedback (CSV)</p>
                            <p className="text-xs text-neutral-400">
                                {csvUploadCount} uploads • {csvSignalCount} signals ingested
                            </p>
                        </div>
                    </div>
                    {csvUploadCount > 0 && (
                        <button
                            onClick={() => setShowCsvModal(true)}
                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium transition-colors"
                        >
                            Clear all CSV signals
                        </button>
                    )}
                </div>
            </div>

            {/* CSV Delete Modal */}
            {showCsvModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#111111] border border-red-500/20 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
                        <h3 className="text-lg font-semibold text-white">Clear CSV Data?</h3>
                        <p className="text-sm text-neutral-300">
                            This will permanently delete all {csvSignalCount} signals associated with your manual CSV uploads. Are you sure?
                        </p>
                        <div className="flex gap-3 justify-end pt-2">
                            <button
                                onClick={() => setShowCsvModal(false)}
                                className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-300 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClearCsv}
                                disabled={clearingCsv}
                                className="px-5 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {clearingCsv ? 'Clearing...' : 'Clear Data'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
