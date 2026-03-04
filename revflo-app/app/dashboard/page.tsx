import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ExecutionScoreCard } from "@/components/dashboard/ExecutionScoreCard";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SignalsFeed } from "@/components/dashboard/SignalsFeed";
import { AIAssistantPanel } from "@/components/dashboard/AIAssistantPanel";
import { Activity, Target, Clock, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column (Main Content) */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    <ExecutionScoreCard />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                {/* Right Column (AI Assistant) */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <AIAssistantPanel />
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
