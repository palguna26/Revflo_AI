'use client'

import { useState, useEffect } from 'react'

interface ApiKey {
    id: string
    name: string
    key_prefix: string
    created_at: string
    last_used_at: string | null
}

export function ApiKeysTab() {
    const [keys, setKeys] = useState<ApiKey[]>([])
    const [loading, setLoading] = useState(true)

    const [showNewKeyModal, setShowNewKeyModal] = useState(false)
    const [newKeyName, setNewKeyName] = useState('')
    const [generating, setGenerating] = useState(false)

    // Displayed once per generation
    const [plainTextKey, setPlainTextKey] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const [deleteKeyId, setDeleteKeyId] = useState<string | null>(null)

    // Toast state
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    async function fetchKeys() {
        try {
            const res = await fetch('/api/settings/api-keys')
            if (!res.ok) throw new Error('Failed to fetch keys')
            const data = await res.json()
            setKeys(data.keys || [])
        } catch (e) {
            showToast('Unable to load API keys', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchKeys()
    }, [])

    async function handleGenerateKey() {
        if (!newKeyName.trim()) return
        setGenerating(true)

        try {
            const res = await fetch('/api/settings/api-keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newKeyName })
            })

            if (!res.ok) throw new Error('Failed to generate log')
            const data = await res.json()

            // Add new key record to list
            setKeys([data.keyRecord, ...keys])

            // Show plaintext key to user directly
            setPlainTextKey(data.plainTextKey)
            setNewKeyName('')

        } catch (e) {
            showToast('Failed to generate key', 'error')
        } finally {
            setGenerating(false)
        }
    }

    async function handleDeleteKey() {
        if (!deleteKeyId) return
        try {
            const res = await fetch(`/api/settings/api-keys/${deleteKeyId}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete')

            setKeys(keys.filter(k => k.id !== deleteKeyId))
            showToast('Key deleted successfully', 'success')
        } catch (e) {
            showToast('Failed to delete key', 'error')
        } finally {
            setDeleteKeyId(null)
        }
    }

    function handleCopyKey() {
        if (plainTextKey) {
            navigator.clipboard.writeText(plainTextKey)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {toast && (
                <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg text-sm border z-50 ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {toast.message}
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">API Keys</h1>
                    <p className="text-sm text-neutral-400">Manage programmable access to your workspace.</p>
                </div>
                <button
                    onClick={() => setShowNewKeyModal(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    + Generate New Key
                </button>
            </div>

            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#111111]">
                {loading ? (
                    <div className="p-8 text-center text-sm text-neutral-500">Loading keys...</div>
                ) : keys.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-sm text-neutral-400">No API keys generated yet.</p>
                        <p className="text-xs text-neutral-500 mt-1">Keys allow external tools to send signals to Revflo.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-neutral-500 bg-white/5 uppercase border-b border-white/10">
                            <tr>
                                <th className="px-6 py-3 font-medium">Name</th>
                                <th className="px-6 py-3 font-medium">Key Prefix</th>
                                <th className="px-6 py-3 font-medium">Created</th>
                                <th className="px-6 py-3 font-medium">Last Used</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {keys.map(key => (
                                <tr key={key.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">{key.name}</td>
                                    <td className="px-6 py-4 font-mono text-neutral-400">{key.key_prefix}...</td>
                                    <td className="px-6 py-4 text-neutral-500">{new Date(key.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-neutral-500">
                                        {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setDeleteKeyId(key.id)}
                                            className="text-neutral-500 hover:text-red-400 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* New Key Modal */}
            {showNewKeyModal && !plainTextKey && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
                        <h3 className="text-lg font-semibold text-white">Generate API Key</h3>
                        <p className="text-sm text-neutral-400">Give this key a descriptive name so you remember where it's used.</p>

                        <input
                            type="text"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            placeholder="e.g. Production Backend"
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors text-white"
                        />

                        <div className="flex gap-3 justify-end pt-2">
                            <button
                                onClick={() => {
                                    setShowNewKeyModal(false)
                                    setNewKeyName('')
                                }}
                                className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-300 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGenerateKey}
                                disabled={!newKeyName.trim() || generating}
                                className="px-5 py-2 bg-white text-black rounded-xl text-sm font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {generating ? 'Generating...' : 'Generate Key'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PlainText Key Display Modal (Shown Once) */}
            {plainTextKey && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#111111] border border-amber-500/30 rounded-2xl p-6 w-full max-w-lg space-y-6 shadow-2xl animate-in zoom-in-95">
                        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm px-4 py-3 rounded-lg flex items-start gap-3">
                            <span className="text-lg mt-0.5">⚠️</span>
                            <div>
                                <strong className="font-semibold block mb-1">Save this key now</strong>
                                For security reasons, <span className="font-semibold underline">it will never be shown again</span>. If you lose it, you will need to generate a new one.
                            </div>
                        </div>

                        <div className="flex items-center gap-2 bg-black border border-white/10 rounded-xl p-2 pl-4">
                            <code className="flex-1 text-sm text-white overflow-x-auto whitespace-nowrap hide-scrollbar">
                                {plainTextKey}
                            </code>
                            <button
                                onClick={handleCopyKey}
                                className="shrink-0 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                setPlainTextKey(null)
                                setShowNewKeyModal(false)
                            }}
                            className="w-full px-5 py-3 border border-white/10 text-white rounded-xl text-sm font-medium hover:bg-white/5 transition-colors"
                        >
                            I have saved my key
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Key Modal */}
            {deleteKeyId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#111111] border border-red-500/20 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
                        <h3 className="text-lg font-semibold text-white">Revoke API Key?</h3>
                        <p className="text-sm text-neutral-300">
                            Any tools using this API key will immediately lose access. This action cannot be undone.
                        </p>

                        <div className="flex gap-3 justify-end pt-2">
                            <button
                                onClick={() => setDeleteKeyId(null)}
                                className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-300 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteKey}
                                className="px-5 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
                            >
                                Revoke Key
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
