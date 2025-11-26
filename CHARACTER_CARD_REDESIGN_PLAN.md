# Character Card Redesign - Complete Implementation Plan

**Project**: Critical Role Companion App
**Feature**: Enhanced Character Card System with Campaign-Wide Layout Control
**Status**: READY TO BUILD
**Date**: November 25, 2025

---

## 📋 Overview

This is a complete redesign of the character card system to allow DMs to:
1. Create a **campaign-wide card layout** (badge positions, colors, stats to display)
2. Choose between **simple (text) or enhanced (visual badges)** card styles
3. Position **1-8 stat badges** with snap-to-grid alignment helpers
4. Let characters **inherit the layout** while only customizing colors
5. Display cards in **collapsed (image+name) or expanded (full stats)** modes
6. Use cards elegantly in **overlays, rosters, and public pages**

---

## 🎯 Locked-In Requirements

### Feature Requirements
- ✅ Variable stats: 1-8 badges, default 6 (STR, DEX, CON, INT, WIS, CHA)
- ✅ Simple vs Enhanced toggle per campaign
- ✅ Campaign-wide layout (one layout per campaign)
- ✅ Separate "Card Layout" setup page (like Characters/Episodes pages)
- ✅ Layout preview visible on campaign detail page
- ✅ Snap-to-grid alignment guides in editor
- ✅ Hard-coded image position (left side, name below)
- ✅ Collapsible cards (minimal ↔ expanded)
- ✅ Character creation only changes colors, not layout
- ✅ Show current layout/colors on campaign detail

### Design Assumptions (No Answer = Reasonable Default)
- Enhanced = visual positioned badges + optional background
- Simple = text-based stats only, no badge positioning
- WYSIWYG drag-and-drop editor for layout
- Collapsible in: overlay, roster, public pages
- One layout per campaign (can extend later)
- Image width: 25-40% of card (adjustable)
- Snap grid: 8px precision

---

## 📊 Database Schema Changes

### 1. Character Model Updates

**File: `backend/models.py`** (add/modify)

```python
# Add to Character model
class Character(Base):
    # ... existing fields ...

    # NEW: Store character stats (inherited layout structure from campaign)
    stats: Column = Column(JSON, nullable=True, default={})
    # Format: {"str": 16, "dex": 14, "con": 15, "int": 10, "wis": 12, "cha": 13, "hp": 45, "ac": 14}

    # Store which stats to display (could override campaign default, but v1: use campaign)
    # stats_visible: Column = Column(JSON, nullable=True)  # Future feature
```

### 2. CharacterLayout Model Updates

**File: `backend/models.py`** (existing model, add fields)

```python
class CharacterLayout(Base):
    # ... existing fields ...

    # NEW: Card style
    card_type: Column = Column(String, default="simple")  # "simple" or "enhanced"

    # NEW: Stat configuration (from our locked-in requirements)
    stats_config: Column = Column(JSON, default=[
        {"key": "str", "label": "STR", "visible": True, "order": 0},
        {"key": "dex", "label": "DEX", "visible": True, "order": 1},
        {"key": "con", "label": "CON", "visible": True, "order": 2},
        {"key": "int", "label": "INT", "visible": True, "order": 3},
        {"key": "wis", "label": "WIS", "visible": True, "order": 4},
        {"key": "cha", "label": "CHA", "visible": True, "order": 5},
    ])
    # Allows DMs to:
    # - Add custom stats (order 6, 7, 8)
    # - Hide stats (visible: false)
    # - Rename stats (label: "Custom")
    # - Reorder stats

    # NEW: Image configuration
    image_width_percent: Column = Column(Integer, default=30)  # 25-40 range
    image_aspect_ratio: Column = Column(String, default="square")  # square, portrait, landscape

    # EXISTING but clarifying usage:
    # badge_layout: Column = Column(JSON)  # Positions of badges on the card
    # Example: [
    #   {"stat": "str", "x": 50, "y": 10, "size": 1.0},
    #   {"stat": "dex", "x": 50, "y": 35, "size": 1.0},
    #   ...
    # ]

    # NEW: Optional background image (enhanced cards only)
    background_image_url: Column = Column(String, nullable=True)

    # NEW: Default colors for all characters (campaign-wide)
    # character_color_override: Column already exists, use this as campaign default
    # When creating character:
    # - If DM has set campaign default → character inherits it
    # - Character can override with their own colors
```

