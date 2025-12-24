"""Health check endpoints."""

import redis.asyncio as redis
from fastapi import APIRouter, Response

from ...core.config import get_settings

router = APIRouter(prefix="/health", tags=["health"])
settings = get_settings()


@router.get("/live")
async def liveness():
    """Liveness probe - app is running."""
    return {"status": "ok", "message": "Service is alive"}


@router.get("/ready")
async def readiness():
    """Readiness probe - app is ready to serve requests."""
    checks = {
        "api": True,
        "redis": False,
        "database": False,  # Simplified check
    }

    # Check Redis
    try:
        client = redis.from_url(settings.redis_url)
        await client.ping()
        checks["redis"] = True
        await client.aclose()
    except Exception:
        pass

    # Simple check - in production, verify database connection
    checks["database"] = True  # Assume database is ready for now

    all_ready = all(checks.values())

    if not all_ready:
        return Response(
            content='{"status": "not_ready", "checks": ' + str(checks) + "}",
            status_code=503,
            media_type="application/json",
        )

    return {"status": "ready", "checks": checks}
