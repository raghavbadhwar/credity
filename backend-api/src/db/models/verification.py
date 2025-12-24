"""Verification database models."""

from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..session import Base


class VerificationStatus(str, Enum):
    """Verification status enum."""

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class VerificationStepName(str, Enum):
    """Verification step names."""

    LIVENESS = "Liveness Check"
    DOCUMENT_FRONT = "Document (Front)"
    DOCUMENT_BACK = "Document (Back)"
    FACE_MATCH = "Face Match"
    DIGILOCKER = "DigiLocker"


class VerificationSession(Base):
    """Verification session model."""

    __tablename__ = "verification_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    status: Mapped[str] = mapped_column(String(20), default=VerificationStatus.PENDING.value)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    steps: Mapped[list["VerificationStep"]] = relationship(
        "VerificationStep", back_populates="session", lazy="selectin"
    )

    def to_dict(self) -> dict:
        """Convert to dictionary for API response."""
        return {
            "id": self.id,
            "status": self.status,
            "steps": [step.to_dict() for step in self.steps],
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


class VerificationStep(Base):
    """Verification step model."""

    __tablename__ = "verification_steps"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    session_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("verification_sessions.id"), index=True
    )
    name: Mapped[str] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(20), default=VerificationStatus.PENDING.value)
    score: Mapped[Optional[int]] = mapped_column(nullable=True)
    media_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    session: Mapped["VerificationSession"] = relationship(
        "VerificationSession", back_populates="steps"
    )

    def to_dict(self) -> dict:
        """Convert to dictionary for API response."""
        result = {
            "name": self.name,
            "status": self.status,
        }
        if self.score is not None:
            result["score"] = self.score
        return result
