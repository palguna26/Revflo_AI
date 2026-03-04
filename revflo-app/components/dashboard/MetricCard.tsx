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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group flex flex-col justify-between rounded-xl border border-neutral-800/80 bg-neutral-900/30 p-5 backdrop-blur-sm transition-all hover:bg-neutral-800/50 hover:border-neutral-700/80"
        >
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-neutral-400">{title}</h3>
                <div className="rounded-md bg-neutral-800/50 p-2 text-neutral-400 group-hover:text-neutral-200 transition-colors">
                    <Icon className="h-4 w-4" />
                </div>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-bold tracking-tight text-neutral-50">
                    {value}
                </span>
            </div>

            <div className="mt-2 flex items-center text-xs font-medium">
                <span
                    className={cn(
                        isPositive ? "text-green-400" : isNegative ? "text-red-400" : "text-yellow-400"
                    )}
                >
                    {trend}
                </span>
                <span className="ml-2 text-neutral-500">vs last week</span>
            </div>
        </motion.div>
    );
}
