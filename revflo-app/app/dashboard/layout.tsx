"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
    { href: "/dashboard", label: "Overview", icon: "⬡" },
    { href: "/dashboard/insights", label: "Insights", icon: "◉" },
    { href: "/dashboard/roadmap", label: "Roadmap", icon: "◈" },
    { href: "/dashboard/integrations", label: "Integrations", icon: "⌥" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const path = usePathname();

    return (
        <div className="flex h-screen bg-black overflow-hidden">
            {/* Sidebar */}
            <aside className="w-56 shrink-0 border-r border-white/5 flex flex-col">
                <div className="h-14 flex items-center px-5 border-b border-white/5">
                    <Link href="/" className="text-sm font-bold">
                        Rev<span className="text-indigo-400">Flo</span>
                    </Link>
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">Demo</span>
                </div>

                <nav className="flex-1 p-3 space-y-0.5">
                    {NAV.map((item) => {
                        const active = path === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${active
                                        ? "bg-white/8 text-white"
                                        : "text-neutral-500 hover:text-neutral-300 hover:bg-white/4"
                                    }`}
                            >
                                <span className={active ? "text-indigo-400" : ""}>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User */}
                <div className="p-3 border-t border-white/5">
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg glass">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">A</div>
                        <div>
                            <p className="text-xs font-medium text-white">Acme AI</p>
                            <p className="text-[10px] text-neutral-500">demo@revflo.ai</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
