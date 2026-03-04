import { DEMO_INSIGHTS, DEMO_PRS, DEMO_LINEAR_ISSUES } from "@/data/demo-data";
import { InsightCard } from "@/components/dashboard/InsightCard";

export default function InsightsPage() {
    return (
        <div className="p-8 space-y-8">
            <div>
                <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Signal Analysis</p>
                <h1 className="text-2xl font-bold">Product Insights</h1>
            </div>

            {/* All insights */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-400 mb-3">All Signals ({DEMO_INSIGHTS.length})</h2>
                <div className="space-y-3">
                    {DEMO_INSIGHTS.map(ins => <InsightCard key={ins.id} insight={ins} />)}
                </div>
            </div>

            {/* PR table */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-400 mb-3">Recent Pull Requests</h2>
                <div className="glass overflow-hidden rounded-xl">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5 text-xs text-neutral-500 uppercase tracking-wider">
                                <th className="text-left px-4 py-3">Title</th>
                                <th className="text-left px-4 py-3">Author</th>
                                <th className="text-left px-4 py-3">Status</th>
                                <th className="text-right px-4 py-3">+/-</th>
                                <th className="text-right px-4 py-3">Review</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DEMO_PRS.slice(0, 12).map((pr, i) => (
                                <tr key={pr.id} className={`border-b border-white/4 hover:bg-white/2 transition-colors ${i === 11 ? 'border-b-0' : ''}`}>
                                    <td className="px-4 py-3 text-neutral-200 max-w-[280px] truncate">{pr.title}</td>
                                    <td className="px-4 py-3 text-neutral-500 text-xs">{pr.author}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${pr.state === 'merged' ? 'bg-purple-500/15 text-purple-400' :
                                                pr.state === 'open' ? 'bg-emerald-500/15 text-emerald-400' :
                                                    'bg-neutral-500/15 text-neutral-400'
                                            }`}>{pr.state}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-xs">
                                        <span className="text-emerald-500">+{pr.additions}</span>{' '}
                                        <span className="text-red-500">-{pr.deletions}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-xs text-neutral-500">
                                        {pr.review_time_h ? `${pr.review_time_h}h` : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Linear issues */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-400 mb-3">Linear Issues</h2>
                <div className="grid grid-cols-2 gap-3">
                    {DEMO_LINEAR_ISSUES.map(issue => (
                        <div key={issue.id} className="glass p-4">
                            <div className="flex items-start gap-2">
                                <span className={`mt-0.5 text-[10px] px-1.5 py-0.5 rounded font-medium ${issue.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                                        issue.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                                            'bg-neutral-500/20 text-neutral-500'
                                    }`}>{issue.priority}</span>
                                <div>
                                    <p className="text-sm text-neutral-200">{issue.title}</p>
                                    <p className="text-xs text-neutral-500 mt-1">{issue.assignee} · {issue.status}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
