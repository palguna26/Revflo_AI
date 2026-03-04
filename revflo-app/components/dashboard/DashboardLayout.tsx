import React from 'react';
import { Sidebar } from './Sidebar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#0A0A0A] font-sans text-neutral-300 selection:bg-purple-500/30 flex">
            <Sidebar />
            <main className="flex-1 ml-64 min-h-screen flex flex-col items-center">
                {/* Adjusted to center content within the remaining width like a standard dash */}
                <div className="w-full max-w-[1400px] px-6 py-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
