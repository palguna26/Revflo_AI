from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt, JWTError
from app.config import get_settings
from app.schemas.auth import UserContext

settings = get_settings()
security = HTTPBearer()


def verify_jwt(token: str) -> dict:
    """
    Verify a Supabase-issued JWT.
    Supabase uses HS256 with the jwt_secret from project settings.
    """
    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> UserContext:
    """
    FastAPI dependency: extracts and validates JWT, returns UserContext.
    Attach to any protected route with: user=Depends(get_current_user)
    """
    token = credentials.credentials
    payload = verify_jwt(token)

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token missing subject")

    email = payload.get("email")

    return UserContext(user_id=user_id, email=email)
