# Phase 3 Tier 3 Implementation Plan: Public Campaign Pages

**Status**: Ready to Begin
**Target Duration**: 2-3 sessions (12-18 hours of development)
**Parallel Research Tracks**: Card Creation (✅ Complete), Design Guidelines (✅ Complete)

---

## 🎯 Tier 3 Overview

**Goal**: Build public-facing campaign website pages that showcase campaigns, characters, and episodes.

**Key Characteristics**:
- ✅ No authentication required (public read-only access)
- ✅ Uses campaign slug (not ID) for URLs
- ✅ Character color overrides displayed with styling
- ✅ Responsive mobile-first design
- ✅ Search/filter capabilities
- ✅ Episode timeline visualization

---

## 📋 Architecture & API Changes Needed

### 1. Backend: Public Endpoints (Add to main.py)

**New Public Endpoints Required**:

#### A. Campaign by Slug
```python
@app.get("/public/campaigns/{slug}")
# Returns: Campaign object with stats
# Auth: None (public)
# Returns only campaigns with public visibility flag
```

#### B. Active Characters by Campaign Slug
```python
@app.get("/public/campaigns/{slug}/characters")
# Returns: List[Character] where is_active=true
# Auth: None (public)
# Includes: character.color_theme_override
```

#### C. Character Detail by Campaign Slug
```python
@app.get("/public/campaigns/{slug}/characters/{character_slug}")
# Returns: Single character with all details
# Auth: None (public)
# Includes: Episodes this character appeared in
```

#### D. Published Episodes by Campaign Slug
```python
@app.get("/public/campaigns/{slug}/episodes")
# Returns: List[Episode] where is_published=true
# Auth: None (public)
# Includes: Episode count, season info
```

#### E. Episode Detail by Campaign Slug
```python
@app.get("/public/campaigns/{slug}/episodes/{episode_slug}")
# Returns: Single episode with events
# Auth: None (public)
# Includes: All events with character involvement
```

#### F. Events for Episode
```python
@app.get("/public/episodes/{episode_id}/events")
# Returns: List[Event] for an episode
# Auth: None (public)
```

**Implementation Notes**:
- Use `is_active=true` filter for characters
- Use `is_published=true` filter for episodes
- Include `color_theme_override` in character responses
- All endpoints accept campaign slug, not ID
- All endpoints return 404 if campaign/character/episode not found

---

### 2. Frontend: API Client Functions (Update src/lib/api.ts)

```typescript
// Public campaign queries (no auth needed)
export const getPublicCampaign = async (slug: string): Promise<Campaign> => { }
export const getPublicCharacters = async (campaignSlug: string): Promise<Character[]> => { }
export const getPublicCharacter = async (campaignSlug: string, characterSlug: string): Promise<Character> => { }
export const getPublicEpisodes = async (campaignSlug: string): Promise<Episode[]> => { }
export const getPublicEpisode = async (campaignSlug: string, episodeSlug: string): Promise<Episode> => { }
export const getPublicEvents = async (episodeId: string): Promise<Event[]> => { }
```

**Pattern**: No adminToken parameter (public endpoints)

---

### 3. Frontend: New Public Routes

```
/campaigns/[slug]                                 → Campaign overview page
/campaigns/[slug]/characters                      → Character roster
/campaigns/[slug]/characters/[character-slug]     → Character detail
/campaigns/[slug]/episodes                        → Episode guide
/campaigns/[slug]/episodes/[episode-slug]         → Episode detail
```

---

## 🛠️ Implementation Checklist

### PHASE 1: Backend Public Endpoints (2-3 hours)

- [ ] Add 6 new `/public/*` GET endpoints to main.py
- [ ] Test all endpoints return correct data
- [ ] Verify character color_theme_override is included
- [ ] Verify filtering works (is_active, is_published)
- [ ] Update main.py documentation comments
- [ ] Commit changes with message: "Phase 3 Tier 3: Add public API endpoints"

