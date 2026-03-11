'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { ArrowLeft, Mail, AlertCircle, CheckCircle2 } from 'lucide-react'

function VerifyEmailContent() {
    const searchParams = useSearchParams()
    const email = searchParams.get('email') || ''
    const error = searchParams.get('error') || ''
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
        <div className="w-full max-w-[400px] relative z-10 glass rounded-2xl p-8 border border-white/10 shadow-2xl text-center">
            <div className="space-y-4 mb-8">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-2 mt-2">
                    <Mail className="w-8 h-8 text-indigo-400" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">Check your email</h1>
                <p className="text-sm text-neutral-400 leading-relaxed">
                    We sent a confirmation link to <br />
                    <span className="text-white font-medium">{email || 'your email'}</span>
                    <br />
                    Click the link to activate your account.
                </p>
            </div>

            {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl flex items-start gap-3 text-left">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p>{error}</p>
                </div>
            )}

            {resendStatus === 'success' && (
                <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl flex items-start gap-3 text-left">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    <p>A new confirmation link has been sent.</p>
                </div>
            )}

            {resendStatus === 'error' && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl flex items-start gap-3 text-left">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p>Failed to resend. Please try again later.</p>
                </div>
            )}

            <div className="pt-6 border-t border-white/10 space-y-4">
                <p className="text-sm text-neutral-500">
                    Didn't receive the email?
                </p>
                <button
                    onClick={handleResend}
                    disabled={resending || !email}
                    className="w-full relative group overflow-hidden rounded-xl p-[1px] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="absolute inset-0 bg-white/10 rounded-xl transition-opacity duration-300 group-hover:bg-white/20" />
                    <div className="relative bg-black/50 backdrop-blur-sm px-4 py-3 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-opacity-0">
                        <span className="font-medium text-sm text-white transition-colors">{resending ? 'Sending...' : 'Resend confirmation email'}</span>
                    </div>
                </button>

                <div className="pt-4">
                    <Link href="/login" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                        Return to sign in
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

            <Link
                href="/"
                className="absolute top-8 left-8 flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to home
            </Link>

            <Suspense fallback={
                <div className="w-full max-w-[400px] relative z-10 glass rounded-2xl p-8 border border-white/10 shadow-2xl flex justify-center py-20">
                    <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin"></div>
                </div>
            }>
                <VerifyEmailContent />
            </Suspense>
        </div>
    )
}
