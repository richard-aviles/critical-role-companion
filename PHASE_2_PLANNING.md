# Phase 2 Planning - Character & Episode Management

**Date:** 2025-11-21
**Status:** Planning & Architecture Design
**Phase Start:** Session 5

---

## 📊 Phase 2 Overview

Build complete Character and Episode management system with image uploads to R2.

### What We're Building
1. **Character Management System**
   - Create, read, update, delete characters
   - Character image uploads to Cloudflare R2
   - Character classes, roles, and stats
   - Character roster for each campaign

2. **Episode Management System**
   - Create, read, update, delete episodes
   - Episode timeline and sequencing
   - Events within episodes
   - Campaign episode chronology

3. **Frontend UI**
   - Character list with grid/gallery view
   - Character detail pages with images
   - Character roster/team view
   - Episode timeline display
   - Event creation and management

---

## 🗄️ Database Schema (Phase 2)

### Character Table
```sql
CREATE TABLE characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

    -- Basic Info
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    class VARCHAR(100),  -- e.g., "Rogue", "Cleric", etc.
    race VARCHAR(100),   -- e.g., "Tiefling", "Half-Elf", etc.
    player_name VARCHAR(255),
    description TEXT,
    backstory TEXT,

    -- Image/Media
    image_url VARCHAR(500),  -- Path to image in R2
    image_r2_key VARCHAR(255),  -- R2 storage key for easy deletion

    -- Status & Metadata
    is_active BOOLEAN DEFAULT true,
    level INT DEFAULT 1,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    UNIQUE(campaign_id, slug),
    UNIQUE(campaign_id, name)
);

CREATE INDEX idx_characters_campaign ON characters(campaign_id);
CREATE INDEX idx_characters_slug ON characters(slug);
```

### Episode Table
```sql
CREATE TABLE episodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

    -- Episode Info
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    episode_number INT,  -- 1, 2, 3, etc.
    season INT,  -- Season number if applicable
    description TEXT,

    -- Timeline
    air_date DATE,  -- When episode aired/played
    runtime INT,  -- Length in minutes

    -- Status
    is_published BOOLEAN DEFAULT false,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    UNIQUE(campaign_id, slug),
    UNIQUE(campaign_id, episode_number, season)
);

CREATE INDEX idx_episodes_campaign ON episodes(campaign_id);
CREATE INDEX idx_episodes_slug ON episodes(slug);
CREATE INDEX idx_episodes_number ON episodes(episode_number);
```

### Event Table (within episodes)
```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,

    -- Event Info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    timestamp_in_episode INT,  -- Seconds into episode

    -- Categories
    event_type VARCHAR(50),  -- e.g., "combat", "roleplay", "discovery"
    characters_involved TEXT,  -- JSON array of character IDs

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_episode ON events(episode_id);
CREATE INDEX idx_events_type ON events(event_type);
```

---

## 🔌 Backend API Endpoints (Phase 2)

### Character Endpoints

#### Create Character
```
POST /characters
Authorization: Bearer {user_id}
Content-Type: multipart/form-data

Body:
- campaign_id: UUID (required)
- name: string (required)
- slug: string (auto-generated from name)
- class: string (optional)
- race: string (optional)
- player_name: string (optional)
- description: string (optional)
- backstory: string (optional)
- image: File (optional) - upload to R2
- level: int (optional, default: 1)

Response:
{
    "id": "uuid",
    "campaign_id": "uuid",
    "name": "Character Name",
    "slug": "character-name",
    "class": "Rogue",
    "race": "Tiefling",
    "player_name": "Player Name",
    "image_url": "https://r2-bucket.example.com/path/to/image.jpg",
    "level": 1,
    "created_at": "2025-11-21T...",
    "updated_at": "2025-11-21T..."
}
```

#### Get Characters (Campaign Roster)
```
GET /campaigns/{campaign_id}/characters
Authorization: Bearer {user_id}

Response:
[
    {
        "id": "uuid",
        "name": "Character Name",
        "slug": "character-name",
        "class": "Rogue",
        "race": "Tiefling",
        "image_url": "https://...",
        "level": 1
    },
    ...
]
```

