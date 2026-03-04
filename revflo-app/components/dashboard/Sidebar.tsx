"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, LineChart, Lightbulb, Settings, LogOut } from "lucide-react";

const NAV_ITEMS = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Analysis", href: "/dashboard/analysis", icon: LineChart },
    { name: "Insights", href: "/dashboard/insights", icon: Lightbulb },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-neutral-800/40 bg-[#060606] flex flex-col z-50">

            {/* Brand */}
            <div className="h-16 flex items-center px-6 border-b border-neutral-800/40">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-gradient-to-b from-neutral-200 to-neutral-400 text-neutral-950 shadow-sm transition-transform group-hover:scale-105">
                        <span className="font-bold text-sm">R</span>
                    </div>
                    <span className="text-[15px] font-semibold tracking-tight text-neutral-100 group-hover:text-white transition-colors">
                        RevFlo
                    </span>
                </Link>
            </div>

            {/* Nav Links */}
            <div className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto">
                <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                    Menu
                </div>
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 group",
                                isActive
                                    ? "bg-neutral-800/60 text-white shadow-sm ring-1 ring-inset ring-neutral-700/50"
                                    : "text-neutral-400 hover:bg-neutral-800/30 hover:text-neutral-200"
                            )}
                        >
                            <Icon className={cn("h-4 w-4", isActive ? "text-neutral-200" : "text-neutral-500 group-hover:text-neutral-400")} />
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            {/* User Profile */}
            <div className="p-4 border-t border-neutral-800/40">
                <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-neutral-800/30 transition-colors cursor-pointer group">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700/80 flex items-center justify-center shadow-sm">
                        <span className="text-[11px] font-medium text-neutral-300">PF</span>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-[13px] font-medium text-neutral-200 truncate">Palguna</span>
                        <span className="text-[11px] text-neutral-500 truncate">palguna@acme.inc</span>
                    </div>
                    <LogOut className="h-3.5 w-3.5 text-neutral-600 group-hover:text-neutral-400 transition-colors" />
                </div>
            </div>

        </aside>
    );
}
