import React from 'react';
import { cn } from '@/lib/utils';
import { HeartPulse } from 'lucide-react';

export function TopNavbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-neutral-800/40 bg-neutral-950/80 backdrop-blur-xl">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-gradient-to-b from-neutral-100 to-neutral-300 text-neutral-950 shadow-sm transition-transform group-hover:scale-105">
                            <span className="font-bold text-sm">R</span>
                        </div>
                        <span className="text-sm font-semibold tracking-tight text-neutral-100 group-hover:text-white transition-colors">
                            RevFlo
                        </span>
                    </div>
                    <div className="hidden md:block">
                        <div className="flex items-center space-x-0.5">
                            {['Overview', 'Analysis', 'Insights', 'Settings'].map((item, i) => (
                                <button
                                    key={item}
                                    className={cn(
                                        "rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200",
                                        i === 0
                                            ? "bg-neutral-800/60 text-neutral-100 shadow-sm ring-1 ring-inset ring-neutral-700/50"
                                            : "text-neutral-400 hover:bg-neutral-800/40 hover:text-neutral-200"
                                    )}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    <div className="hidden sm:flex items-center gap-2 rounded-full border border-neutral-800/60 bg-gradient-to-b from-neutral-900/50 to-neutral-900/80 px-2.5 py-1 backdrop-blur-md shadow-sm transition-colors hover:border-neutral-700">
                        <div className="flex items-center justify-center p-0.5 rounded-full bg-green-500/10">
                            <HeartPulse className="h-3.5 w-3.5 text-green-400" />
                        </div>
                        <span className="text-[13px] font-medium text-neutral-300">
                            Score <span className="text-green-400 font-semibold ml-1">74</span>
                        </span>
                    </div>

                    <div className="h-4 w-[1px] bg-neutral-800" />

                    <button className="h-7 w-7 rounded-full bg-gradient-to-b from-neutral-800 to-neutral-900 flex items-center justify-center border border-neutral-700/80 shadow-sm hover:ring-2 hover:ring-neutral-800 transition-all">
                        <span className="text-[11px] font-medium text-neutral-300">US</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
