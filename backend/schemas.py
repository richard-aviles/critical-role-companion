"""
Pydantic schemas for Mythweaver Studio API
Request/response validation and serialization
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime


# ============================================================================
# Character Schemas
# ============================================================================

class CharacterStatsInput(BaseModel):
    """Character stats input (6 core stats + HP + AC)"""
    str: Optional[int] = Field(None, description="Strength", alias="str")
    dex: Optional[int] = Field(None, description="Dexterity")
    con: Optional[int] = Field(None, description="Constitution")
    int_stat: Optional[int] = Field(None, description="Intelligence", alias="int")
    wis: Optional[int] = Field(None, description="Wisdom")
    cha: Optional[int] = Field(None, description="Charisma")
    hp: Optional[int] = Field(None, description="Hit Points")
    ac: Optional[int] = Field(None, description="Armor Class")

    class Config:
        populate_by_name = True
        schema_extra = {
            "example": {
                "str": 16,
                "dex": 14,
                "con": 15,
                "int": 10,
                "wis": 12,
                "cha": 13,
                "hp": 45,
                "ac": 14
            }
        }


class CharacterThemeOverrideInput(BaseModel):
    """Character-specific color theme override"""
    border_colors: Optional[List[str]] = Field(None, description="Array of hex colors for border gradient")
    text_color: Optional[str] = Field(None, description="Hex color for stat text")
    badge_interior_gradient: Optional[Dict[str, Any]] = Field(None, description="Radial gradient for badge interiors")
    hp_color: Optional[Dict[str, Any]] = Field(None, description="HP badge colors")
    ac_color: Optional[Dict[str, Any]] = Field(None, description="AC badge colors")

    class Config:
        schema_extra = {
            "example": {
                "border_colors": ["#FFD700", "#FFA500", "#FF8C00", "#DC7F2E"],
                "text_color": "#FFFFFF",
                "badge_interior_gradient": {
                    "type": "radial",
                    "colors": ["#FFE4B5", "#DAA520"]
                },
                "hp_color": {
                    "border": "#FF0000",
                    "interior_gradient": {
                        "type": "radial",
                        "colors": ["#FF6B6B", "#CC0000"]
                    }
                },
                "ac_color": {
                    "border": "#808080",
                    "interior_gradient": {
                        "type": "radial",
                        "colors": ["#A9A9A9", "#696969"]
                    }
                }
            }
        }


class CharacterUpdateRequest(BaseModel):
    """Update character info and stats"""
    name: Optional[str] = None
    class_name: Optional[str] = None
    race: Optional[str] = None
    player_name: Optional[str] = None
    description: Optional[str] = None
    backstory: Optional[str] = None
    image_url: Optional[str] = None
    background_image_url: Optional[str] = None
    level: Optional[int] = None
    is_active: Optional[bool] = None
    stats: Optional[CharacterStatsInput] = None
    color_theme_override: Optional[Dict[str, Any]] = None

    class Config:
        schema_extra = {
            "example": {
                "name": "Vax'ildan",
                "class_name": "Rogue",
                "race": "Half-Elf",
                "level": 16,
                "stats": {
                    "str": 16,
                    "dex": 18,
                    "con": 14,
                    "int": 11,
                    "wis": 12,
                    "cha": 10,
                    "hp": 95,
                    "ac": 17
                },
                "color_theme_override": {
                    "border_colors": ["#FFD700", "#FFA500", "#FF8C00", "#DC7F2E"],
                    "text_color": "#FFFFFF",
                    "badge_interior_gradient": {
                        "type": "radial",
                        "colors": ["#FFE4B5", "#DAA520"]
                    },
                    "hp_color": {
                        "border": "#FF0000",
                        "interior_gradient": {
                            "type": "radial",
                            "colors": ["#FF6B6B", "#CC0000"]
                        }
                    },
                    "ac_color": {
                        "border": "#808080",
                        "interior_gradient": {
                            "type": "radial",
                            "colors": ["#A9A9A9", "#696969"]
                        }
                    }
                }
            }
        }


class CharacterResponse(BaseModel):
    """Character response with all fields"""
    id: str
    campaign_id: str
    name: str
    slug: str
    class_name: Optional[str]
    race: Optional[str]
    player_name: Optional[str]
    description: Optional[str]
    backstory: Optional[str]
    image_url: Optional[str]
    background_image_url: Optional[str]
    level: int
    is_active: bool
    stats: Dict[str, Any]
    color_theme_override: Optional[Dict[str, Any]]
    created_at: Optional[str]
    updated_at: Optional[str]

    class Config:
        from_attributes = True


# ============================================================================
# Character Layout Schemas
# ============================================================================

class ColorGradientInput(BaseModel):
    """Gradient definition for colors"""
    type: str = Field(..., description="'linear' or 'radial'")
    colors: List[str] = Field(..., description="Array of hex color codes")
    direction: Optional[str] = None  # For linear: "top-to-bottom", "left-to-right", etc.
    start_point: Optional[Dict[str, float]] = None  # For radial: {x, y}
    radius: Optional[float] = None  # For radial gradients

    class Config:
        schema_extra = {
            "example": {
                "type": "linear",
                "colors": ["#FFD700", "#FFA500", "#FF8C00", "#DC7F2E"],
                "direction": "135deg"
            }
        }


class HPACColorInput(BaseModel):
    """HP/AC specific color configuration"""
    border: str = Field(..., description="Border hex color")
    interior_gradient: Dict[str, Any] = Field(..., description="Radial gradient for interior")

    class Config:
        schema_extra = {
            "example": {
                "border": "#FF0000",
                "interior_gradient": {
                    "type": "radial",
                    "colors": ["#FF6B6B", "#CC0000"]
                }
            }
        }


class BadgeLayoutInput(BaseModel):
    """Badge configuration for a stat"""
    stat: str = Field(..., description="Stat key: str, dex, con, int, wis, cha, hp, ac")
    shape: str = Field(..., description="Shape: hexagon, heart, shield")
    x: float = Field(..., description="X position (0-100%)")
    y: float = Field(..., description="Y position (0-100%)")
    size: Optional[float] = Field(None, description="Size multiplier (0.5-2.0)")
    rotation: Optional[float] = Field(None, description="Rotation in degrees")

    class Config:
        schema_extra = {
            "example": {
                "stat": "str",
                "shape": "hexagon",
                "x": 10.0,
                "y": 20.0,
                "size": 1.0,
                "rotation": 0.0
            }
        }


class StatConfig(BaseModel):
    """Stat configuration for character card layout"""
    key: str = Field(..., description="Stat key (str, dex, con, int, wis, cha, or custom)")
    label: str = Field(..., description="Display label for stat")
    visible: bool = Field(default=True, description="Whether this stat is visible")
    order: int = Field(..., description="Display order (0-7)")

    class Config:
        schema_extra = {
            "example": {
                "key": "str",
                "label": "STR",
                "visible": True,
                "order": 0
            }
        }


class CharacterLayoutCreateRequest(BaseModel):
    """Create character layout for a campaign"""
    name: str = Field(default="Default", description="Layout name")
    is_default: bool = Field(default=False, description="Is this the default layout?")

    # NEW: Card type (simple or enhanced)
    card_type: str = Field(default="simple", description="Card style: 'simple' (text) or 'enhanced' (badges)")

    # NEW: Stat configuration (1-8 stats with custom labels)
    stats_config: List[StatConfig] = Field(
        default=[
            {"key": "str", "label": "STR", "visible": True, "order": 0},
            {"key": "dex", "label": "DEX", "visible": True, "order": 1},
            {"key": "con", "label": "CON", "visible": True, "order": 2},
            {"key": "int", "label": "INT", "visible": True, "order": 3},
            {"key": "wis", "label": "WIS", "visible": True, "order": 4},
            {"key": "cha", "label": "CHA", "visible": True, "order": 5},
        ],
        description="Stat configuration (key, label, visibility, order)"
    )

    # LEGACY: Keeping for backward compatibility
    stats_to_display: List[str] = Field(
        default=["str", "dex", "con", "int", "wis", "cha"],
        description="Which stats to display (legacy field)"
    )

    # NEW: Image configuration for enhanced cards
    image_width_percent: int = Field(default=30, description="Character image width (25-40 range)")
    image_aspect_ratio: str = Field(default="square", description="Image aspect ratio: square, portrait, landscape")

    # NEW: Optional background image
    background_image_url: Optional[str] = Field(None, description="Background image URL for enhanced cards")

    # Color scheme
    border_color_count: int = Field(default=2, description="2 or 4 colors for gradient")
    border_colors: Optional[List[str]] = Field(default=None, description="Array of hex colors for border")
    badge_colors: Optional[List[str]] = Field(default=None, description="Array of hex colors for stat badges (2 colors)")
    text_color: str = Field(default="#FFFFFF", description="Hex color for stat text")
    badge_interior_gradient: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Radial gradient for badge interiors"
    )
    hp_color: Optional[Dict[str, Any]] = Field(default=None, description="HP badge colors")
    ac_color: Optional[Dict[str, Any]] = Field(default=None, description="AC badge colors")
    badge_layout: List[BadgeLayoutInput] = Field(
        default=[],
        description="Badge positions and shapes"
    )
    color_preset: Optional[str] = Field(
        None,
        description="Preset: option_a, option_b, option_c, or null for custom"
    )

    class Config:
        extra = "ignore"  # Ignore extra fields like campaign_id
        schema_extra = {
            "example": {
                "name": "Gold Theme",
                "is_default": True,
                "stats_to_display": ["str", "dex", "con", "int", "wis", "cha"],
                "border_color_count": 4,
                "border_colors": ["#FFD700", "#FFA500", "#FF8C00", "#DC7F2E"],
                "text_color": "#FFFFFF",
                "badge_interior_gradient": {
                    "type": "radial",
                    "colors": ["#FFE4B5", "#DAA520"]
                },
                "hp_color": {
                    "border": "#FF0000",
                    "interior_gradient": {
                        "type": "radial",
                        "colors": ["#FF6B6B", "#CC0000"]
                    }
                },
                "ac_color": {
                    "border": "#808080",
                    "interior_gradient": {
                        "type": "radial",
                        "colors": ["#A9A9A9", "#696969"]
                    }
                },
                "badge_layout": [
                    {
                        "stat": "str",
                        "shape": "hexagon",
                        "x": 10.0,
                        "y": 20.0,
                        "size": 1.0
                    }
                ],
                "color_preset": "option_a"
            }
        }


class CharacterLayoutUpdateRequest(BaseModel):
    """Update character layout"""
    name: Optional[str] = None
    is_default: Optional[bool] = None
    card_type: Optional[str] = None
    stats_config: Optional[List[StatConfig]] = None
    stats_to_display: Optional[List[str]] = None
    image_width_percent: Optional[int] = None
    image_aspect_ratio: Optional[str] = None
    background_image_url: Optional[str] = None
    border_color_count: Optional[int] = None
    border_colors: Optional[List[str]] = None
    badge_colors: Optional[List[str]] = None
    text_color: Optional[str] = None
    badge_interior_gradient: Optional[Dict[str, Any]] = None
    hp_color: Optional[Dict[str, Any]] = None
    ac_color: Optional[Dict[str, Any]] = None
    badge_layout: Optional[List[BadgeLayoutInput]] = None
    color_preset: Optional[str] = None


class CharacterLayoutResponse(BaseModel):
    """Character layout response"""
    id: str
    campaign_id: str
    name: str
    is_default: bool
    card_type: str
    stats_config: List[Dict[str, Any]]
    stats_to_display: List[str]
    image_width_percent: int
    image_aspect_ratio: str
    background_image_url: Optional[str]
    background_image_offset_x: int = 0
    background_image_offset_y: int = 0
    border_color_count: int
    border_colors: List[str]
    badge_colors: List[str]
    text_color: str
    badge_interior_gradient: Dict[str, Any]
    hp_color: Dict[str, Any]
    ac_color: Dict[str, Any]
    badge_layout: List[Dict[str, Any]]
    color_preset: Optional[str]
    created_at: Optional[str]
    updated_at: Optional[str]

    class Config:
        from_attributes = True


# ============================================================================
# Preset Color Schemes
# ============================================================================

class PresetColorScheme(BaseModel):
    """Preset color scheme for quick setup"""
    id: str
    name: str
    description: str
    border_colors: List[str]
    text_color: str
    badge_interior_gradient: Dict[str, Any]
    hp_color: Dict[str, Any]
    ac_color: Dict[str, Any]

    class Config:
        schema_extra = {
            "example": {
                "id": "option_a",
                "name": "Gold & Warmth",
                "description": "Warm gold tones with rich accents",
                "border_colors": ["#FFD700", "#FFA500", "#FF8C00", "#DC7F2E"],
                "text_color": "#FFFFFF",
                "badge_interior_gradient": {
                    "type": "radial",
                    "colors": ["#FFE4B5", "#DAA520"]
                },
                "hp_color": {
                    "border": "#FF0000",
                    "interior_gradient": {
                        "type": "radial",
                        "colors": ["#FF6B6B", "#CC0000"]
                    }
                },
                "ac_color": {
                    "border": "#808080",
                    "interior_gradient": {
                        "type": "radial",
                        "colors": ["#A9A9A9", "#696969"]
                    }
                }
            }
        }


# ============================================================================
# Error Response
# ============================================================================

class ErrorResponse(BaseModel):
    """Error response"""
    status_code: int
    message: str
    detail: Optional[str] = None

    class Config:
        schema_extra = {
            "example": {
                "status_code": 404,
                "message": "Layout not found",
                "detail": "No character layout found for this campaign"
            }
        }


# ============================================================================
# Phase 4: Live Stream Overlay Schemas
# ============================================================================

class OverlayConfigResponse(BaseModel):
    """Overlay configuration response"""
    campaign_id: str
    campaign_name: str
    campaign_slug: str
    default_color_theme: Optional[Dict[str, Any]] = None
    settings: Dict[str, Any]

    class Config:
        from_attributes = True


class OverlayCharacterResponse(BaseModel):
    """Character data for overlay with resolved colors"""
    id: str
    campaign_id: str
    name: str
    slug: str
    class_name: Optional[str]
    race: Optional[str]
    player_name: Optional[str]
    image_url: Optional[str]
    level: int
    is_active: bool
    stats: Dict[str, Any]
    resolved_colors: Dict[str, Any]
    color_source: str

    class Config:
        from_attributes = True


class OverlayRosterCharacter(BaseModel):
    """Lightweight character for roster display"""
    id: str
    name: str
    slug: str
    class_name: Optional[str]
    image_url: Optional[str]
    level: int
    is_active: bool
    resolved_colors: Dict[str, Any]
    color_source: str

    class Config:
        from_attributes = True


class OverlayRosterResponse(BaseModel):
    """Character roster for overlay"""
    campaign_id: str
    characters: List[OverlayRosterCharacter]
    active_roster_ids: List[str]

    class Config:
        from_attributes = True


class OverlayEventResponse(BaseModel):
    """Event data for overlay timeline"""
    id: str
    episode_id: str
    name: str
    description: Optional[str]
    timestamp_in_episode: Optional[int]
    event_type: Optional[str]
    characters_involved: List[str]
    character_names: List[str]
    created_at: str

    class Config:
        from_attributes = True


class OverlayEpisodeEventsResponse(BaseModel):
    """Episode events timeline for overlay"""
    episode_id: str
    episode_name: str
    episode_number: Optional[int]
    season: Optional[int]
    events: List[OverlayEventResponse]

    class Config:
        from_attributes = True


class OverlayActiveEpisodeResponse(BaseModel):
    """Active/featured episode for overlay"""
    id: str
    campaign_id: str
    name: str
    slug: str
    episode_number: Optional[int]
    season: Optional[int]
    description: Optional[str]
    air_date: Optional[str]
    runtime: Optional[int]
    is_published: bool
    event_count: int

    class Config:
        from_attributes = True