#### Get Character Detail
```
GET /characters/{character_id}
Authorization: Bearer {user_id}

Response:
{
    "id": "uuid",
    "campaign_id": "uuid",
    "name": "Character Name",
    "slug": "character-name",
    "class": "Rogue",
    "race": "Tiefling",
    "player_name": "Player Name",
    "description": "...",
    "backstory": "...",
    "image_url": "https://...",
    "level": 1,
    "is_active": true,
    "created_at": "2025-11-21T...",
    "updated_at": "2025-11-21T..."
}
```

#### Update Character
```
PATCH /characters/{character_id}
Authorization: Bearer {user_id}
Content-Type: multipart/form-data

Body:
- name: string (optional)
- class: string (optional)
- race: string (optional)
- description: string (optional)
- backstory: string (optional)
- image: File (optional) - upload to R2
- level: int (optional)
- is_active: boolean (optional)

Response: Updated character object
```

#### Delete Character
```
DELETE /characters/{character_id}
Authorization: Bearer {user_id}

Response: 204 No Content
(Also deletes image from R2)
```

### Episode Endpoints

#### Create Episode
```
POST /episodes
Authorization: Bearer {user_id}

Body:
{
    "campaign_id": "uuid",
    "name": "Episode Name",
    "slug": "episode-slug",
    "episode_number": 1,
    "season": 1,
    "description": "Episode description",
    "air_date": "2025-11-21",
    "runtime": 180,
    "is_published": false
}

Response: Created episode object
```

#### Get Episodes (Campaign Episodes)
```
GET /campaigns/{campaign_id}/episodes
Authorization: Bearer {user_id}

Response:
[
    {
        "id": "uuid",
        "name": "Episode Name",
        "slug": "episode-slug",
        "episode_number": 1,
        "season": 1,
        "air_date": "2025-11-21",
        "runtime": 180,
        "is_published": true
    },
    ...
]
```

#### Get Episode Detail
```
GET /episodes/{episode_id}
Authorization: Bearer {user_id}

Response:
{
    "id": "uuid",
    "campaign_id": "uuid",
    "name": "Episode Name",
    "slug": "episode-slug",
    "episode_number": 1,
    "season": 1,
    "description": "...",
    "air_date": "2025-11-21",
    "runtime": 180,
    "is_published": true,
    "events": [...],  -- Include events in response
    "created_at": "2025-11-21T...",
    "updated_at": "2025-11-21T..."
}
```

#### Update Episode
```
PATCH /episodes/{episode_id}
Authorization: Bearer {user_id}

Body: Any episode field (optional)
Response: Updated episode object
```

#### Delete Episode
```
DELETE /episodes/{episode_id}
Authorization: Bearer {user_id}

Response: 204 No Content
(Cascades to delete all events)
```

### Event Endpoints

#### Create Event
```
POST /episodes/{episode_id}/events
Authorization: Bearer {user_id}

Body:
{
    "name": "Event Name",
    "description": "What happened",
    "timestamp_in_episode": 1200,  -- seconds
    "event_type": "combat",
    "characters_involved": ["uuid1", "uuid2"]
}

Response: Created event object
```

#### Get Events (Episode Timeline)
```
GET /episodes/{episode_id}/events
Authorization: Bearer {user_id}

Response:
[
    {
        "id": "uuid",
        "name": "Event Name",
        "timestamp_in_episode": 1200,
        "event_type": "combat",
        "characters_involved": ["uuid1", "uuid2"]
    },
    ...
]
```

#### Update Event
```
PATCH /episodes/{episode_id}/events/{event_id}
Authorization: Bearer {user_id}

Body: Any event field (optional)
Response: Updated event object
```

#### Delete Event
```
DELETE /episodes/{episode_id}/events/{event_id}
Authorization: Bearer {user_id}

Response: 204 No Content
```

---

## 🎨 Frontend Pages & Components (Phase 2)

### New Pages

#### 1. Characters List Page (`/admin/campaigns/[id]/characters`)
```
Layout:
- Header: Campaign name + navigation
- Grid view of character cards (3-4 per row)
- Each card shows:
  - Character image (or placeholder)
  - Character name
  - Class & Race
  - Player name
  - "View" and "Edit" buttons
- Button: "Add Character" (floating action button)

Components needed:
- CharacterCard.tsx
- CharacterList.tsx
```

