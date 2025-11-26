"""
Critical Role Companion - FastAPI Backend
Multi-tenant D&D campaign companion with real-time WebSocket updates
"""

import os
import json
import asyncio
import uuid
import sys
import logging
from datetime import datetime
from typing import Optional, Dict, Any, List, Set
from io import BytesIO

from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, UploadFile, File, Header, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import and_
from pydantic import BaseModel

from settings import settings
from database import init_db, get_db, get_db_context, SessionLocal
from models import (
    Campaign, Character, Episode, Event, Roster, LayoutOverrides, User, Base, CharacterLayout
)
from schemas import CharacterUpdateRequest, CharacterThemeOverrideInput, CharacterLayoutCreateRequest, CharacterLayoutUpdateRequest, CharacterLayoutResponse, PresetColorScheme
from presets import get_all_presets, cycle_preset
from s3_client import S3Client
from auth import hash_password, verify_password, generate_campaign_token
from episodes import router as episodes_router

# ============================================================================
# APP SETUP
# ============================================================================

app = FastAPI(
    title="Critical Role Companion API",
    version=os.getenv("COMMIT_SHA", "dev"),
    description="Multi-tenant D&D campaign companion API"
)

# Configure logging
logger = logging.getLogger("app")
logger.setLevel(logging.DEBUG)

# CORS configuration
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# S3/R2 client for image uploads
s3_client = S3Client(
    account_id=settings.R2_ACCOUNT_ID,
    access_key_id=settings.R2_ACCESS_KEY_ID,
    secret_access_key=settings.R2_SECRET_ACCESS_KEY,
    bucket_name=settings.R2_BUCKET_NAME,
    public_url=settings.R2_PUBLIC_URL,
)

# ============================================================================
# STARTUP & SHUTDOWN
# ============================================================================

@app.on_event("startup")
def startup():
    """Initialize database on startup"""
    try:
        init_db()
        print("[OK] Database initialized (tables ensured)")
    except Exception as e:
        print(f"[ERROR] Database initialization failed: {e}")
        raise


# ============================================================================
# AUTHENTICATION & HELPERS
# ============================================================================

