"""
RevFlo FastAPI Application Entry Point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import create_pool, close_pool
from app.routes import auth, github, analysis
from app.config import get_settings

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle."""
    await create_pool()
    yield
    await close_pool()


app = FastAPI(
    title="RevFlo API",
    description="AI-powered execution audit system for startup founders.",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(github.router)
app.include_router(analysis.router)


@app.get("/")
async def health_check():
    return {"status": "ok", "service": "RevFlo API"}
