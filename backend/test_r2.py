#!/usr/bin/env python3
"""
Test R2 connection - verifies Cloudflare R2 credentials are working
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Get R2 credentials
R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME")

print("=" * 60)
print("Testing Cloudflare R2 Connection")
print("=" * 60)

# Check if all credentials are set
if not all([R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME]):
    print("[FAIL] Missing R2 credentials in .env file")
    print(f"  R2_ACCOUNT_ID: {'[OK]' if R2_ACCOUNT_ID else '[MISSING]'}")
    print(f"  R2_ACCESS_KEY_ID: {'[OK]' if R2_ACCESS_KEY_ID else '[MISSING]'}")
    print(f"  R2_SECRET_ACCESS_KEY: {'[OK]' if R2_SECRET_ACCESS_KEY else '[MISSING]'}")
    print(f"  R2_BUCKET_NAME: {'[OK]' if R2_BUCKET_NAME else '[MISSING]'}")
    sys.exit(1)

print("\n[OK] All credentials loaded from .env")
print(f"  Bucket Name: {R2_BUCKET_NAME}")
print(f"  Account ID: {R2_ACCOUNT_ID[:8]}... (truncated)")

# Try to import boto3
try:
    import boto3
    print("\n[OK] boto3 library is installed")
except ImportError:
    print("\n[INFO] boto3 not installed. Installing now...")
    os.system("pip install boto3")
    import boto3
    print("[OK] boto3 installed successfully")

# Create S3 client for R2
try:
    s3_client = boto3.client(
        's3',
        endpoint_url=f'https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com',
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        region_name='auto'
    )
    print("\n[OK] S3 client created successfully")
except Exception as e:
    print(f"\n[FAIL] Failed to create S3 client: {e}")
    sys.exit(1)

# Test connection by listing objects in bucket
try:
    response = s3_client.list_objects_v2(Bucket=R2_BUCKET_NAME, MaxKeys=5)
    print(f"[OK] Successfully connected to R2 bucket: {R2_BUCKET_NAME}")

    # Count files in bucket
    if 'Contents' in response:
        file_count = len(response['Contents'])
        print(f"[OK] Bucket contains {file_count} file(s)")
    else:
        print(f"[OK] Bucket is empty (no files yet)")

except Exception as e:
    print(f"[FAIL] Failed to access bucket: {e}")
    print("  Possible causes:")
    print("  - Invalid credentials")
    print("  - Bucket doesn't exist")
    print("  - Permissions not set correctly")
    sys.exit(1)

# Test uploading a test file
print("\n[INFO] Attempting test upload...")
try:
    test_key = "test_upload.txt"
    test_content = "This is a test file for R2 connectivity"

    s3_client.put_object(
        Bucket=R2_BUCKET_NAME,
        Key=test_key,
        Body=test_content.encode('utf-8'),
        ContentType='text/plain'
    )
    print(f"[OK] Successfully uploaded test file: {test_key}")

    # Try to read it back
    obj = s3_client.get_object(Bucket=R2_BUCKET_NAME, Key=test_key)
    content = obj['Body'].read().decode('utf-8')

    if content == test_content:
        print(f"[OK] Successfully read test file back (content matches)")
    else:
        print(f"[FAIL] Read test file but content doesn't match")
        sys.exit(1)

except Exception as e:
    print(f"[FAIL] Failed to upload/read test file: {e}")
    sys.exit(1)

# Clean up test file
try:
    s3_client.delete_object(Bucket=R2_BUCKET_NAME, Key=test_key)
    print(f"[OK] Cleaned up test file")
except Exception as e:
    print(f"[WARN] Could not delete test file: {e}")

print("\n" + "=" * 60)
print("[SUCCESS] R2 Connection Test PASSED!")
print("=" * 60)
print("\nYour R2 setup is working correctly!")
print("The backend can now upload and manage images in R2.")
