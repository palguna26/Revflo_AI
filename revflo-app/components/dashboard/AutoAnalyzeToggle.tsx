'use client'

import { useState } from 'react'

export function AutoAnalyzeToggle({ initialValue }: { initialValue: boolean }) {
    const [enabled, setEnabled] = useState(initialValue)
    const [loading, setLoading] = useState(false)

    async function handleToggle() {
        const newValue = !enabled
        setEnabled(newValue)
        setLoading(true)

        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ auto_analyze: newValue })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to save setting')
            }
        } catch (e: any) {
            alert(e.message)
            setEnabled(!newValue) // fallback
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-between p-4 bg-[#111111] border border-white/10 rounded-xl">
            <div>
                <h3 className="text-sm font-medium text-white">Auto-analyze weekly</h3>
                <p className="text-xs text-neutral-400 mt-1">Automatically run AI analysis on new product signals every week.</p>
            </div>

            <button
                onClick={handleToggle}
                disabled={loading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-black ${enabled ? 'bg-indigo-600' : 'bg-neutral-600'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <span className="sr-only">Enable auto-analyze</span>
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                />
            </button>
        </div>
    )
}
