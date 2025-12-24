"""Webhook service for delivering webhooks to platforms."""

import logging
import uuid
from datetime import datetime
from typing import Any, Optional

import httpx
import redis.asyncio as redis

from ..core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# Webhook settings
MAX_RETRIES = 3
INITIAL_BACKOFF_SECONDS = 1
MAX_BACKOFF_SECONDS = 60


async def get_redis_client() -> redis.Redis:
    """Get Redis client."""
    return redis.from_url(settings.redis_url)


async def deliver_webhook(
    url: str,
    payload: dict[str, Any],
    headers: Optional[dict[str, str]] = None,
    retry_count: int = 0,
) -> bool:
    """Deliver a webhook to a URL.

    Args:
        url: Target URL
        payload: JSON payload
        headers: Optional headers
        retry_count: Current retry attempt

    Returns:
        True if delivered successfully, False otherwise
    """
    webhook_id = str(uuid.uuid4())
    logger.info(f"Delivering webhook {webhook_id} to {url}")

    default_headers = {
        "Content-Type": "application/json",
        "X-Webhook-ID": webhook_id,
        "X-Webhook-Timestamp": datetime.utcnow().isoformat(),
    }

    if headers:
        default_headers.update(headers)

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json=payload,
                headers=default_headers,
                timeout=30.0,
            )

            if response.status_code >= 200 and response.status_code < 300:
                logger.info(f"Webhook {webhook_id} delivered successfully")
                return True

            logger.warning(
                f"Webhook {webhook_id} failed with status {response.status_code}"
            )

    except httpx.RequestError as e:
        logger.error(f"Webhook {webhook_id} request error: {e}")

    # Schedule retry if not exceeded max retries
    if retry_count < MAX_RETRIES:
        await schedule_retry(url, payload, headers, retry_count + 1)

    return False


async def schedule_retry(
    url: str,
    payload: dict[str, Any],
    headers: Optional[dict[str, str]],
    retry_count: int,
) -> None:
    """Schedule a webhook retry with exponential backoff.

    Args:
        url: Target URL
        payload: JSON payload
        headers: Optional headers
        retry_count: Current retry attempt
    """
    # Calculate backoff
    backoff = min(INITIAL_BACKOFF_SECONDS * (2 ** retry_count), MAX_BACKOFF_SECONDS)

    logger.info(f"Scheduling webhook retry {retry_count}/{MAX_RETRIES} in {backoff}s")

    # In a real implementation, this would use Celery or a job queue
    # For now, we just log the scheduled retry
    # TODO: Implement actual job queue for retries
    import json

    client = await get_redis_client()
    retry_data = {
        "url": url,
        "payload": payload,
        "headers": headers,
        "retry_count": retry_count,
        "scheduled_at": datetime.utcnow().isoformat(),
        "backoff_seconds": backoff,
    }
    key = f"webhook_retry:{uuid.uuid4()}"
    await client.setex(key, backoff + 60, json.dumps(retry_data))
    await client.aclose()


async def receive_webhook(payload: dict[str, Any]) -> dict[str, Any]:
    """Receive and log an incoming webhook.

    Args:
        payload: The webhook payload

    Returns:
        Acknowledgment response
    """
    webhook_id = str(uuid.uuid4())
    logger.info(f"Received webhook {webhook_id}: {payload}")

    # Store webhook for processing
    client = await get_redis_client()
    import json

    await client.lpush("incoming_webhooks", json.dumps({
        "id": webhook_id,
        "payload": payload,
        "received_at": datetime.utcnow().isoformat(),
    }))
    await client.aclose()

    return {
        "success": True,
        "webhookId": webhook_id,
        "message": "Webhook received and queued for processing",
    }
