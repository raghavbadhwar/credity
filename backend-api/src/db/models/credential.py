"""Credential database model."""

from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from ..session import Base


class CredentialStatus(str, Enum):
    """Credential status enum."""

    ACTIVE = "active"
    EXPIRED = "expired"
    REVOKED = "revoked"


class Credential(Base):
    """Credential model."""

    __tablename__ = "credentials"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    type: Mapped[str] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(20), default=CredentialStatus.ACTIVE.value)
    usage_count: Mapped[int] = mapped_column(default=0)
    issued_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_used_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    def to_dict(self) -> dict:
        """Convert to dictionary for API response."""
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "status": self.status,
            "issuedAt": self.issued_at.isoformat() if self.issued_at else None,
            "expiresAt": self.expires_at.isoformat() if self.expires_at else None,
            "usageCount": self.usage_count,
            "lastUsedAt": self.last_used_at.isoformat() if self.last_used_at else None,
        }
