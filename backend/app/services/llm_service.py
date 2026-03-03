"""
LLM Service: Groq integration for embeddings and executive summaries.
- generate_embedding: uses sentence-transformers (cached in DB)
- generate_summary: uses Groq llama-3.3-70b-versatile
LLM is NEVER used for metric computation.
"""
import json
import asyncio
import asyncpg
from typing import Optional
from functools import lru_cache
import numpy as np
from groq import AsyncGroq
from app.config import get_settings

settings = get_settings()


@lru_cache(maxsize=1)
def _get_sentence_model():
    """Load sentence-transformers model once (lazy, cached)."""
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer("all-MiniLM-L6-v2")


def _embed_locally(text: str) -> list[float]:
    """Generate embedding using local sentence-transformers model."""
    model = _get_sentence_model()
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()


async def get_cached_embedding(text_hash: str, db: asyncpg.Connection) -> Optional[list[float]]:
    """Check if an embedding is cached in the DB."""
    row = await db.fetchrow(
        "SELECT embedding FROM embedding_cache WHERE text_hash = $1",
        text_hash,
    )
    if row and row["embedding"]:
        return json.loads(row["embedding"])
    return None


async def cache_embedding(text_hash: str, embedding: list[float], db: asyncpg.Connection) -> None:
    """Store an embedding in the DB cache."""
    await db.execute(
        """
        INSERT INTO embedding_cache (text_hash, embedding, created_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (text_hash) DO NOTHING
        """,
        text_hash, json.dumps(embedding),
    )


async def generate_embedding(text: str, db: Optional[asyncpg.Connection] = None) -> list[float]:
    """
    Generate a text embedding.
    1. Check DB cache first.
    2. If not cached, compute with sentence-transformers.
    3. Cache result in DB.
    """
    import hashlib
    text_hash = hashlib.sha256(text.encode()).hexdigest()

    if db:
        cached = await get_cached_embedding(text_hash, db)
        if cached:
            return cached

    # Run CPU-bound embedding in a thread pool to avoid blocking
    loop = asyncio.get_event_loop()
    embedding = await loop.run_in_executor(None, _embed_locally, text)

    if db:
        await cache_embedding(text_hash, embedding, db)

    return embedding


async def generate_summary(
    metrics: dict,
    risks: list[dict],
    score: float,
) -> tuple[str, str]:
    """
    Generate a 150-word executive summary via Groq llama-3.3-70b-versatile.
    Returns (summary_text, status) where status is 'ok' or 'failed'.
    """
    client = AsyncGroq(api_key=settings.groq_api_key)

    risk_lines = "\n".join(
        f"- [{r.get('severity', 'medium').upper()}] {r.get('type', '')}: {r.get('message', '')}"
        for r in risks
    ) or "None identified."

    prompt = f"""You are an AI execution advisor for startup founders.
    
Execution Score: {score}/100
Metric Breakdown:
- Velocity Stability: {metrics.get('velocity', 'N/A')}/100
- Scope Control: {metrics.get('scope', 'N/A')}/100
- Review Efficiency: {metrics.get('review', 'N/A')}/100
- Fragmentation Risk: {metrics.get('fragmentation', 'N/A')}/100
- Drift Risk: {metrics.get('drift', 'N/A')}/100

Identified Risks:
{risk_lines}

Write a concise, founder-focused executive summary (150 words max). Be direct, action-oriented, and highlight the most critical issue. Do not use bullet points. Write in plain prose."""

    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
            temperature=0.3,
        )
        summary = response.choices[0].message.content.strip()
        return summary, "ok"
    except Exception as e:
        fallback = (
            f"Execution Score: {score}/100. "
            f"Key risks detected: {', '.join(r.get('type', '') for r in risks[:3]) or 'none'}. "
            "Review detailed breakdown for actionable insights. (AI summary unavailable)"
        )
        return fallback, "failed"
