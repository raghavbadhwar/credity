"""Connection database model."""

from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from ..session import Base


class ConnectionStatus(str, Enum):
    """Connection status enum."""

    PENDING = "pending"
    ACTIVE = "active"
    REVOKED = "revoked"


class Connection(Base):
    """Platform connection model."""

    __tablename__ = "connections"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    platform: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(20), default=ConnectionStatus.PENDING.value)
    shared_credentials: Mapped[str] = mapped_column(
        String(1000), default=""
    )  # JSON string of credential names
    last_accessed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    def to_dict(self) -> dict:
        """Convert to dictionary for API response."""
        import json

        try:
            shared = json.loads(self.shared_credentials) if self.shared_credentials else []
        except json.JSONDecodeError:
            shared = []

        return {
            "id": self.id,
            "platform": self.platform,
            "status": self.status,
            "sharedCredentials": shared,
            "lastAccessedAt": self.last_accessed_at.isoformat() if self.last_accessed_at else None,
            "expiresAt": self.expires_at.isoformat() if self.expires_at else None,
        }
