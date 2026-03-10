import { createClient } from "@/utils/supabase/server";
import { SettingsShell } from "./settings-shell";

export default async function SettingsPage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>;
}) {
    const tab = (await searchParams).tab ?? 'workspace';
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    // Workspace data
    const { data: workspace } = await supabase
        .from('workspaces')
        .select('id, name, workspace_settings')
        .eq('owner_id', user?.id ?? '')
        .maybeSingle();

    const workspaceName = workspace?.name ?? 'My Workspace';
    const autoAnalyze = workspace?.workspace_settings?.auto_analyze ?? false;
    const userEmail = user?.email ?? '';
    const fullName = (user?.user_metadata?.full_name as string) ?? '';

    // Integration data (for Integrations tab)
    let githubStatus = { connected: false, date: '' };
    let linearStatus = { connected: false, date: '' };
    let csvUploadCount = 0;
    let csvSignalCount = 0;

    if (workspace?.id) {
        const { data: integrations } = await supabase
            .from('workspace_integrations')
            .select('provider, connected_at')
            .eq('workspace_id', workspace.id);

        for (const intg of integrations ?? []) {
            const date = intg.connected_at
                ? new Date(intg.connected_at).toLocaleDateString()
                : '';
            if (intg.provider === 'github') githubStatus = { connected: true, date };
            if (intg.provider === 'linear') linearStatus = { connected: true, date };
        }

        // CSV counts
        const { count: csvCount } = await supabase
            .from('product_signals')
            .select('*', { count: 'exact', head: true })
            .eq('workspace_id', workspace.id)
            .eq('source', 'csv_upload');

        csvSignalCount = csvCount ?? 0;
        if (csvSignalCount > 0) csvUploadCount = 1; // We don't track individual upload runs currently
    }

    return (
        <SettingsShell
            activeTab={tab}
            workspaceName={workspaceName}
            autoAnalyze={autoAnalyze}
            userEmail={userEmail}
            fullName={fullName}
            githubStatus={githubStatus}
            linearStatus={linearStatus}
            csvUploadCount={csvUploadCount}
            csvSignalCount={csvSignalCount}
        />
    );
}
