import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // The middleware currently protects this route, but providing a fallback
    // userEmail specifically handles the placeholder local dev state
    const userEmail = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')
        ? 'founder@acme.ai'
        : (user?.email || 'demo@revflo.ai');

    if (!user && !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
        redirect('/login');
    }

    return (
        <div className="flex h-screen bg-[#0A0A0A] overflow-hidden text-neutral-300">
            <SidebarNav userEmail={userEmail} />

            {/* Main */}
            <main className="flex-1 overflow-y-auto bg-black">
                {children}
            </main>
        </div>
    );
}

