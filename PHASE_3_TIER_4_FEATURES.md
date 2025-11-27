# Phase 3 Tier 4: Production Features & Enhancements

**Last Updated:** 2025-11-27
**Status:** Feature specifications documented, ready for implementation
**Priority:** Feature 1 (High), Feature 2 (High)

---

## Overview

Two critical features identified during production deployment to improve the character card display system:

1. **Feature 1: Sync Card Layout to Public Pages** - Ensure public character displays use the layout configuration chosen in admin
2. **Feature 2: Image Position Control** - Allow users to adjust character image positioning to avoid cutting off heads/faces

Both features enhance the user experience for streamers creating custom character displays.

---

## Feature 1: Sync Card Layout to Public Pages

### Problem Statement

Currently, when users configure a character with a "Simple" or "Enhanced" card layout in the admin panel (via the Card Layout editor), this configuration is **not reflected** on the public character display pages. The public pages show a default layout regardless of what was chosen in admin.

**User Impact:**
- Streamers spend time customizing card layouts in admin but changes don't appear publicly
- Inconsistent experience between what they see in admin vs what viewers see
- Loss of customization work and user frustration

### Requirements

#### Functional Requirements

1. **Fetch Card Layout Configuration**
   - When displaying a character on public pages, fetch the associated CharacterLayout from the database
   - Include card_type, image_width_percent, image_aspect_ratio, and background_image_url
   - Handle cases where no layout exists (use defaults)

2. **Apply Layout to Card Component**
   - Modify PublicCharacterCard to accept and use card_type prop
   - Render "simple" card layout when card_type === "simple"
   - Render "enhanced" card layout when card_type === "enhanced"
   - Apply all layout properties: image positioning, colors, badge placements

3. **Maintain All Layout Features**
   - Support per-character color theme overrides (from Phase 3 Tier 2)
   - Apply image width percentage as configured
   - Apply image aspect ratio (square, portrait, landscape)
   - Display background image with correct positioning
   - Show all badges and stats in correct positions

4. **Responsive Design**
   - Ensure cards render correctly on mobile (< 640px)
   - Ensure cards render correctly on tablet (640px - 1024px)
   - Ensure cards render correctly on desktop (> 1024px)
   - Layouts should adapt to screen size while maintaining configuration

#### Non-Functional Requirements

- **Performance:** Page load time should not increase by more than 200ms
- **Compatibility:** Must work with all existing character data
- **Backwards Compatibility:** Must handle characters without layout configurations
- **API Efficiency:** Minimize database queries (consider joining CharacterLayout with Character)

### Technical Specifications

#### Database / Backend

**Verify Current State:**
- Character model has relationship to CharacterLayout ✓
- CharacterLayout table exists with card_type, image_width_percent, image_aspect_ratio, background_image_url ✓
- Character endpoints return layout data (verify in main.py)

**Changes Required:**

1. Update Character API endpoint schema to include layout configuration:
   ```python
   # In schemas.py - CharacterDetailSchema
   class CharacterDetailSchema(BaseModel):
       id: str
       campaign_id: str
       name: str
       # ... other fields ...
       layout: CharacterLayoutSchema  # NEW: include layout
       color_theme_override: Optional[ColorThemeSchema]
   ```

2. Verify endpoint returns layout data:
   ```python
   # In main.py - GET /campaigns/{campaign_id}/characters/{character_id}
   # Should eagerly load: character.layout
   db_character = db.query(Character)\
       .options(joinedload(Character.layout))\
       .filter(...)\
       .first()
   ```

3. Update public character endpoint:
   ```python
   # GET /public/campaigns/{slug}/characters/{slug}
   # Should include layout in response
   ```

#### Frontend / Components

**Affected Components:**

1. **PublicCharacterCard.tsx** (Update existing)
   - Add prop: `layout: CharacterLayoutSchema | null`
   - Add conditional rendering based on card_type:
     ```typescript
     {layout?.card_type === 'enhanced' ? (
       <EnhancedCardLayout layout={layout} character={character} />
     ) : (
       <SimpleCardLayout layout={layout} character={character} />
     )}
     ```
   - Apply image width: `width: ${layout?.image_width_percent}%`
   - Apply aspect ratio class: `aspect-${layout?.image_aspect_ratio}`
   - Apply background image with R2 URL

2. **pages/campaigns/[slug]/characters/page.tsx** (Update existing)
   - When fetching characters, request layout data from API
   - Pass layout to character card component:
     ```typescript
     <PublicCharacterCard
       character={character}
       campaign={campaign}
       layout={character.layout}
     />
     ```

