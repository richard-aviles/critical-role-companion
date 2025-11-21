# Phase 0.3 Implementation Guide

## Overview

I've generated all the refactored backend code for Phase 0.3. This document walks you through the setup process step-by-step.

**What you're installing:**
- SQLAlchemy ORM models (Campaign, Character, Episode, Event, Roster, LayoutOverrides)
- Multi-tenant FastAPI endpoints
- Alembic database migrations
- R2/S3 image upload functionality
- Real-time WebSocket updates

---

## Files Generated

### New Files Created:
1. `models.py` - SQLAlchemy ORM models (all database tables)
2. `database.py` - Database session management
3. `s3_client.py` - R2 image upload client
4. `alembic.ini` - Alembic configuration
5. `alembic/env.py` - Alembic environment setup
6. `alembic/script.py.mako` - Migration file template
7. `alembic/versions/001_initial_schema.py` - Initial database migration

### Files Updated:
1. `main.py` - Complete refactor with multi-tenant endpoints
2. `settings.py` - Added R2 and authentication settings
3. `requirements.txt` - Added SQLAlchemy, Alembic dependencies

---

## Step-by-Step Implementation

### STEP 1: Install Dependencies (5 minutes)

Run this command in the `backend/` folder:

```bash
cd C:\Development\Twitch_CriticalRole_Project\CR_Companion_PreReq_Layout\critical-role-companion\backend
pip install -r requirements.txt
```

**Expected output:** Should finish without errors. You'll see packages being installed (SQLAlchemy, Alembic, etc.)

**Time:** 2-5 minutes depending on internet speed

---

### STEP 2: Run Database Migrations (5 minutes)

This creates all the tables in your Neon database based on the models.

```bash
alembic upgrade head
```

**Expected output:**
```
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade  -> 001, Initial schema creation
```

**If you see this:** ✅ Great! Migrations succeeded

**If you see an error:** Read the troubleshooting section at the end of this document

**Time:** 1-2 minutes

---

### STEP 3: Verify Database Schema (5 minutes)

Let's verify that all tables were created correctly. You can check your Neon dashboard or run this Python command:

```bash
python
```

Then in the Python REPL:

```python
from database import SessionLocal
from models import Campaign, Character, Episode, Event, Roster, LayoutOverrides

db = SessionLocal()
print("Tables created successfully!")
print(f"Campaigns table exists: {Campaign.__tablename__}")
print(f"Characters table exists: {Character.__tablename__}")
print(f"Episodes table exists: {Episode.__tablename__}")
print(f"Events table exists: {Event.__tablename__}")
print(f"Rosters table exists: {Roster.__tablename__}")
print(f"LayoutOverrides table exists: {LayoutOverrides.__tablename__}")
db.close()
exit()
```

**Expected output:**
```
Tables created successfully!
Campaigns table exists: campaigns
Characters table exists: characters
Episodes table exists: episodes
Events table exists: events
Rosters table exists: rosters
LayoutOverrides table exists: layout_overrides
```

**Time:** 3-5 minutes

---

### STEP 4: Start the Backend Server (5 minutes)

Now let's test the refactored backend!

```bash
cd C:\Development\Twitch_CriticalRole_Project\CR_Companion_PreReq_Layout\critical-role-companion\backend
uvicorn main:app --reload --port 8000
```

**Expected output:**
```
[OK] Database initialized (tables ensured)
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

**If you see this:** ✅ Backend is running!

**What to do:**
- Keep this terminal open
- Open a new terminal for the next steps
- Don't close this unless there are errors

**Time:** 1-2 minutes

---

### STEP 5: Test the API (10 minutes)

With the backend running, let's test some endpoints. Open a new terminal and run these commands:

#### Test 5A: Health Check
```bash
curl http://localhost:8000/healthz
```

**Expected output:**
```json
{"ok":true,"version":"dev"}
```

#### Test 5B: Get API Version
```bash
curl http://localhost:8000/version
```

**Expected output:**
```json
{"version":"dev","env":"development","timestamp":"2025-11-20T..."}
```

#### Test 5C: List Campaigns (Should be empty initially)
```bash
curl http://localhost:8000/campaigns
```

**Expected output:**
```json
[]
```

#### Test 5D: Create a Campaign (Admin operation)

**Important:** First, check your `.env` file - what is your `ADMIN_TOKEN` value?

```bash
# Replace YOUR_ADMIN_TOKEN with the actual value from .env
curl -X POST http://localhost:8000/campaigns \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: YOUR_ADMIN_TOKEN" \
  -d '{
    "slug": "critical-role-c4",
    "name": "Critical Role Campaign 4",
    "description": "The adventure continues in Marquet"
  }'
```

**Expected output:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "slug": "critical-role-c4",
  "name": "Critical Role Campaign 4",
  "description": "The adventure continues in Marquet",
  "admin_token": "admin_abc123...",
  "created_at": "2025-11-20T...",
  "updated_at": "2025-11-20T...",
  "message": "Save this token securely - you'll need it for admin operations"
}
```

**SAVE THIS OUTPUT!** You'll need the `admin_token` for future admin operations.

