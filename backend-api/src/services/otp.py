"""OTP service for email and SMS."""

import logging
import random
import string
from typing import Optional

import redis.asyncio as redis

from ..core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# OTP settings
OTP_LENGTH = 6
OTP_EXPIRY_SECONDS = 300  # 5 minutes


def generate_otp() -> str:
    """Generate a random OTP code."""
    if settings.otp_mock:
        return "123456"  # Mock OTP for development
    return "".join(random.choices(string.digits, k=OTP_LENGTH))


async def get_redis_client() -> redis.Redis:
    """Get Redis client."""
    return redis.from_url(settings.redis_url)


async def store_otp(identifier: str, otp: str) -> None:
    """Store OTP in Redis with expiry."""
    client = await get_redis_client()
    key = f"otp:{identifier}"
    await client.setex(key, OTP_EXPIRY_SECONDS, otp)
    await client.aclose()


async def verify_otp(identifier: str, otp: str) -> bool:
    """Verify OTP from Redis."""
    client = await get_redis_client()
    key = f"otp:{identifier}"
    stored_otp = await client.get(key)
    await client.aclose()

    if stored_otp is None:
        return False

    if stored_otp.decode() == otp:
        # Delete OTP after successful verification
        client = await get_redis_client()
        await client.delete(key)
        await client.aclose()
        return True

    return False


async def send_email_otp(email: str, otp: str) -> bool:
    """Send OTP via email."""
    logger.info(f"Sending email OTP to {email}: {otp}")

    if settings.otp_mock:
        logger.info(f"Mock mode: OTP for {email} is {otp}")
        return True

    # In production, integrate with real email provider
    # For now, log to console (Mailhog can catch this)
    try:
        # TODO: Implement actual email sending
        logger.info(f"Email OTP sent to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email OTP: {e}")
        return False


async def send_sms_otp(phone: str, otp: str) -> bool:
    """Send OTP via SMS."""
    logger.info(f"Sending SMS OTP to {phone}: {otp}")

    if settings.otp_mock:
        logger.info(f"Mock mode: OTP for {phone} is {otp}")
        return True

    # In production, integrate with Twilio or other SMS provider
    try:
        # TODO: Implement actual SMS sending
        logger.info(f"SMS OTP sent to {phone}")
        return True
    except Exception as e:
        logger.error(f"Failed to send SMS OTP: {e}")
        return False


async def check_rate_limit(identifier: str, limit: int = 5, window: int = 300) -> bool:
    """Check if OTP request is within rate limit.

    Args:
        identifier: Email or phone to check
        limit: Maximum requests allowed in window
        window: Time window in seconds

    Returns:
        True if within rate limit, False if exceeded
    """
    client = await get_redis_client()
    key = f"otp_rate:{identifier}"

    current = await client.get(key)
    if current is None:
        await client.setex(key, window, 1)
        await client.aclose()
        return True

    count = int(current.decode())
    if count >= limit:
        await client.aclose()
        return False

    await client.incr(key)
    await client.aclose()
    return True


async def request_otp(identifier: str, is_email: bool = True) -> Optional[str]:
    """Request an OTP for the given identifier.

    Args:
        identifier: Email or phone number
        is_email: True for email, False for SMS

    Returns:
        OTP code if successful, None if rate limited or failed
    """
    # Check rate limit
    if not await check_rate_limit(identifier):
        logger.warning(f"Rate limit exceeded for {identifier}")
        return None

    # Generate and store OTP
    otp = generate_otp()
    await store_otp(identifier, otp)

    # Send OTP
    if is_email:
        success = await send_email_otp(identifier, otp)
    else:
        success = await send_sms_otp(identifier, otp)

    if success:
        return otp
    return None
