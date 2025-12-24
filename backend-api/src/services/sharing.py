"""Sharing service for credential sharing with TTL."""

import logging
import uuid
from typing import Optional

import redis.asyncio as redis

from ..core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# Share token settings
SHARE_TOKEN_EXPIRY_SECONDS = 300  # 5 minutes


async def get_redis_client() -> redis.Redis:
    """Get Redis client."""
    return redis.from_url(settings.redis_url)


async def create_share_token(
    credential_id: str, user_id: str
) -> tuple[str, str]:
    """Create a share token for a credential.

    Args:
        credential_id: The credential to share
        user_id: The owner of the credential

    Returns:
        Tuple of (share_id, qr_payload)
    """
    share_id = str(uuid.uuid4())
    qr_payload = f"credverse://share/{credential_id}/{share_id}"

    # Store in Redis with TTL
    client = await get_redis_client()
    key = f"share:{share_id}"
    value = f"{credential_id}:{user_id}"
    await client.setex(key, SHARE_TOKEN_EXPIRY_SECONDS, value)
    await client.aclose()

    logger.info(f"Created share token {share_id} for credential {credential_id}")
    return share_id, qr_payload


async def verify_share_token(share_id: str) -> Optional[tuple[str, str]]:
    """Verify a share token and return credential/user info.

    Args:
        share_id: The share token to verify

    Returns:
        Tuple of (credential_id, user_id) if valid, None otherwise
    """
    client = await get_redis_client()
    key = f"share:{share_id}"
    value = await client.get(key)
    await client.aclose()

    if value is None:
        logger.warning(f"Share token {share_id} not found or expired")
        return None

    parts = value.decode().split(":")
    if len(parts) != 2:
        return None

    return parts[0], parts[1]


async def revoke_share_token(share_id: str) -> bool:
    """Revoke a share token.

    Args:
        share_id: The share token to revoke

    Returns:
        True if revoked, False if not found
    """
    client = await get_redis_client()
    key = f"share:{share_id}"
    deleted = await client.delete(key)
    await client.aclose()

    if deleted > 0:
        logger.info(f"Revoked share token {share_id}")
        return True

    logger.warning(f"Share token {share_id} not found for revocation")
    return False


async def get_share_token_ttl(share_id: str) -> int:
    """Get remaining TTL for a share token.

    Args:
        share_id: The share token to check

    Returns:
        TTL in seconds, -2 if not found, -1 if no expiry
    """
    client = await get_redis_client()
    key = f"share:{share_id}"
    ttl = await client.ttl(key)
    await client.aclose()
    return ttl
