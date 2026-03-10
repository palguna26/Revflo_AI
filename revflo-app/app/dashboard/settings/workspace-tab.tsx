'use client'

import { useState } from 'react'

export function WorkspaceTab({
    initialName,
    initialAutoAnalyze
}: {
    initialName: string,
    initialAutoAnalyze: boolean
}) {
    const [name, setName] = useState(initialName)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)

    // Toast state
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

    // Delete modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState('')

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    async function handleSaveName() {
        if (!name.trim() || name === initialName) return
        setSaving(true)
        try {
            const res = await fetch('/api/workspace', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            })
            if (!res.ok) throw new Error('Failed to update')
            showToast('Workspace name updated', 'success')
        } catch (e) {
            showToast('Failed to update workspace name', 'error')
            setName(initialName) // revert
        } finally {
            setSaving(false)
        }
    }

    async function handleToggle(e: React.ChangeEvent<HTMLInputElement>) {
        const newValue = e.target.checked
        try {
            const res = await fetch('/api/settings', { // Reusing our existing settings route
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ auto_analyze: newValue })
            })
            if (!res.ok) throw new Error('Failed to update')
            showToast(`Auto-analyze turned ${newValue ? 'ON' : 'OFF'}`, 'success')
        } catch (error) {
            showToast('Failed to update automation setting', 'error')
            e.target.checked = !newValue // Revert toggle visually
        }
    }

    async function handleDelete() {
        if (deleteConfirm !== 'DELETE') return
        setDeleting(true)
        try {
            const res = await fetch('/api/workspace', { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete')
            window.location.href = '/register'
        } catch (e) {
            showToast('Failed to delete workspace', 'error')
            setDeleting(false)
            setShowDeleteModal(false)
            setDeleteConfirm('')
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {toast && (
                <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg text-sm border ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {toast.message}
                </div>
            )}

            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Workspace Details</h1>
                <p className="text-sm text-neutral-400">Manage your organization's core settings.</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-3">
                    <label className="text-xs font-medium text-neutral-300 ml-1">Workspace Name</label>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="flex-1 max-w-sm bg-[#111111] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors text-white"
                        />
                        <button
                            onClick={handleSaveName}
                            disabled={saving || name === initialName || !name.trim()}
                            className="px-4 py-2.5 bg-white text-black font-semibold rounded-xl text-sm hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                    <h2 className="text-sm font-medium tracking-tight mb-4 text-white">Automation</h2>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 max-w-sm">
                        <div>
                            <p className="text-sm font-medium text-white">Continuous AI Loop</p>
                            <p className="text-xs text-neutral-400 mt-0.5">Auto-analyze new signals weekly</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                defaultChecked={initialAutoAnalyze}
                                onChange={handleToggle}
                            />
                            <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                        </label>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="pt-6">
                    <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-6 relative overflow-hidden max-w-xl">
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50"></div>
                        <h2 className="text-base font-medium text-red-400 mb-2">Danger Zone</h2>
                        <p className="text-sm text-neutral-400 mb-6">
                            This action is irreversible and will delete all connected integrations, historical PR data, and execution signals.
                        </p>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-medium rounded-lg transition-colors"
                        >
                            Delete Workspace
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#111111] border border-red-500/20 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
                        <h3 className="text-lg font-semibold text-white">Delete Workspace?</h3>
                        <p className="text-sm text-neutral-300">
                            This will permanently delete your workspace, all signals, insights, and decisions. This cannot be undone. Type <span className="text-red-400 font-mono font-bold">DELETE</span> to confirm.
                        </p>
                        <input
                            type="text"
                            value={deleteConfirm}
                            onChange={(e) => setDeleteConfirm(e.target.value)}
                            placeholder="DELETE"
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500/50 transition-colors text-white font-mono"
                        />
                        <div className="flex gap-3 justify-end pt-2">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false)
                                    setDeleteConfirm('')
                                }}
                                className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-300 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteConfirm !== 'DELETE' || deleting}
                                className="px-5 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleting ? 'Deleting...' : 'Delete Workspace'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