**Success Criteria**:
- All 6 endpoints return 200 OK with correct data
- GET /public/campaigns/{slug} returns campaign object
- GET /public/campaigns/{slug}/characters returns active characters with colors
- GET /public/campaigns/{slug}/episodes returns published episodes
- Endpoints don't require X-Token header
- 404 returned for non-existent slugs

---

### PHASE 2: Frontend API Client (1 hour)

- [ ] Add 6 new public API functions to src/lib/api.ts
- [ ] Type safety: All functions have proper TypeScript types
- [ ] Error handling: Proper error messages for failures
- [ ] Test locally: Try calling each function from browser console
- [ ] Commit changes with message: "Phase 3 Tier 3: Add public API client functions"

**Success Criteria**:
- npm run build passes with 0 TypeScript errors
- All 6 functions callable from frontend
- Proper error handling and typing
- No console errors

---

### PHASE 3: Campaign Detail Page (2 hours)

**File**: `frontend/src/app/campaigns/[slug]/page.tsx`

**Components Needed**:
- Main page component (page.tsx)
- CampaignHeroSection.tsx (banner with campaign info)
- CampaignStats.tsx (key metrics: characters, episodes, etc.)

**Requirements**:
- [ ] Fetch campaign by slug
- [ ] Display campaign name, description
- [ ] Show stats: # of characters, # of episodes
- [ ] Navigation links to character roster and episode guide
- [ ] Loading state while fetching
- [ ] Error state if campaign not found
- [ ] Responsive on mobile/tablet/desktop
- [ ] Follow DESIGN_GUIDELINES.md for styling

**Success Criteria**:
- Page loads without errors
- Campaign data displays correctly
- Navigation links work
- Responsive layout looks good
- TypeScript: 0 errors

---

### PHASE 4: Character Roster Page (3 hours)

**Files**:
- `frontend/src/app/campaigns/[slug]/characters/page.tsx` (main page)
- `frontend/src/components/PublicCharacterCard.tsx` (character card with color styling)
- `frontend/src/components/CharacterSearch.tsx` (search/filter component)

**Requirements for Roster Page**:
- [ ] Fetch active characters for campaign
- [ ] Display as responsive grid
- [ ] Character cards show: image, name, class, race, player name
- [ ] Apply character.color_theme_override styling
- [ ] Search by name
- [ ] Filter by class, race, status
- [ ] Sort options (name, class, race)
- [ ] Click character to view detail
- [ ] Loading state
- [ ] Mobile: 1 column, Tablet: 2-3 columns, Desktop: 3-4 columns

**Requirements for PublicCharacterCard**:
- [ ] Display character image (with fallback)
- [ ] Show basic info: name, class, race
- [ ] Apply color_theme_override colors:
  - Border colors (left border or full border)
  - Text color for name/text
  - Badge colors if stats displayed (HP, AC)
- [ ] Responsive sizing
- [ ] Hover state
- [ ] Click to navigate to detail page

**Requirements for CharacterSearch**:
- [ ] Real-time search as user types
- [ ] Filter dropdowns for class, race, status
- [ ] Reset button to clear filters
- [ ] Sort dropdown (name, class, race)
- [ ] Mobile-friendly interface

**Success Criteria**:
- All characters display with correct styling
- Color overrides apply correctly
- Search/filter works correctly
- Cards responsive on all devices
- TypeScript: 0 errors
- No performance issues with 20+ characters

---

### PHASE 5: Character Detail Page (2-3 hours)

**File**: `frontend/src/app/campaigns/[slug]/characters/[character-slug]/page.tsx`

**Requirements**:
- [ ] Fetch character by slug
- [ ] Display large character image (left sidebar on desktop, top on mobile)
- [ ] Character details:
  - Name (styled with character color override)
  - Class, Race, Level, Player Name
  - Description, Backstory
  - Image (high-res)
- [ ] Apply character color_theme_override:
  - Border/accent colors
  - Text color
  - Background styling
- [ ] Show related episodes (episodes this character appeared in)
- [ ] Links to related characters
- [ ] Back to roster link
- [ ] Loading state
- [ ] Error state (404 if character not found)
- [ ] Responsive layout (sidebar on desktop, stacked on mobile)