### 3. Updated Schemas

**File: `backend/schemas.py`** (add/modify)

```python
# NEW: Stat configuration schema
class StatConfig(BaseModel):
    key: str  # "str", "dex", etc.
    label: str  # Display name
    visible: bool = True
    order: int  # Display order

    class Config:
        schema_extra = {
            "example": {
                "key": "str",
                "label": "STR",
                "visible": True,
                "order": 0
            }
        }

# NEW: Card badge positioning schema (already similar, clarifying)
class BadgePositionInput(BaseModel):
    stat: str  # "str", "dex", "custom_stat_1"
    x: float  # 0-100 (percentage)
    y: float  # 0-100 (percentage)
    size: float = 1.0  # 0.5-2.0 multiplier

# UPDATE: CharacterLayoutCreateRequest
class CharacterLayoutCreateRequest(BaseModel):
    name: str = Field(default="Default", description="Layout name")
    is_default: bool = Field(default=False)
    card_type: str = Field(default="simple", description="simple or enhanced")

    # Stat configuration
    stats_config: List[StatConfig] = Field(
        default=[...6 default stats...],
        description="Stat badges to display"
    )

    # Image settings
    image_width_percent: int = Field(default=30, description="25-40 range")
    image_aspect_ratio: str = Field(default="square")

    # Colors (existing fields, but now apply to all characters)
    border_colors: List[str]
    text_color: str
    badge_interior_gradient: Dict[str, Any]
    hp_color: Dict[str, Any]
    ac_color: Dict[str, Any]

    # Badge positioning (if enhanced card)
    badge_layout: List[BadgePositionInput] = Field(default=[])

    # Optional background
    background_image_url: Optional[str] = None

    color_preset: Optional[str] = None

# UPDATE: CharacterUpdateRequest
class CharacterUpdateRequest(BaseModel):
    # ... existing fields ...

    # NEW: Stats input
    stats: Optional[CharacterStatsInput] = None

    # Keep color override (but layout is fixed to campaign's)
    color_theme_override: Optional[Dict[str, Any]] = None
```

---

## 🔧 Backend Endpoints

### Existing Endpoints (Modify)
- `POST /campaigns/{id}/character-layouts` - Create layout (add card_type, stats_config, image settings)
- `PUT /campaigns/{id}/character-layouts/{layout_id}` - Update layout
- `GET /campaigns/{id}/character-layouts/{layout_id}` - Get layout details

### New Endpoints
None needed! We'll use existing layout endpoints, just with enhanced data.

### Updated Endpoints
- `POST /campaigns/{id}/characters` - Now accepts stats
- `PUT /campaigns/{id}/characters/{char_id}` - Now accepts stats

---

## 🎨 Frontend Components & Pages

### Phase 1: Layout Editor Page

**File: `frontend/src/app/admin/campaigns/[id]/card-layout/page.tsx`** (NEW)

Main layout setup page showing:
- Card style toggle (Simple ↔ Enhanced)
- Stat configuration panel
- WYSIWYG editor with drag-drop badges
- Snap-to-grid visual guides
- Real-time preview
- Color selector
- Save button

**Components to Create:**
1. `CardLayoutEditor.tsx` - Main editor container
2. `CardTypeToggle.tsx` - Simple/Enhanced selector
3. `StatConfigPanel.tsx` - Add/remove/reorder/rename stats
4. `BadgePositioningEditor.tsx` - Drag-drop WYSIWYG
5. `SnapGridOverlay.tsx` - Visual alignment guides
6. `CardPreview.tsx` - Real-time preview of current layout
7. `ColorThemeSelector.tsx` - Campaign-wide colors (reuse existing)
8. `ImageSettingsPanel.tsx` - Width % and aspect ratio

### Phase 2: Enhanced Card Display

**File: `frontend/src/components/CharacterCard.tsx`** (REWRITE)

Complete redesign supporting:
- Simple mode: Text-based (current style)
- Enhanced mode: Visual badges + background
- Positioned badges from layout
- Inherited colors from campaign + character overrides
- Responsive layouts

