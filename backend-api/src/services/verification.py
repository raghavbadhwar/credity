"""Verification service for managing verification sessions and tasks."""

import logging
import uuid
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.models import (
    VerificationSession,
    VerificationStatus,
    VerificationStep,
    VerificationStepName,
)

logger = logging.getLogger(__name__)


async def create_verification_session(
    session: AsyncSession, user_id: str
) -> VerificationSession:
    """Create a new verification session with all steps."""
    session_id = str(uuid.uuid4())

    # Create session
    verification_session = VerificationSession(
        id=session_id,
        user_id=user_id,
        status=VerificationStatus.PENDING.value,
    )
    session.add(verification_session)

    # Create all steps
    steps = [
        VerificationStepName.LIVENESS,
        VerificationStepName.DOCUMENT_FRONT,
        VerificationStepName.DOCUMENT_BACK,
        VerificationStepName.FACE_MATCH,
        VerificationStepName.DIGILOCKER,
    ]

    for step_name in steps:
        step = VerificationStep(
            id=str(uuid.uuid4()),
            session_id=session_id,
            name=step_name.value,
            status=VerificationStatus.PENDING.value,
        )
        session.add(step)

    await session.commit()
    await session.refresh(verification_session)

    logger.info(f"Created verification session {session_id} for user {user_id}")
    return verification_session


async def get_verification_session(
    session: AsyncSession, session_id: str, user_id: Optional[str] = None
) -> Optional[VerificationSession]:
    """Get a verification session by ID."""
    query = select(VerificationSession).where(VerificationSession.id == session_id)
    if user_id:
        query = query.where(VerificationSession.user_id == user_id)

    result = await session.execute(query)
    return result.scalar_one_or_none()


async def update_step_status(
    session: AsyncSession,
    session_id: str,
    step_name: str,
    status: VerificationStatus,
    score: Optional[int] = None,
    media_path: Optional[str] = None,
) -> Optional[VerificationStep]:
    """Update a verification step's status."""
    result = await session.execute(
        select(VerificationStep).where(
            VerificationStep.session_id == session_id,
            VerificationStep.name == step_name,
        )
    )
    step = result.scalar_one_or_none()

    if step:
        step.status = status.value
        if score is not None:
            step.score = score
        if media_path is not None:
            step.media_path = media_path
        await session.commit()
        await session.refresh(step)
        logger.info(f"Updated step {step_name} in session {session_id} to {status.value}")

    return step


async def update_session_status(
    session: AsyncSession, session_id: str
) -> Optional[VerificationSession]:
    """Update session status based on step statuses."""
    verification_session = await get_verification_session(session, session_id)
    if not verification_session:
        return None

    steps = verification_session.steps
    if not steps:
        return verification_session

    # Check if any step failed
    if any(step.status == VerificationStatus.FAILED.value for step in steps):
        verification_session.status = VerificationStatus.FAILED.value
    # Check if all steps completed
    elif all(step.status == VerificationStatus.COMPLETED.value for step in steps):
        verification_session.status = VerificationStatus.COMPLETED.value
    # Check if any step is in progress
    elif any(step.status == VerificationStatus.IN_PROGRESS.value for step in steps):
        verification_session.status = VerificationStatus.IN_PROGRESS.value

    await session.commit()
    await session.refresh(verification_session)
    return verification_session


async def submit_liveness(
    session: AsyncSession, session_id: str, user_id: str, media_data: Optional[dict] = None
) -> Optional[VerificationSession]:
    """Submit liveness check for processing."""
    verification_session = await get_verification_session(session, session_id, user_id)
    if not verification_session:
        return None

    # Mark step as in progress
    await update_step_status(
        session,
        session_id,
        VerificationStepName.LIVENESS.value,
        VerificationStatus.IN_PROGRESS,
    )

    # TODO: Enqueue job for async processing
    # For now, simulate immediate completion with mock score
    await update_step_status(
        session,
        session_id,
        VerificationStepName.LIVENESS.value,
        VerificationStatus.COMPLETED,
        score=95,  # Mock score
    )

    return await update_session_status(session, session_id)


async def submit_document(
    session: AsyncSession,
    session_id: str,
    user_id: str,
    document_type: str = "front",
    media_data: Optional[dict] = None,
) -> Optional[VerificationSession]:
    """Submit document for processing."""
    verification_session = await get_verification_session(session, session_id, user_id)
    if not verification_session:
        return None

    step_name = (
        VerificationStepName.DOCUMENT_FRONT.value
        if document_type == "front"
        else VerificationStepName.DOCUMENT_BACK.value
    )

    # Mark step as in progress
    await update_step_status(session, session_id, step_name, VerificationStatus.IN_PROGRESS)

    # TODO: Enqueue job for async processing
    # For now, simulate immediate completion with mock score
    await update_step_status(
        session, session_id, step_name, VerificationStatus.COMPLETED, score=90
    )

    # If both documents are done, start face match
    front_result = await session.execute(
        select(VerificationStep).where(
            VerificationStep.session_id == session_id,
            VerificationStep.name == VerificationStepName.DOCUMENT_FRONT.value,
        )
    )
    back_result = await session.execute(
        select(VerificationStep).where(
            VerificationStep.session_id == session_id,
            VerificationStep.name == VerificationStepName.DOCUMENT_BACK.value,
        )
    )

    front_step = front_result.scalar_one_or_none()
    back_step = back_result.scalar_one_or_none()

    if (
        front_step
        and back_step
        and front_step.status == VerificationStatus.COMPLETED.value
        and back_step.status == VerificationStatus.COMPLETED.value
    ):
        # Auto-complete face match
        await update_step_status(
            session,
            session_id,
            VerificationStepName.FACE_MATCH.value,
            VerificationStatus.COMPLETED,
            score=88,
        )

    return await update_session_status(session, session_id)


async def connect_digilocker(
    session: AsyncSession, session_id: str, user_id: str
) -> Optional[VerificationSession]:
    """Connect DigiLocker for verification."""
    verification_session = await get_verification_session(session, session_id, user_id)
    if not verification_session:
        return None

    # Mark step as in progress then complete
    await update_step_status(
        session,
        session_id,
        VerificationStepName.DIGILOCKER.value,
        VerificationStatus.IN_PROGRESS,
    )

    # TODO: Integrate with actual DigiLocker API
    # For now, simulate completion
    await update_step_status(
        session,
        session_id,
        VerificationStepName.DIGILOCKER.value,
        VerificationStatus.COMPLETED,
        score=100,
    )

    return await update_session_status(session, session_id)


async def submit_session(
    session: AsyncSession, session_id: str, user_id: str
) -> Optional[VerificationSession]:
    """Submit verification session for final review."""
    verification_session = await get_verification_session(session, session_id, user_id)
    if not verification_session:
        return None

    # Check if all required steps are completed
    required_steps = [
        VerificationStepName.LIVENESS.value,
        VerificationStepName.DOCUMENT_FRONT.value,
        VerificationStepName.DOCUMENT_BACK.value,
        VerificationStepName.FACE_MATCH.value,
    ]

    steps_completed = 0
    for step in verification_session.steps:
        if step.name in required_steps and step.status == VerificationStatus.COMPLETED.value:
            steps_completed += 1

    if steps_completed >= len(required_steps):
        verification_session.status = VerificationStatus.COMPLETED.value
        await session.commit()
        await session.refresh(verification_session)
        logger.info(f"Verification session {session_id} submitted and completed")
    else:
        logger.warning(
            f"Verification session {session_id} not ready for submission: "
            f"{steps_completed}/{len(required_steps)} steps completed"
        )

    return verification_session
