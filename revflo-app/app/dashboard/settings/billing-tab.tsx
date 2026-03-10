'use client'

import { useState } from 'react'

export function BillingTab() {
    const [joiningWaitlist, setJoiningWaitlist] = useState(false)
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    async function handleUpgrade() {
        setJoiningWaitlist(true)

        // Getting email from a safe client-side fetch or assuming the endpoint infers it?
        // Let's use an API route that securely infers auth email from session.
        try {
            const res = await fetch('/api/settings/waitlist/join', { method: 'POST' })
            if (!res.ok) throw new Error('Waitlist join failed')

            showToast('Coming soon — you have been added to the waitlist!', 'success')
        } catch (e) {
            showToast('Failed to join waitlist', 'error')
        } finally {
            setJoiningWaitlist(false)
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
                <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Billing & Plans</h1>
                <p className="text-sm text-neutral-400">View your current plan and usage.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#111111] to-black max-w-md p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-6">
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded bg-white/10 text-white border border-white/10">Active</span>
                </div>

                <h2 className="text-lg font-semibold text-white mb-1">Free Plan</h2>
                <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-bold text-white">$0</span>
                    <span className="text-sm text-neutral-500">/ forever</span>
                </div>

                <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">✓</div>
                        <span className="text-sm text-neutral-300">Up to 3 AI analyses per day</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">✓</div>
                        <span className="text-sm text-neutral-300">GitHub & Linear Integrations</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">✓</div>
                        <span className="text-sm text-neutral-300">Customer Feedback CSV Uploads</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">✓</div>
                        <span className="text-sm text-neutral-300">Unlimited Decision Logs</span>
                    </div>
                </div>

                <button
                    onClick={handleUpgrade}
                    disabled={joiningWaitlist}
                    className="w-full py-3 bg-white text-black font-semibold rounded-xl text-sm hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {joiningWaitlist ? 'Processing...' : 'Upgrade to Pro'}
                </button>
            </div>
        </div>
    )
}
