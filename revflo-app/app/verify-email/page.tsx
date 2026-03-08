import { verifyOtp } from './actions'
import Link from 'next/link'

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ email?: string; error?: string }> }) {
    const params = await searchParams;
    const email = params.email || '';
    const error = params.error || '';

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-4">
            <div className="w-full max-w-sm glass rounded-2xl p-8 border border-white/5 space-y-6">
                <div className="text-center space-y-2">
                    <Link href="/" className="inline-block">
                        <span className="text-xl font-bold tracking-tight">
                            Rev<span className="text-indigo-400">Flo</span>
                        </span>
                    </Link>
                    <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
                    <p className="text-sm text-neutral-400">
                        We sent a 6-digit code to <span className="text-white font-medium">{email}</span>.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl text-center">
                        {error}
                    </div>
                )}

                <form className="space-y-4 text-center">
                    <input type="hidden" name="email" value={email} />
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-300 ml-1" htmlFor="code">Confirmation Code</label>
                        <input
                            id="code"
                            name="code"
                            type="text"
                            placeholder="123456"
                            maxLength={6}
                            required
                            className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-center text-lg tracking-[0.25em] focus:outline-none focus:border-indigo-500/50 transition-colors"
                        />
                    </div>

                    <div className="pt-2 flex flex-col gap-3">
                        <button
                            formAction={verifyOtp}
                            className="w-full bg-white text-black font-semibold rounded-xl py-3 hover:bg-neutral-200 transition-colors"
                        >
                            Verify & Continue
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm text-neutral-400 mt-4">
                    Didn't receive the code?{' '}
                    <button className="text-indigo-400 hover:text-indigo-300 transition-colors">
                        Click to resend
                    </button>
                </div>
            </div>
        </div>
    )
}
