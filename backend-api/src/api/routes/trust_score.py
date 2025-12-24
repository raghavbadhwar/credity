"""Trust score endpoints."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from ...db import get_session
from ...services.trust_score import calculate_trust_score

router = APIRouter(prefix="/trust-score", tags=["trust-score"])


class TrustScoreBreakdownResponse(BaseModel):
    identity: int
    activity: int
    reputation: int


class TrustScoreResponse(BaseModel):
    score: int
    breakdown: TrustScoreBreakdownResponse
    updatedAt: str
    suggestions: list[str]


# Helper to get user_id (in production, from auth header)
def get_mock_user_id() -> str:
    return "mock-user-id"


@router.get("", response_model=TrustScoreResponse)
async def get_trust_score(session: AsyncSession = Depends(get_session)):
    """Get trust score with breakdown and suggestions."""
    user_id = get_mock_user_id()

    # For mock mode, return sample data
    # In production, this would calculate based on real user data
    try:
        result = await calculate_trust_score(session, user_id)
        return TrustScoreResponse(
            score=result.score,
            breakdown=TrustScoreBreakdownResponse(
                identity=result.breakdown.identity,
                activity=result.breakdown.activity,
                reputation=result.breakdown.reputation,
            ),
            updatedAt=datetime.now(timezone.utc).isoformat(),
            suggestions=result.suggestions,
        )
    except Exception:
        # Fallback to mock data if calculation fails
        return TrustScoreResponse(
            score=78,
            breakdown=TrustScoreBreakdownResponse(
                identity=85,
                activity=70,
                reputation=80,
            ),
            updatedAt=datetime.now(timezone.utc).isoformat(),
            suggestions=[
                "Complete DigiLocker verification to boost identity score",
                "Connect more platforms to improve activity score",
                "Request endorsements from verified connections",
            ],
        )
