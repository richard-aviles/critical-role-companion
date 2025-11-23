# Next Actions - Session 9 (Phase 3 Tier 3: Public Campaign Pages)

**Phase 3 Tier 1 & 2 (Backend + Admin UI) are COMPLETE!**

Phase 3 Tier 1 delivered:
- ✅ Character Layout System with per-character color overrides
- ✅ Database migration (005) applied
- ✅ 4 new API endpoints for color management
- ✅ Three-tier color fallback resolution logic

Phase 3 Tier 2 delivered:
- ✅ ColorPickerModal component for individual color selection
- ✅ ColorPresetSelector component for theme selection
- ✅ CharacterColorOverrideForm component for comprehensive color editing
- ✅ CharacterForm integration with color override support
- ✅ 3 predefined color themes (Gold & Warmth, Twilight & Mystique, Emerald & Silver)
- ✅ Full TypeScript type safety (0 compilation errors)
- ✅ Complete API client integration (3 new functions)
- ✅ Full documentation (PHASE_3_TIER_2_TEST_REPORT.md)

**NOW: Begin Phase 3 Tier 3 (Public Campaign Pages)**

---

## 🎯 Start Here

1. Read `SESSION_8_STARTUP.md` (5 min) - Quick start checklist for this session
2. Read `PROJECT_STATUS.md` (5 min) - Quick refresh on project status
3. Read `PHASE_3_TIER_2_TEST_REPORT.md` (10 min) - Review what was just completed
4. Review this document for Phase 3 Tier 3 action items
5. Follow the steps below in order

**Total time commitment: 2-3 sessions of work**

**Progress so far:**
- ✅ Session 1: Neon PostgreSQL setup complete
- ✅ Session 2: Cloudflare R2 setup complete
- ✅ Session 3: Backend refactoring, Frontend setup, Full-stack testing
- ✅ Session 4: Phase 1 Campaign Management - Complete with 7 issues fixed
- ✅ Session 5: Phase 2 Character & Episode Management - Complete
- ✅ Session 6: Phase 2 cont'd - Character Pages complete
- ✅ Session 7: Phase 2 cont'd - Episode Pages complete
- ✅ Session 8: Phase 3 Tier 1 (Backend) + Phase 3 Tier 2 (Admin UI) complete
- ⏳ Session 9+: Phase 3 Tier 3 Public Campaign Pages

---

## ⚡ Session 9 Task List - Phase 3 Tier 3: Public Campaign Pages

### Priority 0: Quick Verification (5 minutes)

Before starting Phase 3 Tier 3, verify Phase 1 & 2 are still working:

#### Task 0A: Start Backend
```bash
cd backend
python -m uvicorn main:app --reload --port 8001
```
Expected output: `application startup complete`

#### Task 0B: Start Frontend (in separate terminal)
```bash
cd frontend
npm run dev
```
Expected output: `Ready in X.XXs` on port 3000

#### Task 0C: Verify Admin Pages Work
Open http://localhost:3000 in browser:
- Navigate to http://localhost:3000/admin
- Login with a test account (create one if needed)
- Verify you can see the campaign list
- Navigate to a campaign and verify you can view/create characters with color overrides
- Verify you can view/create episodes

**If any of these fail, refer to TROUBLESHOOTING.md**

---

## 📋 Phase 3 Tier 3: Public Campaign Pages Tasks

### Overview
Phase 3 Tier 3 focuses on building the **PUBLIC-FACING** campaign pages that viewers can access to learn about campaigns and characters without authentication. These pages will showcase campaign information, character rosters, episode guides, and story timelines.

**Key Differences from Admin Pages:**
- ✅ No authentication required
- ✅ Read-only access (no editing)
- ✅ Optimized for public viewing
- ✅ Character styling uses color overrides
- ✅ Episode/event timeline visualization
- ✅ Character relationship mapping
- ✅ Campaign story progress indicator

### Task 1: Public Campaign Detail Page (2-3 hours)

**Goal:** Build public-facing campaign overview page

#### 1.1: Create Public Campaign Page Route
- File: `frontend/src/app/campaigns/[slug]/page.tsx`
- Route accepts campaign slug (not ID)
- Fetch campaign data from public API
- Display campaign title, description, image
- Show quick stats: # of characters, # of episodes, current status
- Navigation to character roster and episode guide

**Expected Result:** Public campaign page displays with all basic info

#### 1.2: Create Campaign Stats Component
- File: `frontend/src/components/CampaignStats.tsx`
- Display key metrics: Characters, Episodes, Sessions, Story Progress
- Show timeline (when campaign started/ended)
- Links to related content sections

