import { cn } from "@/lib/utils";
import { Github, CircleDot, Database } from "lucide-react";

export type ImpactLevel = "High" | "Medium" | "Low";
export type SourceOrigin = "GitHub" | "Linear" | "Stripe" | "Database";

export interface SignalProps {
    id: string;
    title: string;
    description: string;
    impact: ImpactLevel;
    source: SourceOrigin;
    timeAgo: string;
}

const impactStyles = {
    High: "bg-red-500/10 text-red-400 border-red-500/20",
    Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    Low: "bg-green-500/10 text-green-400 border-green-500/20",
};

const SourceIcon = ({ source }: { source: SourceOrigin }) => {
    switch (source) {
        case "GitHub": return <Github className="h-3 w-3 text-neutral-400" />;
        case "Linear": return <CircleDot className="h-3 w-3 text-purple-400" />;
        case "Stripe": return <div className="h-3 w-3 flex items-center justify-center font-bold text-[8px] text-[#6366f1]">S</div>;
        default: return <Database className="h-3 w-3 text-neutral-400" />;
    }
}

export function SignalCard({ signal }: { signal: SignalProps }) {
    return (
        <div className="group flex flex-col sm:flex-row gap-4 py-4 px-2 hover:bg-neutral-900/50 rounded-lg transition-colors border-b border-neutral-800/50 last:border-0 hover:px-4 -mx-2">
            <div className="pt-1 hidden sm:block">
                <div className="h-6 w-6 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                    <SourceIcon source={signal.source} />
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex items-start justify-between">
                    <h4 className="text-sm font-medium text-neutral-200 group-hover:text-purple-400 transition-colors">
                        {signal.title}
                    </h4>
                    <span className="text-xs text-neutral-500 tabular-nums shrink-0 ml-4">
                        {signal.timeAgo}
                    </span>
                </div>

                <p className="text-sm text-neutral-500 max-w-xl">
                    {signal.description}
                </p>

                <div className="flex items-center gap-3 mt-1">
                    <span className={cn(
                        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide border uppercase",
                        impactStyles[signal.impact]
                    )}>
                        {signal.impact} IMPACT
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <SourceIcon source={signal.source} />
                        <span>{signal.source}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
