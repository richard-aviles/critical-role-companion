# Architecture - Technical Overview

**Last Updated:** 2025-11-21
**Status:** Phase 0 (Foundation) Complete - Implementation in full swing

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      END USERS                               │
│  (Streamers, Viewers, Campaign Hub Visitors)                │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┼──────────┬────────────────────┐
        │          │          │                    │
        ▼          ▼          ▼                    ▼
    ┌────────┐ ┌────────┐ ┌──────────┐      ┌──────────┐
    │ Admin  │ │Campaign│ │   Live   │      │ Public   │
    │Dashboard│ │  Hub   │ │ Overlay  │      │ API      │
    │(React) │ │(Next.js)│(Next.js)  │      │(REST)    │
    └────┬───┘ └───┬────┘ └────┬─────┘      └────┬─────┘
         │         │           │                 │
         └─────────┼───────────┴─────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │   FastAPI Backend    │
        │  (Python)            │
        │  - REST API          │
        │  - WebSocket         │
        │  - Image uploads     │
        └────┬─────────────────┘
             │
    ┌────────┼────────────────────┐
    │        │                    │
    ▼        ▼                    ▼
┌────────┐ ┌──────────┐      ┌──────────┐
│Neon PG │ │Cloudflare│      │Cloudflare│
│Database│ │  R2      │      │   DNS    │
│        │ │(Images)  │      │   CDN    │
└────────┘ └──────────┘      └──────────┘
```

---

## 🗄️ Multi-Tenant Data Model

### Core Concept

**One app, many campaigns.**

Each campaign is completely isolated:
- Own characters
- Own episodes
- Own roster
- Own settings
- Own images

### Entity Relationship

```
Campaign (1)
  ├─ (Many) Characters
  │   ├─ stats (HP, AC, abilities)
  │   ├─ portrait (image URL)
  │   ├─ appearance
  │   └─ status
  ├─ (Many) Episodes
  │   ├─ title
  │   ├─ date
  │   └─ summary
  ├─ (Many) Events
  │   ├─ HP changes
  │   ├─ custom events
  │   └─ timestamps
  ├─ ActiveRoster
  │   └─ List of character IDs currently active
  └─ LayoutSettings
      └─ Badge positions per tier
```

### Database Tables

```sql
-- Campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY,
  slug VARCHAR UNIQUE NOT NULL,  -- URL-friendly name
  name VARCHAR NOT NULL,
  owner_id UUID,                 -- For future multi-user
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  settings JSONB                 -- Theme, layout defaults, etc.
);

-- Characters table
CREATE TABLE characters (
  id UUID PRIMARY KEY,
  campaign_id UUID NOT NULL,     -- Foreign key
  name VARCHAR NOT NULL,
  player_name VARCHAR,
  class VARCHAR,
  race VARCHAR,
  stats JSONB,                   -- HP, AC, abilities
  portrait_url VARCHAR,
  background_url VARCHAR,
  status VARCHAR,                -- active, retired, dead, guest
  created_at TIMESTAMP
);

-- Active Roster
CREATE TABLE rosters (
  campaign_id UUID PRIMARY KEY,
  character_ids UUID[] NOT NULL, -- Array of active character IDs
  updated_at TIMESTAMP
);

-- Episodes
CREATE TABLE episodes (
  id UUID PRIMARY KEY,
  campaign_id UUID NOT NULL,
  episode_number INT,
  title VARCHAR,
  date DATE,
  summary TEXT,
  created_at TIMESTAMP
);

-- Events (HP changes, conditions, etc.)
CREATE TABLE events (
  id UUID PRIMARY KEY,
  campaign_id UUID NOT NULL,
  character_id UUID,
  event_type VARCHAR,            -- hp_change, condition_added, etc.
  data JSONB,                    -- Event-specific data
  timestamp TIMESTAMP
);

-- Layout overrides (badge positions)
CREATE TABLE layout_overrides (
  id UUID PRIMARY KEY,
  campaign_id UUID NOT NULL,
  tier VARCHAR,                  -- large, medium, compact
  badges JSONB,                  -- Position data
  chips JSONB,                   -- Position data
  updated_at TIMESTAMP
);
```

---

## 🔌 API Endpoints

### Public Routes (No Authentication)

```
GET  /campaigns                   # List all public campaigns
GET  /campaigns/{slug}            # Campaign details page
GET  /campaigns/{slug}/characters # Character directory
GET  /campaigns/{slug}/characters/{id}  # Character detail
GET  /campaigns/{slug}/episodes   # Episode list
GET  /overlay/{slug}              # Stream overlay (embeddable)
```

### Admin Routes (Require Token)

```
POST   /campaigns                 # Create new campaign
GET    /campaigns/{id}            # Get campaign (admin view)
PATCH  /campaigns/{id}            # Update campaign settings
DELETE /campaigns/{id}            # Delete campaign

