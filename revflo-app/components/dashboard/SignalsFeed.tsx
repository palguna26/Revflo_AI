"use client";

import { motion } from "framer-motion";
import { SignalCard, type SignalProps } from "./SignalCard";

const PRODUCT_SIGNALS: SignalProps[] = [
    {
        id: "sig-1",
        title: "Onboarding drop-off detected",
        description: "Completion rate for the new setup flow dropped by 12% in the last 48 hours.",
        impact: "High",
        source: "Database",
        timeAgo: "2h ago",
    },
    {
        id: "sig-2",
        title: "Scope drift detected",
        description: "Feature 'Enterprise SSO' has expanded by 3 PRs outside the original sprint scope.",
        impact: "Medium",
        source: "GitHub",
        timeAgo: "5h ago",
    },
    {
        id: "sig-3",
        title: "Enterprise traction",
        description: "New subscription closed: Acme Corp ($24k ARR).",
        impact: "Low",
        source: "Stripe",
        timeAgo: "1d ago",
    },
    {
        id: "sig-4",
        title: "Mobile experience lagging",
        description: "Spike in issue reports regarding touch targets on the dashboard layout.",
        impact: "Medium",
        source: "Linear",
        timeAgo: "1d ago",
    },
];

export function SignalsFeed() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-col rounded-xl border border-neutral-800/40 bg-[#111111] p-6"
        >
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <h3 className="text-[12px] font-medium tracking-widest uppercase text-neutral-400">
                        Signals Feed
                    </h3>
                    <span className="relative flex h-1.5 w-1.5 ml-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                    </span>
                </div>

                <button className="text-[11px] font-medium text-neutral-500 hover:text-neutral-300 transition-colors uppercase tracking-wider">
                    View All
                </button>
            </div>

            <div className="flex flex-col flex-1 divide-y divide-white/5">
                {PRODUCT_SIGNALS.map((signal) => (
                    <SignalCard key={signal.id} signal={signal} />
                ))}
            </div>
        </motion.div>
    );
}