**Success Criteria**:
- Character data displays completely
- Color override styling applied
- Related episodes link correctly
- Responsive layout looks professional
- TypeScript: 0 errors
- Images load efficiently

---

### PHASE 6: Episode Guide Page (2 hours)

**Files**:
- `frontend/src/app/campaigns/[slug]/episodes/page.tsx` (main page)
- `frontend/src/components/PublicEpisodeTimeline.tsx` (timeline component)

**Requirements for Episode Guide**:
- [ ] Fetch published episodes for campaign
- [ ] Display as timeline (vertical preferred)
- [ ] Group by season
- [ ] Show episode number, title, air date, runtime
- [ ] Filter by season
- [ ] Sort chronologically
- [ ] Click episode to view detail
- [ ] Loading state
- [ ] Responsive timeline layout

**Requirements for PublicEpisodeTimeline**:
- [ ] Vertical timeline layout
- [ ] Episode cards with key info
- [ ] Season headers/separators
- [ ] Visual progression indicator (past/current/upcoming)
- [ ] Responsive: readable on mobile
- [ ] Hover states
- [ ] Click to navigate to episode detail

**Success Criteria**:
- All published episodes display
- Timeline renders correctly
- Responsive on mobile
- Season filtering works
- TypeScript: 0 errors

---

### PHASE 7: Episode Detail Page (2 hours)

**File**: `frontend/src/app/campaigns/[slug]/episodes/[episode-slug]/page.tsx`

**Requirements**:
- [ ] Fetch episode by slug
- [ ] Display episode info:
  - Title, Season, Episode Number
  - Air Date, Runtime, Description
  - Thumbnail/banner image
- [ ] Events timeline for episode
- [ ] Character involvement indicator (which characters were in this episode)
- [ ] Links to related characters
- [ ] Back to episode guide link
- [ ] Loading state
- [ ] Error state (404 if episode not found)
- [ ] Responsive layout

**Success Criteria**:
- Episode data displays completely
- Events display in timeline
- Character links work
- Responsive layout
- TypeScript: 0 errors

---

### PHASE 8: Responsive Design & Styling (2-3 hours)

**Focus Areas**:
- [ ] All pages tested on mobile (375px), tablet (768px), desktop (1920px)
- [ ] Character cards scale properly
- [ ] Images load efficiently
- [ ] Text readable on all sizes
- [ ] Navigation accessible on mobile
- [ ] Follow DESIGN_GUIDELINES.md color/typography standards
- [ ] Use Tailwind classes for responsive design

**Testing Checklist**:
- [ ] Desktop: 1920x1080 (all content visible, proper spacing)
- [ ] Tablet: 768x1024 (content adapts to 2-3 column layouts)
- [ ] Mobile: 375x667 (content stacks, images fit)
- [ ] Verify color contrasts meet WCAG AA (4.5:1 for text)
- [ ] Test keyboard navigation
- [ ] Test on 2+ browsers (Chrome, Firefox, Safari)

**Success Criteria**:
- All pages look good on mobile/tablet/desktop
- No horizontal scrolling needed
- Images responsive and efficient
- Typography hierarchy clear

---

### PHASE 9: Integration Testing (3-4 hours)

**Test Scenarios**:

**Campaign Navigation**:
- [ ] Navigate to /campaigns/campaign-slug
- [ ] Campaign page loads and displays correct data
- [ ] Click to character roster → navigates correctly
- [ ] Click to episode guide → navigates correctly

**Character Roster**:
- [ ] All active characters display
- [ ] Color overrides render correctly
- [ ] Search filters characters correctly
- [ ] Class/race filters work
- [ ] Sorting works
- [ ] Click character → navigates to detail page

**Character Detail**:
- [ ] Character page loads for each character
- [ ] All character info displays
- [ ] Color override styling applied
- [ ] Related episodes show correctly
- [ ] Related characters link correctly
- [ ] Back button works

**Episode Guide**:
- [ ] All published episodes display
- [ ] Timeline renders correctly
- [ ] Season filtering works
- [ ] Click episode → navigates to detail page