**Components to Create:**
1. `StatBadge.tsx` - Hexagon shaped badge
2. `HPBadge.tsx` - Heart shaped badge
3. `ACBadge.tsx` - Shield shaped badge
4. `EnhancedCharacterCard.tsx` - New visual card
5. `SimpleCharacterCard.tsx` - Text-based card (current)
6. `CharacterCard.tsx` - Wrapper that switches based on layout type

### Phase 3: Collapsible Card Feature

**File: `frontend/src/components/CollapsibleCharacterCard.tsx`** (NEW)

Card that can toggle between:
- **Collapsed**: Image + Name only
- **Expanded**: Full card with stats

Use in:
- Overlay pages
- Roster views (optional)
- Public pages

**Components to Create:**
1. `CollapsibleCharacterCard.tsx` - Main component with state
2. `CardPreview.tsx` - Compact view helper

### Phase 4: Campaign Detail Page Update

**File: `frontend/src/app/admin/campaigns/[id]/page.tsx`** (MODIFY)

Add section showing:
- Current card layout (name, type)
- Current color scheme (visual preview)
- Link to "Edit Layout" button

---

## 📁 Implementation Phases

### PHASE 1: Database & Backend Setup (2-3 hours)

**Tasks:**
1. [ ] Update Character model with `stats` JSON field
2. [ ] Update CharacterLayout model with new fields
3. [ ] Create/update Pydantic schemas
4. [ ] Update character creation endpoints to accept stats
5. [ ] Update character update endpoints to accept stats
6. [ ] Database migration (alembic)
7. [ ] Test endpoints with stats data

**Deliverable:** Backend ready to receive/store stats and enhanced layout data

---

### PHASE 2: Layout Editor Page (5-6 hours)

**Tasks:**
1. [ ] Create `/card-layout` page structure
2. [ ] Build CardTypeToggle component
3. [ ] Build StatConfigPanel (add/remove/reorder stats)
4. [ ] Build CardPreview component
5. [ ] Build BadgePositioningEditor with drag-drop
6. [ ] Implement SnapGridOverlay (8px grid + alignment guides)
7. [ ] Integrate ColorThemeSelector
8. [ ] Build ImageSettingsPanel
9. [ ] Wire up save functionality
10. [ ] Add loading/error states
11. [ ] Test responsive design
12. [ ] Style to match existing pages

**Deliverable:** Fully functional layout editor where DMs can design their cards

---

### PHASE 3: Enhanced Card Display (4-5 hours)

**Tasks:**
1. [ ] Create StatBadge component (hexagon shape with CSS)
2. [ ] Create HPBadge component (heart shape)
3. [ ] Create ACBadge component (shield shape)
4. [ ] Create EnhancedCharacterCard component
5. [ ] Create SimpleCharacterCard component (wrap existing)
6. [ ] Create CharacterCard wrapper that switches modes
7. [ ] Implement color resolution (character → campaign → default)
8. [ ] Test badge positioning accuracy
9. [ ] Implement responsive behavior
10. [ ] Style badges with gradients
11. [ ] Test with various stat counts (1-8)

**Deliverable:** Cards render beautifully in both simple and enhanced modes

---

### PHASE 4: Collapsible Feature & Polish (3-4 hours)

**Tasks:**
1. [ ] Create CollapsibleCharacterCard component
2. [ ] Implement collapse/expand animation
3. [ ] Test in overlay pages
4. [ ] Test in roster views
5. [ ] Update campaign detail page to show layout preview
6. [ ] Add "Edit Layout" button to campaign detail
7. [ ] Update character creation form (add stats input)
8. [ ] Polish styling and animations
9. [ ] Test on mobile/tablet
10. [ ] Accessibility review (focus states, keyboard nav)

**Deliverable:** Complete feature ready for production, all pages integrated

---

## 🗂️ File Changes Summary

### Backend Files
```
backend/
├── models.py (UPDATE: Character, CharacterLayout)
├── schemas.py (ADD: StatConfig, UPDATE: Various)
├── main.py (UPDATE: Character endpoints to handle stats)
└── [Database migration needed]
```