GET    /campaigns/{id}/characters
POST   /campaigns/{id}/characters
PATCH  /campaigns/{id}/characters/{char_id}
DELETE /campaigns/{id}/characters/{char_id}
POST   /campaigns/{id}/characters/{char_id}/portrait    # Upload
POST   /campaigns/{id}/characters/{char_id}/background  # Upload

GET    /campaigns/{id}/roster
PATCH  /campaigns/{id}/roster     # Update active roster

GET    /campaigns/{id}/layout/{tier}       # Get badge positions
PATCH  /campaigns/{id}/layout/{tier}       # Save badge positions

GET    /campaigns/{id}/events
POST   /campaigns/{id}/events     # Ingest event

WS     /campaigns/{id}/ws         # WebSocket for real-time updates
```

### Authentication

**Token Format:**
```
Header: X-Token: admin_token_campaign-xyz_secret123
```

**Validation:**
- Token must match campaign's admin token
- Tokens are per-campaign (not global)
- Future: User accounts with permissions

---

## 📊 Frontend Structure

### Next.js Routes

```
/                              # Homepage
/campaigns                      # Browse all campaigns
/campaigns/[slug]              # Campaign hub (public)
/campaigns/[slug]/characters    # Character listing
/campaigns/[slug]/characters/[id]   # Character detail
/overlay/[slug]                # Stream overlay (embeddable)

/admin                         # Admin dashboard (protected)
/admin/login                   # Login page
/admin/campaigns               # List your campaigns
/admin/campaigns/[id]          # Campaign dashboard
/admin/campaigns/[id]/characters    # Character management
/admin/campaigns/[id]/layout-editor # Drag-drop badge editor
/admin/campaigns/[id]/settings      # Campaign settings
```

### Components Architecture

```
components/
├── CharacterCard.tsx           # Reusable card component
├── DragDropEditor.tsx          # Badge positioning tool
├── ImageUpload.tsx             # File upload component
├── CampaignNav.tsx             # Navigation
├── Admin/
│   ├── CharacterForm.tsx       # Add/edit character
│   ├── LayoutEditor.tsx        # Drag-and-drop
│   └── ImageUploadModal.tsx    # Image management
└── Public/
    ├── CampaignHero.tsx        # Campaign showcase
    ├── CharacterGrid.tsx       # Character listing
    └── EpisodeTimeline.tsx     # Episode display
```

### State Management

**Using React Context API + Custom Hooks:**

```javascript
// Contexts
- CampaignContext      // Current campaign
- AuthContext          // Admin token
- CharacterContext     // Characters in campaign
- RosterContext        // Active roster

// Custom Hooks
- useCampaign()        // Get campaign data
- useCharacters()      // Get characters with auto-fetch
- useAuth()            // Check authentication
- useImageUpload()     // Handle image uploads
```

---

## 🔄 Real-Time Updates (WebSocket)

### Connection Flow

```
1. Frontend connects to /campaigns/{id}/ws
2. Backend sends BOOTSTRAP event:
   {
     "type": "BOOTSTRAP",
     "characters": [...],
     "roster": [...],
     "layoutOverrides": {...}
   }

3. Frontend listens for events:
   - CHAR_UPDATED: Character changed
   - CHAR_CREATED: New character
   - CHAR_DELETED: Character removed
   - ROSTER_UPDATED: Active roster changed
   - EVENT: HP change, condition, etc.
   - HP_CHANGE: Direct HP update

4. Frontend updates UI in real-time
```

### Example WebSocket Message

```json
{
  "type": "EVENT",
  "data": {
    "type": "HP_CHANGE",
    "characterId": "char-123",
    "from": 45,
    "to": 35,
    "timestamp": "2025-11-20T03:00:00Z"
  }
}
```

---

## 📁 Image Storage (Cloudflare R2)

### R2 Bucket Structure

```
critical-role-companion-images/
├── {campaign-slug}/
│   ├── portraits/
│   │   ├── {char-id}_original.png
│   │   ├── {char-id}_thumb.png (auto-generated)
│   │   └── {char-id}.webp (optimized)
│   └── backgrounds/
│       ├── {char-id}_original.png
│       ├── {char-id}_optimized.png
│       └── {char-id}.webp
```

### Upload Flow

```
1. User selects image in admin
2. Frontend sends to: POST /campaigns/{id}/characters/{char_id}/portrait
3. Backend:
   - Validates (type, size, dimensions)
   - Uploads to R2
   - Generates thumbnail (optional)
   - Returns public URL
