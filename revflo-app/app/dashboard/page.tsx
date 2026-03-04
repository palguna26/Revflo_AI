import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ExecutionScoreCard } from "@/components/dashboard/ExecutionScoreCard";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SignalsFeed } from "@/components/dashboard/SignalsFeed";
import { AIAssistantPanel } from "@/components/dashboard/AIAssistantPanel";
import { Activity, Target, Clock, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <div className="flex flex-col xl:flex-row gap-6 w-full h-full pb-8">

                {/* Main Content Area (Left/Center) */}
                <div className="flex-1 flex flex-col gap-6 min-w-0">

                    {/* Header */}
                    <header className="mb-2">
                        <h1 className="text-2xl font-semibold text-neutral-100 tracking-tight">Acme Overview</h1>
                        <p className="text-[13px] text-neutral-500 mt-1">Real-time intelligence on your product execution.</p>
                    </header>

                    <ExecutionScoreCard />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard
                            title="Velocity"
                            value="92%"
                            trend="+3%"
                            trendDirection="up"
                            icon={<Activity className="h-3.5 w-3.5" />}
                            delay={0.1}
                        />
                        <MetricCard
                            title="Alignment"
                            value="88%"
                            trend="+1%"
                            trendDirection="up"
                            icon={<Target className="h-3.5 w-3.5" />}
                            delay={0.2}
                        />
                        <MetricCard
                            title="Review Speed"
                            value="3.8h"
                            trend="-0.5h"
                            trendDirection="up"
                            icon={<Clock className="h-3.5 w-3.5" />}
                            delay={0.3}
                        />
                        <MetricCard
                            title="Drift Risk"
                            value="Low"
                            trend="Stable"
                            trendDirection="neutral"
                            icon={<AlertTriangle className="h-3.5 w-3.5" />}
                            delay={0.4}
                        />
                    </div>

                    <SignalsFeed />
                </div>

                {/* Right Sidebar Area (AI Assistant) */}
                <aside className="w-full xl:w-[320px] 2xl:w-[380px] shrink-0">
                    <div className="sticky top-6">
                        <AIAssistantPanel />
                    </div>
                </aside>

            </div>
        </DashboardLayout>
    );
}
