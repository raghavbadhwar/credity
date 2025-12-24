"""Trust score calculation service."""

import logging
from dataclasses import dataclass
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.models import (
    Connection,
    ConnectionStatus,
    Credential,
    User,
    VerificationSession,
    VerificationStatus,
)

logger = logging.getLogger(__name__)


@dataclass
class TrustScoreBreakdown:
    """Trust score breakdown by category."""

    identity: int  # 40% weight
    activity: int  # 30% weight
    reputation: int  # 30% weight


@dataclass
class TrustScoreResult:
    """Trust score result with breakdown and suggestions."""

    score: int
    breakdown: TrustScoreBreakdown
    label: str
    suggestions: list[str]


def get_score_label(score: int) -> str:
    """Get label for score value."""
    if score >= 90:
        return "Outstanding"
    elif score >= 75:
        return "Excellent"
    elif score >= 60:
        return "Good"
    elif score >= 40:
        return "Fair"
    else:
        return "Poor"


async def calculate_identity_score(
    session: AsyncSession, user_id: str
) -> tuple[int, list[str]]:
    """Calculate identity score (40% weight).

    Components:
    - Liveness check: 20 points (max 50)
    - Document verification: 15 points (max 37.5)
    - Biometric match: 5 points (max 12.5)
    """
    suggestions = []
    total_points = 0
    max_points = 100

    # Check verification sessions
    result = await session.execute(
        select(VerificationSession).where(
            VerificationSession.user_id == user_id,
            VerificationSession.status == VerificationStatus.COMPLETED.value,
        )
    )
    completed_sessions = result.scalars().all()

    # Liveness check (50 points max)
    has_liveness = any(
        step.name == "Liveness Check" and step.status == VerificationStatus.COMPLETED.value
        for vs in completed_sessions
        for step in vs.steps
    )
    if has_liveness:
        total_points += 50
    else:
        suggestions.append("Complete liveness verification to boost your identity score")

    # Document verification (37.5 points max)
    has_document = any(
        "Document" in step.name and step.status == VerificationStatus.COMPLETED.value
        for vs in completed_sessions
        for step in vs.steps
    )
    if has_document:
        total_points += 37
    else:
        suggestions.append("Upload and verify your government ID document")

    # Biometric match (12.5 points max)
    has_biometric = any(
        step.name == "Face Match" and step.status == VerificationStatus.COMPLETED.value
        for vs in completed_sessions
        for step in vs.steps
    )
    if has_biometric:
        total_points += 13
    else:
        suggestions.append("Complete face match verification for additional security")

    score = min(100, int((total_points / max_points) * 100))
    return score, suggestions


async def calculate_activity_score(
    session: AsyncSession, user_id: str
) -> tuple[int, list[str]]:
    """Calculate activity score (30% weight).

    Components:
    - Verification count
    - Platform connections
    - Recency of activity
    """
    suggestions = []
    total_points = 0

    # Count verification sessions
    result = await session.execute(
        select(func.count(VerificationSession.id)).where(
            VerificationSession.user_id == user_id
        )
    )
    verification_count = result.scalar() or 0
    # Up to 30 points for verifications (10 points per verification, max 3)
    total_points += min(30, verification_count * 10)

    if verification_count < 3:
        suggestions.append("Complete more verification sessions to improve activity score")

    # Count active connections
    result = await session.execute(
        select(func.count(Connection.id)).where(
            Connection.user_id == user_id,
            Connection.status == ConnectionStatus.ACTIVE.value,
        )
    )
    connection_count = result.scalar() or 0
    # Up to 40 points for connections (10 points per connection, max 4)
    total_points += min(40, connection_count * 10)

    if connection_count < 4:
        suggestions.append("Connect more platforms to increase your activity score")

    # Count credentials
    result = await session.execute(
        select(func.count(Credential.id)).where(Credential.user_id == user_id)
    )
    credential_count = result.scalar() or 0
    # Up to 30 points for credentials (10 points per credential, max 3)
    total_points += min(30, credential_count * 10)

    if credential_count < 3:
        suggestions.append("Add more verified credentials to your profile")

    score = min(100, total_points)
    return score, suggestions


async def calculate_reputation_score(
    session: AsyncSession, user_id: str
) -> tuple[int, list[str]]:
    """Calculate reputation score (30% weight).

    Components:
    - No suspicious activity: 50 points base
    - Endorsements: placeholder
    - Feedback: placeholder
    """
    suggestions = []
    total_points = 50  # Base score for no suspicious activity

    # TODO: Implement endorsements and feedback tracking
    # For now, give partial credit
    total_points += 30  # Placeholder for endorsements
    suggestions.append("Request endorsements from verified connections")

    total_points += 20  # Placeholder for feedback
    suggestions.append("Build your reputation through positive interactions")

    score = min(100, total_points)
    return score, suggestions


async def calculate_trust_score(
    session: AsyncSession, user_id: str
) -> TrustScoreResult:
    """Calculate overall trust score with breakdown.

    Weights:
    - Identity: 40%
    - Activity: 30%
    - Reputation: 30%
    """
    # Calculate component scores
    identity_score, identity_suggestions = await calculate_identity_score(session, user_id)
    activity_score, activity_suggestions = await calculate_activity_score(session, user_id)
    reputation_score, reputation_suggestions = await calculate_reputation_score(session, user_id)

    # Calculate weighted total
    total_score = int(
        (identity_score * 0.4) + (activity_score * 0.3) + (reputation_score * 0.3)
    )

    # Combine suggestions (limit to top 3)
    all_suggestions = identity_suggestions + activity_suggestions + reputation_suggestions
    top_suggestions = all_suggestions[:3]

    breakdown = TrustScoreBreakdown(
        identity=identity_score,
        activity=activity_score,
        reputation=reputation_score,
    )

    return TrustScoreResult(
        score=total_score,
        breakdown=breakdown,
        label=get_score_label(total_score),
        suggestions=top_suggestions,
    )


async def update_user_trust_score(session: AsyncSession, user_id: str) -> Optional[int]:
    """Update and return user's trust score."""
    result = await calculate_trust_score(session, user_id)

    # Update user record
    user_result = await session.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if user:
        user.trust_score = result.score
        await session.commit()
        return result.score

    return None
