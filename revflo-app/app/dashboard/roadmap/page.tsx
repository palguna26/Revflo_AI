import { DEMO_ROADMAP_THEMES, DEMO_PRS } from "@/data/demo-data";

const DRIFT_PRS = ['feat: real-time collaboration cursors', 'feat: team collaboration — shared workspaces'];

export default function RoadmapPage() {
    return (
        <div className="p-8 space-y-8">
            <div>
                <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Execution Audit</p>
                <h1 className="text-2xl font-bold">Roadmap vs Reality</h1>
            </div>

            {/* Drift alert */}
            <div className="border border-amber-500/25 bg-amber-500/8 rounded-xl p-5 flex items-start gap-4">
                <span className="text-2xl">⚠</span>
                <div>
                    <p className="font-semibold text-amber-400 mb-1">Scope Drift Detected</p>
                    <p className="text-sm text-neutral-400">2 large PRs (~1,100 LOC) are building real-time collaboration features not committed to in Q1. Consider an explicit decision: absorb into roadmap or defer.</p>
                </div>
            </div>

            {/* Roadmap themes */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-400 mb-3">Roadmap Themes</h2>
                <div className="glass overflow-hidden rounded-xl">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5 text-xs text-neutral-500 uppercase tracking-wider">
                                <th className="text-left px-4 py-3">Theme</th>
                                <th className="text-left px-4 py-3">Quarter</th>
                                <th className="text-left px-4 py-3">Status</th>
                                <th className="text-right px-4 py-3">Alignment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DEMO_ROADMAP_THEMES.map((theme, i) => (
                                <tr key={theme.id} className={`border-b border-white/4 hover:bg-white/2 ${i === DEMO_ROADMAP_THEMES.length - 1 ? 'border-b-0' : ''}`}>
                                    <td className="px-4 py-3 text-neutral-200">{theme.theme}</td>
                                    <td className="px-4 py-3 text-neutral-500 text-xs">{theme.quarter}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${theme.status === 'in_progress' ? 'bg-blue-500/15 text-blue-400' : 'bg-neutral-500/15 text-neutral-500'
                                            }`}>{theme.status === 'in_progress' ? 'In Progress' : 'Planned'}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center gap-2 justify-end">
                                            <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${theme.alignment}%`,
                                                        background: theme.alignment > 70 ? '#10b981' : theme.alignment > 50 ? '#f59e0b' : '#ef4444'
                                                    }}
                                                />
                                            </div>
                                            <span className={`text-xs font-medium ${theme.alignment > 70 ? 'text-emerald-400' : theme.alignment > 50 ? 'text-amber-400' : 'text-red-400'
                                                }`}>{theme.alignment}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Unplanned work */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-400 mb-3">Unplanned Engineering Work</h2>
                <div className="space-y-3">
                    {DEMO_PRS.filter(pr => DRIFT_PRS.includes(pr.title)).map(pr => (
                        <div key={pr.id} className="glass border-amber-500/20 p-4 flex items-center gap-4">
                            <span className="text-amber-400 text-lg">◎</span>
                            <div className="flex-1">
                                <p className="text-sm text-neutral-200">{pr.title}</p>
                                <p className="text-xs text-neutral-500 mt-0.5">by {pr.author} · {pr.additions + pr.deletions} LOC · Not in roadmap</p>
                            </div>
                            <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Off-roadmap</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Context: all active PRs */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-400 mb-3">Active Work</h2>
                <div className="grid grid-cols-2 gap-3">
                    {DEMO_PRS.filter(p => p.state === 'open' || p.state === 'draft').map(pr => (
                        <div key={pr.id} className="glass p-4">
                            <p className="text-sm text-neutral-200 mb-1">{pr.title}</p>
                            <p className="text-xs text-neutral-500">{pr.author} · {pr.additions} LOC added</p>
                            <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full ${pr.state === 'draft' ? 'bg-neutral-500/15 text-neutral-400' : 'bg-emerald-500/15 text-emerald-400'
                                }`}>{pr.state}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
