import React from 'react';
import { cn } from '@/lib/utils';
import { HeartPulse } from 'lucide-react';

export function TopNavbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-950">
                            <span className="font-bold">R</span>
                        </div>
                        <span className="text-lg font-semibold tracking-tight text-neutral-100">
                            RevFlo
                        </span>
                    </div>
                    <div className="hidden md:block">
                        <div className="flex items-center space-x-1">
                            {['Overview', 'Analysis', 'Insights', 'Settings'].map((item, i) => (
                                <button
                                    key={item}
                                    className={cn(
                                        "rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:text-neutral-100",
                                        i === 0 ? "bg-neutral-800 text-neutral-100" : "text-neutral-400 hover:bg-neutral-800/50"
                                    )}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/50 px-3 py-1.5 backdrop-blur-md">
                        <HeartPulse className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-medium text-neutral-300">
                            Execution Score: <span className="text-green-400 font-semibold">74</span>
                        </span>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700">
                        <span className="text-xs font-medium text-neutral-300">US</span>
                    </div>
                </div>
            </div>
        </nav>
    );
}
