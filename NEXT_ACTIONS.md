# Next Actions - What To Do In Session 5 (Phase 2: Character & Episode Management)

**When you log in next session, Phase 1 will be 100% complete and tested. You're ready to begin Phase 2!**

---

## 🎯 Start Here

1. Read `SESSION_5_STARTUP.md` (5 min) - Quick start checklist
2. Read `PROJECT_STATUS.md` (5 min) - Quick refresh on project status
3. Skim `PHASE_2_PLANNING.md` (15 min) - See the full Phase 2 architecture
4. Review this document for specific action items
5. Follow the steps below in order

**Total time commitment: 2-3 sessions of work**

**Progress so far:**
- ✅ Session 1: Neon PostgreSQL setup complete
- ✅ Session 2: Cloudflare R2 setup complete
- ✅ Session 3: Backend refactoring, Frontend setup, Full-stack testing
- ✅ Session 4: Phase 1 Campaign Management - Complete with 7 issues fixed
- ⏳ Session 5+: Phase 2 Character & Episode Management

---

## ⚡ Session 5 Task List - Phase 2: Character & Episode Management

### Priority 0: Quick Verification (5 minutes)

Before starting Phase 2, verify Phase 1 is still working:

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

#### Task 0C: Verify Connection
Open http://localhost:3000 in browser:
- Navigate to http://localhost:3000/admin
- Login with a test account (create one if needed)
- Verify you can see the campaign list
- Try creating/editing/deleting a test campaign

**If any of these fail, refer to TROUBLESHOOTING.md**

---

## 📋 Phase 2: Character & Episode Management Tasks

### Task 1: Backend - Character Model & Endpoints (2-3 hours)

**Goal:** Complete character CRUD with image upload to R2

#### 1.1: Create Database Migration
- File: `backend/alembic/versions/003_add_characters_episodes.py`
- Add `characters` table with fields: id, campaign_id, name, slug, class, race, player_name, description, backstory, image_url, image_r2_key, level, is_active
- Add indexes on campaign_id and slug
- Test migration: `alembic upgrade head`

**Expected Result:** `characters` table exists in Neon database

#### 1.2: Update Character Model in models.py
- Update `Character` model class (already exists)
- Add relationships to Campaign
- Add image_url and image_r2_key fields
- Add validation for required fields

**Expected Result:** SQLAlchemy model ready for CRUD operations

#### 1.3: Create characters.py Endpoints Module
- POST /characters - Create character
- GET /campaigns/{id}/characters - List campaign characters
- GET /characters/{id} - Get character detail
- PATCH /characters/{id} - Update character
- DELETE /characters/{id} - Delete character (+ delete image from R2)

**Each endpoint must:**
- [ ] Require Bearer token authentication
- [ ] Verify campaign ownership
- [ ] Return appropriate status codes (201, 200, 404, 403)
- [ ] Include proper error messages

**Expected Result:** 5 fully functional character endpoints

#### 1.4: Image Upload Support
- Create image_upload.py helper module
- Function to upload character image to R2
- Path format: `campaigns/{campaign_id}/characters/{character_id}/{filename}`
- Store R2 key in database for later deletion
- Return public URL for display

**Expected Result:** Image uploads working with proper R2 integration

#### 1.5: Test Character Endpoints
- Create test_characters.py
- Test create character (with and without image)
- Test list characters
- Test update character
- Test delete character (verify image deleted from R2)

**Expected Result:** All tests pass ✓

---

### Task 2: Backend - Episode & Event Endpoints (2 hours)

**Goal:** Complete episode and event CRUD operations

#### 2.1: Create Database Migration (if needed)
- Verify `episodes` and `events` tables exist
- Add indexes on campaign_id and episode_id

**Expected Result:** Tables exist with proper indexes

#### 2.2: Update Episode & Event Models
- Update `Episode` model with all fields
- Update `Event` model with all fields
- Add relationships between tables

**Expected Result:** SQLAlchemy models ready

