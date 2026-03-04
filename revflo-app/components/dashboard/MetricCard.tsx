"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MetricCardProps {
    title: string;
    value: string;
    trend: string;
    trendDirection: "up" | "down" | "neutral";
    icon: ReactNode;
    delay?: number;
}

export function MetricCard({ title, value, trend, trendDirection, icon, delay = 0 }: MetricCardProps) {
    const isPositive = trendDirection === "up";
    const isNegative = trendDirection === "down";

    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }}
            className="group relative flex flex-col justify-between rounded-xl border border-neutral-800/40 bg-[#111111] p-5 transition-all hover:bg-[#141414] hover:border-neutral-700/50"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[12px] font-medium text-neutral-400/90 tracking-wide uppercase">{title}</h3>
                <div className="text-neutral-500 group-hover:text-neutral-400 transition-colors">
                    {icon}
                </div>
            </div>

            <div className="flex items-baseline gap-3">
                <span className="text-2xl font-semibold tracking-tight text-neutral-100 tabular-nums">
                    {value}
                </span>
            </div>

            <div className="mt-2 text-[11px] font-medium flex items-center gap-1.5">
                <span
                    className={cn(
                        "inline-flex items-center justify-center pt-[1px]",
                        isPositive ? "text-green-500" : isNegative ? "text-red-500" : "text-yellow-500"
                    )}
                >
                    {trend}
                </span>
                <span className="text-neutral-500">vs last week</span>
            </div>
        </motion.div>
    );
}
