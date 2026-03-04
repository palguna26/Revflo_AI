import Link from "next/link";
import { DEMO_SCORE, DEMO_INSIGHTS, DEMO_FEATURE_RECOMMENDATION } from "@/data/demo-data";
import { ScoreRing } from "@/components/dashboard/ScoreRing";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { AIChat } from "@/components/ai/AIChat";

export default function DemoPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            {/* Nav */}
            <nav className="sticky top-0 z-40 border-b border-white/5 bg-black/80 backdrop-blur-xl px-8 h-14 flex items-center gap-4">
                <Link href="/" className="text-sm font-bold">Rev<span className="text-indigo-400">Flo</span></Link>
                <span className="text-neutral-700">/</span>
                <span className="text-sm text-neutral-400">Live Demo — Acme AI</span>
                <div className="ml-auto flex items-center gap-3">
                    <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                        Execution Score: {DEMO_SCORE.overall}
                    </span>
                    <Link href="/dashboard" className="text-sm bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 rounded-full transition-colors">
                        Full dashboard
                    </Link>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-8 py-12 space-y-12">
                {/* Hero metric */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 glass p-6 flex flex-col items-center justify-center">
                        <ScoreRing score={DEMO_SCORE.overall} size={140} />
                        <p className="text-sm text-neutral-400 mt-3 text-center">Execution Health Score</p>
                        <p className="text-xs text-emerald-400 mt-1">↑ +{DEMO_SCORE.trend} pts vs last week</p>
                    </div>
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                        {[
                            { label: 'Velocity', v: DEMO_SCORE.velocity, c: '#6366f1' },
                            { label: 'Alignment', v: DEMO_SCORE.alignment, c: '#a855f7' },
                            { label: 'Review Speed', v: DEMO_SCORE.review, c: '#3b82f6' },
                            { label: 'Drift Risk', v: DEMO_SCORE.drift, c: '#f59e0b' },
                        ].map(m => (
                            <div key={m.label} className="glass p-5">
                                <p className="text-xs text-neutral-500 mb-1">{m.label}</p>
                                <p className="text-3xl font-bold" style={{ color: m.c }}>{m.v}</p>
                                <div className="mt-2 h-1 bg-white/5 rounded-full">
                                    <div className="h-full rounded-full" style={{ width: `${m.v}%`, background: m.c }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top insights */}
                <div>
                    <h2 className="text-lg font-bold mb-4">Top Product Signals</h2>
                    <div className="space-y-3">
                        {DEMO_INSIGHTS.map(ins => <InsightCard key={ins.id} insight={ins} />)}
                    </div>
                </div>

                {/* AI assistant */}
                <div>
                    <h2 className="text-lg font-bold mb-2">Product Intelligence AI</h2>
                    <p className="text-sm text-neutral-500 mb-4">Ask it &quot;What should we build next?&quot; to see the full YC demo flow.</p>
                    <AIChat />
                </div>

                {/* Feature spec preview */}
                <div className="glass p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400">AI Generated</span>
                        <h2 className="font-semibold">Sample Feature Specification</h2>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Feature</p>
                            <p className="text-white font-medium">{DEMO_FEATURE_RECOMMENDATION.feature}</p>
                        </div>
                        <div>
                            <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Expected Impact</p>
                            <p className="text-emerald-400 text-sm">{DEMO_FEATURE_RECOMMENDATION.expected_impact}</p>
                        </div>
                        <div>
                            <p className="text-xs text-neutral-500 uppercase tracking-wide mb-2">Engineering Tasks</p>
                            <div className="space-y-2">
                                {DEMO_FEATURE_RECOMMENDATION.tasks.map(t => (
                                    <div key={t.id} className="flex items-center gap-3 text-sm">
                                        <span className="w-2 h-2 rounded-full bg-indigo-500/60 shrink-0" />
                                        <span className="text-neutral-300 flex-1">{t.title}</span>
                                        <span className="text-neutral-600 text-xs">{t.estimate}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