#### 2.3: Create episodes.py Endpoints Module
- POST /episodes - Create episode
- GET /campaigns/{id}/episodes - List episodes
- GET /episodes/{id} - Get episode detail (include events)
- PATCH /episodes/{id} - Update episode
- DELETE /episodes/{id} - Delete episode (cascades to events)

**Expected Result:** 5 fully functional episode endpoints

#### 2.4: Create events.py Endpoints Module (or add to episodes.py)
- POST /episodes/{id}/events - Create event
- GET /episodes/{id}/events - List events
- PATCH /episodes/{id}/events/{event_id} - Update event
- DELETE /episodes/{id}/events/{event_id} - Delete event

**Expected Result:** 4 fully functional event endpoints

#### 2.5: Test Episode & Event Endpoints
- Create test_episodes.py
- Test full episode CRUD flow
- Test event creation within episodes
- Test cascading deletes

**Expected Result:** All tests pass ✓

---

### Task 3: Frontend - Character Components (3-4 hours)

**Goal:** Build reusable character management components

#### 3.1: Create image_upload.ts Helper
- File: `frontend/src/lib/image_upload.ts`
- Function to preview image before upload
- Function to upload to backend endpoint
- Handle errors gracefully

**Expected Result:** Image upload utility ready

#### 3.2: Create CharacterCard Component
- File: `frontend/src/components/CharacterCard.tsx`
- Display character in grid format
- Show image, name, class, race
- "View" and "Edit" buttons

**Expected Result:** Reusable card component

#### 3.3: Create CharacterForm Component
- File: `frontend/src/components/CharacterForm.tsx`
- Form for create/edit modes
- Fields: name (auto-slug), class, race, player, description, backstory, image, level
- Auto-slug generation from name
- Image preview before save

**Expected Result:** Form component works in both modes

#### 3.4: Create ImageUploadField Component
- File: `frontend/src/components/ImageUploadField.tsx`
- File input with preview
- Drop zone support
- File type/size validation
- Progress indicator

**Expected Result:** Reusable image upload field

#### 3.5: Update API Client
- File: `frontend/src/lib/api.ts`
- Add character endpoints: createCharacter, getCharacters, getCharacter, updateCharacter, deleteCharacter
- Add uploadCharacterImage function
- Proper error handling

**Expected Result:** API functions ready for components

---

### Task 4: Frontend - Character Pages (2-3 hours)

**Goal:** Build UI pages for character management

#### 4.1: Create Character List Page
- File: `frontend/src/app/admin/campaigns/[id]/characters/page.tsx`
- Display grid of character cards
- "Add Character" button
- Navigation back to campaign

**Expected Result:** Character list displays properly

#### 4.2: Create Create Character Page
- File: `frontend/src/app/admin/campaigns/[id]/characters/new/page.tsx`
- CharacterForm in create mode
- On success, redirect to character detail
- On cancel, go back to list

**Expected Result:** Can create characters with all fields

#### 4.3: Create Character Detail Page
- File: `frontend/src/app/admin/campaigns/[id]/characters/[characterId]/page.tsx`
- Large image display (left sidebar)
- Character details (main content)
- Edit form with save/cancel
- Delete button in danger zone

**Expected Result:** Can view, edit, and delete characters

---

### Task 5: Frontend - Episode Components (2-3 hours)

**Goal:** Build episode management components

#### 5.1: Create EpisodeCard Component
- File: `frontend/src/components/EpisodeCard.tsx`
- Display episode in list format
- Show episode number, name, air date, runtime
- "View" and "Edit" buttons

**Expected Result:** Reusable episode card

#### 5.2: Create EpisodeForm Component
- File: `frontend/src/components/EpisodeForm.tsx`
- Form for create/edit modes
- Fields: name (auto-slug), episode_number, season, description, air_date, runtime, is_published

**Expected Result:** Form works in both modes

#### 5.3: Create EpisodeTimeline Component
- File: `frontend/src/components/EpisodeTimeline.tsx`
- Vertical timeline view of episodes
- Ordered by episode number
- Links to detail pages

**Expected Result:** Timeline displays properly

#### 5.4: Create EventCard Component
- File: `frontend/src/components/EventCard.tsx`
- Display event in timeline
- Show name, timestamp, event_type
- Edit/delete buttons

