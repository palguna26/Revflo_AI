"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
    title: string;
    value: string;
    trend: string;
    trendDirection: "up" | "down" | "neutral";
    icon: LucideIcon;
    delay?: number;
}

export function MetricCard({ title, value, trend, trendDirection, icon: Icon, delay = 0 }: MetricCardProps) {
    const isPositive = trendDirection === "up";
    const isNegative = trendDirection === "down";

    return (
        <motion.div
            initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="group relative flex flex-col justify-between rounded-xl border border-neutral-800/40 bg-neutral-900/20 p-5 shadow-sm transition-all hover:bg-neutral-800/30 hover:border-neutral-700/60"
        >
            {/* Linear-style top highlight reveal */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neutral-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-medium text-neutral-400">{title}</h3>
                <div className="rounded-md bg-neutral-800/30 p-1.5 text-neutral-500 border border-neutral-800/50 group-hover:text-neutral-300 group-hover:border-neutral-700 group-hover:bg-neutral-800/80 transition-all duration-300 shadow-sm">
                    <Icon className="h-3.5 w-3.5" />
                </div>
            </div>

            <div className="mt-5 flex items-baseline gap-3">
                <span className="text-2xl font-semibold tracking-tight text-neutral-100 tabular-nums">
                    {value}
                </span>
            </div>

            <div className="mt-2.5 flex items-center text-[12px] font-medium">
                <span
                    className={cn(
                        isPositive ? "text-green-400" : isNegative ? "text-red-400" : "text-yellow-400"
                    )}
                >
                    {trend}
                </span>
                <span className="ml-1.5 text-neutral-500">vs last week</span>
            </div>
        </motion.div>
    );
}