**Expected Result:** Stats section displays with navigation

#### 1.3: Create Campaign Hero Section Component
- File: `frontend/src/components/CampaignHeroSection.tsx`
- Large banner with campaign name, tagline, image
- Quick action buttons: View Characters, View Episodes
- Social sharing buttons (optional)

**Expected Result:** Hero section displays prominently

---

### Task 2: Public Character Roster Page (3-4 hours)

**Goal:** Build searchable/filterable character roster with color styling

#### 2.1: Create Public Character Roster Page
- File: `frontend/src/app/campaigns/[slug]/characters/page.tsx`
- List all active characters for campaign
- Apply character color overrides from database
- Character cards show: name, class, race, player name, image
- Search and filter options (by class, race, name)

**Expected Result:** Character roster displays with all characters

#### 2.2: Enhance CharacterCard for Public View
- Update/create `frontend/src/components/PublicCharacterCard.tsx`
- Display character with color override styling
- Border colors from color_theme_override
- Text color styling
- Badge styling for stats (HP, AC if available)
- Click to view character detail page

**Expected Result:** Character cards display with custom colors

#### 2.3: Create Character Search Component
- File: `frontend/src/components/CharacterSearch.tsx`
- Search by name, class, race
- Filter by status (active/inactive)
- Sort options (alphabetical, by class, by race)
- Mobile-responsive design

**Expected Result:** Search/filter functionality works

#### 2.4: Create Public Character Detail Page
- File: `frontend/src/app/campaigns/[slug]/characters/[characterSlug]/page.tsx`
- Large character image (left sidebar)
- Character details: class, race, player name, backstory, description
- Visual styling with character color overrides
- Related episodes (events this character was involved in)
- Back to roster link

**Expected Result:** Character detail page displays with all info

---

### Task 3: Public Episode Guide Page (2-3 hours)

**Goal:** Build episode guide with story timeline

#### 3.1: Create Public Episode Guide Page
- File: `frontend/src/app/campaigns/[slug]/episodes/page.tsx`
- List all published episodes for campaign
- Timeline view (vertical or horizontal)
- Filter by season
- Show episode number, name, air date, runtime
- Summary/description for each episode

**Expected Result:** Episode guide displays all published episodes

#### 3.2: Create Public Episode Timeline Component
- File: `frontend/src/components/PublicEpisodeTimeline.tsx`
- Vertical or horizontal timeline layout
- Episode cards with: number, title, date, runtime
- Season headers/separators
- Click to view episode detail
- Visual progression indicator (current/past/upcoming)

**Expected Result:** Timeline component renders correctly

#### 3.3: Create Public Episode Detail Page
- File: `frontend/src/app/campaigns/[slug]/episodes/[episodeSlug]/page.tsx`
- Episode title, air date, runtime, description
- Events timeline (character-driven events)
- Character involvement indicator
- Links to related characters
- Back to guide link

**Expected Result:** Episode detail page displays all info

---

### Task 4: Frontend API Updates (1 hour)

**Goal:** Add public API endpoints to API client

#### 4.1: Update API Client with Public Endpoints
- File: `frontend/src/lib/api.ts`
- Add: `getPublicCampaign(slug)` - Get campaign by slug (no auth)
- Add: `getPublicCharacters(campaignSlug)` - Get active characters (no auth)
- Add: `getPublicCharacter(campaignSlug, characterSlug)` - Get character detail (no auth)
- Add: `getPublicEpisodes(campaignSlug)` - Get published episodes (no auth)
- Add: `getPublicEpisode(campaignSlug, episodeSlug)` - Get episode detail (no auth)
- Add: `getPublicEvents(episodeId)` - Get events for episode (no auth)

**Expected Result:** 6 new API functions ready

---

### Task 5: Responsive Design & Styling (2 hours)

**Goal:** Ensure all public pages are mobile-responsive and visually appealing

#### 5.1: Mobile Optimization
- Test all pages on mobile devices
- Character cards stack properly
- Episode timeline readable on small screens
- Navigation works on mobile
- Images load efficiently

**Expected Result:** All pages look good on mobile

#### 5.2: Character Color Styling Implementation
- Ensure character color overrides display correctly:
  - Border colors applied to character cards
  - Text color used for character names/text
  - Badge colors for HP/AC (if displayed)
  - Gradient colors rendered properly

**Expected Result:** Character styling matches admin UI

#### 5.3: Accessibility
- [ ] Alt text for images
- [ ] Proper heading hierarchy
- [ ] Keyboard navigation support
- [ ] Color contrast compliance (WCAG AA)
- [ ] ARIA labels for interactive elements

