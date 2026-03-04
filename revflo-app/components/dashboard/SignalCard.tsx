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
        case "GitHub": return <Github className="h-3 w-3 text-neutral-400" />;
        case "Linear": return <CircleDot className="h-3 w-3 text-[#5E6AD2]" />;
        case "Stripe": return <div className="h-3 w-3 flex items-center justify-center font-bold text-[8px] text-[#635BFF]">S</div>;
        default: return <Database className="h-3 w-3 text-neutral-400" />;
    }
}

export function SignalCard({ signal }: { signal: SignalProps }) {
    return (
        <div className="group flex flex-col sm:flex-row gap-4 py-3.5 px-3 hover:bg-[#141414] rounded-lg transition-all border-b border-white/5 last:border-0 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] cursor-pointer">
            <div className="pt-0.5 hidden sm:block">
                <div className="h-6 w-6 rounded-md bg-[#0A0A0A] border border-neutral-800/60 shadow-sm flex items-center justify-center group-hover:border-neutral-700 transition-colors">
                    <SourceIcon source={signal.source} />
                </div>
            </div>

            <div className="flex-1 flex flex-col min-w-0 pb-1">
                <div className="flex items-center justify-between gap-4 mb-1">
                    <h4 className="text-[13px] font-medium text-neutral-200 truncate group-hover:text-neutral-100 transition-colors duration-200">
                        {signal.title}
                    </h4>
                    <span className="text-[11px] text-neutral-600 tabular-nums shrink-0 font-medium whitespace-nowrap">
                        {signal.timeAgo}
                    </span>
                </div>

                <p className="text-[12px] text-neutral-500 leading-relaxed line-clamp-2 pr-4 mb-2.5">
                    {signal.description}
                </p>

                <div className="flex items-center gap-3">
                    <span className={cn(
                        "inline-flex items-center rounded-sm px-1.5 py-[1px] text-[9px] font-semibold tracking-wide border uppercase",
                        impactStyles[signal.impact]
                    )}>
                        {signal.impact} IMPACT
                    </span>
                    <div className="h-3 w-[1px] bg-neutral-800" />
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-neutral-600 group-hover:text-neutral-500 transition-colors">
                        <SourceIcon source={signal.source} />
                        <span>{signal.source}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
