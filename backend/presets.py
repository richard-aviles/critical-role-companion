"""
Preset color schemes for character layouts
Users can select from these presets or customize their own
"""

from typing import Dict, List, Any


class ColorPreset:
    """Base color preset class"""
    id: str
    name: str
    description: str
    border_colors: List[str]
    text_color: str
    badge_interior_gradient: Dict[str, Any]
    hp_color: Dict[str, Any]
    ac_color: Dict[str, Any]

    def __init__(
        self,
        id: str,
        name: str,
        description: str,
        border_colors: List[str],
        text_color: str,
        badge_interior_gradient: Dict[str, Any],
        hp_color: Dict[str, Any],
        ac_color: Dict[str, Any]
    ):
        self.id = id
        self.name = name
        self.description = description
        self.border_colors = border_colors
        self.text_color = text_color
        self.badge_interior_gradient = badge_interior_gradient
        self.hp_color = hp_color
        self.ac_color = ac_color

    def to_dict(self) -> Dict[str, Any]:
        """Convert preset to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "border_colors": self.border_colors,
            "text_color": self.text_color,
            "badge_interior_gradient": self.badge_interior_gradient,
            "hp_color": self.hp_color,
            "ac_color": self.ac_color,
        }


# ============================================================================
# Option A: Gold & Warmth (Default)
# ============================================================================
OPTION_A = ColorPreset(
    id="option_a",
    name="Gold & Warmth",
    description="Warm gold tones with rich accents - Perfect for medieval fantasy campaigns",
    border_colors=["#FFD700", "#FFA500", "#FF8C00", "#DC7F2E"],
    text_color="#FFFFFF",
    badge_interior_gradient={
        "type": "radial",
        "colors": ["#FFE4B5", "#DAA520"]
    },
    hp_color={
        "border": "#FF0000",
        "interior_gradient": {
            "type": "radial",
            "colors": ["#FF6B6B", "#CC0000"]
        }
    },
    ac_color={
        "border": "#808080",
        "interior_gradient": {
            "type": "radial",
            "colors": ["#A9A9A9", "#696969"]
        }
    }
)


# ============================================================================
# Option B: Purple & Silver (Mystical)
# ============================================================================
OPTION_B = ColorPreset(
    id="option_b",
    name="Purple & Silver",
    description="Mystical purple tones with silver accents - Great for magical campaigns",
    border_colors=["#9370DB", "#8A2BE2", "#6A0DAD", "#4B0082"],
    text_color="#FFFFFF",
    badge_interior_gradient={
        "type": "radial",
        "colors": ["#DDA0DD", "#9932CC"]
    },
    hp_color={
        "border": "#DC143C",
        "interior_gradient": {
            "type": "radial",
            "colors": ["#FF69B4", "#C71585"]
        }
    },
    ac_color={
        "border": "#C0C0C0",
        "interior_gradient": {
            "type": "radial",
            "colors": ["#E8E8E8", "#A9A9A9"]
        }
    }
)


# ============================================================================
# Option C: Emerald & Bronze (Nature)
# ============================================================================
OPTION_C = ColorPreset(
    id="option_c",
    name="Emerald & Bronze",
    description="Natural green and bronze tones - Perfect for druid and nature-based campaigns",
    border_colors=["#00C957", "#228B22", "#006400", "#8B4513"],
    text_color="#FFFFFF",
    badge_interior_gradient={
        "type": "radial",
        "colors": ["#90EE90", "#2E8B57"]
    },
    hp_color={
        "border": "#FF4500",
        "interior_gradient": {
            "type": "radial",
            "colors": ["#FFA07A", "#FF6347"]
        }
    },
    ac_color={
        "border": "#B8860B",
        "interior_gradient": {
            "type": "radial",
            "colors": ["#DAA520", "#CD853F"]
        }
    }
)


# ============================================================================
# Preset Registry
# ============================================================================

PRESETS: Dict[str, ColorPreset] = {
    "option_a": OPTION_A,
    "option_b": OPTION_B,
    "option_c": OPTION_C,
}

# Default preset
DEFAULT_PRESET = OPTION_A


def get_preset(preset_id: str) -> ColorPreset | None:
    """Get a preset by ID"""
    return PRESETS.get(preset_id)


def get_all_presets() -> List[Dict[str, Any]]:
    """Get all available presets as dictionaries"""
    return [preset.to_dict() for preset in PRESETS.values()]


def get_preset_ids() -> List[str]:
    """Get list of all preset IDs"""
    return list(PRESETS.keys())


def cycle_preset(current_preset_id: str | None) -> str:
    """
    Cycle to the next preset.
    Useful for quick preset switching in UI.

    Args:
        current_preset_id: Current preset ID (or None to start from default)

    Returns:
        Next preset ID in cycle
    """
    preset_ids = get_preset_ids()

    if not preset_ids:
        return "option_a"

    if current_preset_id is None:
        return preset_ids[0]

    if current_preset_id not in PRESETS:
        return preset_ids[0]

    current_index = preset_ids.index(current_preset_id)
    next_index = (current_index + 1) % len(preset_ids)

    return preset_ids[next_index]