3. **pages/campaigns/[slug]/characters/[character-slug]/page.tsx** (Update existing)
   - When fetching individual character, request layout data
   - Pass layout to card component in detail view
   - Display layout configuration in character details section

#### API Endpoints Involved

```
GET /campaigns/{campaign_id}/characters/{character_id}
  - Should include: layout (CharacterLayout object)

GET /public/campaigns/{slug}/characters
  - Should include: layout for each character

GET /public/campaigns/{slug}/characters/{character_slug}
  - Should include: layout object
```

### Implementation Checklist

- [ ] Verify backend character schema includes layout
- [ ] Test character endpoint returns layout data
- [ ] Update PublicCharacterCard component for card_type support
- [ ] Add layout prop to character card renderings
- [ ] Update character list pages to pass layout
- [ ] Update character detail pages to pass layout
- [ ] Test simple layout rendering
- [ ] Test enhanced layout rendering
- [ ] Test with color theme overrides
- [ ] Test responsive on mobile/tablet/desktop
- [ ] Verify all layout properties applied correctly
- [ ] Test with characters without layouts (fallback)

### Testing Scenarios

1. **Basic Layout Display**
   - Create character with "simple" layout
   - Verify public page shows simple layout
   - Create character with "enhanced" layout
   - Verify public page shows enhanced layout

2. **Layout Properties**
   - Set image width to 30%
   - Verify image width applied on public page
   - Set aspect ratio to "portrait"
   - Verify aspect ratio applied correctly
   - Upload background image
   - Verify background displays with correct R2 URL

3. **Color Theme Integration**
   - Create character with both layout AND color override
   - Verify layout properties applied
   - Verify color theme applied
   - Both should work together seamlessly

4. **Responsive Design**
   - View on desktop (1920px width) - layout should adapt
   - View on tablet (768px width) - layout should adapt
   - View on mobile (375px width) - layout should adapt
   - No layout breaking on any screen size

5. **Edge Cases**
   - Character with no layout → should use defaults
   - Character with layout but no background image
   - Character with layout but missing color theme

---

## Feature 2: Image Position Control

### Problem Statement

When a character image (portrait/background) is uploaded to a card layout, it **always displays centered**, which often cuts off the character's head or face. Users have **no way to adjust the positioning** to frame the image properly.

**User Impact:**
- Beautiful character portraits are ruined by center positioning cutting off heads
- Streamers must use external tools to crop/edit images before uploading
- Loss of creative control and frustration with image framing

**Example:** A character standing in profile might need the image positioned to the left (offset_x: -30, offset_y: -20) to keep the head centered in the card frame.

### Requirements

#### Functional Requirements

1. **Data Storage**
   - Add background_image_offset_x field to CharacterLayout (-100 to 100, default 0)
   - Add background_image_offset_y field to CharacterLayout (-100 to 100, default 0)
   - Values represent percentage offset from center
   - Negative X = move image left, Positive X = move image right
   - Negative Y = move image up, Positive Y = move image down

2. **Admin UI Controls**
   - Add two slider inputs in ImageSettingsPanel component
   - Label: "Horizontal Position" (-100 to 100, default 0)
   - Label: "Vertical Position" (-100 to 100, default 0)
   - Show numeric value next to each slider
   - Display live preview of positioned image as user adjusts

3. **Image Preview**
   - When user adjusts sliders, immediately update preview
   - Apply CSS transform or background-position to show effect
   - Use: `background-position: calc(50% + ${offset_x}%) calc(50% + ${offset_y}%)`
   - Smooth transitions between slider changes

4. **Public Display**
   - When rendering character cards on public pages, apply saved offsets
   - Apply same transform logic to show positioned image
   - Works with both simple and enhanced layouts

5. **Save & Persistence**
   - Save offset values when user saves layout
   - Offsets persist across sessions
   - Offsets included in layout API responses

#### Non-Functional Requirements

- **UX:** Sliders should feel responsive with < 50ms preview update
- **Storage:** Offset values stored as integers (-100 to 100)
- **Backwards Compatibility:** Handle old layouts with no offsets (default to 0)
- **Performance:** Image position calculations should be GPU-accelerated (CSS transforms)

### Technical Specifications

#### Database / Backend

**Changes Required:**