**Expected Result:** Event cards display in episodes

#### 5.5: Update API Client
- Add episode endpoints: createEpisode, getEpisodes, getEpisode, updateEpisode, deleteEpisode
- Add event endpoints: createEvent, getEvents, deleteEvent

**Expected Result:** API functions ready

---

### Task 6: Frontend - Episode Pages (2-3 hours)

**Goal:** Build UI pages for episode management

#### 6.1: Create Episode List Page
- File: `frontend/src/app/admin/campaigns/[id]/episodes/page.tsx`
- EpisodeTimeline component
- "Add Episode" button
- Navigation back to campaign

**Expected Result:** Episode list displays

#### 6.2: Create Create Episode Page
- File: `frontend/src/app/admin/campaigns/[id]/episodes/new/page.tsx`
- EpisodeForm in create mode
- Redirect to episode detail on success

**Expected Result:** Can create episodes

#### 6.3: Create Episode Detail Page
- File: `frontend/src/app/admin/campaigns/[id]/episodes/[episodeId]/page.tsx`
- Episode info (main content)
- Events timeline (below)
- "Add Event" button
- Edit/delete episode

**Expected Result:** Can view, edit, delete episodes and manage events

---

### Task 7: Integration Testing (2 hours)

**Goal:** Test full Phase 2 workflow end-to-end

#### 7.1: Create Test Campaign
- Use existing Phase 1 campaign or create new one

#### 7.2: Test Character Management
- [ ] Create character with image
- [ ] List characters
- [ ] Edit character (update name, description, image)
- [ ] Verify image appears in list and detail
- [ ] Delete character
- [ ] Verify image deleted from R2

#### 7.3: Test Episode Management
- [ ] Create episode
- [ ] List episodes in timeline
- [ ] Create event in episode
- [ ] Edit event
- [ ] Delete event
- [ ] Delete episode (verify events cascade deleted)

#### 7.4: Test Cross-Feature Integration
- [ ] Create campaign with multiple characters and episodes
- [ ] Verify all data displays correctly
- [ ] Test navigation between related pages
- [ ] Verify campaign deletion cascades to characters and episodes

#### 7.5: Test Error Handling
- [ ] Try operations without auth token (should fail)
- [ ] Try operations on other user's campaign (should fail)
- [ ] Try invalid file uploads (should fail gracefully)
- [ ] Test network error scenarios

**Expected Result:** All integration tests pass ✓

---

### Task 8: Documentation & Polish (1-2 hours)

#### 8.1: Update Documentation Files
- Update PROJECT_STATUS.md with Phase 2 completion
- Update API_DESIGN.md with new endpoints
- Update ARCHITECTURE.md if needed
- Create PHASE_2_COMPLETION_SUMMARY.md

#### 8.2: Code Quality
- [ ] Remove console.log statements
- [ ] Add error handling comments
- [ ] Verify all endpoints have JSDoc comments
- [ ] Check TypeScript types are correct

#### 8.3: Performance Optimization
- [ ] Check bundle size
- [ ] Optimize images (consider lazy loading)
- [ ] Verify database queries are efficient
- [ ] Add caching if needed

**Expected Result:** Code is clean, documented, and optimized

---

## 📊 Implementation Order

**Recommended sequence (follow dependencies):**

1. ✅ Backend: Migration & Models (Task 1.1-1.2)
2. ✅ Backend: Character Endpoints (Task 1.3-1.5)
3. ✅ Backend: Episode Endpoints (Task 2.1-2.5)
4. ✅ Frontend: API Client (Task 3.5 + 5.5)
5. ✅ Frontend: Image Upload (Task 3.1)
6. ✅ Frontend: Character Components (Task 3.2-3.4)
7. ✅ Frontend: Character Pages (Task 4.1-4.3)
8. ✅ Frontend: Episode Components (Task 5.1-5.4)
9. ✅ Frontend: Episode Pages (Task 6.1-6.3)
10. ✅ Integration Testing (Task 7)
11. ✅ Documentation & Polish (Task 8)

---

## ⏱️ Suggested Schedule

