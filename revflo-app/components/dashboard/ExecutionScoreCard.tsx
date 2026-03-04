"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export function ExecutionScoreCard() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 md:p-8 backdrop-blur-sm"
        >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-green-500/20 to-transparent"></div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
                            Execution Score
                        </h2>
                        <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-semibold text-green-400 border border-green-500/20">
                            Strong
                        </span>
                    </div>
                    <div className="flex items-baseline gap-4 mt-4">
                        <span className="text-6xl md:text-8xl font-black tracking-tighter text-neutral-50 drop-shadow-sm">
                            74
                        </span>
                        <div className="flex items-center gap-1 text-sm font-medium text-green-400">
                            <ArrowUpRight className="h-4 w-4" />
                            <span>+5 pts vs last week</span>
                        </div>
                    </div>
                </div>

                <div className="text-neutral-400 text-sm max-w-sm hidden lg:block">
                    <p>
                        Your team is executing efficiently across the board. Review speed is up,
                        and drift risk remains low. Keep up the high velocity to hitting the Q3 targets.
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
