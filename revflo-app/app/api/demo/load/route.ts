import { NextRequest, NextResponse } from "next/server";
import {
    DEMO_PRS, DEMO_LINEAR_ISSUES, DEMO_STRIPE_EVENTS,
    DEMO_INSIGHTS, DEMO_ROADMAP_THEMES, DEMO_SCORE,
    DEMO_ORG, DEMO_FEATURE_RECOMMENDATION
} from "@/data/demo-data";

export async function GET(req: NextRequest) {
    // In production: load from Supabase
    // Demo mode: return from demo-data.ts
    return NextResponse.json({
        status: "demo",
        org: DEMO_ORG,
        score: DEMO_SCORE,
        prs: DEMO_PRS,
        issues: DEMO_LINEAR_ISSUES,
        stripe_events: DEMO_STRIPE_EVENTS,
        insights: DEMO_INSIGHTS,
        roadmap_themes: DEMO_ROADMAP_THEMES,
        feature_recommendation: DEMO_FEATURE_RECOMMENDATION,
    });
}