1. **Update CharacterLayout Model** (`backend/models.py`):
   ```python
   class CharacterLayout(Base):
       __tablename__ = "character_layouts"

       # ... existing fields ...
       background_image_url: str = Column(String, nullable=True)
       background_image_offset_x: int = Column(Integer, default=0)  # NEW
       background_image_offset_y: int = Column(Integer, default=0)  # NEW
   ```

2. **Create Database Migration** (`backend/alembic/versions/008_add_image_offsets.py`):
   ```python
   def upgrade():
       op.add_column('character_layouts',
           sa.Column('background_image_offset_x', sa.Integer(), nullable=False, server_default='0')
       )
       op.add_column('character_layouts',
           sa.Column('background_image_offset_y', sa.Integer(), nullable=False, server_default='0')
       )
   ```

3. **Update Pydantic Schema** (`backend/schemas.py`):
   ```python
   class CharacterLayoutSchema(BaseModel):
       # ... existing fields ...
       background_image_url: Optional[str]
       background_image_offset_x: int = 0
       background_image_offset_y: int = 0
   ```

4. **Update API Endpoints** (`backend/main.py`):
   ```python
   # When saving layout, accept offset values:
   @app.post("/campaigns/{campaign_id}/character-layouts")
   async def update_character_layout(
       campaign_id: str,
       layout: CharacterLayoutSchema,  # includes offset_x, offset_y
       ...
   ):
       db_layout = db.query(CharacterLayout).filter(...).first()
       db_layout.background_image_offset_x = layout.background_image_offset_x
       db_layout.background_image_offset_y = layout.background_image_offset_y
       db.commit()
   ```

#### Frontend / Components

**Affected Components:**

1. **ImageSettingsPanel.tsx** (Update existing)

   Add state for offsets:
   ```typescript
   const [offsetX, setOffsetX] = useState(layout?.background_image_offset_x || 0);
   const [offsetY, setOffsetY] = useState(layout?.background_image_offset_y || 0);
   ```

   Add slider inputs before existing background image section:
   ```typescript
   {preview && (
     <div className="space-y-4">
       {/* Horizontal Position Slider */}
       <div>
         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
           Horizontal Position: {offsetX}%
         </label>
         <input
           type="range"
           min="-100"
           max="100"
           value={offsetX}
           onChange={(e) => setOffsetX(parseInt(e.target.value))}
           className="w-full"
         />
         <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
           Negative = move left, Positive = move right
         </div>
       </div>

       {/* Vertical Position Slider */}
       <div>
         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
           Vertical Position: {offsetY}%
         </label>
         <input
           type="range"
           min="-100"
           max="100"
           value={offsetY}
           onChange={(e) => setOffsetY(parseInt(e.target.value))}
           className="w-full"
         />
         <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
           Negative = move up, Positive = move down
         </div>
       </div>
     </div>
   )}
   ```

   Update preview image styling:
   ```typescript
   <img
     src={preview}
     alt="Background preview"
     className="w-full h-full object-cover"
     style={{
       objectPosition: `calc(50% + ${offsetX}%) calc(50% + ${offsetY}%)`
     }}
   />
   ```

   Pass offsets to parent callback:
   ```typescript
   // When saving, include offsets
   onBackgroundImageChange({
     url: result.url,
     offset_x: offsetX,
     offset_y: offsetY
   });
   ```

2. **PublicCharacterCard.tsx** (Update existing)

   Apply offsets when rendering image:
   ```typescript
   {layout?.background_image_url && (
     <div className="absolute inset-0 overflow-hidden rounded-t-lg">
       <img
         src={layout.background_image_url}
         alt="Background"
         className="absolute inset-0 w-full h-full object-cover"
         style={{
           objectPosition: `calc(50% + ${layout.background_image_offset_x || 0}%) calc(50% + ${layout.background_image_offset_y || 0}%)`
         }}
       />
     </div>
   )}
   ```

3. **CardPreview.tsx** (Update existing)

   Apply same styling as PublicCharacterCard for preview consistency

4. **API Client** (`frontend/src/lib/api.ts`)

   Update layout saving function:
   ```typescript
   export async function updateCharacterLayout(
     campaignId: string,
     characterId: string,
     layout: {
       card_type: 'simple' | 'enhanced';
       image_width_percent: number;
       image_aspect_ratio: string;
       background_image_url?: string;
       background_image_offset_x?: number;  // NEW
       background_image_offset_y?: number;  // NEW
     }
   ) {
     // ... API call with new fields
   }
   ```