def verify_campaign_token(campaign_id: str, token: str = Header(None, alias="X-Token"), db: Session = Depends(get_db), request: Request = None) -> Campaign:
    """
    Verify admin token and return campaign
    Must be called on admin-only endpoints
    """
    # Skip validation for OPTIONS preflight requests
    if request and request.method == "OPTIONS":
        return None

    if not token:
        raise HTTPException(status_code=401, detail="Missing X-Token header")

    try:
        campaign_uuid = uuid.UUID(campaign_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campaign ID format")

    campaign = db.query(Campaign).filter(Campaign.id == campaign_uuid).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if campaign.admin_token != token:
        raise HTTPException(status_code=403, detail="Invalid token")

    return campaign


# ============================================================================
# HEALTH & VERSION
# ============================================================================

@app.get("/healthz")
def healthz():
    """Health check endpoint"""
    return {"ok": True, "version": app.version}


@app.get("/version")
def version():
    """Get API version and environment"""
    return {
        "version": app.version,
        "env": settings.ENV,
        "timestamp": datetime.utcnow().isoformat()
    }


# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

class SignupRequest(BaseModel):
    email: str
    password: str


class SignupResponse(BaseModel):
    id: str
    email: str
    created_at: str

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    user_id: str
    email: str
    campaigns: List[Dict[str, Any]]  # List of campaigns owned by user


def get_current_user(token: str = Header(None, alias="Authorization"), db: Session = Depends(get_db)) -> User:
    """
    Dependency to extract and validate user from token
    Token should be in format: Bearer {user_id}
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


@app.post("/auth/signup", status_code=201)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    """
    Create new user account with email and password
    """
    # Validate email
    if not payload.email or "@" not in payload.email:
        raise HTTPException(status_code=400, detail="Invalid email format")

    # Validate password
    if not payload.password or len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    # Check if user already exists
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Email already registered")

    # Create new user
    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "id": str(user.id),
        "email": user.email,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


@app.post("/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user with email and password
    Returns user_id (to use as Authorization token) and list of campaigns owned
    """
    # Find user by email
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Verify password
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Get user's campaigns
    campaigns = db.query(Campaign).filter(Campaign.owner_id == user.id).all()
    campaign_list = [
        {
            "id": str(c.id),
            "slug": c.slug,
            "name": c.name,
            "description": c.description or "",
            "admin_token": c.admin_token,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None,
        }
        for c in campaigns
    ]

    return {
        "user_id": str(user.id),
        "email": user.email,
        "campaigns": campaign_list,
    }


# ============================================================================
# CAMPAIGN ENDPOINTS (PUBLIC & ADMIN)
# ============================================================================

# --- Request/Response Models ---
class CampaignCreate(BaseModel):
    slug: str
    name: str
    description: Optional[str] = None


class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None


class CampaignResponse(BaseModel):
    id: str
    slug: str
    name: str
    description: Optional[str] = None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


# --- Routes ---
def optional_get_current_user(token: str = Header(None, alias="Authorization"), db: Session = Depends(get_db)) -> User:
    """Optional auth - returns user if token provided, None otherwise"""
    if not token:
        return None

    # Remove "Bearer " prefix if present
    if token.startswith("Bearer "):
        token = token[7:]

    try:
        user_id = uuid.UUID(token)
    except ValueError:
        return None

    return db.query(User).filter(User.id == user_id).first()


@app.get("/campaigns", response_model=List[CampaignResponse])
def list_campaigns(
    user: User = Depends(optional_get_current_user),
    db: Session = Depends(get_db)
):
    """
    List campaigns - returns user's campaigns if authenticated, all public campaigns otherwise
    """
    if user:
        # Return only campaigns owned by the authenticated user
        campaigns = db.query(Campaign).filter(Campaign.owner_id == user.id).all()
    else:
        # Return all public campaigns (not commonly needed but available)
        campaigns = db.query(Campaign).all()

    return [CampaignResponse(**c.to_dict()) for c in campaigns]


@app.get("/campaigns/check-slug/{slug}")
def check_slug_availability(
    slug: str,
    db: Session = Depends(get_db)
):
    """
    Check if a campaign slug is available.
    Also suggests alternatives if the slug is taken.
    """
    # Check if slug exists
    existing = db.query(Campaign).filter(Campaign.slug == slug).first()
    available = existing is None

    suggestions = []
    if not available:
        # Generate suggestions: slug-2, slug-3, etc.
        for i in range(2, 11):  # Try up to 10 suggestions
            suggested_slug = f"{slug}-{i}"
            if not db.query(Campaign).filter(Campaign.slug == suggested_slug).first():
                suggestions.append(suggested_slug)
                if len(suggestions) >= 5:  # Limit to 5 suggestions
                    break

    return {
        "slug": slug,
        "available": available,
        "suggestions": suggestions
    }


@app.post("/campaigns", status_code=201)
def create_campaign(
    payload: CampaignCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create new campaign (requires user authentication)
    Campaign is linked to the authenticated user
    """
    # Check slug is unique
    existing = db.query(Campaign).filter(Campaign.slug == payload.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")

    # Generate campaign admin token
    campaign_token = generate_campaign_token()

    campaign = Campaign(
        slug=payload.slug,
        name=payload.name,
        description=payload.description,
        admin_token=campaign_token,
        owner_id=user.id,  # Link campaign to authenticated user
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)

    return {
        **campaign.to_dict(),
        "admin_token": campaign_token,
        "message": "Save this token securely - you'll need it for admin operations"
    }


@app.get("/campaigns/{campaign_id}")
def get_campaign(
    campaign_id: str,
    token: str = Header(None, alias="Authorization"),
    db: Session = Depends(get_db)
):
    """Get campaign details. Returns admin_token if user owns the campaign."""
    try:
        campaign_uuid = uuid.UUID(campaign_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campaign ID")

    campaign = db.query(Campaign).filter(Campaign.id == campaign_uuid).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    result = campaign.to_dict()

    # If user is authenticated and owns the campaign, include the admin token
    if token:
        try:
            # Remove "Bearer " prefix if present
            auth_token = token
            if auth_token.startswith("Bearer "):
                auth_token = auth_token[7:]

            user_id = uuid.UUID(auth_token)
            if campaign.owner_id == user_id:
                result["admin_token"] = campaign.admin_token
        except (ValueError, AttributeError):
            pass

    return result


@app.patch("/campaigns/{campaign_id}")
def update_campaign(
    campaign_id: str,
    payload: CampaignUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update campaign (requires user ownership)"""
    try:
        campaign_uuid = uuid.UUID(campaign_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campaign ID")

    campaign = db.query(Campaign).filter(Campaign.id == campaign_uuid).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Verify user owns this campaign
    if campaign.owner_id != user.id:
        raise HTTPException(status_code=403, detail="You do not own this campaign")

    if payload.name:
        campaign.name = payload.name
    if payload.description is not None:
        campaign.description = payload.description
    if payload.settings:
        campaign.settings = payload.settings

    campaign.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(campaign)

    # Return campaign with admin_token included for owner
    result = campaign.to_dict()
    result["admin_token"] = campaign.admin_token
    return result


@app.delete("/campaigns/{campaign_id}", status_code=204)
def delete_campaign(
    campaign_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete campaign (requires user ownership)"""
    try:
        campaign_uuid = uuid.UUID(campaign_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campaign ID")

    campaign = db.query(Campaign).filter(Campaign.id == campaign_uuid).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Verify user owns this campaign
    if campaign.owner_id != user.id:
        raise HTTPException(status_code=403, detail="You do not own this campaign")

    db.delete(campaign)
    db.commit()

    return None


# ============================================================================
# CHARACTER ENDPOINTS
# ============================================================================

class CharacterCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    player_name: Optional[str] = None
    class_name: Optional[str] = None
    race: Optional[str] = None
    description: Optional[str] = None
    backstory: Optional[str] = None
    color_theme_override: Optional[Dict[str, Any]] = None


class CharacterUpdate(BaseModel):
    name: Optional[str] = None
    player_name: Optional[str] = None
    class_name: Optional[str] = None
    race: Optional[str] = None
    description: Optional[str] = None
    backstory: Optional[str] = None
    color_theme_override: Optional[Dict[str, Any]] = None


class EpisodeCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    episode_number: Optional[int] = None
    season: Optional[int] = None
    description: Optional[str] = None
    air_date: Optional[str] = None
    runtime: Optional[int] = None
    is_published: Optional[bool] = False


class EpisodeUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    episode_number: Optional[int] = None
    season: Optional[int] = None
    description: Optional[str] = None
    air_date: Optional[str] = None
    runtime: Optional[int] = None
    is_published: Optional[bool] = None


@app.get("/campaigns/{campaign_id}/characters", response_model=List[Dict])
def list_characters(campaign_id: str, db: Session = Depends(get_db)):
    """List all characters in campaign (public)"""
    print("\n" + "="*80)
    print("[LIST CHARACTERS - DETAILED LOG]")
    print("="*80)
    print(f"Timestamp: {datetime.utcnow().isoformat()}")
    print(f"Campaign ID: {campaign_id}")

    try:
        campaign_uuid = uuid.UUID(campaign_id)
        print(f"Campaign UUID: {campaign_uuid}")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campaign ID")

    campaign = db.query(Campaign).filter(Campaign.id == campaign_uuid).first()
    if not campaign:
        print(f"[ERROR] Campaign not found: {campaign_uuid}")
        print("="*80 + "\n")
        raise HTTPException(status_code=404, detail="Campaign not found")

    print(f"Campaign found: {campaign.name}")
    characters = db.query(Character).filter(Character.campaign_id == campaign_uuid).all()
    result = [c.to_dict() for c in characters]
    print(f"Found {len(result)} characters")
    for char in result[:3]:  # Show first 3
        print(f"  - {char.get('name')} (class: {char.get('class')})")
    print("="*80 + "\n")
    return result


@app.post("/campaigns/{campaign_id}/characters", status_code=201)
def create_character(
    campaign_id: str,
    payload: CharacterCreate,
    campaign: Campaign = Depends(verify_campaign_token),
    db: Session = Depends(get_db)
):
    """Create character in campaign (admin only)"""
    import json
    import os

    # FIRST THING: Write immediate log to confirm endpoint was called
    import tempfile
    try:
        test_file = os.path.join(tempfile.gettempdir(), "CREATE_CHAR_CALLED.txt")
        with open(test_file, "w") as f:
            f.write(f"CREATE_CHARACTER ENDPOINT CALLED at {str(__import__('datetime').datetime.now())}\n")
            f.write(f"Campaign ID: {campaign_id}\n")
            f.write(f"Payload name: {payload.name}\n")
    except:
        pass  # Ignore write errors

    # Generate slug if not provided
    slug = payload.slug or payload.name.lower().replace(" ", "-")

    # THIS IS THE KEY ISSUE: Check what we're getting from payload
    color_override_data = payload.color_theme_override

    # Write to file in the current working directory
    cwd = os.getcwd()
    log_file = os.path.join(cwd, "color_override_debug.txt")

    with open(log_file, "w") as f:
        f.write(f"Working directory: {cwd}\n")
        f.write(f"Character name: {payload.name}\n")
        f.write(f"payload.color_theme_override is None: {payload.color_theme_override is None}\n")
        f.write(f"payload.color_theme_override type: {type(payload.color_theme_override)}\n")
        f.write(f"payload.color_theme_override value:\n{json.dumps(payload.color_theme_override, indent=2) if payload.color_theme_override else 'NONE'}\n")
        f.write(f"\ncolor_override_data is None: {color_override_data is None}\n")
        f.write(f"color_override_data type: {type(color_override_data)}\n")

    character = Character(
        campaign_id=campaign.id,
        name=payload.name,
        slug=slug,
        player_name=payload.player_name,
        class_name=payload.class_name,
        race=payload.race,
        description=payload.description,
        backstory=payload.backstory,
        color_theme_override=color_override_data,
    )

    db.add(character)
    db.commit()
    db.refresh(character)

    # Broadcast to all connected clients (background task)
    try:
        asyncio.create_task(broadcast_to_campaign(str(campaign.id), {
            "type": "CHAR_CREATED",
            "character": character.to_dict()
        }))
    except Exception as e:
        print(f"[BROADCAST ERROR] {str(e)}")
        # Don't fail the request if broadcast fails

    return character.to_dict()


@app.get("/campaigns/{campaign_id}/characters/{char_id}")
def get_character(campaign_id: str, char_id: str, db: Session = Depends(get_db)):
    """Get character details (public)"""
    try:
        campaign_uuid = uuid.UUID(campaign_id)
        char_uuid = uuid.UUID(char_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    character = db.query(Character).filter(
        and_(Character.id == char_uuid, Character.campaign_id == campaign_uuid)
    ).first()

    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    return character.to_dict()


@app.patch("/campaigns/{campaign_id}/characters/{char_id}/image")
def update_character_image(
    campaign_id: str,
    char_id: str,
    campaign: Campaign = Depends(verify_campaign_token),
    db: Session = Depends(get_db),
    # Form fields for image upload
    image: Optional[UploadFile] = File(None),
):
    """Upload/update character image only"""

    # ===== DETAILED LOGGING =====
    print("\n" + "="*80)
    print("[CHARACTER IMAGE UPDATE - DETAILED LOG]")
    print("="*80)
    print(f"Timestamp: {datetime.utcnow().isoformat()}")
    print(f"\nURL: PATCH /campaigns/{campaign_id}/characters/{char_id}/image")
    print(f"Campaign ID: {campaign_id}")
    print(f"Character ID: {char_id}")
    print(f"\nIMAGE DATA:")
    print(f"  Filename: {image.filename if image else 'None'}")
    print(f"  Content-Type: {image.content_type if image else 'None'}")
    print(f"  File size: {len(image.file.read()) if image else 0} bytes")
    if image:
        image.file.seek(0)  # Reset file pointer
    # ===== END LOGGING =====

    try:
        char_uuid = uuid.UUID(char_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid character ID")

    character = db.query(Character).filter(
        and_(Character.id == char_uuid, Character.campaign_id == campaign.id)
    ).first()

    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    if not image or not image.filename:
        print("[IMAGE UPLOAD ERROR] No image provided")
        raise HTTPException(status_code=400, detail="No image provided")

    try:
        image_data = image.file.read()
        print(f"[IMAGE UPLOAD] Read {len(image_data)} bytes from file")

        # Upload to S3/R2
        r2_key = f"characters/{campaign.id}/{character.id}/{image.filename}"

        # Determine content type from filename
        content_type = "image/jpeg"
        if image.filename.lower().endswith('.png'):
            content_type = "image/png"
        elif image.filename.lower().endswith('.webp'):
            content_type = "image/webp"
        elif image.filename.lower().endswith('.gif'):
            content_type = "image/gif"

        print(f"[IMAGE UPLOAD] Uploading to R2 with key: {r2_key}")
        print(f"[IMAGE UPLOAD] Content-Type: {content_type}")

        public_url = s3_client.upload_image(r2_key, image_data, content_type)
        character.image_url = public_url
        character.image_r2_key = r2_key
        character.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(character)

        print(f"[IMAGE UPLOAD SUCCESS] URL: {public_url}")
        print("="*80 + "\n")

        # Broadcast update
        try:
            asyncio.create_task(broadcast_to_campaign(str(campaign.id), {
                "type": "CHAR_UPDATED",
                "character": character.to_dict()
            }))
        except Exception as e:
            print(f"[BROADCAST ERROR] {str(e)}")

        return character.to_dict()
    except Exception as e:
        print(f"[IMAGE UPLOAD ERROR] {str(e)}")
        print("="*80 + "\n")
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")


@app.delete("/campaigns/{campaign_id}/characters/{char_id}", status_code=204)
def delete_character(
    campaign_id: str,
    char_id: str,
    campaign: Campaign = Depends(verify_campaign_token),
    db: Session = Depends(get_db)
):
    """Delete character (admin only)"""
    try:
        char_uuid = uuid.UUID(char_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid character ID")

    character = db.query(Character).filter(
        and_(Character.id == char_uuid, Character.campaign_id == campaign.id)
    ).first()

    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    db.delete(character)
    db.commit()

    # Broadcast deletion (best effort - don't fail if broadcast fails)
    try:
        asyncio.create_task(broadcast_to_campaign(str(campaign.id), {
            "type": "CHAR_DELETED",
            "character_id": str(character.id)
        }))
    except RuntimeError:
        # No running event loop - broadcast is optional, deletion succeeded
        pass

    return None


# ============================================================================
# EPISODE ENDPOINTS
# ============================================================================

@app.post("/campaigns/{campaign_id}/episodes", status_code=201)
def create_episode(
    campaign_id: str,
    payload: EpisodeCreate,
    campaign: Campaign = Depends(verify_campaign_token),
    db: Session = Depends(get_db)
):
    """Create episode in campaign (admin only)"""
    # Generate slug if not provided
    slug = payload.slug or payload.name.lower().replace(" ", "-")

    episode = Episode(
        campaign_id=campaign.id,
        name=payload.name,
        slug=slug,
        episode_number=payload.episode_number,
        season=payload.season,
        description=payload.description,
        air_date=payload.air_date,
        runtime=payload.runtime,
        is_published=payload.is_published or False,
    )
    db.add(episode)
    db.commit()
    db.refresh(episode)

    return episode.to_dict()


@app.get("/campaigns/{campaign_id}/episodes", response_model=List[Dict])
def list_episodes(campaign_id: str, db: Session = Depends(get_db)):
    """List all episodes in campaign (public)"""
    try:
        campaign_uuid = uuid.UUID(campaign_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campaign ID")

    episodes = db.query(Episode).filter(Episode.campaign_id == campaign_uuid).all()
    return [ep.to_dict() for ep in episodes]


@app.get("/campaigns/{campaign_id}/episodes/{episode_id}")
def get_episode(campaign_id: str, episode_id: str, db: Session = Depends(get_db)):
    """Get episode details (public)"""
    try:
        ep_uuid = uuid.UUID(episode_id)
        campaign_uuid = uuid.UUID(campaign_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID")

    episode = db.query(Episode).filter(
        and_(Episode.id == ep_uuid, Episode.campaign_id == campaign_uuid)
    ).first()

    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")

    return episode.to_dict()


@app.patch("/campaigns/{campaign_id}/episodes/{episode_id}")
def update_episode(
    campaign_id: str,
    episode_id: str,
    payload: EpisodeUpdate,
    campaign: Campaign = Depends(verify_campaign_token),
    db: Session = Depends(get_db)
):
    """Update episode (admin only)"""
    try:
        ep_uuid = uuid.UUID(episode_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid episode ID")

    episode = db.query(Episode).filter(
        and_(Episode.id == ep_uuid, Episode.campaign_id == campaign.id)
    ).first()

    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")

    # Update fields
    if payload.name is not None:
        episode.name = payload.name
    if payload.slug is not None:
        episode.slug = payload.slug
    if payload.episode_number is not None:
        episode.episode_number = payload.episode_number
    if payload.season is not None:
        episode.season = payload.season
    if payload.description is not None:
        episode.description = payload.description
    if payload.air_date is not None:
        episode.air_date = payload.air_date
    if payload.runtime is not None:
        episode.runtime = payload.runtime
    if payload.is_published is not None:
        episode.is_published = payload.is_published

    episode.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(episode)

    return episode.to_dict()


@app.delete("/campaigns/{campaign_id}/episodes/{episode_id}", status_code=204)
def delete_episode(
    campaign_id: str,
    episode_id: str,
    campaign: Campaign = Depends(verify_campaign_token),
    db: Session = Depends(get_db)
):
    """Delete episode (admin only)"""
    try:
        ep_uuid = uuid.UUID(episode_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid episode ID")

    episode = db.query(Episode).filter(
        and_(Episode.id == ep_uuid, Episode.campaign_id == campaign.id)
    ).first()

    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")

    db.delete(episode)
    db.commit()

    return None


# ============================================================================
# IMAGE UPLOAD ENDPOINTS
# ============================================================================

@app.post("/campaigns/{campaign_id}/characters/{char_id}/portrait")
async def upload_portrait(
    campaign_id: str,
    char_id: str,
    file: UploadFile = File(...),
    campaign: Campaign = Depends(verify_campaign_token),
    db: Session = Depends(get_db)
):
    """Upload character portrait image (admin only)"""
    try:
        char_uuid = uuid.UUID(char_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid character ID")

    # Verify character exists and belongs to campaign
    character = db.query(Character).filter(
        and_(Character.id == char_uuid, Character.campaign_id == campaign.id)
    ).first()

    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    # Read and validate file
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    # Validate file type
    valid_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in valid_types:
        raise HTTPException(status_code=400, detail="Invalid file type (jpg, png, webp only)")

    # Upload to R2
    try:
        key = f"{campaign.slug}/portraits/{str(character.id)}.webp"
        url = s3_client.upload_image(key, contents, file.content_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

    # Update character
    character.portrait_url = url
    character.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(character)

    # Broadcast update
    await broadcast_to_campaign(str(campaign.id), {
        "type": "CHAR_UPDATED",
        "character": character.to_dict()
    })

    return {
        "url": url,
        "character_id": str(character.id),
        "message": "Portrait uploaded successfully"
    }


@app.post("/campaigns/{campaign_id}/characters/{char_id}/background")
async def upload_background(
    campaign_id: str,
    char_id: str,
    file: UploadFile = File(...),
    campaign: Campaign = Depends(verify_campaign_token),
    db: Session = Depends(get_db)
):
    """Upload character background image (admin only)"""
    try:
        char_uuid = uuid.UUID(char_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid character ID")

    # Verify character exists
    character = db.query(Character).filter(
        and_(Character.id == char_uuid, Character.campaign_id == campaign.id)
    ).first()

    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    # Read and validate file
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    # Validate file type
    valid_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in valid_types:
        raise HTTPException(status_code=400, detail="Invalid file type (jpg, png, webp only)")

    # Upload to R2
    try:
        key = f"{campaign.slug}/backgrounds/{str(character.id)}.webp"
        url = s3_client.upload_image(key, contents, file.content_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

    # Update character
    character.background_url = url
    character.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(character)

    # Broadcast update
    await broadcast_to_campaign(str(campaign.id), {
        "type": "CHAR_UPDATED",
        "character": character.to_dict()
    })

    return {
        "url": url,
        "character_id": str(character.id),
        "message": "Background uploaded successfully"
    }


# ============================================================================
# WEBSOCKET - REAL-TIME UPDATES
# ============================================================================

# Store active connections per campaign
campaign_connections: Dict[str, Set[WebSocket]] = {}


async def broadcast_to_campaign(campaign_id: str, message: Dict[str, Any]):
    """Broadcast message to all clients connected to a campaign"""
    if campaign_id not in campaign_connections:
        return

    dead_connections = []
    for ws in campaign_connections[campaign_id]:
        try:
            await ws.send_json(message)
        except Exception:
            dead_connections.append(ws)

    # Clean up dead connections
    for ws in dead_connections:
        campaign_connections[campaign_id].discard(ws)


@app.websocket("/campaigns/{campaign_id}/ws")
async def websocket_endpoint(websocket: WebSocket, campaign_id: str):
    """
    WebSocket endpoint for real-time campaign updates
    Broadcasts character updates, HP changes, events, etc.
    """
    try:
        campaign_uuid = uuid.UUID(campaign_id)
    except ValueError:
        await websocket.close(code=4000, reason="Invalid campaign ID")
        return

    # Verify campaign exists
    with get_db_context() as db:
        campaign = db.query(Campaign).filter(Campaign.id == campaign_uuid).first()
        if not campaign:
            await websocket.close(code=4004, reason="Campaign not found")
            return

    await websocket.accept()

    # Add to campaign connections
    if campaign_id not in campaign_connections:
        campaign_connections[campaign_id] = set()
    campaign_connections[campaign_id].add(websocket)

    # Send bootstrap event with current state
    with get_db_context() as db:
        characters = db.query(Character).filter(Character.campaign_id == campaign_uuid).all()
        roster = db.query(Roster).filter(Roster.campaign_id == campaign_uuid).first()

        await websocket.send_json({
            "type": "BOOTSTRAP",
            "campaign": campaign.to_dict(),
            "characters": [c.to_dict() for c in characters],
            "roster": roster.to_dict() if roster else {"character_ids": []},
        })

    # Handle incoming messages and pings
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back any received messages (keep-alive)
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        campaign_connections[campaign_id].discard(websocket)
    except Exception as e:
        print(f"[ERROR] WebSocket error: {e}")
        campaign_connections[campaign_id].discard(websocket)


# ============================================================================
# EVENT ENDPOINTS (HP changes, conditions, etc.)
# ============================================================================

class EventCreate(BaseModel):
    name: str
    description: Optional[str] = None
    timestamp_in_episode: Optional[int] = None
    event_type: Optional[str] = None
    characters_involved: Optional[List[str]] = None


@app.post("/campaigns/{campaign_id}/events", status_code=201)
async def create_event(
    campaign_id: str,
    payload: EventCreate,
    campaign: Campaign = Depends(verify_campaign_token),
    db: Session = Depends(get_db)
):
    """Create event and broadcast to WebSocket clients"""
    try:
        campaign_uuid = uuid.UUID(campaign_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campaign ID")

    # Convert characters_involved array to JSON string if provided
    characters_involved_str = None
    if payload.characters_involved:
        characters_involved_str = json.dumps(payload.characters_involved)

    # Note: This endpoint creates events without an episode context
    # For episode-specific events, use POST /episodes/{episode_id}/events instead
    event = Event(
        name=payload.name,
        description=payload.description,
        timestamp_in_episode=payload.timestamp_in_episode,
        event_type=payload.event_type,
        characters_involved=characters_involved_str,
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    # Broadcast to WebSocket clients
    await broadcast_to_campaign(campaign_id, {
        "type": "EVENT",
        "event": event.to_dict()
    })

    return event.to_dict()


@app.get("/campaigns/{campaign_id}/events")
def list_events(
    campaign_id: str,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List recent events in campaign (public)"""
    try:
        campaign_uuid = uuid.UUID(campaign_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campaign ID")

    events = db.query(Event).filter(
        Event.campaign_id == campaign_uuid
    ).order_by(Event.timestamp.desc()).limit(limit).all()

    return [e.to_dict() for e in events]


@app.get("/episodes/{episode_id}/events")
def list_episode_events(
    episode_id: str,
    token: str = Header(None, alias="X-Token"),
    db: Session = Depends(get_db)
):
    """List all events in an episode (requires campaign authorization)"""
    try:
        ep_uuid = uuid.UUID(episode_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid episode ID")

    if not token:
        raise HTTPException(status_code=401, detail="Missing X-Token header")

    # Get the episode to verify it exists
    episode = db.query(Episode).filter(Episode.id == ep_uuid).first()
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")

    # Verify the user has access to this episode's campaign
    campaign = db.query(Campaign).filter(Campaign.id == episode.campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if campaign.admin_token != token:
        raise HTTPException(status_code=403, detail="Invalid admin token")

    # Fetch all events for this episode
    events = db.query(Event).filter(
        Event.episode_id == ep_uuid
    ).order_by(Event.created_at.desc()).all()

    return [e.to_dict() for e in events]


@app.post("/episodes/{episode_id}/events", status_code=201)
async def create_episode_event(
    episode_id: str,
    payload: EventCreate,
    token: str = Header(None, alias="X-Token"),
    db: Session = Depends(get_db)
):
    """Create an event in an episode (requires campaign authorization)"""
    try:
        ep_uuid = uuid.UUID(episode_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid episode ID")

    if not token:
        raise HTTPException(status_code=401, detail="Missing X-Token header")

    # Get the episode to verify it exists
    episode = db.query(Episode).filter(Episode.id == ep_uuid).first()
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")

    # Verify the user has access to this episode's campaign
    campaign = db.query(Campaign).filter(Campaign.id == episode.campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if campaign.admin_token != token:
        raise HTTPException(status_code=403, detail="Invalid admin token")

    # Convert characters_involved array to JSON string if provided (always JSON, even if empty)
    characters_involved_str = None
    if payload.characters_involved is not None:
        characters_involved_str = json.dumps(payload.characters_involved)

    # Create the event
    event = Event(
        episode_id=ep_uuid,
        name=payload.name,
        description=payload.description,
        timestamp_in_episode=payload.timestamp_in_episode,
        event_type=payload.event_type,
        characters_involved=characters_involved_str,
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    # Broadcast to WebSocket clients
    await broadcast_to_campaign(str(episode.campaign_id), {
        "type": "EVENT",
        "event": event.to_dict()
    })

    return event.to_dict()


@app.patch("/episodes/{episode_id}/events/{event_id}")
async def update_episode_event(
    episode_id: str,
    event_id: str,
    payload: EventCreate,
    token: str = Header(None, alias="X-Token"),
    db: Session = Depends(get_db)
):
    """Update an event in an episode (requires campaign authorization)"""
    try:
        ep_uuid = uuid.UUID(episode_id)
        ev_uuid = uuid.UUID(event_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid episode or event ID")

    if not token:
        raise HTTPException(status_code=401, detail="Missing X-Token header")

    # Get the episode to verify it exists
    episode = db.query(Episode).filter(Episode.id == ep_uuid).first()
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")

    # Get the event to verify it exists
    event = db.query(Event).filter(Event.id == ev_uuid).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Verify the event belongs to this episode
    if event.episode_id != ep_uuid:
        raise HTTPException(status_code=400, detail="Event does not belong to this episode")

    # Verify the user has access to this episode's campaign
    campaign = db.query(Campaign).filter(Campaign.id == episode.campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if campaign.admin_token != token:
        raise HTTPException(status_code=403, detail="Invalid admin token")

    # Update the event fields
    if payload.name:
        event.name = payload.name
    if payload.description is not None:
        event.description = payload.description
    if payload.timestamp_in_episode is not None:
        event.timestamp_in_episode = payload.timestamp_in_episode
    if payload.event_type is not None:
        event.event_type = payload.event_type
    if payload.characters_involved is not None:
        # Handle empty arrays - always serialize to JSON, even if empty list
        event.characters_involved = json.dumps(payload.characters_involved)

    db.commit()
    db.refresh(event)

    # Broadcast to WebSocket clients
    await broadcast_to_campaign(str(episode.campaign_id), {
        "type": "EVENT_UPDATED",
        "event": event.to_dict()
    })

    return event.to_dict()


@app.delete("/episodes/{episode_id}/events/{event_id}")
async def delete_episode_event(
    episode_id: str,
    event_id: str,
    token: str = Header(None, alias="X-Token"),
    db: Session = Depends(get_db)
):
    """Delete an event from an episode (requires campaign authorization)"""
    try:
        ep_uuid = uuid.UUID(episode_id)
        ev_uuid = uuid.UUID(event_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid episode or event ID")

    if not token:
        raise HTTPException(status_code=401, detail="Missing X-Token header")

    # Get the episode to verify it exists
    episode = db.query(Episode).filter(Episode.id == ep_uuid).first()
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")

    # Get the event to verify it exists
    event = db.query(Event).filter(Event.id == ev_uuid).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Verify the event belongs to this episode
    if event.episode_id != ep_uuid:
        raise HTTPException(status_code=400, detail="Event does not belong to this episode")

    # Verify the user has access to this episode's campaign
    campaign = db.query(Campaign).filter(Campaign.id == episode.campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if campaign.admin_token != token:
        raise HTTPException(status_code=403, detail="Invalid admin token")

    # Delete the event
    db.delete(event)
    db.commit()

    # Broadcast to WebSocket clients
    await broadcast_to_campaign(str(episode.campaign_id), {
        "type": "EVENT_DELETED",
        "event_id": str(event_id)
    })

    return {"message": "Event deleted successfully"}


# ============================================================================
# ROSTER ENDPOINTS
# ============================================================================

class RosterUpdate(BaseModel):
    character_ids: List[str]


@app.get("/campaigns/{campaign_id}/roster")
def get_roster(campaign_id: str, db: Session = Depends(get_db)):
    """Get current active roster (public)"""
    try:
        campaign_uuid = uuid.UUID(campaign_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campaign ID")

    roster = db.query(Roster).filter(Roster.campaign_id == campaign_uuid).first()
    if not roster:
        return {"character_ids": []}

    return roster.to_dict()


@app.patch("/campaigns/{campaign_id}/roster")
async def update_roster(
    campaign_id: str,
    payload: RosterUpdate,
    campaign: Campaign = Depends(verify_campaign_token),
    db: Session = Depends(get_db)
):
    """Update active roster (admin only)"""
    # Convert string IDs to UUIDs
    char_uuids = []
    for char_id_str in payload.character_ids:
        try:
            char_uuids.append(uuid.UUID(char_id_str))
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid character ID: {char_id_str}")

    roster = db.query(Roster).filter(Roster.campaign_id == campaign.id).first()
    if not roster:
        roster = Roster(campaign_id=campaign.id, character_ids=char_uuids)
        db.add(roster)
    else:
        roster.character_ids = char_uuids
        roster.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(roster)

    # Broadcast update
    await broadcast_to_campaign(campaign_id, {
        "type": "ROSTER_UPDATED",
        "roster": roster.to_dict()
    })

    return roster.to_dict()


# ============================================================================
# PHASE 3: CHARACTER LAYOUT & STATS ENDPOINTS
# ============================================================================

@app.get("/presets")
def get_color_presets():
    """Get all available color presets (public endpoint)"""
    return {"presets": get_all_presets()}


@app.post("/campaigns/{campaign_id}/character-layouts", response_model=CharacterLayoutResponse)
async def create_character_layout(
    campaign_id: str,
    payload: CharacterLayoutCreateRequest,
    campaign: Campaign = Depends(verify_campaign_token),
    db: Session = Depends(get_db)
):
    """Create a new character layout for a campaign (admin only)"""
    try:
        campaign_uuid = uuid.UUID(campaign_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campaign ID")

    # Verify campaign ownership
    if campaign.id != campaign_uuid:
        raise HTTPException(status_code=403, detail="Not authorized to modify this campaign")

    # If this layout is set as default, unset other defaults
    if payload.is_default:
        db.query(CharacterLayout).filter(
            and_(CharacterLayout.campaign_id == campaign_uuid, CharacterLayout.is_default == True)
        ).update({"is_default": False})

    layout = CharacterLayout(
        campaign_id=campaign_uuid,
        name=payload.name,
        is_default=payload.is_default,
        stats_to_display=payload.stats_to_display,
        border_color_count=payload.border_color_count,
        border_colors=payload.border_colors,
        text_color=payload.text_color,
        badge_interior_gradient=payload.badge_interior_gradient,
        hp_color=payload.hp_color,
        ac_color=payload.ac_color,
        badge_layout=[b.dict() for b in payload.badge_layout],
        color_preset=payload.color_preset,
    )

    db.add(layout)
    db.commit()
    db.refresh(layout)

    return layout.to_dict()


@app.get("/campaigns/{campaign_id}/character-layouts")
def list_character_layouts(
    campaign_id: str,
    campaign: Campaign = Depends(verify_campaign_token),
    db: Session = Depends(get_db)
):
    """List all character layouts for a campaign (admin only)"""
    try:
        campaign_uuid = uuid.UUID(campaign_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campaign ID")

    if campaign.id != campaign_uuid:
        raise HTTPException(status_code=403, detail="Not authorized to view this campaign")

    layouts = db.query(CharacterLayout).filter(
        CharacterLayout.campaign_id == campaign_uuid
    ).all()

    return {"layouts": [layout.to_dict() for layout in layouts]}


@app.get("/campaigns/{campaign_id}/character-layouts/{layout_id}", response_model=CharacterLayoutResponse)
def get_character_layout(
    campaign_id: str,
    layout_id: str,
    campaign: Campaign = Depends(verify_campaign_token),
    db: Session = Depends(get_db)
):
    """Get a specific character layout (admin only)"""
    try:
        campaign_uuid = uuid.UUID(campaign_id)
        layout_uuid = uuid.UUID(layout_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campaign or layout ID")

    if campaign.id != campaign_uuid:
        raise HTTPException(status_code=403, detail="Not authorized to view this campaign")

    layout = db.query(CharacterLayout).filter(
        and_(CharacterLayout.id == layout_uuid, CharacterLayout.campaign_id == campaign_uuid)
    ).first()

    if not layout:
        raise HTTPException(status_code=404, detail="Layout not found")

    return layout.to_dict()


@app.patch("/campaigns/{campaign_id}/character-layouts/{layout_id}", response_model=CharacterLayoutResponse)
async def update_character_layout(
    campaign_id: str,
    layout_id: str,
    payload: CharacterLayoutUpdateRequest,
    campaign: Campaign = Depends(verify_campaign_token),
    db: Session = Depends(get_db)
):
    """Update a character layout (admin only)"""
    try:
        campaign_uuid = uuid.UUID(campaign_id)
        layout_uuid = uuid.UUID(layout_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campaign or layout ID")

    if campaign.id != campaign_uuid:
        raise HTTPException(status_code=403, detail="Not authorized to modify this campaign")

    layout = db.query(CharacterLayout).filter(
        and_(CharacterLayout.id == layout_uuid, CharacterLayout.campaign_id == campaign_uuid)
    ).first()

    if not layout:
        raise HTTPException(status_code=404, detail="Layout not found")

    # Handle updates
    if payload.name is not None:
        layout.name = payload.name
    if payload.is_default is not None:
        if payload.is_default:
            db.query(CharacterLayout).filter(
                and_(CharacterLayout.campaign_id == campaign_uuid, CharacterLayout.is_default == True, CharacterLayout.id != layout_uuid)
            ).update({"is_default": False})
        layout.is_default = payload.is_default
    if payload.stats_to_display is not None:
        layout.stats_to_display = payload.stats_to_display
    if payload.border_color_count is not None:
        layout.border_color_count = payload.border_color_count
    if payload.border_colors is not None:
        layout.border_colors = payload.border_colors
    if payload.text_color is not None:
        layout.text_color = payload.text_color
    if payload.badge_interior_gradient is not None:
        layout.badge_interior_gradient = payload.badge_interior_gradient
    if payload.hp_color is not None:
        layout.hp_color = payload.hp_color
    if payload.ac_color is not None:
        layout.ac_color = payload.ac_color
    if payload.badge_layout is not None:
        layout.badge_layout = [b.dict() for b in payload.badge_layout]
    if payload.color_preset is not None:
        layout.color_preset = payload.color_preset

    layout.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(layout)

    return layout.to_dict()


@app.delete("/campaigns/{campaign_id}/character-layouts/{layout_id}")
async def delete_character_layout(
    campaign_id: str,
    layout_id: str,
    campaign: Campaign = Depends(verify_campaign_token),
    db: Session = Depends(get_db)
):
    """Delete a character layout (admin only)"""
    try:
        campaign_uuid = uuid.UUID(campaign_id)
        layout_uuid = uuid.UUID(layout_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campaign or layout ID")

    if campaign.id != campaign_uuid:
        raise HTTPException(status_code=403, detail="Not authorized to modify this campaign")

    layout = db.query(CharacterLayout).filter(
        and_(CharacterLayout.id == layout_uuid, CharacterLayout.campaign_id == campaign_uuid)
    ).first()

    if not layout:
        raise HTTPException(status_code=404, detail="Layout not found")

    db.delete(layout)
    db.commit()

    return {"message": "Layout deleted successfully"}


@app.patch("/campaigns/{campaign_id}/characters/{character_id}/stats")
async def update_character_stats(
    campaign_id: str,
    character_id: str,
    stats: Dict[str, Any],
    campaign: Campaign = Depends(verify_campaign_token),
    db: Session = Depends(get_db)
):
    """Update character stats (admin only)"""
    try:
        campaign_uuid = uuid.UUID(campaign_id)
        character_uuid = uuid.UUID(character_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campaign or character ID")

    if campaign.id != campaign_uuid:
        raise HTTPException(status_code=403, detail="Not authorized to modify this campaign")

    character = db.query(Character).filter(
        and_(Character.id == character_uuid, Character.campaign_id == campaign_uuid)
    ).first()

    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    # Update stats - validate only known stat keys
    allowed_stats = {"str", "dex", "con", "int", "wis", "cha", "hp", "ac"}
    character.stats = {k: v for k, v in stats.items() if k in allowed_stats}
    character.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(character)

    return character.to_dict()


@app.patch("/campaigns/{campaign_id}/characters/{character_id}")
async def update_character(
    campaign_id: str,
    character_id: str,
    payload: CharacterUpdateRequest,
    campaign: Campaign = Depends(verify_campaign_token),
    db: Session = Depends(get_db)
):
    """Update character info and stats (admin only)"""


    try:
        campaign_uuid = uuid.UUID(campaign_id)
        character_uuid = uuid.UUID(character_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campaign or character ID")

    if campaign.id != campaign_uuid:
        raise HTTPException(status_code=403, detail="Not authorized to modify this campaign")

    character = db.query(Character).filter(
        and_(Character.id == character_uuid, Character.campaign_id == campaign_uuid)
    ).first()

    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    # Update fields if provided
    if payload.name is not None:
        character.name = payload.name
    if payload.class_name is not None:
        character.class_name = payload.class_name
    if payload.race is not None:
        character.race = payload.race
    if payload.player_name is not None:
        character.player_name = payload.player_name
    if payload.description is not None:
        character.description = payload.description
    if payload.backstory is not None:
        character.backstory = payload.backstory
    if payload.image_url is not None:
        character.image_url = payload.image_url
    if payload.background_image_url is not None:
        character.background_image_url = payload.background_image_url
    if payload.level is not None:
        character.level = payload.level
    if payload.is_active is not None:
        character.is_active = payload.is_active
    if payload.stats is not None:
        allowed_stats = {"str", "dex", "con", "int", "wis", "cha", "hp", "ac"}
        stats_dict = payload.stats.dict(exclude_none=True)
        character.stats = {k: v for k, v in stats_dict.items() if k in allowed_stats}

    # Update color theme override if provided in the request
    # Check if the field was explicitly set (either to a value or to null)
    if 'color_theme_override' in payload.__fields_set__:
        character.color_theme_override = payload.color_theme_override

    character.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(character)

    return character.to_dict()


@app.post("/campaigns/{campaign_id}/characters/{character_id}/color-theme")
async def set_character_color_override(
    campaign_id: str,
    character_id: str,
    payload: CharacterThemeOverrideInput,
    campaign: Campaign = Depends(verify_campaign_token),
    db: Session = Depends(get_db)
):
    """Set character color theme override (admin only)"""
    try:
        campaign_uuid = uuid.UUID(campaign_id)
        character_uuid = uuid.UUID(character_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campaign or character ID")

    if campaign.id != campaign_uuid:
        raise HTTPException(status_code=403, detail="Not authorized to modify this campaign")

    character = db.query(Character).filter(
        and_(Character.id == character_uuid, Character.campaign_id == campaign_uuid)
    ).first()

    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    # Set color theme override
    character.color_theme_override = payload.dict()
    character.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(character)

    return {"message": "Color theme override set", "character": character.to_dict()}


@app.delete("/campaigns/{campaign_id}/characters/{character_id}/color-theme")
async def clear_character_color_override(
    campaign_id: str,
    character_id: str,
    campaign: Campaign = Depends(verify_campaign_token),
    db: Session = Depends(get_db)
):
    """Clear character color theme override to use campaign default (admin only)"""
    try:
        campaign_uuid = uuid.UUID(campaign_id)
        character_uuid = uuid.UUID(character_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campaign or character ID")

    if campaign.id != campaign_uuid:
        raise HTTPException(status_code=403, detail="Not authorized to modify this campaign")

    character = db.query(Character).filter(
        and_(Character.id == character_uuid, Character.campaign_id == campaign_uuid)
    ).first()

    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    # Clear color theme override (set to None)
    character.color_theme_override = None
    character.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(character)

    return {"message": "Color theme override cleared, using campaign default", "character": character.to_dict()}


@app.get("/campaigns/{campaign_id}/characters/{character_id}/resolved-colors")
async def get_resolved_character_colors(
    campaign_id: str,
    character_id: str,
    db: Session = Depends(get_db)
):
    """Get resolved colors for character (character override if set, else campaign layout) - Public endpoint"""
    try:
        campaign_uuid = uuid.UUID(campaign_id)
        character_uuid = uuid.UUID(character_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campaign or character ID")

    campaign = db.query(Campaign).filter(Campaign.id == campaign_uuid).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    character = db.query(Character).filter(
        and_(Character.id == character_uuid, Character.campaign_id == campaign_uuid)
    ).first()

    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    # If character has color override, return that
    if character.color_theme_override:
        return {
            "character_id": str(character.id),
            "source": "character_override",
            "colors": character.color_theme_override
        }

    # Otherwise, get campaign's default layout colors
    layout = db.query(CharacterLayout).filter(
        and_(CharacterLayout.campaign_id == campaign_uuid, CharacterLayout.is_default == True)
    ).first()

    if layout:
        return {
            "character_id": str(character.id),
            "source": "campaign_default",
            "colors": {
                "border_colors": layout.border_colors,
                "text_color": layout.text_color,
                "badge_interior_gradient": layout.badge_interior_gradient,
                "hp_color": layout.hp_color,
                "ac_color": layout.ac_color
            }
        }

    # Fallback: return Option A (Gold & Warmth) preset if no default layout
    return {
        "character_id": str(character.id),
        "source": "system_default",
        "colors": {
            "border_colors": ["#FFD700", "#FFA500", "#FF8C00", "#DC7F2E"],
            "text_color": "#FFFFFF",
            "badge_interior_gradient": {"type": "radial", "colors": ["#FFE4B5", "#DAA520"]},
            "hp_color": {"border": "#FF0000", "interior_gradient": {"type": "radial", "colors": ["#FF6B6B", "#CC0000"]}},
            "ac_color": {"border": "#808080", "interior_gradient": {"type": "radial", "colors": ["#A9A9A9", "#696969"]}}
        }
    }


# ============================================================================
# LAYOUT ENDPOINTS
# ============================================================================

class LayoutUpdate(BaseModel):
    badges: Optional[Dict[str, Any]] = None
    chips: Optional[Dict[str, Any]] = None


@app.get("/campaigns/{campaign_id}/layout/{tier}")
def get_layout(campaign_id: str, tier: str, db: Session = Depends(get_db)):
    """Get layout overrides for tier (public)"""
    try:
        campaign_uuid = uuid.UUID(campaign_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campaign ID")

    layout = db.query(LayoutOverrides).filter(
        and_(LayoutOverrides.campaign_id == campaign_uuid, LayoutOverrides.tier == tier)
    ).first()

    if not layout:
        return {"tier": tier, "badges": {}, "chips": {}}

    return layout.to_dict()


@app.patch("/campaigns/{campaign_id}/layout/{tier}")
async def update_layout(
    campaign_id: str,
    tier: str,
    payload: LayoutUpdate,
    campaign: Campaign = Depends(verify_campaign_token),
    db: Session = Depends(get_db)
):
    """Update layout overrides for tier (admin only)"""
    layout = db.query(LayoutOverrides).filter(
        and_(LayoutOverrides.campaign_id == campaign.id, LayoutOverrides.tier == tier)
    ).first()

    if not layout:
        layout = LayoutOverrides(campaign_id=campaign.id, tier=tier)
        db.add(layout)

    if payload.badges is not None:
        layout.badges = payload.badges
    if payload.chips is not None:
        layout.chips = payload.chips

    layout.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(layout)

    # Broadcast update
    await broadcast_to_campaign(campaign_id, {
        "type": "LAYOUT_UPDATED",
        "tier": tier,
        "layout": layout.to_dict()
    })

    return layout.to_dict()


# ============================================================================
# PUBLIC ENDPOINTS (Phase 3 Tier 3: Campaign Website Pages)
# ============================================================================

@app.get("/public/campaigns")
def get_all_public_campaigns(db: Session = Depends(get_db)):
    """
    Get all public campaigns with character and episode counts (public - no auth required)
    Returns: List of campaigns with character_count and episode_count
    """
    campaigns = db.query(Campaign).all()

    result = []
    for campaign in campaigns:
        active_chars = db.query(Character).filter(
            and_(Character.campaign_id == campaign.id, Character.is_active == True)
        ).count()
        published_eps = db.query(Episode).filter(
            and_(Episode.campaign_id == campaign.id, Episode.is_published == True)
        ).count()

        campaign_dict = campaign.to_dict()
        campaign_dict['character_count'] = active_chars
        campaign_dict['episode_count'] = published_eps
        result.append(campaign_dict)

    return result


@app.get("/public/campaigns/{slug}")
def get_public_campaign(slug: str, db: Session = Depends(get_db)):
    """
    Get campaign details by slug (public - no auth required)
    Returns: Campaign object with stats
    """
    campaign = db.query(Campaign).filter(Campaign.slug == slug).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Count active characters and published episodes
    active_chars = db.query(Character).filter(
        and_(Character.campaign_id == campaign.id, Character.is_active == True)
    ).count()
    published_eps = db.query(Episode).filter(
        and_(Episode.campaign_id == campaign.id, Episode.is_published == True)
    ).count()

    return {
        **campaign.to_dict(),
        "character_count": active_chars,
        "episode_count": published_eps
    }


@app.get("/public/campaigns/{slug}/characters")
def get_public_characters(slug: str, db: Session = Depends(get_db)):
    """
    Get all active characters for a campaign (public - no auth required)
    Returns: List[Character] with color_theme_override
    """
    campaign = db.query(Campaign).filter(Campaign.slug == slug).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    characters = db.query(Character).filter(
        and_(Character.campaign_id == campaign.id, Character.is_active == True)
    ).all()

    return [c.to_dict() for c in characters]


@app.get("/public/campaigns/{slug}/characters/{character_slug}")
def get_public_character(slug: str, character_slug: str, db: Session = Depends(get_db)):
    """
    Get character details by slug (public - no auth required)
    Returns: Character object with full details and color_theme_override
    """
    campaign = db.query(Campaign).filter(Campaign.slug == slug).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    character = db.query(Character).filter(
        and_(
            Character.campaign_id == campaign.id,
            Character.slug == character_slug,
            Character.is_active == True
        )
    ).first()

    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    return character.to_dict()


@app.get("/public/campaigns/{slug}/episodes")
def get_public_episodes(slug: str, db: Session = Depends(get_db)):
    """
    Get all published episodes for a campaign (public - no auth required)
    Returns: List[Episode] ordered by season/episode number
    """
    campaign = db.query(Campaign).filter(Campaign.slug == slug).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    episodes = db.query(Episode).filter(
        and_(Episode.campaign_id == campaign.id, Episode.is_published == True)
    ).order_by(Episode.season.desc(), Episode.episode_number.asc()).all()

    return [e.to_dict() for e in episodes]


@app.get("/public/campaigns/{slug}/episodes/{episode_slug}")
def get_public_episode(slug: str, episode_slug: str, db: Session = Depends(get_db)):
    """
    Get episode details by slug with all events (public - no auth required)
    Returns: Episode object with events included
    """
    campaign = db.query(Campaign).filter(Campaign.slug == slug).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    episode = db.query(Episode).filter(
        and_(
            Episode.campaign_id == campaign.id,
            Episode.slug == episode_slug,
            Episode.is_published == True
        )
    ).first()

    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")

    return episode.to_dict(include_events=True)


@app.get("/public/episodes/{episode_id}/events")
def get_public_episode_events(episode_id: str, db: Session = Depends(get_db)):
    """
    Get all events for an episode (public - no auth required)
    Returns: List[Event] for the episode
    """
    try:
        episode_uuid = uuid.UUID(episode_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid episode ID format")

    episode = db.query(Episode).filter(Episode.id == episode_uuid).first()
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")

    # Only return events if episode is published
    if not episode.is_published:
        raise HTTPException(status_code=403, detail="Episode is not published")

    events = db.query(Event).filter(Event.episode_id == episode_uuid).all()
    return [e.to_dict() for e in events]


# ============================================================================
# PHASE 4: HELPER FUNCTIONS FOR OVERLAY ENDPOINTS
# ============================================================================

def resolve_character_colors(character: Character, campaign: Campaign, db: Session) -> tuple[Dict[str, Any], str]:
    """
    Resolve character colors using three-tier fallback logic:
    1. Character's color_theme_override (if set)
    2. Campaign's default color theme from CharacterLayout (if exists)
    3. System default (Option A - Gold & Warmth preset)

    Returns: (resolved_colors_dict, source_string)
    """
    # Tier 1: Character override
    if character.color_theme_override:
        return (character.color_theme_override, "character_override")

    # Tier 2: Campaign default layout
    layout = db.query(CharacterLayout).filter(
        and_(CharacterLayout.campaign_id == campaign.id, CharacterLayout.is_default == True)
    ).first()

    if layout:
        campaign_colors = {
            "border_colors": layout.border_colors,
            "text_color": layout.text_color,
            "badge_interior_gradient": layout.badge_interior_gradient,
            "hp_color": layout.hp_color,
            "ac_color": layout.ac_color
        }
        return (campaign_colors, "campaign_default")

    # Tier 3: System default (Option A preset)
    from presets import DEFAULT_PRESET
    system_default = {
        "border_colors": DEFAULT_PRESET.border_colors,
        "text_color": DEFAULT_PRESET.text_color,
        "badge_interior_gradient": DEFAULT_PRESET.badge_interior_gradient,
        "hp_color": DEFAULT_PRESET.hp_color,
        "ac_color": DEFAULT_PRESET.ac_color
    }
    return (system_default, "system_default")


# ============================================================================
# PHASE 4: LIVE STREAM OVERLAY ENDPOINTS (PUBLIC - NO AUTH REQUIRED)
# ============================================================================

@app.get("/campaigns/{campaign_id}/overlay/config")
def get_overlay_config(campaign_id: str, db: Session = Depends(get_db)):
    """Get overlay configuration for campaign (PUBLIC - no auth required)"""
    try:
        campaign_uuid = uuid.UUID(campaign_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campaign ID format")

    campaign = db.query(Campaign).filter(Campaign.id == campaign_uuid).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Get default color theme from campaign layout
    default_layout = db.query(CharacterLayout).filter(
        and_(CharacterLayout.campaign_id == campaign_uuid, CharacterLayout.is_default == True)
    ).first()

    default_color_theme = None
    if default_layout:
        default_color_theme = {
            "border_colors": default_layout.border_colors,
            "text_color": default_layout.text_color,
            "badge_interior_gradient": default_layout.badge_interior_gradient,
            "hp_color": default_layout.hp_color,
            "ac_color": default_layout.ac_color
        }

    return {
        "campaign_id": str(campaign.id),
        "campaign_name": campaign.name,
        "campaign_slug": campaign.slug,
        "default_color_theme": default_color_theme,
        "settings": campaign.settings or {}
    }


@app.get("/campaigns/{campaign_id}/overlay/character/{character_id}")
def get_overlay_character(campaign_id: str, character_id: str, db: Session = Depends(get_db)):
    """Get character with resolved colors for overlay (PUBLIC - no auth required)"""
    try:
        campaign_uuid = uuid.UUID(campaign_id)
        char_uuid = uuid.UUID(character_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campaign or character ID format")

    campaign = db.query(Campaign).filter(Campaign.id == campaign_uuid).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    character = db.query(Character).filter(
        and_(Character.id == char_uuid, Character.campaign_id == campaign_uuid)
    ).first()

    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    # Resolve colors with three-tier fallback
    resolved_colors, color_source = resolve_character_colors(character, campaign, db)

    return {
        "id": str(character.id),
        "campaign_id": str(character.campaign_id),
        "name": character.name,
        "slug": character.slug,
        "class_name": character.class_name,
        "race": character.race,
        "player_name": character.player_name,
        "image_url": character.image_url,
        "level": character.level,
        "is_active": character.is_active,
        "stats": character.stats or {},
        "resolved_colors": resolved_colors,
        "color_source": color_source
    }


@app.get("/campaigns/{campaign_id}/overlay/roster")
def get_overlay_roster(campaign_id: str, db: Session = Depends(get_db)):
    """Get character roster for overlay (PUBLIC - no auth required)"""
    try:
        campaign_uuid = uuid.UUID(campaign_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campaign ID format")

    campaign = db.query(Campaign).filter(Campaign.id == campaign_uuid).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Get all characters
    characters = db.query(Character).filter(Character.campaign_id == campaign_uuid).all()

    # Get active roster
    roster = db.query(Roster).filter(Roster.campaign_id == campaign_uuid).first()
    active_roster_ids = [str(cid) for cid in roster.character_ids] if roster and roster.character_ids else []

    # Build character list with resolved colors
    character_list = []
    for char in characters:
        resolved_colors, color_source = resolve_character_colors(char, campaign, db)
        character_list.append({
            "id": str(char.id),
            "name": char.name,
            "slug": char.slug,
            "class_name": char.class_name,
            "image_url": char.image_url,
            "level": char.level,
            "is_active": char.is_active,
            "resolved_colors": resolved_colors,
            "color_source": color_source
        })

    return {
        "campaign_id": str(campaign.id),
        "characters": character_list,
        "active_roster_ids": active_roster_ids
    }


@app.get("/campaigns/{campaign_id}/episodes/{episode_id}/overlay/events")
def get_overlay_episode_events(campaign_id: str, episode_id: str, db: Session = Depends(get_db)):
    """Get episode events timeline for overlay (PUBLIC - no auth required)"""
    try:
        campaign_uuid = uuid.UUID(campaign_id)
        episode_uuid = uuid.UUID(episode_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campaign or episode ID format")

    campaign = db.query(Campaign).filter(Campaign.id == campaign_uuid).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    episode = db.query(Episode).filter(
        and_(Episode.id == episode_uuid, Episode.campaign_id == campaign_uuid)
    ).first()

    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")

    # Get all events for episode
    events = db.query(Event).filter(Event.episode_id == episode_uuid).order_by(Event.timestamp_in_episode.asc()).all()

    # Build event list with character names
    event_list = []
    for event in events:
        character_ids = []
        character_names = []

        if event.characters_involved:
            try:
                character_ids = json.loads(event.characters_involved) if isinstance(event.characters_involved, str) else event.characters_involved

                # Resolve character names
                if character_ids:
                    for char_id_str in character_ids:
                        try:
                            char_uuid = uuid.UUID(char_id_str)
                            char = db.query(Character).filter(Character.id == char_uuid).first()
                            if char:
                                character_names.append(char.name)
                        except (ValueError, AttributeError):
                            continue
            except (json.JSONDecodeError, TypeError):
                pass

        event_list.append({
            "id": str(event.id),
            "episode_id": str(event.episode_id),
            "name": event.name,
            "description": event.description,
            "timestamp_in_episode": event.timestamp_in_episode,
            "event_type": event.event_type,
            "characters_involved": character_ids,
            "character_names": character_names,
            "created_at": event.created_at.isoformat() if event.created_at else None
        })

    return {
        "episode_id": str(episode.id),
        "episode_name": episode.name,
        "episode_number": episode.episode_number,
        "season": episode.season,
        "events": event_list
    }


@app.get("/campaigns/{campaign_id}/overlay/active-episode")
def get_overlay_active_episode(campaign_id: str, db: Session = Depends(get_db)):
    """Get active/featured episode for overlay (PUBLIC - no auth required)"""
    try:
        campaign_uuid = uuid.UUID(campaign_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campaign ID format")

    campaign = db.query(Campaign).filter(Campaign.id == campaign_uuid).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Get most recent published episode
    episode = db.query(Episode).filter(
        and_(Episode.campaign_id == campaign_uuid, Episode.is_published == True)
    ).order_by(Episode.created_at.desc()).first()

    if not episode:
        raise HTTPException(status_code=404, detail="No published episodes found")

    # Count events in episode
    event_count = db.query(Event).filter(Event.episode_id == episode.id).count()

    return {
        "id": str(episode.id),
        "campaign_id": str(episode.campaign_id),
        "name": episode.name,
        "slug": episode.slug,
        "episode_number": episode.episode_number,
        "season": episode.season,
        "description": episode.description,
        "air_date": episode.air_date,
        "runtime": episode.runtime,
        "is_published": episode.is_published,
        "event_count": event_count
    }


# ============================================================================
# INCLUDE EPISODE & EVENT ROUTERS
# ============================================================================

app.include_router(episodes_router, tags=["episodes"])