4. Frontend displays image immediately
5. URL stored in database
6. Served via Cloudflare CDN
```

### URL Format

```
https://cdn.crc.example.com/campaign-slug/portraits/char-id.webp
```

---

## 🚀 Deployment Architecture

### Development (localhost)

```
Frontend:   http://localhost:3000
Backend:    http://localhost:8000
Database:   Neon (cloud)
Storage:    Cloudflare R2 (cloud)
```

### Production (Fly.io)

```
Frontend:   Deployed on Fly.io (Node.js)
Backend:    Deployed on Fly.io (Python/Uvicorn)
Database:   Neon (PostgreSQL)
Storage:    Cloudflare R2
DNS:        Cloudflare
CDN:        Cloudflare
```

### Environment Variables

**Backend (.env):**
```
ENV=production
DATABASE_URL=postgresql://...
NEON_API_KEY=...
FRONTEND_BASE_URL=https://example.com
BACKEND_BASE_URL=https://api.example.com
ADMIN_TOKEN=...
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
CORS_ORIGINS=https://example.com
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_CAMPAIGN_SLUG=critical-role-c4
```

---

## 🔐 Security Considerations

### Data Isolation

- Each query filters by campaign_id
- No cross-campaign data access
- Token tied to campaign (not global)

### Authentication

- Token in X-Token header
- Validate before each request
- Token scoped to campaign

### Image Security

- Validate file types (jpg, png, webp only)
- Limit file size (5MB max)
- Scan for malware (optional)
- Store in private R2 bucket (public URLs via CDN)

### CORS

- Frontend and backend on same Fly.io instance
- Or explicit CORS whitelist in production
- No wildcard CORS in production

---

## 📈 Scalability

### Current Architecture Supports

- ✓ 1,000+ campaigns
- ✓ 100+ characters per campaign
- ✓ 10,000+ concurrent WebSocket connections
- ✓ 100GB+ images in R2

### Bottlenecks to Monitor

1. **Database:** Connection pooling via Neon
2. **WebSocket:** Broadcasting to all connected clients
3. **File uploads:** R2 rate limits (generous)
4. **API calls:** Rate limiting (implement later)

### Future Optimizations

- Redis for caching
- CDN image compression
- Database query optimization
- WebSocket message batching

---

## 🔄 Data Flow Examples

### Example 1: Update Character HP

```
1. Admin updates HP in dashboard
2. Frontend: PATCH /campaigns/{id}/characters/{char_id}
   {stats: {hp: {current: 35}}}
3. Backend:
   - Validates campaign_id matches token
   - Updates database
   - Broadcasts to all WebSocket clients
4. All connected clients receive update
5. Overlay updates in real-time
6. Campaign hub page refreshes
```

### Example 2: Upload Character Portrait

```
1. Admin selects image file
2. Frontend: POST /campaigns/{id}/characters/{char_id}/portrait
   Body: multipart/form-data with file
3. Backend:
   - Validates file
   - Uploads to R2
   - Returns public URL
4. Frontend stores URL in database
5. All clients see new portrait immediately
```

### Example 3: View Campaign Hub (Public)

```
1. Viewer goes to /campaigns/critical-role-c4
2. Frontend fetches: GET /campaigns/critical-role-c4/characters
3. Backend queries database (no auth needed)
4. Returns public character data
5. Frontend renders campaign hub
6. Images load from Cloudflare CDN
```

---

## 📚 Technology Details

### Backend Stack

- **Framework:** FastAPI (modern, fast, async)
- **ORM:** SQLAlchemy (database abstraction)
- **Database:** PostgreSQL via Neon
- **Migrations:** Alembic (schema versioning)
- **Validation:** Pydantic (data validation)
- **Server:** Uvicorn (ASGI)
- **Storage:** Boto3 (AWS/S3-compatible)

### Frontend Stack

- **Framework:** Next.js 14 (React, SSR, optimizations)
- **Language:** TypeScript (type safety)
- **Styling:** TailwindCSS (utility CSS)
- **UI Library:** shadcn/ui (Headless, customizable)
- **Forms:** React Hook Form + Zod (validation)
- **Drag & Drop:** dnd-kit (lightweight, flexible)
- **Data Fetching:** SWR (client-side, auto-revalidation)

### Infrastructure

- **Hosting:** Fly.io (simple, cost-effective)
- **Database:** Neon (PostgreSQL as a service)
- **Storage:** Cloudflare R2 (S3-compatible)
- **DNS/CDN:** Cloudflare (DDoS protection, caching)

---

## 🎯 Design Principles

1. **Simplicity:** Keep it simple, add complexity only when needed
2. **Multi-tenant:** Everything scoped by campaign
3. **User-friendly:** Easy for non-technical streamers
4. **Scalable:** Can grow from 1 campaign to 1000+
5. **Real-time:** WebSocket for instant updates
6. **Responsive:** Works on desktop, tablet, mobile

---

**This architecture ensures:**
- Clean separation of concerns
- Easy to understand for new developers
- Scalable without major refactoring
- Secure data isolation between campaigns
- Ready for future features

---

Last updated: 2025-11-20
