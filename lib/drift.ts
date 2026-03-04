/**
 * Drift Detection Engine
 * Computes cosine similarity between PR embeddings and roadmap embedding.
 * Flags misaligned PRs and detects new keyword clusters.
 */

import type { PullRequest, MisalignedPR } from '../types/database'

export interface DriftResult {
    misalignedPrs: MisalignedPR[]
    driftRatio: number
    newClusters: string[]
    alignedCount: number
}

const ALIGNMENT_THRESHOLD = 0.35

// ── Cosine Similarity ─────────────────────────────────────────────────────────

export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0
    let dot = 0, normA = 0, normB = 0
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i]
        normA += a[i] * a[i]
        normB += b[i] * b[i]
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB)
    return denom === 0 ? 0 : dot / denom
}

// ── Keyword Extraction ────────────────────────────────────────────────────────

const STOPWORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'from', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does',
    'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that',
    'these', 'those', 'it', 'its', 'we', 'i', 'you', 'he', 'she', 'they', 'pr', 'fix',
    'update', 'add', 'remove', 'change', 'use', 'into', 'feat', 'refactor', 'chore',
])

export function extractKeywords(text: string): Set<string> {
    const words = text.toLowerCase().match(/[a-z]{4,}/g) ?? []
    return new Set(words.filter((w) => !STOPWORDS.has(w)))
}

// ── Main Drift Detection ──────────────────────────────────────────────────────

export async function detectDrift(
    prs: PullRequest[],
    roadmapText: string,
    getEmbedding: (text: string) => Promise<number[]>,
): Promise<DriftResult> {
    if (prs.length === 0 || !roadmapText.trim()) {
        return { misalignedPrs: [], driftRatio: 0, newClusters: [], alignedCount: prs.length }
    }

    const roadmapEmbedding = await getEmbedding(roadmapText)
    const roadmapKeywords = extractKeywords(roadmapText)

    const misalignedPrs: MisalignedPR[] = []
    const allPrKeywords = new Set<string>()

    for (const pr of prs) {
        const prText = `${pr.title ?? ''} ${pr.body ?? ''}`.trim()
        if (!prText) continue

        const prEmbedding = await getEmbedding(prText)
        const sim = cosineSimilarity(roadmapEmbedding, prEmbedding)

        for (const kw of extractKeywords(prText)) allPrKeywords.add(kw)

        if (sim < ALIGNMENT_THRESHOLD) {
            misalignedPrs.push({
                pr_id: pr.id,
                title: pr.title ?? `PR #${pr.github_pr_id}`,
                similarity: Math.round(sim * 10000) / 10000,
            })
        }
    }

    // New clusters = keywords in PRs but not roadmap
    const newClusters = [...allPrKeywords]
        .filter((kw) => !roadmapKeywords.has(kw))
        .slice(0, 10)

    const driftRatio = misalignedPrs.length / prs.length
    const alignedCount = prs.length - misalignedPrs.length

    return {
        misalignedPrs,
        driftRatio: Math.round(driftRatio * 10000) / 10000,
        newClusters,
        alignedCount,
    }
}
