"""
Scoring Service: Deterministic execution metric computation.
No LLM used here.

Formula:
  score = 0.30*velocity + 0.25*scope + 0.20*review + 0.15*fragmentation + 0.10*drift
"""
import math
from typing import Optional
from app.schemas.analysis import ScoreBreakdown, RiskItem


# ──────────────────────────────────────────────────────────────────────────────
# Individual metric functions
# ──────────────────────────────────────────────────────────────────────────────

def velocity_score(prs: list[dict]) -> tuple[float, Optional[RiskItem]]:
    """
    Velocity Stability: measures how consistent PR shipping is.
    Groups PRs by week, computes std deviation, normalizes to 0-100.
    High variance → low score.
    """
    if not prs:
        return 50.0, None

    from datetime import datetime, timezone
    from collections import defaultdict

    weekly: dict[int, int] = defaultdict(int)
    for pr in prs:
        created = pr.get("created_at")
        if isinstance(created, str):
            dt = datetime.fromisoformat(created.replace("Z", "+00:00"))
        elif hasattr(created, "isocalendar"):
            dt = created
        else:
            continue
        week = dt.isocalendar()[1]
        weekly[week] += 1

    counts = list(weekly.values())
    if len(counts) < 2:
        return 80.0, None

    mean = sum(counts) / len(counts)
    variance = sum((c - mean) ** 2 for c in counts) / len(counts)
    std_dev = math.sqrt(variance)

    # Normalize: if std_dev is 0, perfect; cap at 10 for normalization
    normalized_std = min(std_dev / 10.0, 1.0)
    score = round((1 - normalized_std) * 100, 2)

    risk = None
    if score < 50:
        risk = RiskItem(
            type="velocity",
            severity="high",
            message=f"PR shipping is highly erratic (std dev: {std_dev:.1f} PRs/week). Consider enforcing a regular cadence."
        )
    elif score < 70:
        risk = RiskItem(
            type="velocity",
            severity="medium",
            message="PR velocity shows some inconsistency. Monitor for burnout or blocking issues."
        )

    return score, risk


def scope_score(prs: list[dict], aligned_count: int) -> tuple[float, Optional[RiskItem]]:
    """
    Scope Control: % of PRs aligned with roadmap.
    scope_score = 100 - (misaligned_ratio * 100)
    """
    if not prs:
        return 75.0, None

    total = len(prs)
    misaligned = total - aligned_count
    misaligned_ratio = misaligned / total
    score = round(max(0.0, 100.0 - (misaligned_ratio * 100)), 2)

    risk = None
    if score < 50:
        risk = RiskItem(
            type="scope",
            severity="high",
            message=f"{misaligned}/{total} PRs are not aligned with the roadmap. Significant scope drift detected."
        )
    elif score < 70:
        risk = RiskItem(
            type="scope",
            severity="medium",
            message=f"{misaligned}/{total} PRs show partial scope misalignment. Review roadmap adherence."
        )

    return score, risk


def review_score(prs: list[dict]) -> tuple[float, Optional[RiskItem]]:
    """
    Review Efficiency: normalized avg review time.
    review_score = 100 - normalized_review_time
    Baseline: 0h → 100, 48h+ → 0
    """
    times = []
    for pr in prs:
        # review_time_hours already computed, or derive from created/merged
        rth = pr.get("review_time_hours")
        if rth is not None:
            times.append(float(rth))
        elif pr.get("merged_at") and pr.get("created_at"):
            from datetime import datetime
            def parse(s):
                return datetime.fromisoformat(str(s).replace("Z", "+00:00"))
            delta = (parse(pr["merged_at"]) - parse(pr["created_at"])).total_seconds() / 3600
            if delta >= 0:
                times.append(delta)

    if not times:
        return 70.0, None

    avg_hours = sum(times) / len(times)
    # Normalize to 0-48h window
    normalized = min(avg_hours / 48.0, 1.0)
    score = round((1 - normalized) * 100, 2)

    risk = None
    if avg_hours > 24:
        risk = RiskItem(
            type="review",
            severity="high",
            message=f"Average PR review time is {avg_hours:.1f}h. Reviews are bottlenecking delivery."
        )
    elif avg_hours > 12:
        risk = RiskItem(
            type="review",
            severity="medium",
            message=f"Average PR review time is {avg_hours:.1f}h. Consider setting review SLAs."
        )

    return score, risk


def fragmentation_score(prs: list[dict]) -> tuple[float, Optional[RiskItem]]:
    """
    Fragmentation Risk: burst of small PRs (<50 LOC).
    fragmentation_score = 100 - burst_ratio*100
    """
    if not prs:
        return 80.0, None

    small_prs = [
        p for p in prs
        if (p.get("additions", 0) + p.get("deletions", 0)) < 50
    ]
    burst_ratio = len(small_prs) / len(prs)
    score = round(max(0.0, 100.0 - (burst_ratio * 100)), 2)

    risk = None
    if burst_ratio > 0.6:
        risk = RiskItem(
            type="fragmentation",
            severity="high",
            message=f"{len(small_prs)}/{len(prs)} PRs are <50 LOC. High fragmentation may indicate micro-task overhead."
        )
    elif burst_ratio > 0.4:
        risk = RiskItem(
            type="fragmentation",
            severity="medium",
            message=f"{len(small_prs)}/{len(prs)} PRs are very small. Monitor for excessive task splitting."
        )

    return score, risk


def drift_score(drift_ratio: float) -> tuple[float, Optional[RiskItem]]:
    """
    Drift Risk: % new semantic clusters from roadmap.
    drift_score = 100 - drift_ratio*100
    """
    score = round(max(0.0, 100.0 - (drift_ratio * 100)), 2)

    risk = None
    if drift_ratio > 0.4:
        risk = RiskItem(
            type="drift",
            severity="high",
            message=f"{drift_ratio*100:.0f}% of PR themes are outside the roadmap. Major scope drift detected."
        )
    elif drift_ratio > 0.2:
        risk = RiskItem(
            type="drift",
            severity="medium",
            message=f"{drift_ratio*100:.0f}% of PR themes are off-roadmap. Review prioritization."
        )

    return score, risk


# ──────────────────────────────────────────────────────────────────────────────
# Aggregate
# ──────────────────────────────────────────────────────────────────────────────

def compute_execution_score(breakdown: ScoreBreakdown) -> float:
    """
    Weighted aggregate score per spec:
    0.30*V + 0.25*S + 0.20*R + 0.15*F + 0.10*D
    """
    score = (
        0.30 * breakdown.velocity
        + 0.25 * breakdown.scope
        + 0.20 * breakdown.review
        + 0.15 * breakdown.fragmentation
        + 0.10 * breakdown.drift
    )
    return round(score, 2)
