"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, TrendingUp } from "lucide-react";

export function ExecutionScoreCard() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="group relative overflow-hidden rounded-2xl border border-neutral-800/60 bg-gradient-to-b from-neutral-900/40 to-neutral-900/10 p-8 pt-10 backdrop-blur-md shadow-sm transition-all hover:border-neutral-700/60"
        >
            {/* Top indicator line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-green-500/30 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Subtle background glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition-colors duration-500" />

            <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-12">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-[13px] font-medium text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="h-3.5 w-3.5" />
                            Execution Health
                        </h2>
                        <div className="h-4 w-[1px] bg-neutral-800" />
                        <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-[11px] font-medium tracking-wide text-green-400 border border-green-500/20 shadow-[0_0_10px_rgba(74,222,128,0.1)]">
                            Strong Status
                        </span>
                    </div>

                    <div className="mt-6 flex items-baseline gap-4">
                        <span className="text-7xl md:text-8xl font-black tracking-tighter text-white drop-shadow-sm font-sans tabular-nums">
                            74
                        </span>
                        <div className="flex items-center justify-center p-1 rounded-full bg-green-500/10 mb-2">
                            <ArrowUpRight className="h-4 w-4 text-green-400" />
                        </div>
                        <span className="text-sm font-medium text-green-400 mb-2">
                            +5 pts
                        </span>
                    </div>
                </div>

                <div className="hidden lg:flex flex-col gap-3 max-w-xs justify-end h-full">
                    <div className="h-[1px] w-8 bg-neutral-800 mb-2" />
                    <p className="text-neutral-400 text-[13px] leading-relaxed">
                        Your team is executing efficiently across the board. <span className="text-neutral-200">Review speed is up</span>,
                        and drift risk remains low. Keep up the high velocity to hit Q3 targets.
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
