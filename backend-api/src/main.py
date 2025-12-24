"""Main FastAPI application."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import (
    auth_router,
    connections_router,
    credentials_router,
    health_router,
    notifications_router,
    trust_score_router,
    verification_router,
)
from .core.config import get_settings
from .db import Base, engine

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info("Starting CredVerse API...")

    # Create database tables (in production, use Alembic migrations)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created")

    yield

    # Shutdown
    logger.info("Shutting down CredVerse API...")
    await engine.dispose()


# Create FastAPI application
app = FastAPI(
    title="CredVerse API",
    description="Backend API for CredVerse identity verification and trust scoring",
    version="0.1.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(verification_router)
app.include_router(trust_score_router)
app.include_router(credentials_router)
app.include_router(connections_router)
app.include_router(notifications_router)


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "CredVerse API",
        "version": "0.1.0",
        "status": "running",
        "docs": "/docs",
    }


# Me endpoint (get current user)
@app.get("/me")
async def get_me():
    """Get current authenticated user."""
    # In production, extract user from JWT token
    # For now, return mock user
    return {
        "id": "mock-user-id",
        "email": "demo@credverse.io",
        "name": "Demo User",
        "phone": "+1234567890",
        "trustScore": 78,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug,
    )