**Expected Result:** Pages are accessible

---

### Task 6: Character Relationship & Network (Optional - Phase 3.5)

**Goal:** Build interactive character relationship visualization

#### 6.1: Create Character Network Component (OPTIONAL)
- File: `frontend/src/components/CharacterNetwork.tsx`
- Visual network graph of character relationships
- Connect characters who appear in same episodes
- Filter by type of relationship (party members, allies, enemies, etc.)

**Expected Result:** Relationship graph displays (optional feature)

---

### Task 7: Integration Testing (2-3 hours)

**Goal:** Test full Phase 3 Tier 3 workflow end-to-end

#### 7.1: Test Public Campaign Pages
- [ ] Navigate to /campaigns/campaign-slug
- [ ] Verify campaign data displays
- [ ] Click to character roster
- [ ] Click to episode guide

#### 7.2: Test Character Roster
- [ ] All active characters display
- [ ] Color overrides show correctly
- [ ] Search/filter works
- [ ] Click character to view detail
- [ ] Detail page shows all info

#### 7.3: Test Episode Guide
- [ ] All published episodes display
- [ ] Timeline renders properly
- [ ] Click episode to view detail
- [ ] Events display in episode detail
- [ ] Character mentions link correctly

#### 7.4: Test Public API Endpoints
- [ ] All GET endpoints return correct data
- [ ] Endpoints don't require auth
- [ ] Error handling works (404 for missing campaign/character/episode)
- [ ] Data filtering works (active characters, published episodes)

#### 7.5: Test Cross-Device Experience
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] All content visible and usable

**Expected Result:** All integration tests pass ✓

---

### Task 8: Documentation & Polish (2-3 hours)

**Goal:** Update documentation and clean up code

#### 8.1: Update Documentation Files
- Update PROJECT_STATUS.md with Phase 3 Tier 3 completion
- Update ARCHITECTURE.md if public routes need documenting
- Create PHASE_3_TIER_3_COMPLETION_SUMMARY.md
- Update NEXT_ACTIONS.md for Phase 3 Tier 4 (optional enhancements)

**Expected Result:** All docs updated and consistent

#### 8.2: Code Quality Review
- [ ] Remove console.log statements
- [ ] Verify all new components have JSDoc comments
- [ ] Check TypeScript types are correct on public pages
- [ ] Verify no auth tokens leak to client-side code

**Expected Result:** Code is clean and documented

#### 8.3: Performance Optimization
- [ ] Check bundle size
- [ ] Optimize images with next/image
- [ ] Add lazy loading for component lists
- [ ] Implement caching headers on public API responses

**Expected Result:** Pages load quickly

---

## 📊 Implementation Order

**Recommended sequence (follow dependencies):**

1. Frontend: API Client - Public Endpoints (Task 4)
2. Frontend: Campaign Detail Page (Task 1)
3. Frontend: Character Roster + Detail (Task 2)
4. Frontend: Episode Guide + Detail (Task 3)
5. Frontend: Responsive Design & Styling (Task 5)
6. Integration Testing (Task 7)
7. Documentation & Polish (Task 8)
8. Optional: Character Relationship Network (Task 6)

---

## ⏱️ Suggested Schedule

**If working 4-6 hour sessions:**

**Session 9:**
- Task 0: Verification (5 min)
- Task 4: Frontend API Client Updates (1 hour)
- Task 1: Campaign Detail Page (2-3 hours)
- Start Task 2: Character Roster (1-2 hours)

**Session 10:**
- Finish Task 2: Character Roster & Detail Pages (2-3 hours)
- Task 3: Episode Guide Pages (2-3 hours)
- Start Task 5: Responsive Design (30 min)

**Session 11:**
- Finish Task 5: Responsive Design & Styling (1-2 hours)
- Task 7: Integration Testing (2-3 hours)
- Start Task 8: Documentation (30 min)

**Session 12:**
- Finish Task 8: Documentation & Polish (1-2 hours)
- **Phase 3 Tier 3 Complete!**
- **Discuss Phase 3 Tier 4+ or other enhancements**

---

## 🔗 Key Reference Files

**For Architecture & Design:**
- `ARCHITECTURE.md` - Overall system architecture
- `DECISIONS.md` - Design rationale
- `DATABASE_SCHEMA.md` - Database design details

**For Implementation Examples:**
- `PHASE_3_TIER_2_TEST_REPORT.md` - Completed color override UI implementation
- `PHASE_1_COMPLETION_SUMMARY.md` - Phase 1 reference patterns
- `FINAL_ISSUE_FIXES.md` - How to fix bugs (Phase 1 patterns)

