"""
GitHub Routes:
  POST /github/callback  – OAuth code exchange
  POST /github/webhook   – Webhook ingestion (X-Hub-Signature-256 validated)
"""
import hashlib
import hmac
import json
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from fastapi.responses import JSONResponse
import asyncpg

from app.database import get_db
from app.schemas.github import GitHubCallbackRequest
from app.schemas.auth import UserContext
from app.utils.auth import get_current_user
from app.services import github_service
from app.config import get_settings

router = APIRouter(prefix="/github", tags=["github"])
settings = get_settings()


@router.post("/callback")
async def github_callback(
    body: GitHubCallbackRequest,
    user: UserContext = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    """
    Exchange GitHub OAuth code for an access token.
    Store encrypted token. Fetch and store repositories.
    """
    # Ensure the user owns the org
    org = await db.fetchrow(
        "SELECT id FROM organizations WHERE id = $1 AND owner_id = $2",
        body.organization_id, user.user_id,
    )
    if not org:
        raise HTTPException(status_code=403, detail="Organization not found or access denied")

    # Exchange code for token
    try:
        token = await github_service.exchange_code_for_token(body.code)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Fetch GitHub user info
    import httpx
    async with httpx.AsyncClient() as client:
        r = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json"},
        )
        r.raise_for_status()
        gh_user = r.json()

    # Store encrypted token
    await github_service.store_github_connection(
        org_id=body.organization_id,
        token=token,
        github_user=gh_user.get("login", ""),
        db=db,
    )

    # Fetch and store repositories
    repos = await github_service.fetch_repositories(token)
    await github_service.store_repositories(
        org_id=body.organization_id,
        repos=repos,
        db=db,
    )

    return {"status": "connected", "repos_found": len(repos)}


@router.post("/webhook")
async def github_webhook(
    request: Request,
    x_hub_signature_256: str = Header(None, alias="X-Hub-Signature-256"),
    x_github_event: str = Header(None, alias="X-GitHub-Event"),
    db: asyncpg.Connection = Depends(get_db),
):
    """
    Receive GitHub webhook events. Validates signature, then ingests
    pull_request, push, and pull_request_review events.
    """
    raw_body = await request.body()

    # ── Validate signature ────────────────────────────────────────────────────
    if not x_hub_signature_256:
        raise HTTPException(status_code=400, detail="Missing X-Hub-Signature-256")

    expected = "sha256=" + hmac.new(
        settings.github_webhook_secret.encode(),
        raw_body,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected, x_hub_signature_256):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")

    # ── Parse payload ─────────────────────────────────────────────────────────
    try:
        payload = json.loads(raw_body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event = x_github_event or "unknown"
    repo_full_name = payload.get("repository", {}).get("full_name", "")

    # Look up repository in DB by full_name
    repo_row = await db.fetchrow(
        "SELECT id FROM repositories WHERE full_name = $1",
        repo_full_name,
    )
    if not repo_row:
        # Unknown repo – accept but ignore (200 OK per GitHub webhook best practices)
        return JSONResponse({"status": "ignored", "reason": "repo not found"})

    repo_id = str(repo_row["id"])

    # ── Handle events ─────────────────────────────────────────────────────────
    if event == "pull_request":
        pr_data = payload.get("pull_request", {})
        await github_service.upsert_pull_request(pr_data, repo_id, db)

    elif event == "push":
        commits = payload.get("commits", [])
        for commit in commits:
            await github_service.upsert_commit(commit, repo_id, None, db)

    elif event == "pull_request_review":
        # Store review timing data – update PR's review_time_hours if merged
        pass  # Future: update review_time_hours on the PR

    return JSONResponse({"status": "ok", "event": event})
