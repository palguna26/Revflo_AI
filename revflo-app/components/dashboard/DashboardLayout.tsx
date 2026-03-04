import React from 'react';
import { TopNavbar } from './TopNavbar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-neutral-950 font-sans text-neutral-300 selection:bg-purple-500/30">
            <TopNavbar />
            <main className="mx-auto max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
