'use client'

import { useState } from 'react'

export function ProfileTab({
    initialName,
    email
}: {
    initialName: string,
    email: string
}) {
    const [name, setName] = useState(initialName)
    const [saving, setSaving] = useState(false)

    // Password state
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [updatingPassword, setUpdatingPassword] = useState(false)

    // Toast state
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    async function handleSaveProfile() {
        if (!name.trim() || name === initialName) return
        setSaving(true)

        try {
            const res = await fetch('/api/settings/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ full_name: name })
            })
            if (!res.ok) throw new Error('Failed to update')
            showToast('Profile updated successfully', 'success')
        } catch (e) {
            showToast('Failed to update profile', 'error')
            setName(initialName) // revert
        } finally {
            setSaving(false)
        }
    }

    async function handleUpdatePassword(e: React.FormEvent) {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            showToast('Passwords do not match', 'error')
            return
        }

        setUpdatingPassword(true)
        try {
            const res = await fetch('/api/settings/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword })
            })

            if (!res.ok) throw new Error('Failed to update password')

            showToast('Password updated successfully', 'success')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (e) {
            showToast('Failed to update password', 'error')
        } finally {
            setUpdatingPassword(false)
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
                <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Your Profile</h1>
                <p className="text-sm text-neutral-400">Manage your personal account settings.</p>
            </div>

            <div className="space-y-6 max-w-sm">
                <div className="space-y-3">
                    <label className="text-xs font-medium text-neutral-300 ml-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full bg-[#111111]/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-neutral-500 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-neutral-500 ml-1">Contact support to change your email.</p>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-medium text-neutral-300 ml-1">Full Name</label>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Your Name"
                            className="flex-1 bg-[#111111] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors text-white"
                        />
                        <button
                            onClick={handleSaveProfile}
                            disabled={saving || name === initialName || !name.trim()}
                            className="px-4 py-2.5 bg-white text-black font-semibold rounded-xl text-sm hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10">
                    <h2 className="text-sm font-medium tracking-tight mb-4 text-white">Change Password</h2>

                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="space-y-2">
                            <input
                                type="password"
                                placeholder="Current Password"
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                required
                                className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <input
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors text-white"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={updatingPassword || !currentPassword || !newPassword || !confirmPassword}
                            className="w-full py-2.5 bg-white/10 text-white font-medium rounded-xl text-sm hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2 border border-white/5"
                        >
                            {updatingPassword ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
