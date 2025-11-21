"""
Character management endpoints for Phase 2
Handles CRUD operations for campaign characters with image uploads
"""

import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models import Character, Campaign, User
from image_upload import upload_character_image, delete_character_image
from s3_client import S3Client
from settings import settings


# Initialize router
router = APIRouter(prefix="/characters", tags=["characters"])

# S3/R2 client for image uploads
s3_client = S3Client(
    account_id=settings.R2_ACCOUNT_ID,
    access_key_id=settings.R2_ACCESS_KEY_ID,
    secret_access_key=settings.R2_SECRET_ACCESS_KEY,
    bucket_name=settings.R2_BUCKET_NAME,
)


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_current_user(
    token: str = Header(None, alias="Authorization"),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to extract and validate user from Bearer token
    """
    if not token:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    # Remove "Bearer " prefix if present
    if token.startswith("Bearer "):
        token = token[7:]

    try:
        user_id = uuid.UUID(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token format")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


def generate_slug(name: str) -> str:
    """Generate URL-friendly slug from character name"""
    return name.lower().replace(" ", "-").replace("'", "").replace('"', "")


def verify_campaign_ownership(
    campaign_id: str,
    user: User,
    db: Session
) -> Campaign:
    """
    Verify user owns the campaign
    Returns campaign if authorized, raises 403/404 otherwise
    """
    try:
        campaign_uuid = uuid.UUID(campaign_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campaign ID format")

    campaign = db.query(Campaign).filter(Campaign.id == campaign_uuid).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if campaign.owner_id != user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to access this campaign"
        )

    return campaign


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class CharacterResponse(BaseModel):
    id: str
    campaign_id: str
    name: str
    slug: str
    class_: Optional[str] = None
    race: Optional[str] = None
    player_name: Optional[str] = None
    description: Optional[str] = None
    backstory: Optional[str] = None
    image_url: Optional[str] = None
    level: int
    is_active: bool
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
        populate_by_name = True


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.post("", status_code=201)
async def create_character(
    campaign_id: str = Form(...),
    name: str = Form(...),
    class_name: Optional[str] = Form(None),
    race: Optional[str] = Form(None),
    player_name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    backstory: Optional[str] = Form(None),
    level: Optional[int] = Form(1),
    image: Optional[UploadFile] = File(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create new character in campaign (requires authentication and campaign ownership)
    Accepts multipart/form-data with optional image upload
    """
    # Verify campaign ownership
    campaign = verify_campaign_ownership(campaign_id, user, db)

    # Generate slug
    slug = generate_slug(name)

    # Check if character with same name or slug already exists in campaign
    existing = db.query(Character).filter(
        Character.campaign_id == campaign.id,
        ((Character.name == name) | (Character.slug == slug))
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Character with this name already exists in campaign"
        )

    # Create character
    character = Character(
        campaign_id=campaign.id,
        name=name,
        slug=slug,
        class_name=class_name,
        race=race,
        player_name=player_name,
        description=description,
        backstory=backstory,
        level=level if level is not None else 1,
        is_active=True,
    )

    db.add(character)
    db.commit()
    db.refresh(character)

    # Handle image upload if provided
    if image:
        # Validate file
        if image.size and image.size > 5 * 1024 * 1024:  # 5MB limit
            raise HTTPException(status_code=400, detail="Image file too large (max 5MB)")

        valid_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
        if image.content_type not in valid_types:
            raise HTTPException(
                status_code=400,
                detail="Invalid image type (jpg, png, webp only)"
            )

        # Read file content
        file_content = await image.read()

        # Upload to R2
        try:
            result = upload_character_image(
                campaign_id=str(campaign.id),
                character_id=str(character.id),
                file_content=file_content,
                content_type=image.content_type,
                filename=image.filename or "character.webp",
                s3_client=s3_client
            )

            # Update character with image info
            character.image_url = result["url"]
            character.image_r2_key = result["r2_key"]
            db.commit()
            db.refresh(character)
        except Exception as e:
            # Character was created but image upload failed
            # Return character anyway with error message
            return {
                **character.to_dict(),
                "image_upload_error": str(e)
            }

    return character.to_dict()


@router.get("/campaigns/{campaign_id}/characters", response_model=List[Dict])
async def list_campaign_characters(
    campaign_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all characters in a campaign (requires authentication and campaign ownership)
    """
    # Verify campaign ownership
    campaign = verify_campaign_ownership(campaign_id, user, db)

    # Get all characters
    characters = db.query(Character).filter(
        Character.campaign_id == campaign.id
    ).order_by(Character.name).all()

    return [c.to_dict() for c in characters]


@router.get("/{character_id}")
async def get_character(
    character_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get character details (requires authentication)
    User must own the campaign containing this character
    """
    try:
        char_uuid = uuid.UUID(character_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid character ID format")

    character = db.query(Character).filter(Character.id == char_uuid).first()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    # Verify user owns the campaign
    campaign = db.query(Campaign).filter(Campaign.id == character.campaign_id).first()
    if not campaign or campaign.owner_id != user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to access this character"
        )

    return character.to_dict()


@router.patch("/{character_id}")
async def update_character(
    character_id: str,
    name: Optional[str] = Form(None),
    class_name: Optional[str] = Form(None),
    race: Optional[str] = Form(None),
    player_name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    backstory: Optional[str] = Form(None),
    level: Optional[int] = Form(None),
    is_active: Optional[bool] = Form(None),
    image: Optional[UploadFile] = File(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update character (requires authentication and campaign ownership)
    Accepts multipart/form-data with optional image upload
    """
    try:
        char_uuid = uuid.UUID(character_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid character ID format")

    character = db.query(Character).filter(Character.id == char_uuid).first()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    # Verify user owns the campaign
    campaign = db.query(Campaign).filter(Campaign.id == character.campaign_id).first()
    if not campaign or campaign.owner_id != user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to update this character"
        )

    # Update fields
    if name is not None:
        character.name = name
        character.slug = generate_slug(name)
    if class_name is not None:
        character.class_name = class_name
    if race is not None:
        character.race = race
    if player_name is not None:
        character.player_name = player_name
    if description is not None:
        character.description = description
    if backstory is not None:
        character.backstory = backstory
    if level is not None:
        character.level = level
    if is_active is not None:
        character.is_active = is_active

    character.updated_at = datetime.utcnow()

    # Handle image upload if provided
    if image:
        # Validate file
        if image.size and image.size > 5 * 1024 * 1024:  # 5MB limit
            raise HTTPException(status_code=400, detail="Image file too large (max 5MB)")

        valid_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
        if image.content_type not in valid_types:
            raise HTTPException(
                status_code=400,
                detail="Invalid image type (jpg, png, webp only)"
            )

        # Read file content
        file_content = await image.read()

        # Upload to R2 (will delete old image if exists)
        try:
            result = upload_character_image(
                campaign_id=str(campaign.id),
                character_id=str(character.id),
                file_content=file_content,
                content_type=image.content_type,
                filename=image.filename or "character.webp",
                s3_client=s3_client,
                old_r2_key=character.image_r2_key
            )

            # Update character with new image info
            character.image_url = result["url"]
            character.image_r2_key = result["r2_key"]
        except Exception as e:
            # Continue with update but note image upload error
            db.commit()
            db.refresh(character)
            return {
                **character.to_dict(),
                "image_upload_error": str(e)
            }

    db.commit()
    db.refresh(character)

    return character.to_dict()


@router.delete("/{character_id}", status_code=204)
async def delete_character(
    character_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete character (requires authentication and campaign ownership)
    Also deletes associated image from R2
    """
    try:
        char_uuid = uuid.UUID(character_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid character ID format")

    character = db.query(Character).filter(Character.id == char_uuid).first()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    # Verify user owns the campaign
    campaign = db.query(Campaign).filter(Campaign.id == character.campaign_id).first()
    if not campaign or campaign.owner_id != user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to delete this character"
        )

    # Delete image from R2 if exists
    if character.image_r2_key:
        try:
            delete_character_image(character.image_r2_key, s3_client)
        except Exception as e:
            # Log but don't fail the deletion
            print(f"[WARNING] Failed to delete character image: {e}")

    # Delete character from database
    db.delete(character)
    db.commit()

    return None
