import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { DEMO_SCORE, DEMO_INSIGHTS } from "@/data/demo-data";

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function POST(req: NextRequest) {
    const { message } = await req.json();

    const systemPrompt = `You are RevFlo's Product Intelligence AI — an expert PM advisor.
You are analyzing a SaaS startup called "Acme AI" with:
- Execution Score: ${DEMO_SCORE.overall}/100
- Velocity: ${DEMO_SCORE.velocity}, Alignment: ${DEMO_SCORE.alignment}, Review: ${DEMO_SCORE.review}, Drift: ${DEMO_SCORE.drift}
- Top insights: ${DEMO_INSIGHTS.map(i => i.title).join('; ')}

Be concise, direct, and founder-focused. Max 200 words. Use bullet points.`;

    if (!groq) {
        // Demo fallback
        return NextResponse.json({
            reply: `Based on your product signals (score: ${DEMO_SCORE.overall}/100):\n\n• Top opportunity: Onboarding completion is your #1 growth lever\n• Key risk: Scope drift in real-time collaboration features\n• Revenue signal: 2 enterprise upgrades suggest feature gap\n\nWant me to generate a feature spec or sprint breakdown?`
        });
    }

    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message },
            ],
            max_tokens: 400,
            temperature: 0.4,
        });

        return NextResponse.json({
            reply: completion.choices[0]?.message?.content || "Unable to generate response."
        });
    } catch (err) {
        return NextResponse.json({ error: "LLM error" }, { status: 500 });
    }
}
