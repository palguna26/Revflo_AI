'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'

export default function SignupPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        
        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to sign up')
            
            router.push(data.redirectTo || '/verify-email')
        } catch (err: any) {
            setError(err.message)
            setLoading(false)
        }
    }

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

            <div className="w-[400px] max-w-full relative z-10 glass rounded-2xl p-8 border border-white/10 shadow-2xl">
                <div className="text-center space-y-3 mb-8">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 mb-2">
                        <span className="text-xl font-bold tracking-tight">
                            R<span className="text-indigo-400">F</span>
                        </span>
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
                    <p className="text-sm text-neutral-400">Join RevFlo to accelerate your product execution</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2 relative">
                        <label className="text-xs font-medium text-neutral-300 ml-1" htmlFor="email">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@company.com"
                                required
                                className="w-full bg-[#111111]/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-neutral-600"
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2 relative">
                        <div className="flex items-center justify-between ml-1 mr-1">
                            <label className="text-xs font-medium text-neutral-300" htmlFor="password">Password</label>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                className="w-full bg-[#111111]/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-neutral-600"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full relative group overflow-hidden rounded-xl p-[1px] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative bg-black px-4 py-3 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-opacity-0">
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                                ) : (
                                    <span className="font-medium text-sm text-white transition-colors group-hover:text-white">Sign Up</span>
                                )}
                            </div>
                        </button>
                    </div>
                </form>
                
                <div className="text-center text-sm text-neutral-400 mt-6 pt-6 border-t border-white/10">
                    Already have an account?{' '}
                    <Link href="/login" className="text-white hover:text-indigo-400 transition-colors font-medium">
                        Log in
                    </Link>
                </div>
            </div>
        </div>
    )
}