### Implementation Checklist

- [ ] Create Alembic migration for offset columns
- [ ] Update CharacterLayout model with offset fields
- [ ] Update CharacterLayoutSchema with offset fields
- [ ] Update API endpoints to handle offset values
- [ ] Test migration on local database
- [ ] Add offset state to ImageSettingsPanel
- [ ] Add horizontal position slider to ImageSettingsPanel
- [ ] Add vertical position slider to ImageSettingsPanel
- [ ] Implement live preview with object-position CSS
- [ ] Test sliders update preview in real-time
- [ ] Update PublicCharacterCard to apply offsets
- [ ] Update CardPreview to apply offsets
- [ ] Update API client with offset parameters
- [ ] Test save/load offsets from database
- [ ] Test with various offset values (-100 to 100)
- [ ] Test on responsive layouts
- [ ] Verify backwards compatibility (no offsets = default to 0)

### Testing Scenarios

1. **Slider Functionality**
   - Move horizontal slider left (negative) - image should move left
   - Move horizontal slider right (positive) - image should move right
   - Move vertical slider up (negative) - image should move up
   - Move vertical slider down (positive) - image should move down
   - Values should display correctly (e.g., "-30", "0", "50")

2. **Preview Updates**
   - Adjust slider - preview should update instantly (< 50ms)
   - Stop adjusting - preview should stop updating
   - Smooth animation between positions (no jank)

3. **Persistence**
   - Set offsets to (-25, 10)
   - Save character layout
   - Reload page
   - Offsets should still be (-25, 10)

4. **Public Display**
   - Create character with offsets
   - View on public character page
   - Offsets should be applied identically to preview
   - No gaps or positioning differences

5. **Edge Cases**
   - Offset values at extremes (-100, 100)
   - Reset offsets back to 0
   - Change image but keep offsets
   - View on mobile/tablet/desktop (positioning should adapt)

6. **Responsive Design**
   - Desktop (1920px): offsets work correctly
   - Tablet (768px): offsets work correctly
   - Mobile (375px): offsets work correctly
   - No stretching or distortion

---

## Implementation Order

### Recommended Sequence

1. **Feature 1 First** (Higher Priority)
   - Easier to implement (mostly frontend)
   - Unblocks public page testing
   - Gives users visibility of their admin choices

2. **Feature 2 Second** (Also High Priority)
   - Depends on database migration knowledge
   - More complex but self-contained
   - Significantly improves UX

### Parallel Work (if resources available)

- Backend: Work on Feature 2 database changes and API
- Frontend: Work on Feature 1 component updates
- Both can be tested simultaneously on localhost

---

## Deployment Considerations

### Staging Environment
- Test both features on Fly.io backend before production
- Test frontend on Vercel staging before deploying to production
- Verify database migrations work on production PostgreSQL (Neon)

### Production Rollout
1. Create database migration on production
2. Deploy backend code with new endpoints
3. Deploy frontend code with new UI
4. Monitor for any errors in logs
5. Test end-to-end on production URLs

### Rollback Plan
- If migration fails: Have backup database snapshot
- If frontend breaks: Revert GitHub commit and redeploy
- Keep admin endpoints accepting old data format (graceful degradation)

---

## Success Criteria

### Feature 1: Sync Card Layout
- ✅ Public character pages show correct card_type layout
- ✅ All layout properties (image width, aspect ratio, colors) apply
- ✅ Works on mobile/tablet/desktop
- ✅ Handles characters without layouts gracefully
- ✅ No performance regression

### Feature 2: Image Position Control
- ✅ Sliders appear in ImageSettingsPanel
- ✅ Preview updates in real-time as user adjusts
- ✅ Offsets save to database
- ✅ Public cards display with correct positioning
- ✅ Works with both simple and enhanced layouts
- ✅ Backwards compatible (old layouts default to 0,0)

---

## Documentation & Communication

### Admin Documentation
- Update user guide for card layout editor
- Add section: "Positioning Your Character Image"
- Explain offset sliders and how to use them
- Provide example: "To show your character's head, try offsetting up (negative Y)"

### User Tutorial (Optional)
- Screenshot showing before/after of offset adjustment
- Video tutorial on proper positioning
- Best practices for character portraits

---

## Notes

- Both features enhance the public viewing experience for streamers
- Feature 1 ensures admin work is visible to audience
- Feature 2 gives creative control over image framing
- Together they complete a professional character card system

**Ready for implementation in Session 12 or next available slot.**
