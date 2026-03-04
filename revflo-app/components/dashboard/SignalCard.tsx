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
    High: "bg-red-500/10 text-red-500 border-red-500/20",
    Medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    Low: "bg-green-500/10 text-green-500 border-green-500/20",
};

const SourceIcon = ({ source }: { source: SourceOrigin }) => {
    switch (source) {
        case "GitHub": return <Github className="h-3.5 w-3.5 text-neutral-400" />;
        case "Linear": return <CircleDot className="h-3.5 w-3.5 text-[#5E6AD2]" />;
        case "Stripe": return <div className="h-3.5 w-3.5 flex items-center justify-center font-bold text-[9px] text-[#635BFF]">S</div>;
        default: return <Database className="h-3.5 w-3.5 text-neutral-400" />;
    }
}

export function SignalCard({ signal }: { signal: SignalProps }) {
    return (
        <div className="group flex flex-col sm:flex-row gap-4 py-3.5 px-3 hover:bg-neutral-800/30 rounded-lg transition-all border-b border-neutral-800/40 last:border-0 hover:shadow-sm">
            <div className="pt-0.5 hidden sm:block">
                <div className="h-7 w-7 rounded-[6px] bg-gradient-to-b from-neutral-800 to-neutral-900 border border-neutral-700/60 shadow-sm flex items-center justify-center group-hover:border-neutral-600 transition-colors">
                    <SourceIcon source={signal.source} />
                </div>
            </div>

            <div className="flex-1 flex flex-col min-w-0 pb-1">
                <div className="flex items-center justify-between gap-4 mb-1">
                    <h4 className="text-[13px] font-medium text-neutral-300 truncate group-hover:text-purple-400 transition-colors duration-200">
                        {signal.title}
                    </h4>
                    <span className="text-[11px] text-neutral-500 tabular-nums shrink-0 font-medium">
                        {signal.timeAgo}
                    </span>
                </div>

                <p className="text-[13px] text-neutral-500 leading-snug line-clamp-2 pr-4 mb-2">
                    {signal.description}
                </p>

                <div className="flex items-center gap-3 mt-1">
                    <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-[1px] text-[10px] font-semibold tracking-wide border",
                        impactStyles[signal.impact]
                    )}>
                        {signal.impact} IMPACT
                    </span>
                    <div className="h-3 w-[1px] bg-neutral-800" />
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500 group-hover:text-neutral-400 transition-colors">
                        <SourceIcon source={signal.source} />
                        <span>{signal.source}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