**Episode Detail**:
- [ ] Episode page loads for each episode
- [ ] All episode info displays
- [ ] Events display in timeline
- [ ] Character links work
- [ ] Back button works

**Cross-Device**:
- [ ] All pages work on mobile (375px)
- [ ] All pages work on tablet (768px)
- [ ] All pages work on desktop (1920px)

**API Testing**:
- [ ] All 6 public endpoints tested
- [ ] Endpoints return correct data structure
- [ ] Error handling works (404 for missing resources)
- [ ] No auth required to access endpoints
- [ ] Performance acceptable (< 2s load time)

**Success Criteria**:
- ✅ All navigation paths work
- ✅ All data displays correctly
- ✅ Color overrides render properly
- ✅ Responsive on all devices
- ✅ No critical bugs
- ✅ TypeScript: 0 errors
- ✅ Browser console: 0 errors

---

### PHASE 10: Documentation & Polish (2-3 hours)

- [ ] Create PHASE_3_TIER_3_COMPLETION_SUMMARY.md
- [ ] Update PROJECT_STATUS.md with Tier 3 completion
- [ ] Update ARCHITECTURE.md with public routes
- [ ] Add code comments to new components
- [ ] Remove console.log statements
- [ ] Verify no auth tokens leak to client
- [ ] Verify all TypeScript types are correct
- [ ] Commit final changes

**Documentation Files to Create/Update**:
- `PHASE_3_TIER_3_COMPLETION_SUMMARY.md` (new)
- `PROJECT_STATUS.md` (update)
- `ARCHITECTURE.md` (add public routes section)
- Add JSDoc comments to all new components

**Success Criteria**:
- All documentation updated
- Code is clean and well-commented
- No TypeScript errors
- No console errors
- Ready for production

---

## 📊 Implementation Order & Timeline

### Recommended Sequence (with dependencies):

**Session 9 (Current)**:
1. ✅ Complete card library research
2. ✅ Complete design research
3. **START**: Phase 1 Backend Endpoints (2-3 hrs)
4. **START**: Phase 2 Frontend API Client (1 hr)
5. **START**: Phase 3 Campaign Detail Page (2 hrs)

**Session 10**:
6. Phase 4 Character Roster (3 hrs)
7. Phase 5 Character Detail (2-3 hrs)
8. Phase 6 Episode Guide (2 hrs)

**Session 11**:
9. Phase 7 Episode Detail (2 hrs)
10. Phase 8 Responsive Design (2-3 hrs)
11. **START**: Phase 9 Integration Testing (2 hrs)

**Session 12**:
12. Finish Phase 9 Integration Testing (1-2 hrs)
13. Phase 10 Documentation (2-3 hrs)
14. **COMPLETE**: Phase 3 Tier 3

---

## 🔗 Reference Materials

**Design Resources**:
- `DESIGN_GUIDELINES.md` - Use this for all styling/colors/typography
- `CARD_IMPLEMENTATION_GUIDE.md` - Reference for character card implementation
- `PHASE_3_TIER_2_TEST_REPORT.md` - Reference for color override patterns

**Code Patterns**:
- `PHASE_1_COMPLETION_SUMMARY.md` - Page structure patterns
- `PHASE_3_TIER_2_TEST_REPORT.md` - Component patterns
- `API_CONTRACT.md` - API authentication patterns

**Troubleshooting**:
- `TROUBLESHOOTING.md` - Common issues
- `KNOWN_ISSUES.md` - Known bugs and workarounds
- `API_CONTRACT.md` - API issues (X-Token, etc.)

---

## 🚀 Ready to Start?

Phases 1-2 of Phase 3 Tier 3 (backend endpoints + API client) require 3-4 hours total and are the quickest wins. These unblock all frontend work.

**Next Immediate Steps**:
1. Create backend endpoints in main.py
2. Test backend endpoints with curl/Postman
3. Create frontend API client functions
4. Test API client in browser console
5. Start campaign detail page

Let's begin! 🎉

---

**Last Updated**: 2025-11-22
**Status**: Ready to Begin
**Parallel Tracks**: ✅ Card Research Complete, ✅ Design Research Complete