#### Test 5E: List Campaigns Again
```bash
curl http://localhost:8000/campaigns
```

**Expected output:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "slug": "critical-role-c4",
    "name": "Critical Role Campaign 4",
    "description": "The adventure continues in Marquet",
    "created_at": "2025-11-20T...",
    "updated_at": "2025-11-20T..."
  }
]
```

**Time:** 5-10 minutes

---

## Architecture Overview

### Database Schema

```
campaigns
├── id (UUID primary key)
├── slug (unique, URL-friendly name)
├── name
├── admin_token (for authentication)
└── [references to other tables]
    ├── characters (many)
    ├── episodes (many)
    ├── events (many)
    ├── roster (one)
    └── layout_overrides (many)

characters
├── id (UUID)
├── campaign_id (FK to campaigns)
├── name, player_name, class, race
├── stats (JSON: hp, ac, abilities)
├── portrait_url (R2)
└── background_url (R2)

episodes
├── id (UUID)
├── campaign_id (FK)
├── episode_number, title, date
└── summary

events
├── id (UUID)
├── campaign_id (FK)
├── character_id (FK, optional)
├── event_type (hp_change, condition, custom)
└── data (JSON, event-specific)

rosters
├── campaign_id (PK)
└── character_ids (UUID array: active characters)

layout_overrides
├── id (UUID)
├── campaign_id (FK)
├── tier (large, medium, compact)
├── badges (JSON: position data)
└── chips (JSON: status positions)
```

### API Endpoints

**Public (No Auth):**
- `GET /campaigns` - List all campaigns
- `GET /campaigns/{id}` - Get campaign details
- `GET /campaigns/{id}/characters` - List characters
- `GET /campaigns/{id}/characters/{id}` - Get character
- `GET /campaigns/{id}/events` - List events
- `GET /campaigns/{id}/roster` - Get active roster
- `WS /campaigns/{id}/ws` - WebSocket real-time updates

**Admin (Requires X-Token Header):**
- `POST /campaigns` - Create campaign (requires X-Admin-Token header)
- `PATCH /campaigns/{id}` - Update campaign
- `POST /campaigns/{id}/characters` - Create character
- `PATCH /campaigns/{id}/characters/{id}` - Update character
- `DELETE /campaigns/{id}/characters/{id}` - Delete character
- `POST /campaigns/{id}/characters/{id}/portrait` - Upload portrait
- `POST /campaigns/{id}/characters/{id}/background` - Upload background
- `POST /campaigns/{id}/events` - Create event
- `PATCH /campaigns/{id}/roster` - Update roster
- `PATCH /campaigns/{id}/layout/{tier}` - Update layout

---

## Troubleshooting

### Issue: `ModuleNotFoundError: No module named 'models'`

**Solution:**
1. Make sure you're in the `backend/` folder
2. Make sure you've run `pip install -r requirements.txt`
3. Restart your Python interpreter

### Issue: `alembic: command not found`

**Solution:**
1. Make sure you've installed alembic: `pip install alembic==1.13.0`
2. You might need to use: `python -m alembic upgrade head`

### Issue: Database connection error during migration

**Solution:**
1. Check that Neon is online (https://console.neon.tech/)
2. Check that `.env` file has correct `DATABASE_URL`
3. Check your internet connection
4. Try running `python test_db.py` to verify connection

### Issue: `psycopg` or `SQLAlchemy` errors

**Solution:**
1. Make sure you've run `pip install -r requirements.txt`
2. Try: `pip install --upgrade psycopg SQLAlchemy`
3. Restart terminal and try again

### Issue: Port 8000 already in use

**Solution:**
1. Kill the existing process: `lsof -i :8000` (Mac/Linux) or `netstat -ano | findstr :8000` (Windows)
2. Or use a different port: `uvicorn main:app --reload --port 8001`

---

## What's Next?

Once all tests pass and the backend is running successfully:

1. ✅ Dependencies installed
2. ✅ Database migrations run
3. ✅ Backend server starts
4. ✅ Basic endpoints tested

### Next Phase (0.4): Frontend Setup

When you're ready, we'll build the **Next.js frontend** that connects to this backend.

Just let me know:
> "Phase 0.3 is complete and tested. Ready for Phase 0.4!"

---

## Quick Reference Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start backend
uvicorn main:app --reload --port 8000

# Test health
curl http://localhost:8000/healthz

# Create campaign
curl -X POST http://localhost:8000/campaigns \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: YOUR_ADMIN_TOKEN" \
  -d '{"slug": "test-campaign", "name": "Test Campaign"}'

# List campaigns
curl http://localhost:8000/campaigns

# Python REPL check
python
>>> from models import Campaign
>>> from database import SessionLocal
>>> db = SessionLocal()
>>> print(db.query(Campaign).count())
>>> db.close()
>>> exit()
```

---

## Documentation

For detailed technical info, see:
- `ARCHITECTURE.md` - System design
- `models.py` - Database schema
- `main.py` - API endpoints
- `TROUBLESHOOTING.md` - Common issues

---

Good luck! Let me know how it goes! 🚀
