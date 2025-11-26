# Tomorrow's Startup - Session 2 (November 27, 2025)

**Last Updated:** November 26, 2025, Evening
**Session Goal:** Fix persistent 500 error on character layout save/load

---

## Problem: Character Layout Save Returns 500 Error

### Error Details
- **Endpoint:** POST `/campaigns/{campaignId}/character-layouts`
- **Error Message:** "No data found for resource with given identifier"
- **Status Code:** 500
- **When It Happens:** Clicking "Save Layout" on card layout editor
- **Still Occurring:** Even after schema fix and backend restart

### Root Cause: Unknown
The error persists even after fixing Pydantic schema validation errors. The issue is likely deeper in the database layer or data flow, not just validation.

---

## What Was Done Yesterday

### 1. Identified and Fixed Schema Issue
**File:** `backend/schemas.py` (lines 274-281)
- Changed 4 fields from required to optional in `CharacterLayoutCreateRequest`:
  - `border_colors: Optional[List[str]] = None`
  - `badge_interior_gradient: Optional[Dict[str, Any]] = None`
  - `hp_color: Optional[Dict[str, Any]] = None`
  - `ac_color: Optional[Dict[str, Any]] = None`
- **Fix committed to git** ✓

### 2. Backend Restart Performed
- Killed old processes on port 8001 (PIDs 37988, 90668)
- Started fresh backend on port 8002 with clean Python environment
- Backend confirmed working on port 8002
- **Result:** Error still persists - fix was not the root cause

### 3. Changes Made
- `backend/schemas.py`: Optional color fields
- `frontend/src/lib/api.ts`: Temporarily used port 8002 for testing, reverted to 8001

---

## Tomorrow: Fresh Start Checklist

### Step 1: Clean System (5 min)
```bash
# Kill all processes
taskkill /F /IM python.exe
taskkill /F /IM node.exe

# Verify ports are free
netstat -ano | findstr :8001
netstat -ano | findstr :3000
```

### Step 2: Start Backend (10 min)
```bash
cd "C:\Development\Twitch_CriticalRole_Project\CR_Companion_PreReq_Layout\critical-role-companion\backend"
python -m uvicorn main:app --reload --port 8001 --timeout-keep-alive 600
```

**Watch for:**
- "Application startup complete" message
- No errors during startup

### Step 3: Start Frontend (5 min)
```bash
cd "C:\Development\Twitch_CriticalRole_Project\CR_Companion_PreReq_Layout\critical-role-companion\frontend"
npm run dev
```

---

## Investigation Strategy

### Priority 1: Check Database
1. Is the campaign in the database?
2. Are the character layout tables created?
3. Can you manually INSERT a layout via SQL?

### Priority 2: Check Backend Logs
1. Add `print()` statements to `create_character_layout` endpoint
2. Log the request payload
3. Log the database operation
4. Watch terminal output when saving a layout

### Priority 3: Test Endpoints
1. **Test GET** `/campaigns/{id}/character-layouts` - Do saved layouts load?
2. **Test POST** with minimal data (just name, is_default, card_type)
3. **Test UPDATE** to see if that endpoint works better
4. Check if similar endpoints work (episodes, characters)

### Priority 4: Check Token/Authorization
1. Verify X-Token header is being sent correctly
2. Check if campaign token validation is causing the issue
3. Test with different campaign/character combinations

---

## Key Files to Investigate

| File | Why | Lines |
|------|-----|-------|
| `backend/main.py` | Create layout endpoint | 1433-1487 |
| `backend/schemas.py` | Request/response schemas | 274-281 (already fixed) |
| `frontend/src/lib/api.ts` | API client & error handling | All |
| `backend/database.py` | Database queries | TBD |
| Database logs | Transaction errors | TBD |

---

## What We Know Works
✅ Backend starts and responds to requests
✅ Frontend can communicate with backend
✅ Other endpoints work (campaigns, characters)
✅ Schema validation fix was applied and committed

---

## What's NOT Working
❌ Character layout save returns 500 error
❌ Error message doesn't indicate validation issue
❌ Fresh backend restart didn't fix it
❌ Error is persistent across multiple attempts

---

## Success Criteria for Tomorrow

**Session succeeds if we:**
1. Identify the actual root cause (not just schema)
2. Either fix it or create an isolated test case
3. Document findings in TROUBLESHOOTING.md

---

## Testing Order

1. **First:** Check if database/campaign exists
2. **Second:** Add logging to endpoint and watch output
3. **Third:** Test with curl/Postman before browser
4. **Fourth:** Check token authorization
5. **Fifth:** Compare with working endpoints (episodes, characters)

---

## Notes

- The schema fix was correct but isn't the root cause
- The error may be in database connectivity or constraints
- A fresh overnight restart may have helped clear corrupted state
- Log output will be more helpful than browser DevTools
- Consider checking database transactions and deadlocks
