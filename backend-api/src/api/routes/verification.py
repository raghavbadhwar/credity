"""Verification endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from ...db import get_session
from ...services.verification import (
    connect_digilocker,
    create_verification_session,
    get_verification_session,
    submit_document,
    submit_liveness,
    submit_session,
)

router = APIRouter(prefix="/verification", tags=["verification"])


# Request models
class LivenessRequest(BaseModel):
    mediaData: Optional[str] = None  # Base64 encoded media


class DocumentRequest(BaseModel):
    type: str = "front"  # front or back
    mediaData: Optional[str] = None


# Helper to get user_id (in production, from auth header)
def get_mock_user_id() -> str:
    return "mock-user-id"


@router.post("/sessions")
async def create_session(session: AsyncSession = Depends(get_session)):
    """Create a new verification session."""
    user_id = get_mock_user_id()
    verification_session = await create_verification_session(session, user_id)
    return verification_session.to_dict()


@router.get("/sessions/{session_id}")
async def get_session_status(
    session_id: str, session: AsyncSession = Depends(get_session)
):
    """Get verification session status."""
    user_id = get_mock_user_id()
    verification_session = await get_verification_session(session, session_id, user_id)

    if not verification_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Verification session not found",
        )

    return verification_session.to_dict()


@router.post("/sessions/{session_id}/liveness")
async def submit_liveness_check(
    session_id: str,
    request: LivenessRequest,
    session: AsyncSession = Depends(get_session),
):
    """Submit liveness check for verification."""
    user_id = get_mock_user_id()
    verification_session = await submit_liveness(
        session, session_id, user_id, {"mediaData": request.mediaData}
    )

    if not verification_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Verification session not found",
        )

    return verification_session.to_dict()


@router.post("/sessions/{session_id}/document")
async def submit_document_check(
    session_id: str,
    request: DocumentRequest,
    session: AsyncSession = Depends(get_session),
):
    """Submit document for verification."""
    user_id = get_mock_user_id()
    verification_session = await submit_document(
        session,
        session_id,
        user_id,
        document_type=request.type,
        media_data={"mediaData": request.mediaData},
    )

    if not verification_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Verification session not found",
        )

    return verification_session.to_dict()


@router.post("/sessions/{session_id}/digilocker")
async def connect_digilocker_account(
    session_id: str, session: AsyncSession = Depends(get_session)
):
    """Connect DigiLocker for document verification."""
    user_id = get_mock_user_id()
    verification_session = await connect_digilocker(session, session_id, user_id)

    if not verification_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Verification session not found",
        )

    return verification_session.to_dict()


@router.post("/sessions/{session_id}/submit")
async def submit_verification(
    session_id: str, session: AsyncSession = Depends(get_session)
):
    """Submit verification session for final review."""
    user_id = get_mock_user_id()
    verification_session = await submit_session(session, session_id, user_id)

    if not verification_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Verification session not found",
        )

    return verification_session.to_dict()
