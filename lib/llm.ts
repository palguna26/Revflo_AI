/**
 * LLM Layer — Groq API integration
 * Used ONLY for:
 *   1. Text embeddings (for drift detection)
 *   2. Executive summary generation
 * Never used for metric computation.
 */

import Groq from 'groq-sdk'
import type { ScoreBreakdown, RiskItem } from '../types/database'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

const EMBEDDING_MODEL = 'llama-3.3-70b-versatile' // Groq chat model used for summarisation
// Note: Groq doesn't have a native embedding endpoint; we use a lightweight
// approach — encode text via a small deterministic hash for cosine comparison,
// OR use the chat model to produce structured embedding-like output.
// For production, swap in OpenAI/Cohere embeddings here.

// ── Embeddings ────────────────────────────────────────────────────────────────

/**
 * Generate a numeric embedding for the given text.
 * Uses a simple TF-IDF-style bag-of-words vector for zero-cost inference.
 * For higher accuracy, replace with an embedding API call.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    // Vocabulary-based embedding (deterministic, free, 512-dim).
    // Swap with an async embedding API (OpenAI, Cohere) for higher accuracy.
    const tokens = text.toLowerCase().match(/[a-z]{3,}/g) ?? []
    const vocab: Record<string, number> = {}
    for (const t of tokens) vocab[t] = (vocab[t] ?? 0) + 1

    // Map to fixed 512-dim vector using hash projection
    const dim = 512
    const vec = new Array<number>(dim).fill(0)
    for (const [word, count] of Object.entries(vocab)) {
        const idx = Math.abs(hashCode(word)) % dim
        vec[idx] += count
    }

    // L2 normalize
    const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1
    return vec.map((v) => v / norm)
}

function hashCode(str: string): number {
    let h = 0
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(31, h) + str.charCodeAt(i)
    }
    return h
}

// ── Executive Summary ─────────────────────────────────────────────────────────

export async function generateSummary(
    score: number,
    breakdown: ScoreBreakdown,
    risks: RiskItem[],
): Promise<{ summary: string; status: 'ok' | 'failed' }> {
    const riskLines = risks.length
        ? risks.map((r) => `- [${r.severity.toUpperCase()}] ${r.type}: ${r.message}`).join('\n')
        : 'None identified.'

    const prompt = `You are an AI execution advisor for startup founders.

Execution Score: ${score}/100
Breakdown:
- Velocity Stability: ${breakdown.velocity}/100
- Scope Control: ${breakdown.scope}/100
- Review Efficiency: ${breakdown.review}/100
- Fragmentation Risk: ${breakdown.fragmentation}/100
- Drift Risk: ${breakdown.drift}/100

Identified Risks:
${riskLines}

Write a concise, founder-focused executive brief (150 words max). Be direct and action-oriented. Plain prose only, no bullets.`

    try {
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 300,
            temperature: 0.3,
        })
        const summary = response.choices[0]?.message?.content?.trim() ?? ''
        return { summary, status: 'ok' }
    } catch (err) {
        console.error('Groq summary failed:', err)
        const fallback = `Execution Score: ${score}/100. Key risks: ${risks.map((r) => r.type).join(', ') || 'none'}. Review detailed breakdown for insights. (AI summary unavailable)`
        return { summary: fallback, status: 'failed' }
    }
}
