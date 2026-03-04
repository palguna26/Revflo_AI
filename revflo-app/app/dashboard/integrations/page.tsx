"use client";

const INTEGRATIONS = [
    {
        id: "github", name: "GitHub", icon: "⌥", desc: "Pull requests, commits, code review activity",
        color: "#24292e", connected: true, stats: "20 PRs · 4 repos",
    },
    {
        id: "linear", name: "Linear", icon: "◈", desc: "Issues, projects, sprints, labels",
        color: "#5e6ad2", connected: true, stats: "15 issues · 3 projects",
    },
    {
        id: "jira", name: "Jira", icon: "◆", desc: "Tickets, epics, sprints, issue tracking",
        color: "#0052cc", connected: false, stats: null,
    },
    {
        id: "stripe", name: "Stripe", icon: "▲", desc: "Subscriptions, upgrades, churn, MRR",
        color: "#6772e5", connected: true, stats: "10 events · $1,592 MRR",
    },
];

export default function IntegrationsPage() {
    return (
        <div className="p-8 space-y-8">
            <div>
                <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Connected Tools</p>
                <h1 className="text-2xl font-bold">Integrations</h1>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {INTEGRATIONS.map(int => (
                    <div key={int.id} className={`glass p-5 transition-all ${int.connected ? '' : 'opacity-60'}`}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                                    style={{ background: int.color + '25', border: `1px solid ${int.color}40` }}>
                                    {int.icon}
                                </div>
                                <div>
                                    <p className="font-medium">{int.name}</p>
                                    {int.stats && <p className="text-xs text-neutral-500">{int.stats}</p>}
                                </div>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${int.connected
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                                    : 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20'
                                }`}>
                                {int.connected ? '✓ Connected' : 'Not connected'}
                            </span>
                        </div>
                        <p className="text-xs text-neutral-500 mb-4">{int.desc}</p>
                        <button
                            className={`w-full py-2 rounded-lg text-xs font-medium transition-colors ${int.connected
                                    ? 'bg-white/5 text-neutral-400 hover:bg-white/8'
                                    : 'bg-indigo-600/80 hover:bg-indigo-600 text-white'
                                }`}
                            onClick={() => alert(`In production, this would open the ${int.name} OAuth flow.`)}
                        >
                            {int.connected ? 'Manage connection' : `Connect ${int.name}`}
                        </button>
                    </div>
                ))}
            </div>

            {/* Coming soon */}
            <div className="glass p-5 border-dashed">
                <p className="text-sm font-medium text-neutral-400 mb-1">Coming soon</p>
                <p className="text-xs text-neutral-600">Intercom · Notion · Slack · Amplitude · Mixpanel · Zendesk</p>
            </div>
        </div>
    );
}