**For Troubleshooting & Startup:**
- `TROUBLESHOOTING.md` - Common issues & solutions
- `SESSION_8_STARTUP.md` - Session 8 quick start checklist
- `KNOWN_ISSUES.md` - Documented issues from previous sessions

---

## 📚 Code Patterns to Follow

### Public Page Pattern (new for Phase 3 Tier 3)
```typescript
// Public pages DO NOT require authentication
// Data is fetched from public API endpoints
// Components are read-only (no editing)
// Character color overrides are displayed

// Example route structure
/campaigns/[slug]                    // Campaign overview
/campaigns/[slug]/characters         // Character roster
/campaigns/[slug]/characters/[slug]  // Character detail
/campaigns/[slug]/episodes          // Episode guide
/campaigns/[slug]/episodes/[slug]   // Episode detail
```

### Public API Pattern
```typescript
// Public API functions (no auth required)
getPublicCampaign(slug)
getPublicCharacters(campaignSlug)
getPublicCharacter(campaignSlug, characterSlug)
getPublicEpisodes(campaignSlug)
getPublicEpisode(campaignSlug, episodeSlug)
getPublicEvents(episodeId)

// These endpoints should be fast and cacheable
// Use HTTP caching headers for performance
```

### Color Styling Pattern
```typescript
// Character color overrides should be applied to:
// - Border colors (card borders, accents)
// - Text color (character name, text)
// - Badge colors (HP/AC if displayed)
// - Gradient colors (background gradients)

// Example implementation:
<div style={{
  borderColor: character.color_theme_override?.border_colors[0],
  color: character.color_theme_override?.text_color,
}}>
  {character.name}
</div>
```

---

## ✅ Success Criteria for Phase 3 Tier 3

**Public API Complete When:**
- [ ] getPublicCampaign endpoint works
- [ ] getPublicCharacters endpoint works
- [ ] getPublicEpisodes endpoint works
- [ ] getPublicEvents endpoint works
- [ ] All endpoints return only published/active data
- [ ] No auth token required for these endpoints

**Frontend Complete When:**
- [ ] Campaign detail page displays
- [ ] Character roster page displays with search/filter
- [ ] Character detail page displays with color styling
- [ ] Episode guide page displays
- [ ] Episode detail page displays with event timeline
- [ ] All navigation working correctly
- [ ] Character color overrides display correctly
- [ ] Responsive design looks good on mobile/tablet/desktop
- [ ] Error handling works (404, network errors, etc.)
- [ ] No critical bugs

**Testing Complete When:**
- [ ] Can navigate all public pages
- [ ] Character color styling displays correctly
- [ ] Search and filters work
- [ ] All data displays correctly
- [ ] Tested on multiple devices/browsers

**Documentation Complete When:**
- [ ] PHASE_3_TIER_3_COMPLETION_SUMMARY.md written
- [ ] Public routes documented in ARCHITECTURE.md
- [ ] API_DESIGN.md updated with public endpoints
- [ ] Code comments added where needed
- [ ] Phase 3 progress updated in PROJECT_STATUS.md

---

## 🎯 Quick Reference: Key Commands

```bash
# Start backend
cd backend
python -m uvicorn main:app --reload --port 8001

# Run database migration
cd backend
alembic upgrade head

# Start frontend
cd frontend
npm run dev

# View backend API docs
http://localhost:8001/docs

# View frontend
http://localhost:3000

# Run backend tests
cd backend
python test_characters.py
python test_episodes.py

# Check Python version
python --version

# Check Node version
node --version
```

---

## 🚀 You're Ready!

Phase 1 & 2 are complete and tested. Phase 3 Tiers 1 & 2 are complete. Phase 3 Tier 3 is fully planned.

Everything you need is in:
- This file (action items & schedule for Tier 3)
- SESSION_8_STARTUP.md (quick start reference)
- PHASE_3_TIER_2_TEST_REPORT.md (reference for color override implementation)
- PROJECT_STATUS.md (overall project status)
- Previous phase docs (reference & patterns)

**Key Points for Phase 3 Tier 3:**
- Public pages require NO authentication
- Character color overrides should display with styling
- Use `/campaigns/[slug]` format for public routes (not `/campaigns/[id]`)
- Episode guide and character roster should be searchable/filterable
- Responsive design is critical for public pages
- All color override styling should match admin UI

**Start whenever you're ready. Happy coding! 🎉**

---

**Last updated:** 2025-11-22 (Session 8 Completion - Phase 3 Tier 2 Done)
**Status:** Ready to Begin Phase 3 Tier 3
