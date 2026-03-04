import Link from "next/link";

// ── Hero badges ──────────────────────────────────────────────────────────────

const INTEGRATIONS = [
  { name: "GitHub", icon: "⌥", color: "#24292e" },
  { name: "Linear", icon: "◈", color: "#5e6ad2" },
  { name: "Jira", icon: "◆", color: "#0052cc" },
  { name: "Stripe", icon: "▲", color: "#6772e5" },
];

const PROBLEMS = [
  "Teams ship fast but build the wrong things",
  "Roadmaps drift from what's actually being built",
  "Engineering work isn't tied to revenue metrics",
  "PMs spend 80% of time on status — not strategy",
];

const HOW_IT_WORKS = [
  { step: "01", title: "Connect your tools", desc: "GitHub, Linear, Jira, Stripe — one click each." },
  { step: "02", title: "AI analyzes signals", desc: "Product Brain reads 100+ data points across your stack." },
  { step: "03", title: "Get the answer", desc: "RevFlo tells you exactly what to build next, and why." },
];

// ── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight">
            Rev<span className="text-indigo-400">Flo</span>
          </span>
          <div className="flex items-center gap-6">
            <Link href="#integrations" className="text-sm text-neutral-400 hover:text-white transition-colors">Integrations</Link>
            <Link href="/demo" className="text-sm text-neutral-400 hover:text-white transition-colors">Demo</Link>
            <Link href="/dashboard" className="text-sm bg-indigo-600 hover:bg-indigo-500 transition-colors px-4 py-1.5 rounded-full font-medium">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-36 pb-28 grid-bg">
        {/* Radial glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full bg-indigo-600/8 blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Backed by product leaders from Figma, Notion & Vercel
          </div>

          <h1 className="text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            <span className="shimmer-text">RevFlo</span>
            <br />
            <span className="text-neutral-300">Cursor for Product Managers</span>
          </h1>

          <p className="text-xl text-neutral-400 max-w-xl mx-auto mb-10 leading-relaxed">
            AI that analyzes your product signals across GitHub, Linear, Jira, and Stripe — then tells you exactly what to build next.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/demo" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-semibold transition-all hover:scale-[1.02] glow">
              See live demo →
            </Link>
            <Link href="/dashboard" className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold transition-all">
              Start for free
            </Link>
          </div>

          {/* Score preview */}
          <div className="mt-16 flex justify-center gap-3 flex-wrap text-sm">
            {["Execution Score: 74", "Drift: Medium", "Top opportunity: Onboarding"].map((s) => (
              <span key={s} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-neutral-300">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs text-indigo-400 font-semibold tracking-widest uppercase mb-4">The Problem</p>
              <h2 className="text-4xl font-bold tracking-tight mb-6 leading-tight">
                AI can write code.<br />
                <span className="text-neutral-500">Nobody knows what to build.</span>
              </h2>
              <p className="text-neutral-400 leading-relaxed">
                With AI accelerating engineering 10x, the bottleneck shifted. The question is no longer &quot;can we build it?&quot; — it&apos;s <em>&quot;should we build it?&quot;</em>
              </p>
            </div>
            <div className="space-y-3">
              {PROBLEMS.map((p, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl glass">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500/70 shrink-0" />
                  <p className="text-neutral-300 text-sm">{p}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="py-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-xs text-indigo-400 font-semibold tracking-widest uppercase mb-4">Integrations</p>
          <h2 className="text-4xl font-bold tracking-tight mb-4">Connects to your entire stack</h2>
          <p className="text-neutral-400 mb-12 max-w-md mx-auto">RevFlo reads signals from every tool your team already uses.</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {INTEGRATIONS.map((int) => (
              <div key={int.name} className="glass p-6 flex flex-col items-center gap-3 hover:border-indigo-500/30 transition-colors group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: int.color + '22', border: `1px solid ${int.color}33` }}>
                  <span className="text-2xl">{int.icon}</span>
                </div>
                <span className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">{int.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Brain */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs text-indigo-400 font-semibold tracking-widest uppercase mb-4">Product Brain</p>
            <h2 className="text-4xl font-bold tracking-tight mb-4">One brain. All your signals.</h2>
            <p className="text-neutral-400 max-w-md mx-auto">RevFlo fuses engineering, planning, and revenue data into a single product intelligence layer.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.step} className="glass p-6">
                <div className="text-3xl font-bold text-indigo-600/40 mb-4">{s.step}</div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-neutral-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 border-t border-white/5 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-4xl font-bold tracking-tight mb-4">Ready to know what to build?</h2>
          <p className="text-neutral-400 mb-8">Join founders and PMs shipping with confidence.</p>
          <Link href="/demo" className="inline-flex px-10 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-semibold transition-all hover:scale-[1.02] glow">
            Try live demo — free forever →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-neutral-600">
          <span>RevFlo © 2025</span>
          <span>Built for founders</span>
        </div>
      </footer>
    </div>
  );
}
