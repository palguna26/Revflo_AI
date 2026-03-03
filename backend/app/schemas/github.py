from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PullRequestSchema(BaseModel):
    id: str
    number: int
    title: str
    body: Optional[str] = None
    state: str  # open | closed | merged
    author: str
    created_at: datetime
    merged_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    additions: int = 0
    deletions: int = 0
    changed_files: int = 0
    review_time_hours: Optional[float] = None
    repository_id: str


class CommitSchema(BaseModel):
    sha: str
    message: str
    author: str
    timestamp: datetime
    repository_id: str
    pull_request_id: Optional[str] = None


class RepositorySchema(BaseModel):
    id: str
    name: str
    full_name: str
    private: bool
    organization_id: str
    installed: bool = False


class GitHubCallbackRequest(BaseModel):
    code: str
    organization_id: str


class WebhookPR(BaseModel):
    """Normalized GitHub webhook PR payload."""
    action: str
    number: int
    title: str
    body: Optional[str] = None
    state: str
    author: str
    created_at: str
    merged_at: Optional[str] = None
    closed_at: Optional[str] = None
    additions: int = 0
    deletions: int = 0
    changed_files: int = 0
    repository_full_name: str


class WebhookPush(BaseModel):
    """Normalized GitHub webhook push payload."""
    ref: str
    commits: list[dict]
    repository_full_name: str
