"""
Auth Routes: JWT validation dependency is in utils/auth.py.
This route file provides org management endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException
import asyncpg
from pydantic import BaseModel

from app.database import get_db
from app.schemas.auth import UserContext
from app.utils.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


class CreateOrgRequest(BaseModel):
    name: str


@router.get("/me")
async def get_me(
    user: UserContext = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    """Return current user's profile and organization."""
    org = await db.fetchrow(
        "SELECT id, name FROM organizations WHERE owner_id = $1 LIMIT 1",
        user.user_id,
    )
    return {
        "user_id": user.user_id,
        "email": user.email,
        "organization": dict(org) if org else None,
    }


@router.post("/org")
async def create_org(
    body: CreateOrgRequest,
    user: UserContext = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    """Create an organization for the current user."""
    existing = await db.fetchrow(
        "SELECT id FROM organizations WHERE owner_id = $1",
        user.user_id,
    )
    if existing:
        raise HTTPException(status_code=409, detail="Organization already exists")

    import uuid
    org_id = str(uuid.uuid4())
    await db.execute(
        "INSERT INTO organizations (id, name, owner_id, created_at) VALUES ($1, $2, $3, NOW())",
        org_id, body.name, user.user_id,
    )
    return {"organization_id": org_id, "name": body.name}
