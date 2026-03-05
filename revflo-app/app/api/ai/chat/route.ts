import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/utils/supabase/server";

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function POST(req: NextRequest) {
    const { message } = await req.json();

    const supabase = await createClient();
    const { data: workspace } = await supabase.from('workspaces').select('id, name').limit(1).single();

    let insights: any[] = [];
    if (workspace) {
        const { data } = await supabase.from('insights')
            .select('*')
            .eq('workspace_id', workspace.id)
            .order('created_at', { ascending: false })
            .limit(5);
        insights = data || [];
    }

    const systemPrompt = `You are RevFlo's Product Intelligence AI — an expert PM advisor.
You are analyzing a SaaS startup Workspace "${workspace?.name || 'Local Workspace'}" with:
- Top insights: ${insights.length > 0 ? insights.map(i => i.title).join('; ') : 'No insights generated yet. Awaiting integrations.'}

Be concise, direct, and founder-focused. Max 200 words. Use bullet points.`;

    if (!groq) {
        return NextResponse.json({
            reply: `(Groq API Key Required) I see you have ${insights.length} active insights right now. I can help analyze your product signals once connected to the orchestrator.`
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
    } catch {
        return NextResponse.json({ error: "LLM error" }, { status: 500 });
    }
}
