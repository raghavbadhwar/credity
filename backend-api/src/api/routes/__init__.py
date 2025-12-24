"""API routes exports."""

from .auth import router as auth_router
from .connections import router as connections_router
from .credentials import router as credentials_router
from .health import router as health_router
from .notifications import router as notifications_router
from .trust_score import router as trust_score_router
from .verification import router as verification_router

__all__ = [
    "auth_router",
    "health_router",
    "verification_router",
    "trust_score_router",
    "credentials_router",
    "connections_router",
    "notifications_router",
]
