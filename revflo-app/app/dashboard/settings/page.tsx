import { createClient } from "@/utils/supabase/server";

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: workspace } = await supabase.from('workspaces').select('name').limit(1).single();

    const userEmail = user?.email || '';
    const workspaceName = workspace?.name || 'Your Workspace';
    const domainPrefix = workspaceName.toLowerCase().replace(/[^a-z0-9]/g, '-');

    return (
        <div className="flex h-full">
            {/* Inner navigation rail */}
            <div className="w-48 border-r border-[#222222] bg-[#0A0A0A] p-4 flex flex-col gap-1 hidden md:flex">
                <div className="px-3 py-2 text-xs font-semibold tracking-widest uppercase text-neutral-500 mt-2 mb-2">Settings</div>
                <button className="text-left px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">Profile</button>
                <button className="text-left px-3 py-2 text-sm text-white bg-white/10 rounded-lg transition-colors font-medium">Workspace</button>
                <button className="text-left px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">Integrations</button>
                <button className="text-left px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">Billing</button>
                <button className="text-left px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">API Keys</button>
            </div>

            {/* Main content */}
            <div className="flex-1 p-8 max-w-2xl text-white">
                <div className="mb-10">
                    <h1 className="text-2xl font-semibold tracking-tight">Workspace Details</h1>
                    <p className="text-sm text-neutral-400 mt-1">Manage your organization's core settings.</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-300 ml-1">Workspace Name</label>
                        <input
                            type="text"
                            defaultValue={workspaceName}
                            className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-300 ml-1">Domain URL</label>
                        <div className="flex w-full bg-[#111111] border border-white/10 rounded-xl overflow-hidden focus-within:border-indigo-500/50 transition-colors">
                            <input
                                type="text"
                                defaultValue={domainPrefix}
                                className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none text-white text-right"
                            />
                            <div className="bg-[#222222]/50 px-4 py-3 border-l border-white/10 text-sm font-mono text-neutral-500">
                                .revflo.ai
                            </div>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="mt-16 border border-red-500/20 bg-red-500/5 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50"></div>
                    <h2 className="text-lg font-medium text-red-500 mb-2">Danger Zone</h2>
                    <p className="text-sm text-neutral-400 mb-6 max-w-md">
                        This action is irreversible and will delete all connected integrations, historical PR data, and execution signals.
                    </p>
                    <button className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 text-xs font-semibold rounded-lg transition-all">
                        Delete Workspace
                    </button>
                </div>
            </div>
        </div>
    );
}
