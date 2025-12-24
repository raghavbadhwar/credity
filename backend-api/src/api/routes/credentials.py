"""Credentials endpoints."""

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...db import get_session
from ...db.models import Credential, CredentialStatus
from ...services.sharing import create_share_token

router = APIRouter(prefix="/credentials", tags=["credentials"])


class CredentialResponse(BaseModel):
    id: str
    name: str
    type: str
    status: str
    issuedAt: str
    expiresAt: Optional[str] = None
    usageCount: int
    lastUsedAt: Optional[str] = None


class ShareResponse(BaseModel):
    shareId: str
    qrPayload: str


class SuccessResponse(BaseModel):
    success: bool


# Helper to get user_id (in production, from auth header)
def get_mock_user_id() -> str:
    return "mock-user-id"


# Mock credentials for demo
MOCK_CREDENTIALS = [
    {
        "id": "1",
        "name": "Email Verification",
        "type": "email",
        "status": "active",
        "issuedAt": "2024-01-15T10:00:00Z",
        "expiresAt": "2025-01-15T10:00:00Z",
        "usageCount": 5,
        "lastUsedAt": "2024-12-20T15:30:00Z",
    },
    {
        "id": "2",
        "name": "Phone Verification",
        "type": "phone",
        "status": "active",
        "issuedAt": "2024-02-20T14:00:00Z",
        "expiresAt": None,
        "usageCount": 3,
        "lastUsedAt": "2024-12-18T09:00:00Z",
    },
    {
        "id": "3",
        "name": "Government ID",
        "type": "document",
        "status": "expired",
        "issuedAt": "2023-01-01T00:00:00Z",
        "expiresAt": "2024-01-01T00:00:00Z",
        "usageCount": 10,
        "lastUsedAt": None,
    },
]


@router.get("", response_model=list[CredentialResponse])
async def list_credentials(session: AsyncSession = Depends(get_session)):
    """List all credentials for the authenticated user."""
    user_id = get_mock_user_id()

    # Try to get from database first
    result = await session.execute(
        select(Credential).where(Credential.user_id == user_id)
    )
    credentials = result.scalars().all()

    if credentials:
        return [
            CredentialResponse(**cred.to_dict()) for cred in credentials
        ]

    # Return mock data if no credentials in database
    return [CredentialResponse(**cred) for cred in MOCK_CREDENTIALS]


@router.get("/{credential_id}", response_model=CredentialResponse)
async def get_credential(
    credential_id: str, session: AsyncSession = Depends(get_session)
):
    """Get a specific credential by ID."""
    user_id = get_mock_user_id()

    # Try database first
    result = await session.execute(
        select(Credential).where(
            Credential.id == credential_id,
            Credential.user_id == user_id,
        )
    )
    credential = result.scalar_one_or_none()

    if credential:
        return CredentialResponse(**credential.to_dict())

    # Check mock data
    for cred in MOCK_CREDENTIALS:
        if cred["id"] == credential_id:
            return CredentialResponse(**cred)

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Credential not found",
    )


@router.post("/{credential_id}/share", response_model=ShareResponse)
async def share_credential(
    credential_id: str, session: AsyncSession = Depends(get_session)
):
    """Generate a share token for a credential (5-minute TTL)."""
    user_id = get_mock_user_id()

    # Verify credential exists and is active
    # Check database first
    result = await session.execute(
        select(Credential).where(
            Credential.id == credential_id,
            Credential.user_id == user_id,
        )
    )
    credential = result.scalar_one_or_none()

    if credential:
        if credential.status != CredentialStatus.ACTIVE.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot share inactive credential",
            )
        # Update usage count
        credential.usage_count += 1
        credential.last_used_at = datetime.now(timezone.utc)
        await session.commit()
    else:
        # Check mock data
        mock_cred = next(
            (c for c in MOCK_CREDENTIALS if c["id"] == credential_id), None
        )
        if not mock_cred:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Credential not found",
            )
        if mock_cred["status"] != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot share inactive credential",
            )

    # Create share token with 5-minute TTL
    share_id, qr_payload = await create_share_token(credential_id, user_id)

    return ShareResponse(shareId=share_id, qrPayload=qr_payload)


@router.post("/{credential_id}/revoke", response_model=SuccessResponse)
async def revoke_credential(
    credential_id: str, session: AsyncSession = Depends(get_session)
):
    """Revoke a credential."""
    user_id = get_mock_user_id()

    # Try database first
    result = await session.execute(
        select(Credential).where(
            Credential.id == credential_id,
            Credential.user_id == user_id,
        )
    )
    credential = result.scalar_one_or_none()

    if credential:
        credential.status = CredentialStatus.REVOKED.value
        await session.commit()
        return SuccessResponse(success=True)

    # Check mock data (can't actually revoke mock data)
    mock_cred = next(
        (c for c in MOCK_CREDENTIALS if c["id"] == credential_id), None
    )
    if mock_cred:
        return SuccessResponse(success=True)

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Credential not found",
    )
