"""
Drift Detection Service: Measures alignment between PRs and the roadmap.
Uses embeddings + cosine similarity to detect semantic drift.
"""
import numpy as np
from typing import Optional
import asyncpg
from app.services.llm_service import generate_embedding


def cosine_similarity(a: list[float], b: list[float]) -> float:
    """Compute cosine similarity between two embedding vectors."""
    va = np.array(a, dtype=np.float32)
    vb = np.array(b, dtype=np.float32)
    dot = np.dot(va, vb)
    norm = np.linalg.norm(va) * np.linalg.norm(vb)
    if norm == 0:
        return 0.0
    return float(dot / norm)


def extract_keywords(text: str) -> set[str]:
    """Simple keyword extraction: lowercase, split, filter stopwords."""
    STOPWORDS = {
        "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
        "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
        "have", "has", "had", "do", "does", "did", "will", "would", "could",
        "should", "may", "might", "can", "this", "that", "these", "those",
        "it", "its", "we", "i", "you", "he", "she", "they", "pr", "fix",
        "update", "add", "remove", "change", "use", "into",
    }
    words = set(text.lower().split())
    return words - STOPWORDS


async def detect_drift(
    roadmap_text: str,
    prs: list[dict],
    db: Optional[asyncpg.Connection] = None,
    alignment_threshold: float = 0.35,
) -> dict:
    """
    Main drift detection routine.

    Returns:
        {
            misaligned_prs: [{pr_id, title, similarity}],
            drift_ratio: float,
            new_clusters: [str],
            aligned_count: int,
        }
    """
    if not prs or not roadmap_text.strip():
        return {
            "misaligned_prs": [],
            "drift_ratio": 0.0,
            "new_clusters": [],
            "aligned_count": len(prs),
        }

    # Generate roadmap embedding
    roadmap_embedding = await generate_embedding(roadmap_text, db)

    # Extract roadmap keywords for cluster comparison
    roadmap_keywords = extract_keywords(roadmap_text)

    misaligned = []
    all_pr_keywords: set[str] = set()

    for pr in prs:
        pr_text = f"{pr.get('title', '')} {pr.get('body', '') or ''}".strip()
        if not pr_text:
            continue

        pr_embedding = await generate_embedding(pr_text, db)
        sim = cosine_similarity(roadmap_embedding, pr_embedding)

        pr_keywords = extract_keywords(pr_text)
        all_pr_keywords.update(pr_keywords)

        if sim < alignment_threshold:
            misaligned.append({
                "pr_id": str(pr.get("id", pr.get("number", ""))),
                "title": pr.get("title", ""),
                "similarity": round(sim, 4),
            })

    # Detect keyword clusters that don't appear in roadmap
    new_clusters = sorted(
        [kw for kw in all_pr_keywords if kw not in roadmap_keywords and len(kw) > 4]
    )[:10]  # top 10 novel clusters

    drift_ratio = len(misaligned) / max(len(prs), 1)
    aligned_count = len(prs) - len(misaligned)

    return {
        "misaligned_prs": misaligned,
        "drift_ratio": round(drift_ratio, 4),
        "new_clusters": new_clusters,
        "aligned_count": aligned_count,
    }


async def get_or_store_roadmap_embedding(
    repo_id: str,
    roadmap_text: str,
    db: asyncpg.Connection,
) -> list[float]:
    """Get cached roadmap embedding or generate and store it."""
    row = await db.fetchrow(
        "SELECT embedding FROM roadmaps WHERE repository_id = $1 ORDER BY created_at DESC LIMIT 1",
        repo_id,
    )
    if row and row["embedding"]:
        import json
        return json.loads(row["embedding"])

    embedding = await generate_embedding(roadmap_text, db)
    return embedding