**If working 4-6 hour sessions:**

**Session 5:**
- Task 0: Verification (5 min)
- Task 1: Backend Character Model & Endpoints (2-3 hours)
- Start Task 2: Backend Episode Endpoints (1-2 hours)

**Session 6:**
- Finish Task 2: Backend Episode Endpoints (1 hour)
- Task 3: Frontend Character Components (3 hours)

**Session 7:**
- Task 4: Frontend Character Pages (2-3 hours)
- Start Task 5: Frontend Episode Components (1-2 hours)

**Session 8:**
- Finish Task 5: Episode Components (1 hour)
- Task 6: Episode Pages (2-3 hours)
- Start Task 7: Testing (1 hour)

**Session 9:**
- Finish Task 7: Integration Testing (1-2 hours)
- Task 8: Documentation & Polish (1-2 hours)
- **Phase 2 Complete!**

---

## 🔗 Key Reference Files

**For Architecture & Design:**
- `PHASE_2_PLANNING.md` - Detailed Phase 2 architecture (READ THIS FIRST)
- `ARCHITECTURE.md` - Overall system architecture
- `DATABASE_SCHEMA.md` - Database design details
- `DECISIONS.md` - Design rationale

**For Implementation Examples:**
- `FINAL_ISSUE_FIXES.md` - How to fix bugs (Phase 1 patterns)
- `PHASE_1_PROGRESS.md` - Phase 1 implementation details
- `PHASE_1_COMPLETION_SUMMARY.md` - Complete Phase 1 reference

**For Troubleshooting:**
- `TROUBLESHOOTING.md` - Common issues & solutions
- `SESSION_5_STARTUP.md` - Quick start checklist

---

## 📚 Code Patterns to Follow (from Phase 1)

### Character CRUD Pattern (follow like Campaign CRUD)
```typescript
// Backend: Characters endpoints follow same pattern as Campaigns
POST /characters
GET /campaigns/{id}/characters
GET /characters/{id}
PATCH /characters/{id}
DELETE /characters/{id}

// Frontend: Components follow same pattern
useAuth → useCharacters hook
CharacterForm (create/edit modes)
CharacterCard (list items)
Protected routes
localStorage caching
```

### Image Upload Pattern (new for Phase 2)
```typescript
// Frontend
SelectFile → Preview → Upload → Get URL from Backend
Store URL in database
Delete image from R2 on character delete

// Backend
Receive File → Upload to R2
Store R2 key + public URL in database
Return data to frontend
```

### Form Component Pattern
```typescript
// Create Mode
- Initialize with empty fields
- On submit, POST to create endpoint
- On success, redirect to detail page

// Edit Mode
- Initialize with existing data
- On submit, PATCH to update endpoint
- On success, stay on page with updated data
- Show loading state during submission
```

---

## ✅ Success Criteria for Phase 2

**Backend Complete When:**
- [ ] Character endpoints working (create, read, update, delete)
- [ ] Character image uploads to R2 working
- [ ] Episode endpoints working
- [ ] Event endpoints working
- [ ] All tests passing
- [ ] No critical bugs

**Frontend Complete When:**
- [ ] Character list page displaying
- [ ] Create character page working
- [ ] Character detail page with edit/delete working
- [ ] Episode list page displaying
- [ ] Episode detail page with events working
- [ ] All navigation working correctly
- [ ] All CRUD operations working
- [ ] Responsive design looks good
- [ ] Error handling works properly
- [ ] No critical bugs

**Documentation Complete When:**
- [ ] All new endpoints documented
- [ ] Phase 2 completion summary written
- [ ] Architecture updated if needed
- [ ] Code comments added where needed

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

Phase 1 is complete and tested. Phase 2 is fully planned and documented.

Everything you need is in:
- PHASE_2_PLANNING.md (architecture & detailed design)
- This file (action items & schedule)
- SESSION_5_STARTUP.md (quick start)
- Previous phase docs (reference & patterns)

**Start whenever you're ready. Happy coding! 🎉**

---

**Last updated:** 2025-11-21 (Session 5 Preparation)
**Status:** Ready to Begin Phase 2
