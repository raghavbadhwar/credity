"""Connections endpoints."""

from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...db import get_session
from ...db.models import Connection, ConnectionStatus
from ...services.webhooks import receive_webhook

router = APIRouter(prefix="/connections", tags=["connections"])


class ConnectionResponse(BaseModel):
    id: str
    platform: str
    status: str
    sharedCredentials: list[str]
    lastAccessedAt: str
    expiresAt: str | None = None


class SuccessResponse(BaseModel):
    success: bool


# Helper to get user_id (in production, from auth header)
def get_mock_user_id() -> str:
    return "mock-user-id"


# Mock connections for demo
MOCK_ACTIVE_CONNECTIONS = [
    {
        "id": "1",
        "platform": "TechCorp Inc.",
        "status": "active",
        "sharedCredentials": ["Email Verification", "Phone Verification"],
        "lastAccessedAt": "2024-12-23T10:00:00Z",
        "expiresAt": None,
    },
    {
        "id": "2",
        "platform": "StartupXYZ",
        "status": "active",
        "sharedCredentials": ["Email Verification"],
        "lastAccessedAt": "2024-12-20T14:30:00Z",
        "expiresAt": None,
    },
]

MOCK_PENDING_CONNECTIONS = [
    {
        "id": "3",
        "platform": "FinanceApp",
        "status": "pending",
        "sharedCredentials": ["Government ID", "Phone Verification"],
        "lastAccessedAt": datetime.now(timezone.utc).isoformat(),
        "expiresAt": None,
    },
]


@router.get("", response_model=list[ConnectionResponse])
async def list_connections(session: AsyncSession = Depends(get_session)):
    """List all active connections for the authenticated user."""
    user_id = get_mock_user_id()

    # Try database first
    result = await session.execute(
        select(Connection).where(
            Connection.user_id == user_id,
            Connection.status == ConnectionStatus.ACTIVE.value,
        )
    )
    connections = result.scalars().all()

    if connections:
        return [ConnectionResponse(**conn.to_dict()) for conn in connections]

    # Return mock data
    return [ConnectionResponse(**conn) for conn in MOCK_ACTIVE_CONNECTIONS]


@router.get("/pending", response_model=list[ConnectionResponse])
async def list_pending_connections(session: AsyncSession = Depends(get_session)):
    """List all pending connection requests."""
    user_id = get_mock_user_id()

    # Try database first
    result = await session.execute(
        select(Connection).where(
            Connection.user_id == user_id,
            Connection.status == ConnectionStatus.PENDING.value,
        )
    )
    connections = result.scalars().all()

    if connections:
        return [ConnectionResponse(**conn.to_dict()) for conn in connections]

    # Return mock data
    return [ConnectionResponse(**conn) for conn in MOCK_PENDING_CONNECTIONS]


@router.post("/{connection_id}/approve", response_model=ConnectionResponse)
async def approve_connection(
    connection_id: str, session: AsyncSession = Depends(get_session)
):
    """Approve a pending connection request."""
    user_id = get_mock_user_id()

    # Try database first
    result = await session.execute(
        select(Connection).where(
            Connection.id == connection_id,
            Connection.user_id == user_id,
        )
    )
    connection = result.scalar_one_or_none()

    if connection:
        if connection.status != ConnectionStatus.PENDING.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Connection is not pending",
            )
        connection.status = ConnectionStatus.ACTIVE.value
        connection.last_accessed_at = datetime.now(timezone.utc)
        await session.commit()
        await session.refresh(connection)
        return ConnectionResponse(**connection.to_dict())

    # Check mock data
    mock_conn = next(
        (c for c in MOCK_PENDING_CONNECTIONS if c["id"] == connection_id), None
    )
    if mock_conn:
        approved = {**mock_conn, "status": "active"}
        return ConnectionResponse(**approved)

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Connection not found",
    )


@router.post("/{connection_id}/deny", response_model=SuccessResponse)
async def deny_connection(
    connection_id: str, session: AsyncSession = Depends(get_session)
):
    """Deny a pending connection request or revoke an active connection."""
    user_id = get_mock_user_id()

    # Try database first
    result = await session.execute(
        select(Connection).where(
            Connection.id == connection_id,
            Connection.user_id == user_id,
        )
    )
    connection = result.scalar_one_or_none()

    if connection:
        connection.status = ConnectionStatus.REVOKED.value
        await session.commit()
        return SuccessResponse(success=True)

    # Check mock data
    mock_conn = next(
        (c for c in MOCK_PENDING_CONNECTIONS + MOCK_ACTIVE_CONNECTIONS if c["id"] == connection_id),
        None,
    )
    if mock_conn:
        return SuccessResponse(success=True)

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Connection not found",
    )


# Webhook receiver endpoint
@router.post("/webhooks")
async def receive_connection_webhook(payload: dict[str, Any]):
    """Receive webhook from external platform."""
    result = await receive_webhook(payload)
    return result
