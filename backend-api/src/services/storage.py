"""Storage service for S3/MinIO file uploads."""

import logging
import uuid
from typing import Optional

import boto3
from botocore.exceptions import ClientError

from ..core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


def get_s3_client():
    """Get S3/MinIO client."""
    return boto3.client(
        "s3",
        endpoint_url=settings.s3_endpoint_url,
        aws_access_key_id=settings.s3_access_key,
        aws_secret_access_key=settings.s3_secret_key,
    )


async def ensure_bucket_exists() -> bool:
    """Ensure the S3 bucket exists."""
    client = get_s3_client()
    try:
        client.head_bucket(Bucket=settings.s3_bucket_name)
        return True
    except ClientError:
        try:
            client.create_bucket(Bucket=settings.s3_bucket_name)
            logger.info(f"Created bucket {settings.s3_bucket_name}")
            return True
        except ClientError as e:
            logger.error(f"Failed to create bucket: {e}")
            return False


async def upload_file(
    file_data: bytes,
    content_type: str,
    prefix: str = "uploads",
) -> Optional[str]:
    """Upload a file to S3/MinIO.

    Args:
        file_data: File content as bytes
        content_type: MIME type of the file
        prefix: Path prefix for the file

    Returns:
        Object key if successful, None otherwise
    """
    await ensure_bucket_exists()

    file_id = str(uuid.uuid4())
    extension = content_type.split("/")[-1] if "/" in content_type else "bin"
    object_key = f"{prefix}/{file_id}.{extension}"

    client = get_s3_client()
    try:
        client.put_object(
            Bucket=settings.s3_bucket_name,
            Key=object_key,
            Body=file_data,
            ContentType=content_type,
        )
        logger.info(f"Uploaded file to {object_key}")
        return object_key
    except ClientError as e:
        logger.error(f"Failed to upload file: {e}")
        return None


async def get_presigned_url(
    object_key: str,
    expiration: int = 3600,
    method: str = "get_object",
) -> Optional[str]:
    """Generate a presigned URL for an object.

    Args:
        object_key: S3 object key
        expiration: URL expiration time in seconds
        method: get_object for download, put_object for upload

    Returns:
        Presigned URL if successful, None otherwise
    """
    client = get_s3_client()
    try:
        url = client.generate_presigned_url(
            method,
            Params={"Bucket": settings.s3_bucket_name, "Key": object_key},
            ExpiresIn=expiration,
        )
        return url
    except ClientError as e:
        logger.error(f"Failed to generate presigned URL: {e}")
        return None


async def delete_file(object_key: str) -> bool:
    """Delete a file from S3/MinIO.

    Args:
        object_key: S3 object key

    Returns:
        True if deleted, False otherwise
    """
    client = get_s3_client()
    try:
        client.delete_object(Bucket=settings.s3_bucket_name, Key=object_key)
        logger.info(f"Deleted file {object_key}")
        return True
    except ClientError as e:
        logger.error(f"Failed to delete file: {e}")
        return False
