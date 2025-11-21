"""
Image upload utilities for character images
Handles uploads to Cloudflare R2 with proper path management
"""

from typing import Dict, Optional
from s3_client import S3Client
from settings import settings


def upload_character_image(
    campaign_id: str,
    character_id: str,
    file_content: bytes,
    content_type: str,
    filename: str,
    s3_client: S3Client,
    old_r2_key: Optional[str] = None
) -> Dict[str, str]:
    """
    Upload character image to R2 storage

    Args:
        campaign_id: UUID of the campaign
        character_id: UUID of the character
        file_content: Image file bytes
        content_type: MIME type (e.g., "image/jpeg")
        filename: Original filename
        s3_client: S3Client instance
        old_r2_key: Previous R2 key to delete (if replacing image)

    Returns:
        Dictionary with 'url' and 'r2_key' keys

    Raises:
        Exception: If upload or deletion fails
    """
    # Delete old image if exists
    if old_r2_key:
        try:
            s3_client.delete_image(old_r2_key)
        except Exception as e:
            # Log but don't fail - old image might already be deleted
            print(f"[WARNING] Failed to delete old image {old_r2_key}: {e}")

    # Generate R2 key path: campaigns/{campaign_id}/characters/{character_id}/{filename}
    r2_key = f"campaigns/{campaign_id}/characters/{character_id}/{filename}"

    # Upload to R2
    try:
        url = s3_client.upload_image(r2_key, file_content, content_type)
    except Exception as e:
        raise Exception(f"Failed to upload character image: {str(e)}")

    return {
        "url": url,
        "r2_key": r2_key
    }


def delete_character_image(r2_key: str, s3_client: S3Client) -> bool:
    """
    Delete character image from R2 storage

    Args:
        r2_key: R2 storage key to delete
        s3_client: S3Client instance

    Returns:
        True if successful

    Raises:
        Exception: If deletion fails
    """
    try:
        return s3_client.delete_image(r2_key)
    except Exception as e:
        raise Exception(f"Failed to delete character image: {str(e)}")
