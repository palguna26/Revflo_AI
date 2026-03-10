import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ensureWorkspace } from '@/lib/workspace'
import Groq from 'groq-sdk'

export async function POST() {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const workspace = await ensureWorkspace(supabase)

        if (!process.env.GROQ_API_KEY) {
            return NextResponse.json({ error: 'GROQ_API_KEY is not configured' }, { status: 400 })
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

        // ── 1. Fetch Signals ──────────────────────────────────────────────────────
        const { data: signals } = await supabase
            .from('product_signals')
            .select('*')
            .eq('workspace_id', workspace.id)
            .limit(100)

        if (!signals || signals.length === 0) {
            return NextResponse.json(
                { error: 'No signals found. Connect an integration from the Integrations page first.' },
                { status: 400 }
            )
        }

        const signalsContext = JSON.stringify(
            signals.slice(0, 60).map(s => ({ type: s.signal_type, source: s.source, content: s.content.slice(0, 150) }))
        )

        // ── 2. Insight Engine ─────────────────────────────────────────────────────
        const insightCompletion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'user',
                    content: `You are a product intelligence AI. Analyze these product signals and generate exactly 3 key insights.
Group related feedback, detect patterns, and identify opportunities and risks.

Return ONLY valid JSON in this exact format:
{
  "insights": [
    {
      "title": "Short title under 10 words",
      "description": "2-3 sentence description with specific evidence",
      "insight_type": "opportunity|risk|trend",
      "confidence_score": 85
    }
  ]
}

Signals:
${signalsContext}`,
                },
            ],
        })

        const insightsData = JSON.parse(
            insightCompletion.choices[0]?.message?.content ?? '{"insights":[]}'
        ) as { insights: Array<{ title: string; description: string; insight_type: string; confidence_score: number }> }

        // Save insights
        const savedInsights = await Promise.all(
            (insightsData.insights ?? []).map(async ins => {
                const { data } = await supabase
                    .from('insights')
                    .insert({
                        workspace_id: workspace.id,
                        title: ins.title ?? 'Unnamed Insight',
                        description: ins.description ?? '',
                        insight_type: ins.insight_type ?? 'opportunity',
                        confidence_score: Math.min(100, Math.max(0, ins.confidence_score ?? 70)),
                    })
                    .select()
                    .single()
                return data
            })
        )

        const topInsight = savedInsights.find(Boolean)
        if (!topInsight) throw new Error('Failed to save insights')

        // ── 3. Recommendation Engine ──────────────────────────────────────────────
        const featureCompletion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'user',
                    content: `Based on this product insight, recommend the single most impactful feature to build next.
Be specific and actionable.

Insight: "${topInsight.title}" — ${topInsight.description}

Return ONLY valid JSON:
{
  "feature_name": "Feature name (5-8 words)",
  "description": "What it does and why it matters (2-3 sentences)",
  "reasoning": "Evidence-based reasoning from the signals (2-3 sentences)",
  "expected_impact": "Specific quantified impact prediction",
  "priority_score": 88
}`,
                },
            ],
        })

        const featureData = JSON.parse(
            featureCompletion.choices[0]?.message?.content ?? '{}'
        ) as { feature_name?: string; description?: string; reasoning?: string; expected_impact?: string; priority_score?: number }

        const { data: feature, error: featureError } = await supabase
            .from('feature_recommendations')
            .insert({
                workspace_id: workspace.id,
                insight_id: topInsight.id,
                feature_name: featureData.feature_name ?? 'New Feature',
                description: featureData.description ?? '',
                reasoning: featureData.reasoning ?? '',
                expected_impact: featureData.expected_impact ?? '',
                priority_score: featureData.priority_score ?? 75,
            })
            .select()
            .single()

        if (featureError || !feature) throw new Error(`Feature insert failed: ${featureError?.message}`)

        // ── 4. PRD Generator ──────────────────────────────────────────────────────
        const prdCompletion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'user',
                    content: `Generate a complete Product Requirements Document (PRD) for this feature.

Feature: "${feature.feature_name}"
Description: ${feature.description}
Reasoning: ${feature.reasoning}

Return ONLY valid JSON:
{
  "problem": "The specific problem this solves (2-3 sentences)",
  "solution": "The proposed solution with key functionality (3-4 sentences)",
  "user_flows": "Step-by-step user flow (numbered list as plain text)",
  "technical_considerations": "Key technical implementation notes (3-4 sentences)",
  "success_metrics": "Specific measurable success metrics (numbered list as plain text)"
}`,
                },
            ],
        })

        const prdData = JSON.parse(
            prdCompletion.choices[0]?.message?.content ?? '{}'
        ) as { problem?: string; solution?: string; user_flows?: string; technical_considerations?: string; success_metrics?: string }

        const { data: prd, error: prdError } = await supabase
            .from('prds')
            .insert({
                workspace_id: workspace.id,
                feature_id: feature.id,
                problem: prdData.problem ?? '',
                solution: prdData.solution ?? '',
                user_flows: prdData.user_flows ?? '',
                technical_considerations: prdData.technical_considerations ?? '',
                success_metrics: prdData.success_metrics ?? '',
            })
            .select()
            .single()

        if (prdError || !prd) throw new Error(`PRD insert failed: ${prdError?.message}`)

        // ── 5. Engineering Task Generator ─────────────────────────────────────────
        const taskCompletion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'user',
                    content: `Break this PRD into specific engineering tasks for a modern web application.

Problem: ${prd.problem}
Solution: ${prd.solution}
Technical Context: ${prd.technical_considerations}

Return ONLY valid JSON with 3-5 tasks per category:
{
  "backend_tasks": ["Task 1", "Task 2", "Task 3"],
  "frontend_tasks": ["Task 1", "Task 2", "Task 3"],
  "database_tasks": ["Task 1", "Task 2"]
}`,
                },
            ],
        })

        const taskData = JSON.parse(
            taskCompletion.choices[0]?.message?.content ?? '{"backend_tasks":[],"frontend_tasks":[],"database_tasks":[]}'
        ) as { backend_tasks?: string[]; frontend_tasks?: string[]; database_tasks?: string[] }

        const { data: engPlan } = await supabase
            .from('engineering_plans')
            .insert({
                workspace_id: workspace.id,
                prd_id: prd.id,
                backend_tasks: taskData.backend_tasks ?? [],
                frontend_tasks: taskData.frontend_tasks ?? [],
                database_tasks: taskData.database_tasks ?? [],
            })
            .select()
            .single()

        // Update workspace metadata
        await supabase
            .from('workspaces')
            .update({
                last_analyzed_at: new Date().toISOString(),
                new_signals_count: 0
            })
            .eq('id', workspace.id)

        return NextResponse.json({
            success: true,
            insights: savedInsights.filter(Boolean),
            recommendation: feature,
            prd,
            engineering_plan: engPlan,
        })
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error'
        console.error('Analysis pipeline error:', msg)
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
