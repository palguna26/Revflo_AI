import asyncpg
from typing import AsyncGenerator
from app.config import get_settings

settings = get_settings()

_pool: asyncpg.Pool | None = None


async def create_pool() -> asyncpg.Pool:
    """Create the asyncpg connection pool."""
    global _pool
    _pool = await asyncpg.create_pool(
        dsn=settings.database_url,
        min_size=2,
        max_size=10,
        command_timeout=60,
    )
    return _pool


async def close_pool() -> None:
    """Close the asyncpg connection pool."""
    global _pool
    if _pool:
        await _pool.close()
        _pool = None


async def get_db() -> AsyncGenerator[asyncpg.Connection, None]:
    """FastAPI dependency: yields a DB connection from the pool."""
    global _pool
    if _pool is None:
        raise RuntimeError("Database pool not initialized")
    async with _pool.acquire() as connection:
        yield connection
