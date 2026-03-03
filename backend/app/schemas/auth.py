from pydantic import BaseModel
from typing import Optional


class UserContext(BaseModel):
    user_id: str
    email: Optional[str] = None
    organization_id: Optional[str] = None
