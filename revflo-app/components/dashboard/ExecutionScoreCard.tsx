"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, TrendingUp } from "lucide-react";

interface ExecutionScoreCardProps {
    score?: number;
    trendPts?: number;
    description?: string;
}

export function ExecutionScoreCard({ score = 0, trendPts = 0, description = "Awaiting execution data based on new insights and product signals." }: ExecutionScoreCardProps) {
    const isPositive = trendPts >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="relative overflow-hidden rounded-xl border border-neutral-800/40 bg-[#111111] p-6 lg:p-8 transition-all hover:border-neutral-700/50 hover:bg-[#141414] group"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-12 relative z-10">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-3.5 w-3.5 text-neutral-500" />
                        <h2 className="text-[12px] font-medium text-neutral-400 uppercase tracking-widest">
                            Execution Health
                        </h2>
                        <div className="h-3.5 w-[1px] bg-neutral-800 mx-1" />
                        <span className="inline-flex items-center rounded-sm bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-blue-400 border border-blue-500/20">
                            {score > 0 ? "ACTIVE" : "PENDING"}
                        </span>
                    </div>

                    <div className="mt-5 flex items-baseline gap-4">
                        <span className="text-6xl md:text-7xl font-semibold tracking-tighter text-neutral-100 font-sans tabular-nums leading-none">
                            {score}
                        </span>
                        {score > 0 && (
                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${isPositive ? 'bg-green-500/10 border-green-500/10' : 'bg-red-500/10 border-red-500/10'}`}>
                                {isPositive && <ArrowUpRight className="h-3.5 w-3.5 text-green-400" />}
                                <span className={`text-[12px] font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                    {isPositive ? '+' : ''}{trendPts} pts
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="hidden lg:flex flex-col gap-2 max-w-sm justify-end h-full">
                    <p className="text-neutral-400 text-[13px] leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>

            {/* Flattened but precise hover glow specific to Lovable reference style */}
            <div className="absolute right-0 bottom-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                <div className="w-[400px] h-[300px] bg-[radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.03),transparent_70%)]" />
            </div>
        </motion.div>
    );
}
