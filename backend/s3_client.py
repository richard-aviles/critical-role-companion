"""
S3/R2 Client for image uploads
Handles file uploads to Cloudflare R2
"""

import boto3
from botocore.exceptions import ClientError


class S3Client:
    """Client for uploading images to Cloudflare R2"""

    def __init__(self, account_id: str, access_key_id: str, secret_access_key: str, bucket_name: str):
        """
        Initialize R2 client

        Args:
            account_id: Cloudflare Account ID
            access_key_id: R2 API Token Access Key ID
            secret_access_key: R2 API Token Secret Access Key
            bucket_name: R2 Bucket name
        """
        self.bucket_name = bucket_name
        self.account_id = account_id

        # Create S3 client configured for R2
        self.client = boto3.client(
            's3',
            endpoint_url=f'https://{account_id}.r2.cloudflarestorage.com',
            aws_access_key_id=access_key_id,
            aws_secret_access_key=secret_access_key,
            region_name='auto'
        )

    def upload_image(self, key: str, file_content: bytes, content_type: str) -> str:
        """
        Upload image to R2

        Args:
            key: S3 key (path in bucket) e.g. "campaign-slug/portraits/char-id.webp"
            file_content: Image file bytes
            content_type: MIME type e.g. "image/jpeg"

        Returns:
            Public URL to the uploaded image

        Raises:
            ClientError: If upload fails
        """
        try:
            self.client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=file_content,
                ContentType=content_type,
            )

            # Return public URL (assuming bucket is public)
            # Format: https://cdn.example.com/{key} or https://{bucket}.{account}.r2.cloudflarestorage.com/{key}
            url = f"https://{self.bucket_name}.{self.account_id}.r2.cloudflarestorage.com/{key}"
            return url

        except ClientError as e:
            raise Exception(f"Failed to upload image to R2: {str(e)}")

    def delete_image(self, key: str) -> bool:
        """
        Delete image from R2

        Args:
            key: S3 key (path in bucket)

        Returns:
            True if successful

        Raises:
            ClientError: If deletion fails
        """
        try:
            self.client.delete_object(Bucket=self.bucket_name, Key=key)
            return True
        except ClientError as e:
            raise Exception(f"Failed to delete image from R2: {str(e)}")