#### 2. Character Detail Page (`/admin/campaigns/[id]/characters/[characterId]`)
```
Layout:
- Large character image (left sidebar)
- Character details (main content):
  - Name, class, race, player name
  - Description & backstory
  - Level and active status
- Edit form with save/cancel
- Delete button (danger zone)
- Change image button

Components needed:
- CharacterForm.tsx
- ImageUploadField.tsx
- ConfirmDialog.tsx (reuse from Phase 1)
```

#### 3. Create Character Page (`/admin/campaigns/[id]/characters/new`)
```
Layout:
- Form with fields:
  - Name (auto-slug)
  - Class (dropdown)
  - Race (dropdown)
  - Player name
  - Description (textarea)
  - Backstory (textarea)
  - Image upload (with preview)
  - Level (number)
- Cancel/Create buttons

Components needed:
- CharacterForm.tsx
- ImageUploadField.tsx
```

#### 4. Episodes Timeline Page (`/admin/campaigns/[id]/episodes`)
```
Layout:
- Vertical timeline of episodes
- Each episode card shows:
  - Episode number & name
  - Air date
  - Runtime
  - Published status
  - "View" and "Edit" buttons
- Button: "Add Episode"

Components needed:
- EpisodeCard.tsx
- EpisodeTimeline.tsx
```

#### 5. Episode Detail Page (`/admin/campaigns/[id]/episodes/[episodeId]`)
```
Layout:
- Episode info (main content)
- Events timeline (below)
- Each event shows:
  - Name & description
  - Timestamp
  - Characters involved
  - Edit/delete buttons
- Button: "Add Event"

Components needed:
- EpisodeForm.tsx
- EventTimeline.tsx
- EventCard.tsx
```

### New Components

| Component | Purpose | Reusability |
|-----------|---------|-------------|
| `CharacterCard.tsx` | Display character in grid | High (used in list) |
| `CharacterForm.tsx` | Create/edit character | High (create & detail pages) |
| `ImageUploadField.tsx` | Handle image uploads to R2 | High (characters & episodes) |
| `CharacterList.tsx` | Grid of character cards | Medium (campaign detail page) |
| `EpisodeCard.tsx` | Display episode in timeline | High (used in list) |
| `EpisodeForm.tsx` | Create/edit episode | High (create & detail pages) |
| `EpisodeTimeline.tsx` | Vertical timeline view | High (episode list page) |
| `EventTimeline.tsx` | Timeline within episode | Medium (episode detail page) |
| `EventCard.tsx` | Single event in timeline | High (event list) |
| `EventForm.tsx` | Create/edit event | High (create & detail pages) |

---

## 📁 File Structure (Phase 2)

### Backend Changes
```
backend/
├── main.py                          (UPDATE - add new routes)
├── models.py                        (UPDATE - add Character, Episode, Event)
├── database.py                      (UPDATE if needed)
├── characters.py                    (NEW - character endpoints)
├── episodes.py                      (NEW - episode endpoints)
├── image_upload.py                  (NEW - R2 image handling)
├── alembic/
│   └── versions/
│       └── 003_add_characters_episodes.py  (NEW - migrations)
└── test_characters_episodes.py      (NEW - testing)
```

### Frontend Changes
```
frontend/src/
├── lib/
│   ├── api.ts                       (UPDATE - add character/episode endpoints)
│   └── image_upload.ts              (NEW - R2 image upload helper)
├── components/
│   ├── CharacterCard.tsx            (NEW)
│   ├── CharacterForm.tsx            (NEW)
│   ├── CharacterList.tsx            (NEW)
│   ├── EpisodeCard.tsx              (NEW)
│   ├── EpisodeForm.tsx              (NEW)
│   ├── EpisodeTimeline.tsx          (NEW)
│   ├── EventCard.tsx                (NEW)
│   ├── EventForm.tsx                (NEW)
│   ├── EventTimeline.tsx            (NEW)
│   ├── ImageUploadField.tsx         (NEW)
│   └── (existing components)
├── hooks/
│   ├── useAuth.ts                   (EXISTING)
│   ├── useCharacters.ts             (NEW - character list hook)
│   └── useEpisodes.ts               (NEW - episode list hook)
└── app/admin/
    ├── campaigns/
    │   └── [id]/
    │       ├── page.tsx             (UPDATE - add tabs)
    │       ├── characters/          (NEW)
    │       │   ├── page.tsx
    │       │   ├── new/
    │       │   │   └── page.tsx
    │       │   └── [characterId]/
    │       │       └── page.tsx
    │       └── episodes/            (NEW)
    │           ├── page.tsx
    │           ├── new/
    │           │   └── page.tsx
    │           └── [episodeId]/
    │               └── page.tsx
```

