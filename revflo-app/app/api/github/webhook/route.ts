import { NextRequest, NextResponse } from "next/server";
import { processGitHubWebhook } from "@/lib/github/sync";
import * as crypto from "crypto";

export async function POST(req: NextRequest) {
    const signature = req.headers.get("x-hub-signature-256");
    const eventType = req.headers.get("x-github-event");
    const payload = await req.json();

    // 1. Verify Webhook Signature (Security)
    if (process.env.GITHUB_WEBHOOK_SECRET && signature) {
        const bodyText = JSON.stringify(payload);
        const expectedSignature = "sha256=" + crypto.createHmac("sha256", process.env.GITHUB_WEBHOOK_SECRET).update(bodyText).digest("hex");

        if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature)) === false) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }
    }

    // 2. Process Event
    if (eventType) {
        await processGitHubWebhook(payload, eventType);
    }

    return NextResponse.json({ success: true, message: "Webhook processed" });
}
