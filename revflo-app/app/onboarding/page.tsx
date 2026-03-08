'use client';

import Link from 'next/link';
import { useState } from 'react';

const INTEGRATIONS = [
    { id: 'github', name: 'GitHub', icon: '⌥', connected: true },
    { id: 'linear', name: 'Linear', icon: '◈', connected: false },
    { id: 'stripe', name: 'Stripe', icon: '▲', connected: false }
];

export default function OnboardingPage() {
    const [integrations, setIntegrations] = useState(INTEGRATIONS);

    const toggleConnection = (id: string) => {
        setIntegrations(integrations.map(inv =>
            inv.id === id ? { ...inv, connected: !inv.connected } : inv
        ));
    };

    const hasConnected = integrations.some(i => i.connected);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-[400px]">
                {/* Step Indicator */}
                <div className="mb-6 flex flex-col gap-2">
                    <div className="flex bg-[#222222] h-1 rounded-full overflow-hidden">
                        <div className="w-full bg-indigo-500 rounded-full"></div>
                    </div>
                    <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-widest text-center">Step 2 of 2: Connect Integrations</p>
                </div>

                {/* Main Card */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
                    <div className="mb-6">
                        <h1 className="text-xl text-white font-semibold tracking-tight">Connect your stack</h1>
                        <p className="text-sm text-neutral-400 mt-1">RevFlo needs read-only access to analyze your product signals.</p>
                    </div>

                    <div className="space-y-3 mb-8">
                        {integrations.map(int => (
                            <div key={int.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-[#111111]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-neutral-300">
                                        {int.icon}
                                    </div>
                                    <span className="text-sm font-medium text-neutral-200">{int.name}</span>
                                </div>
                                {int.connected ? (
                                    <button
                                        onClick={() => toggleConnection(int.id)}
                                        className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[11px] font-medium"
                                    >
                                        Synced
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => toggleConnection(int.id)}
                                        className="px-3 py-1 bg-transparent hover:bg-white/5 text-neutral-400 hover:text-white border border-white/10 rounded-full text-[11px] font-medium transition-colors"
                                    >
                                        Connect
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <Link href="/dashboard" className={`block w-full text-center rounded-xl py-3 text-sm font-semibold transition-all ${hasConnected ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-white/5 text-neutral-500 cursor-not-allowed pointer-events-none'}`}>
                        Continue to Dashboard
                    </Link>

                    <div className="mt-4 text-center">
                        <Link href="/dashboard" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
                            Skip for now
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