---

## 🖼️ Image Upload Strategy

### For Character Images
1. User selects image in character form
2. Frontend preview shown before save
3. On save, upload to R2 with key: `campaigns/{campaign_id}/characters/{character_id}/{filename}`
4. Store R2 key and public URL in database
5. Display image on character detail/card pages
6. On character delete, also delete image from R2

### Implementation
```typescript
// Frontend image upload
async function uploadCharacterImage(
    campaignId: string,
    characterId: string,
    file: File
): Promise<{ url: string; r2Key: string }> {
    const formData = new FormData();
    formData.append('campaign_id', campaignId);
    formData.append('character_id', characterId);
    formData.append('image', file);

    const response = await fetch('/api/images/character', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });

    return response.json();
}
```

---

## 🔄 Implementation Strategy

### Phase 2.1 - Backend (Characters)
1. Add Character model to models.py
2. Create characters.py with CRUD endpoints
3. Implement R2 image upload for characters
4. Create database migration
5. Test with test_characters.py

### Phase 2.2 - Frontend (Characters)
1. Create character API functions in api.ts
2. Create CharacterForm and CharacterCard components
3. Create character pages (list, detail, new)
4. Implement image upload UI
5. Test in browser

### Phase 2.3 - Backend (Episodes)
1. Add Episode and Event models to models.py
2. Create episodes.py with CRUD endpoints
3. Create database migration
4. Test with test_episodes.py

### Phase 2.4 - Frontend (Episodes)
1. Create episode API functions in api.ts
2. Create EpisodeForm and EpisodeTimeline components
3. Create episode pages (list, detail, new)
4. Implement event management
5. Test in browser

### Phase 2.5 - Integration & Testing
1. Test cross-feature interactions
2. Test image uploads and deletions
3. Test cascading deletes
4. Performance optimization
5. Bug fixes and polish

---

## ✅ Success Criteria for Phase 2

- [ ] Character CRUD endpoints working
- [ ] Character image uploads to R2 functional
- [ ] Character list page displaying correctly
- [ ] Character detail page with edit/delete working
- [ ] Episode CRUD endpoints working
- [ ] Episode list page displaying correctly
- [ ] Episode detail page with events working
- [ ] Event creation/deletion working
- [ ] All tests passing
- [ ] No critical bugs remaining
- [ ] Documentation updated
- [ ] Code reviewed and cleaned

---

## 📊 Estimated Timeline

- Phase 2.1 (Backend Characters): ~2 hours
- Phase 2.2 (Frontend Characters): ~3 hours
- Phase 2.3 (Backend Episodes): ~2 hours
- Phase 2.4 (Frontend Episodes): ~3 hours
- Phase 2.5 (Integration & Testing): ~2 hours
- **Total: ~12 hours across 2-3 sessions**

---

## 🎯 Key Design Decisions

1. **Image Storage:** Using Cloudflare R2 (already set up) for character images
2. **Slug Generation:** Auto-generate from name (like Phase 1)
3. **Character Ownership:** Inherited from campaign ownership (no separate permissions)
4. **Episode Sequencing:** Number-based for timeline view
5. **Events:** Simple timeline entries with character involvement tracking
6. **Cascading Deletes:** Campaign deletion → Characters & Episodes deleted automatically

---

## 🚀 Ready to Build!

This plan provides everything needed to implement Phase 2. Follow the implementation strategy, test after each section, and refer back to Phase 1 patterns for consistency.

**Let's go! 🎉**
