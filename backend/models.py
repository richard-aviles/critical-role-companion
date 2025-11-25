"""
SQLAlchemy ORM Models for Critical Role Companion
Multi-tenant architecture - all entities scoped by campaign
"""

from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, UUID, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB, ARRAY, UUID as PG_UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import json

Base = declarative_base()


class User(Base):
    """
    User account for admin access to campaigns
    One user can own multiple campaigns
    """
    __tablename__ = "users"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)  # bcrypt hash
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    campaigns = relationship("Campaign", back_populates="owner", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": str(self.id),
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Campaign(Base):
    """
    Root entity - represents a D&D campaign (e.g., Critical Role Campaign 4)
    All other entities are scoped to a campaign
    Owned by a User who manages it via the admin dashboard
    """
    __tablename__ = "campaigns"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    admin_token = Column(String(255), nullable=False, unique=True)  # Current auth method
    settings = Column(JSONB, nullable=True, default={})  # Theme, layout defaults, etc.
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    owner = relationship("User", back_populates="campaigns")
    characters = relationship("Character", back_populates="campaign", cascade="all, delete-orphan")
    episodes = relationship("Episode", back_populates="campaign", cascade="all, delete-orphan")
    roster = relationship("Roster", back_populates="campaign", uselist=False, cascade="all, delete-orphan")
    layout_overrides = relationship("LayoutOverrides", back_populates="campaign", cascade="all, delete-orphan")
    character_layouts = relationship("CharacterLayout", back_populates="campaign", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": str(self.id),
            "slug": self.slug,
            "name": self.name,
            "description": self.description,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Character(Base):
    """
    Player character in a campaign - Phase 2 schema
    Stores basic info, images, and metadata
    """
    __tablename__ = "characters"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(PG_UUID(as_uuid=True), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False, index=True)

    # Basic Info
    name = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False, index=True)
    class_name = Column(String(100), nullable=True)  # Renamed from 'class' (Python keyword)
    race = Column(String(100), nullable=True)
    player_name = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    backstory = Column(Text, nullable=True)

    # Image/Media
    image_url = Column(String(500), nullable=True)  # Public R2 URL (portrait)
    image_r2_key = Column(String(255), nullable=True)  # R2 storage key for deletion
    background_image_url = Column(String(500), nullable=True)  # Background image URL

    # Status & Metadata
    is_active = Column(Boolean, default=True)
    level = Column(Integer, default=1)

    # Character Stats (Phase 3)
    stats = Column(JSONB, nullable=True, default={})  # {str, dex, con, int, wis, cha, hp, ac}

    # Character Color Theme Override (Phase 3)
    # When set, overrides campaign's default color theme for this character
    color_theme_override = Column(JSONB, nullable=True)  # {border_colors, text_color, badge_interior_gradient, hp_color, ac_color}

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    campaign = relationship("Campaign", back_populates="characters")

    def to_dict(self):
        return {
            "id": str(self.id),
            "campaign_id": str(self.campaign_id),
            "name": self.name,
            "slug": self.slug,
            "class_name": self.class_name,
            "race": self.race,
            "player_name": self.player_name,
            "description": self.description,
            "backstory": self.backstory,
            "image_url": self.image_url,
            "background_image_url": self.background_image_url,
            "level": self.level,
            "is_active": self.is_active,
            "stats": self.stats or {},
            "color_theme_override": self.color_theme_override,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Episode(Base):
    """
    Campaign episode/session tracking
    Phase 2: Episodes with detailed metadata
    """
    __tablename__ = "episodes"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(PG_UUID(as_uuid=True), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False, index=True)

    # Episode Info
    name = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False)
    episode_number = Column(Integer, nullable=True)
    season = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)

    # Timeline
    air_date = Column(String(50), nullable=True)  # ISO date string
    runtime = Column(Integer, nullable=True)  # Length in minutes

    # Status
    is_published = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    campaign = relationship("Campaign", back_populates="episodes")
    events = relationship("Event", back_populates="episode", cascade="all, delete-orphan")

    def to_dict(self, include_events=False):
        result = {
            "id": str(self.id),
            "campaign_id": str(self.campaign_id),
            "name": self.name,
            "slug": self.slug,
            "episode_number": self.episode_number,
            "season": self.season,
            "description": self.description,
            "air_date": self.air_date,
            "runtime": self.runtime,
            "is_published": self.is_published,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_events:
            result["events"] = [e.to_dict() for e in self.events]
        return result


class Event(Base):
    """
    Events within episodes: key moments, plot points, character interactions
    Phase 2: Episode timeline events (NOT real-time overlay events)
    """
    __tablename__ = "events"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    episode_id = Column(PG_UUID(as_uuid=True), ForeignKey("episodes.id", ondelete="CASCADE"), nullable=False, index=True)

    # Event Info
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    timestamp_in_episode = Column(Integer, nullable=True)  # Seconds into episode

    # Categories
    event_type = Column(String(50), nullable=True)  # e.g., "combat", "roleplay", "discovery"
    characters_involved = Column(Text, nullable=True)  # JSON array of character IDs

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    episode = relationship("Episode", back_populates="events")

    def to_dict(self):
        # Parse characters_involved JSON string back to array
        # Handle None, empty string, and JSON string (including "[]")
        characters_array = []
        if self.characters_involved is not None:
            try:
                characters_array = json.loads(self.characters_involved)
            except (json.JSONDecodeError, TypeError):
                characters_array = []

        return {
            "id": str(self.id),
            "episode_id": str(self.episode_id),
            "name": self.name,
            "description": self.description,
            "timestamp_in_episode": self.timestamp_in_episode,
            "event_type": self.event_type,
            "characters_involved": characters_array,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Roster(Base):
    """
    Active roster for a campaign
    Tracks which characters are currently "on screen"
    Stored as array of character IDs for easy filtering
    """
    __tablename__ = "rosters"

    campaign_id = Column(PG_UUID(as_uuid=True), ForeignKey("campaigns.id"), primary_key=True, index=True)
    character_ids = Column(ARRAY(PG_UUID(as_uuid=True)), nullable=False, default=[])
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    campaign = relationship("Campaign", back_populates="roster")

    def to_dict(self):
        return {
            "campaign_id": str(self.campaign_id),
            "character_ids": [str(cid) for cid in self.character_ids] if self.character_ids else [],
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class LayoutOverrides(Base):
    """
    Badge positioning overrides for different tiers (large, medium, compact)
    Allows customization of character badge layout on stream overlay
    """
    __tablename__ = "layout_overrides"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(PG_UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=False, index=True)
    tier = Column(String(50), nullable=False)  # large, medium, compact
    badges = Column(JSONB, nullable=True, default={})  # Position data: {char_id: {x, y, scale}}
    chips = Column(JSONB, nullable=True, default={})  # Status chip positions
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    campaign = relationship("Campaign", back_populates="layout_overrides")

    def to_dict(self):
        return {
            "id": str(self.id),
            "campaign_id": str(self.campaign_id),
            "tier": self.tier,
            "badges": self.badges or {},
            "chips": self.chips or {},
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class CharacterLayout(Base):
    """
    Character card layout and styling configuration for a campaign (Phase 3)
    Defines which stats display, their positions, shapes, and color scheme
    Applied campaign-wide: all characters in campaign use the same layout
    """
    __tablename__ = "character_layouts"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(PG_UUID(as_uuid=True), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False, index=True)

    # Layout metadata
    name = Column(String(100), nullable=False, default="Default")  # User-friendly name
    is_default = Column(Boolean, default=False)  # Whether this is the default layout

    # Stat configuration
    stats_to_display = Column(JSONB, nullable=False, default=["str", "dex", "con", "int", "wis", "cha"])  # Array of stat keys

    # Color scheme
    border_color_count = Column(Integer, default=2, nullable=False)  # 2 or 4 colors for gradient
    border_colors = Column(JSONB, nullable=False, default={})  # {count: [colors]} or list of hex codes
    text_color = Column(String(7), nullable=False, default="#FFFFFF")  # Hex color
    badge_interior_gradient = Column(JSONB, nullable=False, default={})  # {type, start, end} for radial

    # HP & AC colors (fixed)
    hp_color = Column(JSONB, nullable=False, default={})  # {border, interior: {start, end}}
    ac_color = Column(JSONB, nullable=False, default={})  # {border, interior: {start, end}}

    # Badge layout (positions & shapes)
    badge_layout = Column(JSONB, nullable=False, default=[])  # Array of {stat, shape, x, y, ...}

    # Color preset (if using preset)
    color_preset = Column(String(50), nullable=True)  # "option_a", "option_b", "option_c", or null for custom

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    campaign = relationship("Campaign", back_populates="character_layouts")

    def to_dict(self):
        return {
            "id": str(self.id),
            "campaign_id": str(self.campaign_id),
            "name": self.name,
            "is_default": self.is_default,
            "stats_to_display": self.stats_to_display or [],
            "border_color_count": self.border_color_count,
            "border_colors": self.border_colors or {},
            "text_color": self.text_color,
            "badge_interior_gradient": self.badge_interior_gradient or {},
            "hp_color": self.hp_color or {},
            "ac_color": self.ac_color or {},
            "badge_layout": self.badge_layout or [],
            "color_preset": self.color_preset,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
