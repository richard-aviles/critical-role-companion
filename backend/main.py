"""
Critical Role Companion - FastAPI Backend
Multi-tenant D&D campaign companion with real-time WebSocket updates
"""

import os
import asyncio
import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List, Set
from io import BytesIO

from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, UploadFile, File, Header, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import and_
from pydantic import BaseModel

from settings import settings
from database import init_db, get_db, get_db_context, SessionLocal
from models import (
    Campaign, Character, Episode, Event, Roster, LayoutOverrides, User, Base
)
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

def verify_campaign_token(campaign_id: str, token: str = Header(None, alias="X-Token"), db: Session = Depends(get_db)) -> Campaign:
    """
    Verify admin token and return campaign
    Must be called on admin-only endpoints
    """
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


class CharacterUpdate(BaseModel):
    name: Optional[str] = None
    player_name: Optional[str] = None
    class_name: Optional[str] = None
    race: Optional[str] = None
    description: Optional[str] = None
    backstory: Optional[str] = None


@app.get("/campaigns/{campaign_id}/characters", response_model=List[Dict])
def list_characters(campaign_id: str, db: Session = Depends(get_db)):
    """List all characters in campaign (public)"""
    try:
        campaign_uuid = uuid.UUID(campaign_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campaign ID")

    campaign = db.query(Campaign).filter(Campaign.id == campaign_uuid).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    characters = db.query(Character).filter(Character.campaign_id == campaign_uuid).all()
    return [c.to_dict() for c in characters]


@app.post("/campaigns/{campaign_id}/characters", status_code=201)
def create_character(
    campaign_id: str,
    payload: CharacterCreate,
    campaign: Campaign = Depends(verify_campaign_token),
    db: Session = Depends(get_db)
):
    """Create character in campaign (admin only)"""
    # Generate slug if not provided
    slug = payload.slug or payload.name.lower().replace(" ", "-")

    character = Character(
        campaign_id=campaign.id,
        name=payload.name,
        slug=slug,
        player_name=payload.player_name,
        class_name=payload.class_name,
        race=payload.race,
        description=payload.description,
        backstory=payload.backstory,
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


@app.patch("/campaigns/{campaign_id}/characters/{char_id}")
def update_character(
    campaign_id: str,
    char_id: str,
    campaign: Campaign = Depends(verify_campaign_token),
    db: Session = Depends(get_db),
    # Form fields (for FormData uploads)
    name: Optional[str] = Form(None),
    player_name: Optional[str] = Form(None),
    class_name: Optional[str] = Form(None),
    race: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    backstory: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
):
    """Update character (admin only) - supports JSON and FormData"""
    try:
        char_uuid = uuid.UUID(char_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid character ID")

    character = db.query(Character).filter(
        and_(Character.id == char_uuid, Character.campaign_id == campaign.id)
    ).first()

    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    # Update fields from form data
    if name:
        character.name = name
    if player_name is not None:
        character.player_name = player_name
    if class_name is not None:
        character.class_name = class_name
    if race is not None:
        character.race = race
    if description is not None:
        character.description = description
    if backstory is not None:
        character.backstory = backstory

    # Handle image upload if provided
    if image and image.filename:
        try:
            image_data = image.file.read()
            # Upload to S3/R2
            r2_key = f"characters/{campaign.id}/{character.id}/{image.filename}"
            public_url = s3_client.upload_file(image_data, r2_key)
            character.image_url = public_url
            character.image_r2_key = r2_key
        except Exception as e:
            print(f"[IMAGE UPLOAD ERROR] {str(e)}")
            raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

    character.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(character)

    # Broadcast update
    try:
        asyncio.create_task(broadcast_to_campaign(str(campaign.id), {
            "type": "CHAR_UPDATED",
            "character": character.to_dict()
        }))
    except Exception as e:
        print(f"[BROADCAST ERROR] {str(e)}")

    return character.to_dict()


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

    # Broadcast deletion
    asyncio.create_task(broadcast_to_campaign(str(campaign.id), {
        "type": "CHAR_DELETED",
        "character_id": str(character.id)
    }))

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
    character_id: Optional[str] = None
    event_type: str
    data: Optional[Dict[str, Any]] = None


@app.post("/campaigns/{campaign_id}/events", status_code=201)
async def create_event(
    campaign_id: str,
    payload: EventCreate,
    campaign: Campaign = Depends(verify_campaign_token),
    db: Session = Depends(get_db)
):
    """Create event (HP change, condition, etc.) and broadcast to WebSocket clients"""
    try:
        campaign_uuid = uuid.UUID(campaign_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campaign ID")

    char_id = None
    if payload.character_id:
        try:
            char_id = uuid.UUID(payload.character_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid character ID")

    event = Event(
        campaign_id=campaign_uuid,
        character_id=char_id,
        event_type=payload.event_type,
        data=payload.data or {},
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
# INCLUDE EPISODE & EVENT ROUTERS
# ============================================================================

app.include_router(episodes_router, tags=["episodes"])
