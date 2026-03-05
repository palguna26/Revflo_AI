import Link from "next/link";
import { ArrowRight, PlayCircle, ShieldAlert, Github, Trello, CreditCard, Activity } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans">

      {/* ── Navigation ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold font-mono">⬡</span>
              </div>
              <span className="text-[15px] font-bold tracking-tight text-white uppercase tracking-widest">
                REVFLO
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-neutral-400">
              <Link href="#product" className="hover:text-white transition-colors">Product</Link>
              <Link href="#solutions" className="hover:text-white transition-colors">Solutions</Link>
              <Link href="#docs" className="hover:text-white transition-colors">Docs</Link>
              <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="text-[13px] font-medium text-neutral-300 hover:text-white transition-colors hidden sm:block">
              Sign in
            </Link>
            <Link href="/login" className="text-[13px] bg-white text-black hover:bg-neutral-200 transition-colors px-4 py-2 rounded-md font-semibold">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative pt-40 pb-24 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center justify-center text-center">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-[100%] pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-purple-600/5 blur-[150px] rounded-[100%] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 relative z-10 w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 mb-8 backdrop-blur-sm">
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 font-mono">⬡ RevFlo is now in Beta</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.05] mb-8">
            AI can write code.<br />
            <span className="text-neutral-500">Nobody knows what to build.</span>
          </h1>

          <p className="text-[17px] text-neutral-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            RevFlo is the AI Product Brain that aligns engineering velocity with product strategy. Stop drifting, start building what matters.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-semibold transition-all flex items-center justify-center gap-2 text-[15px] shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.4)]">
              Start Building <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="#docs" className="w-full sm:w-auto px-6 py-3.5 bg-transparent border border-white/10 hover:bg-white/5 rounded-lg text-white font-semibold transition-all flex items-center justify-center gap-2 text-[15px]">
              View Documentation
            </Link>
          </div>
        </div>

        {/* Hero UI Component Mockup */}
        <div className="w-full max-w-5xl mx-auto mt-24 px-4 relative z-10 perspective-[1000px]">
          <div className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative" style={{ transform: 'rotateX(2deg) translateY(0)' }}>
            {/* Fake Browser Top */}
            <div className="h-10 border-b border-white/5 bg-[#111] flex items-center px-4 gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
              <div className="ml-4 flex-1 h-5 bg-white/5 rounded-md"></div>
            </div>
            {/* Dashboard Overview */}
            <div className="p-8">
              {/* Top metrics row */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-[#111] border border-white/5 rounded-xl p-5">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-500 mb-2">Execution Score</p>
                  <div className="flex items-end gap-2">
                    <h3 className="text-3xl font-semibold text-white tracking-tighter">98<span className="text-xl text-neutral-500">/100</span></h3>
                  </div>
                </div>
                <div className="bg-[#111] border border-white/5 rounded-xl p-5">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-500 mb-2">Drift Risk</p>
                  <h3 className="text-2xl font-semibold text-emerald-400 tracking-tight">Low</h3>
                </div>
                <div className="bg-[#111] border border-white/5 rounded-xl p-5">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-500 mb-2">Product Velocity</p>
                  <h3 className="text-2xl font-semibold text-white tracking-tight">14.2<span className="text-lg text-neutral-500">x</span></h3>
                </div>
              </div>

              {/* Bottom row */}
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-8 bg-[#111] border border-white/5 rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">AI Insight</span>
                  </div>
                  <h4 className="text-[11px] font-bold tracking-widest uppercase text-neutral-500 mb-4">AI Action Recommendation</h4>
                  <div className="font-mono text-[13px] text-green-400 mt-2 space-y-1 opacity-90">
                    <p><span className="text-blue-400">// Strategic Drift Detected</span></p>
                    <p><span className="text-pink-400">if</span> (active_sprint.features.includes(<span className="text-yellow-300">"websockets"</span>) && roadmap.priority !== <span className="text-yellow-300">"websockets"</span>) {"{"}</p>
                    <p className="pl-4">recommend(<span className="text-yellow-300">"Pivot to Performance Optimization"</span>);</p>
                    <p className="pl-4 text-neutral-500">// 14 PRs redirected by this expression</p>
                    <p>{"}"}</p>
                  </div>
                </div>
                <div className="col-span-4 bg-[#111] border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center relative">
                  <div className="relative w-24 h-24 mb-4">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#222" strokeWidth="8" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#6366f1" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="15" strokeLinecap="round" className="opacity-90 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-2xl font-bold tracking-tighter text-white">94%</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-medium">Velocity Score</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Integrations Section ── */}
      <section id="integrations" className="py-24 border-t border-white/5 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-3xl font-semibold tracking-tight mb-4">Deep Intelligence Integrations</h2>
              <p className="text-[15px] text-neutral-400">Connect your stack and let RevFlo build a comprehensive model of your product execution landscape.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-neutral-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              30+ Connections
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-xl hover:bg-[#111] transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-neutral-800/50 border border-white/10 flex items-center justify-center mb-6">
                <Github className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">GitHub</h3>
              <p className="text-[13px] text-neutral-500 leading-relaxed">Sync code activity and analyze PR patterns in real-time.</p>
            </div>
            <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-xl hover:bg-[#111] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-indigo-900/30 border border-indigo-500/20 flex items-center justify-center mb-6">
                <Activity className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Linear</h3>
              <p className="text-[13px] text-neutral-500 leading-relaxed">Auto-track issue progress against strategic milestones.</p>
            </div>
            <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-xl hover:bg-[#111] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-900/30 border border-blue-500/20 flex items-center justify-center mb-6">
                <Trello className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Jira</h3>
              <p className="text-[13px] text-neutral-500 leading-relaxed">Unify legacy project data with modern execution metrics.</p>
            </div>
            <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-xl hover:bg-[#111] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-purple-900/30 border border-purple-500/20 flex items-center justify-center mb-6">
                <CreditCard className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Stripe</h3>
              <p className="text-[13px] text-neutral-500 leading-relaxed">Correlate shipping velocity with revenue growth.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Comparison Section ── */}
      <section className="py-24 border-t border-white/5 bg-gradient-to-b from-[#050505] to-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="max-w-md">
              <h2 className="text-4xl font-bold tracking-tight leading-[1.1] mb-2">Stop the Drift.</h2>
              <h2 className="text-4xl font-bold tracking-tight text-indigo-500 mb-10">Master the Outcome.</h2>

              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 rounded-full border border-neutral-600 flex items-center justify-center text-neutral-500 text-xs font-bold">1</div>
                    <h4 className="text-[11px] font-bold tracking-widest uppercase text-neutral-500">The Old Way</h4>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 ml-9">Roadmap Drift</h3>
                  <p className="text-[14px] text-neutral-400 ml-9 leading-relaxed">Engineers ship features that PMs didn't prioritize, while strategic objectives stall due to lack of visibility.</p>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-[0_0_10px_rgba(79,70,229,0.5)]">✓</div>
                    <h4 className="text-[11px] font-bold tracking-widest uppercase text-indigo-400">The RevFlo Way</h4>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 ml-9">RevFlo Intelligence</h3>
                  <p className="text-[14px] text-neutral-400 ml-9 leading-relaxed">Continuous alignment between code commits and product goals. Automated drift detection keeps every sprint on track.</p>
                </div>
              </div>
            </div>

            {/* Interactive UI block representing drift detection */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden h-[400px]">
              {/* Top info bar */}
              <div className="flex justify-between items-center mb-12 mt-20">
                <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-500">DRIFT_ANALYSIS_001</span>
                <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-500">CRITICAL</span>
              </div>

              {/* Alert Block */}
              <div className="bg-[#111] border border-white/5 rounded-xl p-4 mb-4 flex items-start gap-4">
                <div className="mt-0.5"><ShieldAlert className="w-5 h-5 text-red-500" /></div>
                <div>
                  <p className="text-sm font-semibold text-white">Refactor of Auth system</p>
                  <p className="text-xs text-neutral-500">Un-aligned with Goal "User Growth"</p>
                </div>
              </div>

              {/* Recommendation Block */}
              <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-4">
                <p className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 mb-2">Recommended Action</p>
                <p className="text-sm text-neutral-300">Reassign 2 developers to "Onboarding Flow" to recover 14 days of drift.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-32 border-t border-white/5 bg-[#050505] relative overflow-hidden">
        {/* Purple gradient fade */}
        <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-indigo-900/10 to-transparent pointer-events-none fade-up" />

        <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">Ready to align your brain?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-semibold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]">
              Get Early Access
            </Link>
            <Link href="mailto:founders@acme.ai" className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/10 hover:bg-white/5 rounded-lg text-white font-semibold transition-all">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 bg-[#0A0A0A] py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-[4px] bg-white flex items-center justify-center">
              <span className="text-black text-[8px] font-bold font-mono shrink-0">⬡</span>
            </div>
            <span className="text-xs font-bold tracking-tight text-white uppercase tracking-widest">
              REVFLO
            </span>
          </div>

          <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest">
            © 2024 RevFlo Intelligence Inc. All rights reserved.
          </span>

          <div className="flex items-center gap-4 text-neutral-500">
            <Link href="#" className="hover:text-white transition-colors"><div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[8px] font-bold">X</div></Link>
            <Link href="#" className="hover:text-white transition-colors"><Github className="w-4 h-4" /></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
