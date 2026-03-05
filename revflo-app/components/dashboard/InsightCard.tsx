interface Insight {
    type: string;
    title: string;
    severity: string;
    description: string;
    signal_sources: string[];
    impact: string;
}

const TYPE_CONFIG = {
    opportunity: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", badge: "text-emerald-400", icon: "◈" },
    risk: { bg: "bg-red-500/10", border: "border-red-500/20", badge: "text-red-400", icon: "⚠" },
    health: { bg: "bg-blue-500/10", border: "border-blue-500/20", badge: "text-blue-400", icon: "✓" },
    trend: { bg: "bg-indigo-500/10", border: "border-indigo-500/20", badge: "text-indigo-400", icon: "↗" },
};

const SEVERITY_BADGE = {
    high: "bg-red-500/15 text-red-400 border-red-500/20",
    medium: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    low: "bg-neutral-500/15 text-neutral-400 border-neutral-500/20",
};

export function InsightCard({ insight }: { insight: Insight }) {
    const cfg = TYPE_CONFIG[insight.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.health;
    return (
        <div className={`${cfg.bg} border ${cfg.border} rounded-xl p-4`}>
            <div className="flex items-start gap-3">
                <span className={`text-lg mt-0.5 ${cfg.badge}`}>{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-sm font-medium text-white">{insight.title}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wide ${SEVERITY_BADGE[insight.severity as keyof typeof SEVERITY_BADGE]}`}>
                            {insight.severity}
                        </span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">{insight.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                        {insight.signal_sources.map(s => (
                            <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-neutral-500">{s}</span>
                        ))}
                        <span className="ml-auto text-[10px] text-neutral-600">Impact: {insight.impact}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
