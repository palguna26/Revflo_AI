"""
GitHub Service: OAuth token exchange, repo fetching, and DB persistence.
"""
import httpx
import asyncpg
from typing import Optional
from app.config import get_settings
from app.utils.crypto import encrypt_token, decrypt_token

settings = get_settings()

GITHUB_API = "https://api.github.com"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"


async def exchange_code_for_token(code: str) -> str:
    """Exchange GitHub OAuth code for an access token."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            GITHUB_TOKEN_URL,
            json={
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "code": code,
            },
            headers={"Accept": "application/json"},
            timeout=10.0,
        )
        response.raise_for_status()
        data = response.json()

    if "error" in data:
        raise ValueError(f"GitHub OAuth error: {data.get('error_description', data['error'])}")

    return data["access_token"]


async def fetch_repositories(token: str) -> list[dict]:
    """Fetch all repositories accessible to the token."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{GITHUB_API}/user/repos",
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github+json",
            },
            params={"per_page": 100, "sort": "updated"},
            timeout=10.0,
        )
        response.raise_for_status()
        return response.json()


async def fetch_pull_requests(token: str, owner: str, repo: str, days: int = 30) -> list[dict]:
    """Fetch recent pull requests for a repository."""
    from datetime import datetime, timedelta, timezone
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

    prs = []
    page = 1
    async with httpx.AsyncClient() as client:
        while True:
            response = await client.get(
                f"{GITHUB_API}/repos/{owner}/{repo}/pulls",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Accept": "application/vnd.github+json",
                },
                params={"state": "all", "per_page": 100, "page": page, "sort": "created", "direction": "desc"},
                timeout=15.0,
            )
            response.raise_for_status()
            batch = response.json()
            if not batch:
                break
            for pr in batch:
                created = pr.get("created_at", "")
                if created < since:
                    return prs
                prs.append(pr)
            page += 1
    return prs


async def store_github_connection(
    org_id: str,
    token: str,
    github_user: str,
    db: asyncpg.Connection,
) -> None:
    """Store encrypted GitHub token for an organization."""
    encrypted = encrypt_token(token)
    await db.execute(
        """
        INSERT INTO github_connections (organization_id, encrypted_token, github_user, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        ON CONFLICT (organization_id)
        DO UPDATE SET encrypted_token = $2, github_user = $3, updated_at = NOW()
        """,
        org_id, encrypted, github_user,
    )


async def get_decrypted_token(org_id: str, db: asyncpg.Connection) -> Optional[str]:
    """Retrieve and decrypt the GitHub token for an organization."""
    row = await db.fetchrow(
        "SELECT encrypted_token FROM github_connections WHERE organization_id = $1",
        org_id,
    )
    if not row:
        return None
    return decrypt_token(row["encrypted_token"])


async def store_repositories(
    org_id: str,
    repos: list[dict],
    db: asyncpg.Connection,
) -> None:
    """Upsert GitHub repositories for an organization."""
    for repo in repos:
        await db.execute(
            """
            INSERT INTO repositories (id, name, full_name, private, organization_id, installed, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, false, NOW(), NOW())
            ON CONFLICT (id) DO UPDATE
            SET name = $2, full_name = $3, private = $4, updated_at = NOW()
            """,
            str(repo["id"]), repo["name"], repo["full_name"], repo["private"], org_id,
        )


async def upsert_pull_request(pr_data: dict, repo_id: str, db: asyncpg.Connection) -> None:
    """Insert or update a pull request record."""
    from datetime import datetime

    def parse_dt(s):
        if not s:
            return None
        return datetime.fromisoformat(s.replace("Z", "+00:00"))

    await db.execute(
        """
        INSERT INTO pull_requests (
            id, number, title, body, state, author,
            created_at, merged_at, closed_at,
            additions, deletions, changed_files, repository_id
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        ON CONFLICT (id) DO UPDATE SET
            state = $5, merged_at = $8, closed_at = $9, updated_at = NOW()
        """,
        str(pr_data["id"]),
        pr_data["number"],
        pr_data["title"],
        pr_data.get("body"),
        pr_data["state"],
        pr_data["user"]["login"],
        parse_dt(pr_data.get("created_at")),
        parse_dt(pr_data.get("merged_at")),
        parse_dt(pr_data.get("closed_at")),
        pr_data.get("additions", 0),
        pr_data.get("deletions", 0),
        pr_data.get("changed_files", 0),
        repo_id,
    )


async def upsert_commit(commit_data: dict, repo_id: str, pr_id: Optional[str], db: asyncpg.Connection) -> None:
    """Insert or update a commit record."""
    from datetime import datetime
    ts = commit_data.get("timestamp", commit_data.get("author", {}).get("date", ""))
    timestamp = datetime.fromisoformat(ts.replace("Z", "+00:00")) if ts else None

    await db.execute(
        """
        INSERT INTO commits (sha, message, author, timestamp, repository_id, pull_request_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (sha) DO NOTHING
        """,
        commit_data.get("id", commit_data.get("sha", "")),
        commit_data.get("message", ""),
        commit_data.get("author", {}).get("name", "unknown"),
        timestamp,
        repo_id,
        pr_id,
    )
