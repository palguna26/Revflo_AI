import { createClient } from '@/utils/supabase/server';

export async function processGitHubWebhook(payload: any, eventType: string) {
    // Mock webhook processor for the placeholder phase
    const supabase = await createClient();

    if (eventType === 'pull_request' && payload.action === 'closed' && payload.pull_request.merged) {
        const pr = payload.pull_request;
        const repo = payload.repository;

        console.log(`[GitHub Sync] Processing merged PR #${pr.number} from ${repo.full_name}`);

        try {
            // MVP: Since we don't have complex user-to-org mappings yet, we just grab the first workspace.
            const { data: workspace } = await supabase.from('workspaces').select('id').limit(1).single();
            if (!workspace) throw new Error("No default workspace found");

            // Insert the PR as a Product Signal
            const { error } = await supabase.from('product_signals').insert({
                workspace_id: workspace.id,
                signal_type: 'feature_shipped',
                source: 'github',
                content: `Pull Request Merged: ${pr.title}\n\n${pr.body || ''}`,
                metadata: {
                    github_pr_id: pr.id,
                    number: pr.number,
                    author: pr.user.login,
                    diff_url: pr.diff_url,
                    merged_at: pr.merged_at,
                    repo: repo.full_name
                }
            });

            if (error) throw error;
            console.log(`[GitHub Sync] Successfully stored PR #${pr.number} as a product signal`);
        } catch (e) {
            console.error(`[GitHub Sync] Failed to store PR`, e);
        }
    }

    // Handle other events like push (commits) or installation
}

export async function fetchRepositoryPRs(owner: string, repo: string, token: string) {
    // Uses the GitHub REST API to bulk fetch recent PRs when a repo is first connected.
    // This allows analysis of historical data immediately after onboarding.
    console.log(`[GitHub Sync] Fetching historical PRs for ${owner}/${repo}`);

    // const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=50`, {
    //     headers: { Authorization: `Bearer ${token}` }
    // });

    // return res.json();
    return [];
}
