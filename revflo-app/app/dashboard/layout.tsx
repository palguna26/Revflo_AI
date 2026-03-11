import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { Topbar } from "@/components/dashboard/Topbar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // The middleware currently protects this route, but providing a fallback
    // userEmail specifically handles the placeholder local dev state
    const userEmail = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')
        ? 'founder@acme.ai'
        : (user?.email || '');

    if (!user && !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
        redirect('/login');
    }

    return (
        <div className="flex h-screen bg-[var(--bg-primary)] overflow-hidden text-[var(--text-primary)] font-sans">
            <SidebarNav userEmail={userEmail} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
                    <div className="max-w-[1200px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

