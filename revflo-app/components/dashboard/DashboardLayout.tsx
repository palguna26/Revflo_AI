import React from 'react';
import { TopNavbar } from './TopNavbar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#0A0A0A] font-sans text-neutral-300 selection:bg-purple-500/30">
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-neutral-900/20 via-[#0A0A0A] to-[#0A0A0A] pointer-events-none" />
            <TopNavbar />
            <main className="relative mx-auto max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
