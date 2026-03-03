"""
Analysis Routes:
  POST /analysis/run          – Orchestrate full pipeline, return report_id
  GET  /analysis/report/{id}  – Return full execution report
  POST /analysis/roadmap      – Save roadmap text for a repository

Pipeline:
  1. Fetch PRs from DB
  2. Compute drift (embeddings + cosine similarity)
  3. Compute deterministic scores
  4. Generate AI summary (Groq)
  5. Store execution_report
  6. Return report_id
"""
import uuid
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
import asyncpg
from pydantic import BaseModel

from app.database import get_db
from app.schemas.auth import UserContext
from app.schemas.analysis import RunAnalysisRequest, RunAnalysisResponse, ExecutionReport, ScoreBreakdown
from app.utils.auth import get_current_user
from app.services import scoring_service, drift_service, llm_service

router = APIRouter(prefix="/analysis", tags=["analysis"])


class RoadmapSaveRequest(BaseModel):
    repository_id: str
    organization_id: str
    roadmap_text: str


@router.post("/roadmap")
async def save_roadmap(
    body: RoadmapSaveRequest,
    user: UserContext = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    """Save roadmap text and trigger embedding generation."""
    # Verify org ownership
    org = await db.fetchrow(
        "SELECT id FROM organizations WHERE id = $1 AND owner_id = $2",
        body.organization_id, user.user_id,
    )
    if not org:
        raise HTTPException(status_code=403, detail="Access denied")

    roadmap_id = str(uuid.uuid4())
    embedding = await llm_service.generate_embedding(body.roadmap_text, db)

    await db.execute(
        """
        INSERT INTO roadmaps (id, repository_id, organization_id, roadmap_text, embedding, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        """,
        roadmap_id,
        body.repository_id,
        body.organization_id,
        body.roadmap_text,
        json.dumps(embedding),
    )
    return {"roadmap_id": roadmap_id, "status": "saved"}


@router.post("/run", response_model=RunAnalysisResponse)
async def run_analysis(
    body: RunAnalysisRequest,
    user: UserContext = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    """
    Orchestrate the full RevFlo analysis pipeline.
    Returns report_id immediately after storing the report.
    """
    org_id = body.organization_id

    # Validate org ownership
    org = await db.fetchrow(
        "SELECT id FROM organizations WHERE id = $1 AND owner_id = $2",
        org_id, user.user_id,
    )
    if not org:
        raise HTTPException(status_code=403, detail="Organization not found or access denied")

    # ── Step 1: Fetch PRs from DB ─────────────────────────────────────────────
    if body.repository_id:
        pr_rows = await db.fetch(
            """
            SELECT p.* FROM pull_requests p
            JOIN repositories r ON r.id = p.repository_id
            WHERE r.organization_id = $1
              AND p.repository_id = $2
              AND p.created_at > NOW() - INTERVAL '30 days'
            ORDER BY p.created_at DESC
            """,
            org_id, body.repository_id,
        )
    else:
        pr_rows = await db.fetch(
            """
            SELECT p.* FROM pull_requests p
            JOIN repositories r ON r.id = p.repository_id
            WHERE r.organization_id = $1
              AND p.created_at > NOW() - INTERVAL '30 days'
            ORDER BY p.created_at DESC
            """,
            org_id,
        )

    prs = [dict(r) for r in pr_rows]

    # ── Step 2: Fetch Roadmap ─────────────────────────────────────────────────
    roadmap_row = await db.fetchrow(
        """
        SELECT roadmap_text FROM roadmaps
        WHERE organization_id = $1
        ORDER BY created_at DESC LIMIT 1
        """,
        org_id,
    )
    roadmap_text = roadmap_row["roadmap_text"] if roadmap_row else ""

    # ── Step 3: Compute Drift ─────────────────────────────────────────────────
    drift_result = await drift_service.detect_drift(
        roadmap_text=roadmap_text,
        prs=prs,
        db=db,
    )
    aligned_count = drift_result["aligned_count"]
    drift_ratio = drift_result["drift_ratio"]
    misaligned_prs = drift_result["misaligned_prs"]
    new_clusters = drift_result["new_clusters"]

    # ── Step 4: Compute Scores ────────────────────────────────────────────────
    v_score, v_risk = scoring_service.velocity_score(prs)
    s_score, s_risk = scoring_service.scope_score(prs, aligned_count)
    r_score, r_risk = scoring_service.review_score(prs)
    f_score, f_risk = scoring_service.fragmentation_score(prs)
    d_score, d_risk = scoring_service.drift_score(drift_ratio)

    breakdown = ScoreBreakdown(
        velocity=v_score,
        scope=s_score,
        review=r_score,
        fragmentation=f_score,
        drift=d_score,
    )
    final_score = scoring_service.compute_execution_score(breakdown)

    # Collect risk items (filter out Nones)
    risks_raw = [r for r in [v_risk, s_risk, r_risk, f_risk, d_risk] if r is not None]
    risks_dicts = [r.model_dump() for r in risks_raw]

    # ── Step 5: Generate AI Summary ───────────────────────────────────────────
    summary, summary_status = await llm_service.generate_summary(
        metrics=breakdown.model_dump(),
        risks=risks_dicts,
        score=final_score,
    )

    # ── Step 6: Store Execution Report ────────────────────────────────────────
    report_id = str(uuid.uuid4())
    await db.execute(
        """
        INSERT INTO execution_reports (
            id, organization_id, repository_id,
            score, velocity, scope, review, fragmentation, drift,
            summary, summary_status,
            risks, misaligned_prs, new_clusters,
            created_at
        ) VALUES (
            $1, $2, $3,
            $4, $5, $6, $7, $8, $9,
            $10, $11,
            $12, $13, $14,
            NOW()
        )
        """,
        report_id,
        org_id,
        body.repository_id,
        final_score,
        v_score, s_score, r_score, f_score, d_score,
        summary,
        summary_status,
        json.dumps(risks_dicts),
        json.dumps(misaligned_prs),
        json.dumps(new_clusters),
    )

    # ── Step 7: Return report_id ──────────────────────────────────────────────
    return RunAnalysisResponse(report_id=report_id)


@router.get("/report/{report_id}")
async def get_report(
    report_id: str,
    user: UserContext = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    """Return a full execution report by ID."""
    row = await db.fetchrow(
        """
        SELECT r.* FROM execution_reports r
        JOIN organizations o ON o.id = r.organization_id
        WHERE r.id = $1 AND o.owner_id = $2
        """,
        report_id, user.user_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Report not found")

    data = dict(row)
    return {
        "id": data["id"],
        "score": data["score"],
        "breakdown": {
            "velocity": data["velocity"],
            "scope": data["scope"],
            "review": data["review"],
            "fragmentation": data["fragmentation"],
            "drift": data["drift"],
        },
        "summary": data["summary"],
        "summary_status": data["summary_status"],
        "risks": json.loads(data["risks"] or "[]"),
        "misaligned_prs": json.loads(data["misaligned_prs"] or "[]"),
        "new_clusters": json.loads(data["new_clusters"] or "[]"),
        "created_at": data["created_at"].isoformat() if data.get("created_at") else None,
        "organization_id": data["organization_id"],
        "repository_id": data.get("repository_id"),
    }
