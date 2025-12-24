"""Celery worker tasks for async processing."""

import logging
import random

from celery import Celery

from ..core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# Initialize Celery
app = Celery(
    "credverse_worker",
    broker=settings.redis_url,
    backend=settings.redis_url,
)

app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes
)


@app.task(bind=True, max_retries=3)
def process_liveness(self, session_id: str, user_id: str, media_path: str | None = None) -> dict:
    """Process liveness check.

    Simulates liveness detection with mock results.

    Args:
        session_id: Verification session ID
        user_id: User ID
        media_path: Path to uploaded media

    Returns:
        Processing result with status and score
    """
    logger.info(f"Processing liveness for session {session_id}")

    try:
        # Simulate processing time
        import time
        time.sleep(random.uniform(1, 3))

        # Generate mock result
        # In production, this would call actual liveness detection API
        passed = random.random() > 0.1  # 90% pass rate
        confidence = random.randint(85, 99) if passed else random.randint(40, 70)

        result = {
            "session_id": session_id,
            "step": "liveness",
            "status": "completed" if passed else "failed",
            "confidence": confidence,
            "message": "Liveness check passed" if passed else "Liveness check failed",
        }

        logger.info(f"Liveness result for {session_id}: {result}")
        return result

    except Exception as e:
        logger.error(f"Liveness processing error: {e}")
        raise self.retry(exc=e, countdown=5)


@app.task(bind=True, max_retries=3)
def process_document(
    self,
    session_id: str,
    user_id: str,
    document_type: str,
    media_path: str | None = None,
) -> dict:
    """Process document verification.

    Simulates document verification with mock results.

    Args:
        session_id: Verification session ID
        user_id: User ID
        document_type: front or back
        media_path: Path to uploaded document

    Returns:
        Processing result with status and score
    """
    logger.info(f"Processing document {document_type} for session {session_id}")

    try:
        # Simulate processing time
        import time
        time.sleep(random.uniform(2, 4))

        # Generate mock result
        passed = random.random() > 0.15  # 85% pass rate
        confidence = random.randint(80, 98) if passed else random.randint(30, 65)

        # Mock extracted data
        extracted_data = None
        if passed:
            extracted_data = {
                "document_number": f"***{random.randint(1000, 9999)}",
                "name": "Verified User",
                "dob": "****-**-**",
            }

        result = {
            "session_id": session_id,
            "step": f"document_{document_type}",
            "status": "completed" if passed else "failed",
            "confidence": confidence,
            "extracted_data": extracted_data,
            "message": (
                f"Document {document_type} verified"
                if passed
                else f"Document {document_type} verification failed"
            ),
        }

        logger.info(f"Document result for {session_id}: {result}")
        return result

    except Exception as e:
        logger.error(f"Document processing error: {e}")
        raise self.retry(exc=e, countdown=5)


@app.task(bind=True, max_retries=3)
def process_face_match(
    self,
    session_id: str,
    user_id: str,
    liveness_media_path: str | None = None,
    document_media_path: str | None = None,
) -> dict:
    """Process face match verification.

    Compares face from liveness check with document photo.

    Args:
        session_id: Verification session ID
        user_id: User ID
        liveness_media_path: Path to liveness check media
        document_media_path: Path to document media

    Returns:
        Processing result with status and score
    """
    logger.info(f"Processing face match for session {session_id}")

    try:
        # Simulate processing time
        import time
        time.sleep(random.uniform(2, 5))

        # Generate mock result
        passed = random.random() > 0.2  # 80% pass rate
        similarity = random.uniform(0.85, 0.99) if passed else random.uniform(0.3, 0.7)

        result = {
            "session_id": session_id,
            "step": "face_match",
            "status": "completed" if passed else "failed",
            "similarity": round(similarity, 3),
            "confidence": int(similarity * 100),
            "message": "Face match successful" if passed else "Face match failed",
        }

        logger.info(f"Face match result for {session_id}: {result}")
        return result

    except Exception as e:
        logger.error(f"Face match processing error: {e}")
        raise self.retry(exc=e, countdown=5)


@app.task
def send_notification(user_id: str, notification_type: str, title: str, body: str) -> dict:
    """Send a notification to a user.

    Args:
        user_id: User ID
        notification_type: Type of notification
        title: Notification title
        body: Notification body

    Returns:
        Notification result
    """
    logger.info(f"Sending notification to user {user_id}: {title}")

    # In production, this would create a notification record and possibly
    # send push notifications, emails, etc.
    return {
        "user_id": user_id,
        "type": notification_type,
        "title": title,
        "body": body,
        "sent": True,
    }


@app.task
def cleanup_expired_share_tokens() -> dict:
    """Cleanup expired share tokens (periodic task).

    Returns:
        Cleanup result with count
    """
    logger.info("Running expired share token cleanup")

    # Redis handles expiry automatically, but we might want to log or audit
    return {
        "task": "cleanup_expired_share_tokens",
        "status": "completed",
    }
