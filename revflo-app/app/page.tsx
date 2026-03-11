import Link from "next/link";
import { ArrowRight, PlayCircle, ShieldAlert, Github, Trello, CreditCard, Activity, CheckCircle2, Workflow, Target, Zap, LayoutDashboard } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans scroll-smooth">
      {/* ── Navigation ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-white text-xs font-bold font-mono">⬡</span>
              </div>
              <span className="text-[15px] font-bold tracking-tight text-white uppercase tracking-widest">
                REVFLO
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-neutral-400">
              <Link href="#problem" className="hover:text-white transition-colors">The Problem</Link>
              <Link href="#features" className="hover:text-white transition-colors">Features</Link>
              <Link href="#integrations" className="hover:text-white transition-colors">Integrations</Link>
              <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="text-[13px] font-medium text-neutral-300 hover:text-white transition-colors hidden sm:block">
              Log in
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
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/15 blur-[120px] rounded-[100%] pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-purple-600/10 blur-[150px] rounded-[100%] pointer-events-none" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 relative z-10 w-full">
          {/* Badge */}
          <div className="mx-auto w-fit inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 mb-8 backdrop-blur-sm cursor-pointer hover:bg-indigo-500/10 transition-colors">
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              RevFlo 1.0 is now live
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.05] mb-8">
            Engineers write code.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-400 to-neutral-600">But are they building the right thing?</span>
          </h1>

          <p className="text-[17px] text-neutral-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            RevFlo is the AI Product Brain that aligns engineering velocity with product strategy. Stop roadmap drift and start building what moves the needle.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-semibold transition-all flex items-center justify-center gap-2 text-[15px] shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.4)]">
              Start Building <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="#problem" className="w-full sm:w-auto px-6 py-3.5 bg-transparent border border-white/10 hover:bg-white/5 rounded-lg text-white font-semibold transition-all flex items-center justify-center gap-2 text-[15px]">
              See how it works
            </Link>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="w-full max-w-5xl mx-auto mt-20 px-6 relative z-10">
          <div className="rounded-xl border border-white/10 bg-black/50 backdrop-blur-sm overflow-hidden shadow-2xl">
            <div className="h-8 border-b border-white/10 bg-[#111] flex items-center px-4 gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
            </div>
            <div className="bg-[#0A0A0A] p-6 lg:p-10 flex flex-col items-center justify-center min-h-[400px]">
               <div className="text-center">
                 <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6">
                    <Activity className="w-10 h-10 text-white" />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">Connect your tools to see the magic</h3>
                 <p className="text-neutral-500 text-sm max-w-md mx-auto">RevFlo ingests signals from GitHub, Linear, and your CRM to build a real-time product graph.</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pain Section: Roadmap Drift ── */}
      <section id="problem" className="py-24 border-t border-white/5 bg-[#050505] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="max-w-md">
              <h2 className="text-4xl font-bold tracking-tight mb-6">The Silent Killer: <br/><span className="text-red-500">Roadmap Drift</span></h2>
              <p className="text-[16px] text-neutral-400 mb-8 leading-relaxed">
                Your strategy says "Enterprise Growth". Your Jira says "Refactor Auth". Your CRM says "Churn Risk". When systems don't talk, your team builds the wrong things fast.
              </p>
              
              <ul className="space-y-4">
                <li className="flex gap-3 text-neutral-300 items-start text-[15px]">
                  <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Misaligned Effort:</strong> 40% of sprint capacity is spent on technical debt not tied to strategic goals.</span>
                </li>
                <li className="flex gap-3 text-neutral-300 items-start text-[15px]">
                   <Target className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Blind Spots:</strong> Product Managers discover shifted priorities weeks after they happen.</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#0A0A0A] border border-red-500/20 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.05)]">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
               <h3 className="text-sm font-bold tracking-widest uppercase text-red-500 mb-6 flex items-center gap-2">
                 <ShieldAlert className="w-4 h-4" /> Drift Detected
               </h3>
               
               <div className="space-y-4">
                 <div className="p-4 bg-black border border-white/10 rounded-lg opacity-50 flex justify-between items-center">
                   <div className="flex items-center gap-3">
                     <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                     <span className="text-sm">Strategic Goal: Launch SSO</span>
                   </div>
                   <span className="text-xs text-neutral-500">0 PRs this week</span>
                 </div>
                 
                 <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex justify-between items-center">
                   <div className="flex flex-col gap-1">
                     <div className="flex items-center gap-3">
                       <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                       <span className="text-sm font-semibold text-white">Shadow Work: Notification Refactor</span>
                     </div>
                     <span className="text-xs text-red-400 ml-5">Absorbing 45% of backend capacity</span>
                   </div>
                   <span className="text-xs font-bold px-2 py-1 bg-red-500/20 text-red-400 rounded">HIGH RISK</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Solution Section: Product Brain ── */}
      <section id="features" className="py-24 border-t border-white/5 bg-gradient-to-b from-[#050505] to-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Enter the Product Brain</h2>
          <p className="text-[17px] text-neutral-400 max-w-2xl mx-auto">
            RevFlo acts as an autonomous nervous system for your startup connecting customer feedback to code execution.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-6">
          <div className="bg-[#0D0D0D] border border-white/5 p-8 rounded-2xl hover:border-indigo-500/30 transition-all group">
             <div className="w-12 h-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition-transform">
               <Workflow className="w-6 h-6" />
             </div>
             <h3 className="text-lg font-bold text-white mb-3">Continuous Alignment</h3>
             <p className="text-sm text-neutral-400 leading-relaxed">
               Map every GitHub commit and Linear issue back to your overarching OKRs automatically.
             </p>
          </div>

          <div className="bg-[#0D0D0D] border border-white/5 p-8 rounded-2xl hover:border-purple-500/30 transition-all group">
             <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
               <Zap className="w-6 h-6" />
             </div>
             <h3 className="text-lg font-bold text-white mb-3">AI Intervention</h3>
             <p className="text-sm text-neutral-400 leading-relaxed">
               When drift is detected, RevFlo’s AI suggests capacity reallocations before the sprint is lost.
             </p>
          </div>

          <div className="bg-[#0D0D0D] border border-white/5 p-8 rounded-2xl hover:border-emerald-500/30 transition-all group">
             <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform">
               <LayoutDashboard className="w-6 h-6" />
             </div>
             <h3 className="text-lg font-bold text-white mb-3">Executive Visibility</h3>
             <p className="text-sm text-neutral-400 leading-relaxed">
               Real-time dashboards showing true R&D ROI, feature adoption velocity, and delivery health.
             </p>
          </div>
        </div>
      </section>

      {/* ── Integrations Section ── */}
      <section id="integrations" className="py-24 border-t border-white/5 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-sm font-bold tracking-widest uppercase text-neutral-500 mb-12 font-mono">
              Integrates with your entire stack
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               <div className="flex items-center gap-2 text-xl font-bold"><Github className="w-8 h-8"/> GitHub</div>
               <div className="flex items-center gap-2 text-xl font-bold"><Trello className="w-8 h-8"/> Jira</div>
               <div className="flex items-center gap-2 text-xl font-bold"><Activity className="w-8 h-8"/> Linear</div>
               <div className="flex items-center gap-2 text-xl font-bold"><CreditCard className="w-8 h-8"/> Stripe</div>
            </div>
        </div>
      </section>

      {/* ── Pricing Section ── */}
      <section id="pricing" className="py-24 border-t border-white/5 bg-gradient-to-b from-[#0A0A0A] to-[#050505]">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Simple, transparent pricing</h2>
          <p className="text-[17px] text-neutral-400 max-w-2xl mx-auto">
            Start aligning your team today. No hidden fees.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 px-6">
          {/* Starter Plan */}
          <div className="bg-[#0A0A0A] border border-white/10 p-8 rounded-2xl flex flex-col">
            <h3 className="text-lg font-bold text-white mb-2">Starter</h3>
            <div className="text-4xl font-bold text-white mb-6">$49<span className="text-lg text-neutral-500 font-normal">/mo</span></div>
            <p className="text-sm text-neutral-400 mb-8">Perfect for small teams finding product-market fit.</p>
            <ul className="space-y-4 mb-8 flex-1">
               <li className="flex items-center gap-3 text-sm text-neutral-300"><CheckCircle2 className="w-4 h-4 text-indigo-500"/> Up to 10 team members</li>
               <li className="flex items-center gap-3 text-sm text-neutral-300"><CheckCircle2 className="w-4 h-4 text-indigo-500"/> Core integrations (GitHub, Linear)</li>
               <li className="flex items-center gap-3 text-sm text-neutral-300"><CheckCircle2 className="w-4 h-4 text-indigo-500"/> Basic drift detection</li>
            </ul>
             <Link href="/login" className="w-full py-3 bg-white hover:bg-neutral-200 text-black rounded-lg font-semibold transition-colors text-center text-sm">
               Start Free Trial
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-b from-indigo-900/20 to-black border border-indigo-500/30 p-8 rounded-2xl flex flex-col relative overflow-hidden">
             <div className="absolute top-0 right-0 bg-indigo-600 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-lg">Popular</div>
            <h3 className="text-lg font-bold text-indigo-400 mb-2">Pro</h3>
            <div className="text-4xl font-bold text-white mb-6">$199<span className="text-lg text-neutral-500 font-normal">/mo</span></div>
            <p className="text-sm text-neutral-400 mb-8">For scaling startups that need complete visibility.</p>
            <ul className="space-y-4 mb-8 flex-1">
               <li className="flex items-center gap-3 text-sm text-neutral-300"><CheckCircle2 className="w-4 h-4 text-indigo-500"/> Unlimited team members</li>
               <li className="flex items-center gap-3 text-sm text-neutral-300"><CheckCircle2 className="w-4 h-4 text-indigo-500"/> All integrations including CRM</li>
               <li className="flex items-center gap-3 text-sm text-neutral-300"><CheckCircle2 className="w-4 h-4 text-indigo-500"/> Advanced AI drift resolution</li>
               <li className="flex items-center gap-3 text-sm text-neutral-300"><CheckCircle2 className="w-4 h-4 text-indigo-500"/> Executive ROI dashboards</li>
            </ul>
            <Link href="/login" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors text-center text-sm">
               Upgrade to Pro
            </Link>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-32 border-t border-white/5 bg-[#050505] relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-indigo-900/10 to-transparent pointer-events-none" />
        
        <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">Stop guessing. Start knowing.</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-semibold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]">
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 bg-[#0A0A0A] py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded-[4px] bg-white flex items-center justify-center">
                <span className="text-black text-[10px] font-bold font-mono shrink-0">⬡</span>
              </div>
              <span className="text-sm font-bold tracking-tight text-white uppercase tracking-widest">
                REVFLO
              </span>
            </div>
            <p className="text-sm text-neutral-500 max-w-xs">
              The AI Product Brain that aligns engineering execution with business strategy.
            </p>
          </div>
          <div>
             <h4 className="text-white font-semibold mb-4 text-sm">Product</h4>
             <ul className="space-y-2 text-sm text-neutral-500">
               <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
               <li><Link href="#integrations" className="hover:text-white transition-colors">Integrations</Link></li>
               <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
               <li><Link href="#" className="hover:text-white transition-colors">Changelog</Link></li>
             </ul>
          </div>
          <div>
             <h4 className="text-white font-semibold mb-4 text-sm">Company</h4>
             <ul className="space-y-2 text-sm text-neutral-500">
               <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
               <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
               <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
               <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
             </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
           <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest">
            © {new Date().getFullYear()} RevFlo Intelligence Inc. All rights reserved.
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
