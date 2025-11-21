"""
Episode and Event Management Endpoints
Phase 2: Episode timeline and event tracking
"""

import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
import json

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import and_
from pydantic import BaseModel

from database import get_db
from models import Campaign, Episode, Event, User


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_current_user(authorization: str = Header(None, alias="Authorization"), db: Session = Depends(get_db)) -> User:
    """
    Extract and validate user from Authorization header
    Token format: Bearer {user_id}
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    # Remove "Bearer " prefix if present
    token = authorization
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


def verify_campaign_ownership(campaign_id: str, user: User, db: Session) -> Campaign:
    """
    Verify that the user owns the campaign
    Returns the campaign if ownership is verified
    """
    try:
        campaign_uuid = uuid.UUID(campaign_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campaign ID format")

    campaign = db.query(Campaign).filter(Campaign.id == campaign_uuid).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if campaign.owner_id != user.id:
        raise HTTPException(status_code=403, detail="You do not own this campaign")

    return campaign


def verify_episode_ownership(episode_id: str, user: User, db: Session) -> Episode:
    """
    Verify that the user owns the episode (through campaign ownership)
    Returns the episode if ownership is verified
    """
    try:
        episode_uuid = uuid.UUID(episode_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid episode ID format")

    episode = db.query(Episode).filter(Episode.id == episode_uuid).first()
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")

    # Verify campaign ownership
    campaign = db.query(Campaign).filter(Campaign.id == episode.campaign_id).first()
    if not campaign or campaign.owner_id != user.id:
        raise HTTPException(status_code=403, detail="You do not own this episode")

    return episode


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class EpisodeCreate(BaseModel):
    campaign_id: str
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


class EventCreate(BaseModel):
    name: str
    description: Optional[str] = None
    timestamp_in_episode: Optional[int] = None
    event_type: Optional[str] = None
    characters_involved: Optional[List[str]] = None  # List of character IDs


class EventUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    timestamp_in_episode: Optional[int] = None
    event_type: Optional[str] = None
    characters_involved: Optional[List[str]] = None


# ============================================================================
# ROUTER
# ============================================================================

router = APIRouter()


# ============================================================================
# EPISODE ENDPOINTS
# ============================================================================

@router.post("/episodes", status_code=201)
def create_episode(
    payload: EpisodeCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new episode in a campaign
    Requires authentication and campaign ownership
    """
    # Verify campaign ownership
    campaign = verify_campaign_ownership(payload.campaign_id, user, db)

    # Auto-generate slug from name if not provided
    slug = payload.slug
    if not slug:
        slug = payload.name.lower().replace(" ", "-").replace("'", "")

    # Check if slug already exists in this campaign
    existing = db.query(Episode).filter(
        and_(Episode.campaign_id == campaign.id, Episode.slug == slug)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Episode slug already exists in this campaign")

    # Create episode
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


@router.get("/campaigns/{campaign_id}/episodes")
def list_episodes(
    campaign_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all episodes in a campaign
    Requires authentication and campaign ownership
    """
    # Verify campaign ownership
    campaign = verify_campaign_ownership(campaign_id, user, db)

    # Get all episodes ordered by episode number and season
    episodes = db.query(Episode).filter(
        Episode.campaign_id == campaign.id
    ).order_by(Episode.season, Episode.episode_number).all()

    return [ep.to_dict() for ep in episodes]


@router.get("/episodes/{episode_id}")
def get_episode(
    episode_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get episode details including all events
    Requires authentication and campaign ownership
    """
    # Verify ownership
    episode = verify_episode_ownership(episode_id, user, db)

    # Return episode with events included
    return episode.to_dict(include_events=True)


@router.patch("/episodes/{episode_id}")
def update_episode(
    episode_id: str,
    payload: EpisodeUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update episode information
    Requires authentication and campaign ownership
    """
    # Verify ownership
    episode = verify_episode_ownership(episode_id, user, db)

    # Update fields
    if payload.name is not None:
        episode.name = payload.name
    if payload.slug is not None:
        # Check if new slug conflicts
        existing = db.query(Episode).filter(
            and_(
                Episode.campaign_id == episode.campaign_id,
                Episode.slug == payload.slug,
                Episode.id != episode.id
            )
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Episode slug already exists in this campaign")
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


@router.delete("/episodes/{episode_id}", status_code=204)
def delete_episode(
    episode_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an episode (cascades to delete all events)
    Requires authentication and campaign ownership
    """
    # Verify ownership
    episode = verify_episode_ownership(episode_id, user, db)

    db.delete(episode)
    db.commit()

    return None


# ============================================================================
# EVENT ENDPOINTS
# ============================================================================

@router.post("/episodes/{episode_id}/events", status_code=201)
def create_event(
    episode_id: str,
    payload: EventCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new event within an episode
    Requires authentication and campaign ownership
    """
    # Verify ownership
    episode = verify_episode_ownership(episode_id, user, db)

    # Convert characters_involved list to JSON string
    characters_json = None
    if payload.characters_involved:
        characters_json = json.dumps(payload.characters_involved)

    # Create event
    event = Event(
        episode_id=episode.id,
        name=payload.name,
        description=payload.description,
        timestamp_in_episode=payload.timestamp_in_episode,
        event_type=payload.event_type,
        characters_involved=characters_json,
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    return event.to_dict()


@router.get("/episodes/{episode_id}/events")
def list_events(
    episode_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all events in an episode
    Requires authentication and campaign ownership
    """
    # Verify ownership
    episode = verify_episode_ownership(episode_id, user, db)

    # Get all events ordered by timestamp
    events = db.query(Event).filter(
        Event.episode_id == episode.id
    ).order_by(Event.timestamp_in_episode).all()

    return [event.to_dict() for event in events]


@router.patch("/episodes/{episode_id}/events/{event_id}")
def update_event(
    episode_id: str,
    event_id: str,
    payload: EventUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an event
    Requires authentication and campaign ownership
    """
    # Verify ownership of episode
    episode = verify_episode_ownership(episode_id, user, db)

    # Get event and verify it belongs to this episode
    try:
        event_uuid = uuid.UUID(event_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid event ID format")

    event = db.query(Event).filter(
        and_(Event.id == event_uuid, Event.episode_id == episode.id)
    ).first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found in this episode")

    # Update fields
    if payload.name is not None:
        event.name = payload.name
    if payload.description is not None:
        event.description = payload.description
    if payload.timestamp_in_episode is not None:
        event.timestamp_in_episode = payload.timestamp_in_episode
    if payload.event_type is not None:
        event.event_type = payload.event_type
    if payload.characters_involved is not None:
        event.characters_involved = json.dumps(payload.characters_involved)

    event.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(event)

    return event.to_dict()


@router.delete("/episodes/{episode_id}/events/{event_id}", status_code=204)
def delete_event(
    episode_id: str,
    event_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an event
    Requires authentication and campaign ownership
    """
    # Verify ownership of episode
    episode = verify_episode_ownership(episode_id, user, db)

    # Get event and verify it belongs to this episode
    try:
        event_uuid = uuid.UUID(event_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid event ID format")

    event = db.query(Event).filter(
        and_(Event.id == event_uuid, Event.episode_id == episode.id)
    ).first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found in this episode")

    db.delete(event)
    db.commit()

    return None
