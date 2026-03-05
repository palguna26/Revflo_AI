"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
    { href: "/dashboard", label: "Overview", icon: "⬡" },
    { href: "/dashboard/integrations", label: "Integrations", icon: "⊕" },
    { href: "/dashboard/insights", label: "Insights", icon: "◉" },
    { href: "/dashboard/analysis", label: "Recommendations", icon: "◈" },
    { href: "/dashboard/settings", label: "Settings", icon: "⌥" },
];

export function SidebarNav({ userEmail }: { userEmail: string }) {
    const path = usePathname();

    return (
        <aside className="w-56 shrink-0 border-r border-white/5 flex flex-col">
            <div className="h-14 flex items-center px-5 border-b border-white/5">
                <Link href="/" className="text-sm font-bold text-white">
                    Rev<span className="text-indigo-400">Flo</span>
                </Link>
            </div>

            <nav className="flex-1 p-3 space-y-0.5">
                {NAV.map((item) => {
                    const active = path === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${active
                                ? "bg-white/10 text-white"
                                : "text-neutral-500 hover:text-neutral-300 hover:bg-white/5"
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
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                        {userEmail.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-xs font-medium text-white truncate">Workspace</p>
                        <p className="text-[10px] text-neutral-500 truncate">{userEmail}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
