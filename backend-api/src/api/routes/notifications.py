"""Notifications endpoints."""


from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...db import get_session
from ...db.models import Notification

router = APIRouter(prefix="/notifications", tags=["notifications"])


class NotificationResponse(BaseModel):
    id: str
    type: str
    title: str
    body: str
    createdAt: str
    read: bool


class SuccessResponse(BaseModel):
    success: bool


# Helper to get user_id (in production, from auth header)
def get_mock_user_id() -> str:
    return "mock-user-id"


# Mock notifications for demo
MOCK_NOTIFICATIONS = [
    {
        "id": "1",
        "type": "info",
        "title": "Verification Complete",
        "body": "Your email verification has been completed successfully.",
        "createdAt": "2024-12-23T10:00:00Z",
        "read": False,
    },
    {
        "id": "2",
        "type": "warning",
        "title": "Credential Expiring",
        "body": "Your Government ID credential will expire in 7 days.",
        "createdAt": "2024-12-22T14:00:00Z",
        "read": True,
    },
    {
        "id": "3",
        "type": "success",
        "title": "Trust Score Improved",
        "body": "Your trust score has increased by 5 points!",
        "createdAt": "2024-12-21T09:00:00Z",
        "read": True,
    },
]


@router.get("", response_model=list[NotificationResponse])
async def list_notifications(session: AsyncSession = Depends(get_session)):
    """List all notifications for the authenticated user."""
    user_id = get_mock_user_id()

    # Try database first
    result = await session.execute(
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
    )
    notifications = result.scalars().all()

    if notifications:
        return [NotificationResponse(**notif.to_dict()) for notif in notifications]

    # Return mock data
    return [NotificationResponse(**notif) for notif in MOCK_NOTIFICATIONS]


@router.post("/{notification_id}/read", response_model=SuccessResponse)
async def mark_notification_read(
    notification_id: str, session: AsyncSession = Depends(get_session)
):
    """Mark a notification as read."""
    user_id = get_mock_user_id()

    # Try database first
    result = await session.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == user_id,
        )
    )
    notification = result.scalar_one_or_none()

    if notification:
        notification.read = True
        await session.commit()
        return SuccessResponse(success=True)

    # Check mock data
    mock_notif = next(
        (n for n in MOCK_NOTIFICATIONS if n["id"] == notification_id), None
    )
    if mock_notif:
        return SuccessResponse(success=True)

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Notification not found",
    )
