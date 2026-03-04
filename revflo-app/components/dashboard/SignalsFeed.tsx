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
            initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-col rounded-xl border border-neutral-800/40 bg-neutral-900/20 p-6 backdrop-blur-md shadow-sm"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-neutral-800/60 pb-5">
                <div>
                    <h3 className="text-base font-semibold text-neutral-200 flex items-center gap-2.5">
                        Product Signals Feed
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                    </h3>
                    <p className="text-[13px] text-neutral-500 mt-1 font-medium">
                        Real-time anomalies and intelligence from your stack
                    </p>
                </div>

                <button className="text-[12px] font-medium text-neutral-400 hover:text-white transition-colors bg-neutral-800/30 hover:bg-neutral-800/60 px-3 py-1.5 rounded-md border border-neutral-800/60 shadow-sm self-start sm:self-auto">
                    View All
                </button>
            </div>

            <div className="flex flex-col flex-1 divide-y divide-neutral-800/40">
                {PRODUCT_SIGNALS.map((signal) => (
                    <SignalCard key={signal.id} signal={signal} />
                ))}
            </div>
        </motion.div>
    );
}
