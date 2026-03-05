import { login, signup } from './actions'
import Link from 'next/link'

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-4">
            <div className="w-full max-w-sm glass rounded-2xl p-8 border border-white/5 space-y-6">
                <div className="text-center space-y-2">
                    <Link href="/" className="inline-block">
                        <span className="text-xl font-bold tracking-tight">
                            Rev<span className="text-indigo-400">Flo</span>
                        </span>
                    </Link>
                    <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
                    <p className="text-sm text-neutral-400">Enter your email to sign in to your workspace</p>
                </div>

                <form className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-300 ml-1" htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@company.com"
                            required
                            className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-300 ml-1" htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                        />
                    </div>

                    <div className="pt-2 flex flex-col gap-3">
                        <button
                            formAction={login}
                            className="w-full bg-white text-black font-semibold rounded-xl py-3 hover:bg-neutral-200 transition-colors"
                        >
                            Sign in
                        </button>
                        <button
                            formAction={signup}
                            className="w-full bg-transparent border border-white/10 text-white font-semibold rounded-xl py-3 hover:bg-white/5 transition-colors"
                        >
                            Create an account
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
