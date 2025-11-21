"""
Authentication utilities for user login and campaign token management
"""

import bcrypt
import secrets
from typing import Optional


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt

    Args:
        password: Plain text password

    Returns:
        Hashed password string
    """
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def verify_password(password: str, password_hash: str) -> bool:
    """
    Verify a password against a bcrypt hash

    Args:
        password: Plain text password to verify
        password_hash: Bcrypt hash to verify against

    Returns:
        True if password matches, False otherwise
    """
    try:
        return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
    except Exception:
        return False


def generate_campaign_token() -> str:
    """
    Generate a unique, cryptographically secure token for campaign admin access

    Returns:
        A 32-character hex token (128 bits of entropy)
    """
    return secrets.token_hex(32)  # 64 character hex string (256 bits)