### Frontend Files
```
frontend/src/
├── app/admin/campaigns/[id]/
│   ├── card-layout/
│   │   └── page.tsx (NEW)
│   └── page.tsx (UPDATE: Add layout preview)
│
├── components/
│   ├── CharacterCard.tsx (REWRITE)
│   ├── CollapsibleCharacterCard.tsx (NEW)
│   ├── StatBadge.tsx (NEW)
│   ├── HPBadge.tsx (NEW)
│   ├── ACBadge.tsx (NEW)
│   ├── EnhancedCharacterCard.tsx (NEW)
│   ├── SimpleCharacterCard.tsx (NEW)
│   ├── CardLayoutEditor.tsx (NEW)
│   ├── CardTypeToggle.tsx (NEW)
│   ├── StatConfigPanel.tsx (NEW)
│   ├── BadgePositioningEditor.tsx (NEW)
│   ├── SnapGridOverlay.tsx (NEW)
│   ├── CardPreview.tsx (NEW)
│   ├── ColorThemeSelector.tsx (NEW - or reuse existing)
│   └── ImageSettingsPanel.tsx (NEW)
│
└── lib/api.ts (UPDATE: New endpoints if any)
```

---

## 🎨 Key Technical Decisions

### 1. Badge Positioning (X, Y coordinates)
- Store as **percentages** (0-100) for responsiveness
- Snap to **8px grid** in editor
- At runtime, convert percentages to pixels based on card dimensions

### 2. Snap-to-Grid Implementation
- Show semi-transparent grid background (optional)
- When dragging badge within 8px of another badge's alignment:
  - Draw alignment line (horizontal or vertical)
  - Snap to aligned position on drop
  - Similar to Figma/design tools

### 3. Color Resolution (Priority)
1. Character's `color_theme_override` (if set)
2. Campaign's `CharacterLayout` colors (default)
3. System default (Gold & Warmth preset)

### 4. Responsive Image Sizing
- Store as percentage width (25-40%)
- Calculate height based on aspect ratio
- On mobile: Full-width, badges below image
- On desktop: Side-by-side layout

### 5. Stats Data Structure
```json
{
  "str": 16,
  "dex": 14,
  "con": 15,
  "int": 10,
  "wis": 12,
  "cha": 13,
  "hp": 45,
  "ac": 14
}
```
- Store as JSON in database
- Flexible for custom stats (just add more keys)
- Backend doesn't validate keys (DM defines valid ones in stats_config)

---

## 🚀 Estimated Timeline

| Phase | Duration | Complexity |
|-------|----------|-----------|
| Phase 1: Database & Backend | 2-3 hours | Low-Medium |
| Phase 2: Layout Editor | 5-6 hours | High |
| Phase 3: Card Display | 4-5 hours | High |
| Phase 4: Collapsible & Polish | 3-4 hours | Medium |
| **TOTAL** | **14-18 hours** | **Medium** |

**Can be split across multiple sessions or done in parallel with minor coordination.**

---

## 🧪 Testing Plan

### Backend Testing
- [ ] Stats are saved/retrieved correctly
- [ ] Layout changes don't affect existing characters
- [ ] Color override still works with new system
- [ ] Database migration runs smoothly

### Frontend Testing
- [ ] Layout editor saves correctly
- [ ] Badge positions are accurate at different card sizes
- [ ] Snap-to-grid works as expected
- [ ] Simple card displays correctly
- [ ] Enhanced card displays with badges
- [ ] Collapsible animation is smooth
- [ ] Responsive on mobile/tablet/desktop
- [ ] Color inheritance works (char → campaign → default)
- [ ] Overlay displays collapsed by default
- [ ] Accessibility: keyboard navigation, focus states

### Integration Testing
- [ ] Campaign detail shows layout preview
- [ ] Character creation accepts stats
- [ ] Character update accepts stats
- [ ] Cards display correctly with 1-8 stats
- [ ] Different card types (simple vs enhanced) work
- [ ] Collapsible works across all pages

---

## 📋 Next Steps

Ready to start with **Phase 1: Database & Backend Setup**?

This phase is straightforward and unlocks all future phases. Once backend is ready, frontend work can happen in parallel or independently.

**Should I:**
1. ✅ **Go straight to Phase 1** - Start with database/backend
2. ⏸️ **Create detailed subtasks first** - Break down each phase into smaller tasks
3. 🎨 **Create UI mockups** - Design exact layouts before coding

What's your preference?

---

**Status: LOCKED IN & READY TO BUILD 🚀**

All decisions made. All requirements specified. Ready to code!

