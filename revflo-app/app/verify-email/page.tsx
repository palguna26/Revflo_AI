'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function VerifyEmailPage({
    searchParams,
}: {
    searchParams: { email?: string; error?: string }
}) {
    const email = searchParams.email || ''
    const error = searchParams.error || ''
    const [resending, setResending] = useState(false)
    const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle')

    async function handleResend() {
        if (!email) return
        setResending(true)
        setResendStatus('idle')

        try {
            const formData = new FormData()
            formData.append('email', email)

            const res = await fetch('/api/auth/resend', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) throw new Error('Failed to resend')
            setResendStatus('success')
        } catch (e) {
            setResendStatus('error')
        } finally {
            setResending(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-4">
            <div className="w-full max-w-sm glass rounded-2xl p-8 border border-white/5 space-y-6 text-center">
                <div className="space-y-4">
                    <Link href="/" className="inline-block">
                        <span className="text-xl font-bold tracking-tight">
                            Rev<span className="text-indigo-400">Flo</span>
                        </span>
                    </Link>
                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-500/20">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight text-white">Check your email</h1>
                    <p className="text-sm text-neutral-400 leading-relaxed">
                        We sent a confirmation link to <br />
                        <span className="text-white font-medium">{email}</span>
                        <br />
                        Click the link to activate your account.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
                        {error}
                    </div>
                )}

                {resendStatus === 'success' && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl">
                        A new confirmation link has been sent.
                    </div>
                )}

                {resendStatus === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
                        Failed to resend. Please try again later.
                    </div>
                )}

                <div className="pt-4 border-t border-white/5 space-y-4">
                    <p className="text-sm text-neutral-500">
                        Didn't receive the email?
                    </p>
                    <button
                        onClick={handleResend}
                        disabled={resending || !email}
                        className="w-full bg-white/5 text-white font-medium rounded-xl py-3 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
                    >
                        {resending ? 'Sending...' : 'Resend confirmation email'}
                    </button>

                    <div className="pt-2">
                        <Link href="/login" className="text-sm text-neutral-400 hover:text-white transition-colors">
                            Return to sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
