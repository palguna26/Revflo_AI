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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col rounded-xl border border-neutral-800 bg-neutral-900/30 p-6 backdrop-blur-sm"
        >
            <div className="flex items-center justify-between mb-4 border-b border-neutral-800/80 pb-4">
                <div>
                    <h3 className="text-lg font-semibold text-neutral-100 flex items-center gap-2">
                        Product Signals Feed
                        <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                    </h3>
                    <p className="text-sm text-neutral-500 mt-1">
                        Real-time anomalies and intelligence from your stack
                    </p>
                </div>
            </div>

            <div className="flex flex-col">
                {PRODUCT_SIGNALS.map((signal) => (
                    <SignalCard key={signal.id} signal={signal} />
                ))}
            </div>

            <button className="mt-4 w-full rounded-md border border-neutral-800 bg-neutral-800/20 py-2.5 text-sm font-medium text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200 transition-colors">
                View all signals
            </button>
        </motion.div>
    );
}
