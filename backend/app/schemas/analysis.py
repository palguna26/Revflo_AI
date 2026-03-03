from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ScoreBreakdown(BaseModel):
    velocity: float
    scope: float
    review: float
    fragmentation: float
    drift: float


class RiskItem(BaseModel):
    type: str
    severity: str  # low | medium | high
    message: str


class RunAnalysisRequest(BaseModel):
    organization_id: str
    repository_id: Optional[str] = None


class RunAnalysisResponse(BaseModel):
    report_id: str


class ExecutionReport(BaseModel):
    id: str
    organization_id: str
    repository_id: Optional[str] = None
    score: float
    breakdown: ScoreBreakdown
    summary: str
    summary_status: str  # ok | failed
    risks: list[RiskItem]
    created_at: datetime


class DriftResult(BaseModel):
    misaligned_prs: list[dict]   # [{pr_id, title, similarity}]
    drift_ratio: float
    new_clusters: list[str]
