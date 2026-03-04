import { NextRequest, NextResponse } from "next/server";
import {
    DEMO_PRS, DEMO_LINEAR_ISSUES, DEMO_SCORE,
    DEMO_INSIGHTS, DEMO_FEATURE_RECOMMENDATION
} from "@/data/demo-data";

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const { organization_id } = body as { organization_id?: string };

    // If no real integrations configured, use demo data
    const isDemo = !process.env.GITHUB_TOKEN || !organization_id;

    if (isDemo) {
        return NextResponse.json({
            report_id: "demo-report-" + Date.now(),
            score: DEMO_SCORE.overall,
            breakdown: {
                velocity: DEMO_SCORE.velocity,
                alignment: DEMO_SCORE.alignment,
                review: DEMO_SCORE.review,
                fragmentation: DEMO_SCORE.fragmentation,
                drift: DEMO_SCORE.drift,
            },
            insights: DEMO_INSIGHTS,
            summary: DEMO_FEATURE_RECOMMENDATION.reason,
            feature_recommendation: DEMO_FEATURE_RECOMMENDATION,
            mode: "demo",
        });
    }

    // Production: real analysis would run here
    return NextResponse.json({ error: "Real analysis not yet configured. Add environment variables." }, { status: 501 });
}
