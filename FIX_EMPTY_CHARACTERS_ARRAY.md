# Fix: Event Character Removal - Empty Array Handling

## Issue Summary

When editing an event on the episodes/{episode_slug} page:
- Removing some characters (but leaving at least one) worked correctly
- Removing ALL characters failed - the characters remained associated with the event
- The UI showed the character as removed, but clicking "Update" didn't actually save the removal
- The event timeline still showed "1 character involved" after attempted removal

## Root Cause

The issue was in the **frontend** EventForm component (`frontend/src/components/EventForm.tsx` line 115):

```typescript
// BEFORE (BROKEN):
characters_involved: formData.characters_involved.length > 0 ? formData.characters_involved : undefined,
```

When all characters were removed, this code set `characters_involved` to `undefined`, which meant the field was **omitted entirely** from the API request payload.

The backend update logic (correctly implemented with `if payload.characters_involved is not None:`) would only update the field if it was present in the payload. Since `undefined` fields are omitted from JSON, the backend never received the empty array and didn't update the field.

## The Fix

### Frontend Change (PRIMARY FIX)

**File:** `frontend/src/components/EventForm.tsx`
**Line:** 115-116

```typescript
// AFTER (FIXED):
// Always send characters_involved array, even if empty (to allow clearing all characters)
characters_involved: formData.characters_involved,
```

**Why this works:**
- Now when all characters are removed, the frontend sends `characters_involved: []` (empty array)
- The backend receives the empty array in the payload
- `if payload.characters_involved is not None:` evaluates to True (because `[]` is not None)
- `json.dumps([])` serializes to `"[]"` and saves to database
- When retrieved, `json.loads("[]")` returns an empty array `[]`

### Backend Improvement (DEFENSIVE)

**File:** `backend/models.py`
**Lines:** 220-228

```python
# BEFORE:
characters_array = None
if self.characters_involved:
    try:
        characters_array = json.loads(self.characters_involved)
    except (json.JSONDecodeError, TypeError):
        characters_array = []

# AFTER:
# Handle None, empty string, and JSON string (including "[]")
characters_array = []
if self.characters_involved is not None:
    try:
        characters_array = json.loads(self.characters_involved)
    except (json.JSONDecodeError, TypeError):
        characters_array = []
```

**Why this improves things:**
- Changed default from `None` to `[]` for consistency
- Changed condition from `if self.characters_involved:` to `if self.characters_involved is not None:`
- This ensures that an empty JSON array `"[]"` is properly parsed (it was working before, but now more explicit)
- Provides better fallback behavior for edge cases

## Backend Already Correct

The backend event update endpoint (`backend/main.py` lines 1287-1289) was already correctly implemented:

```python
if payload.characters_involved is not None:
    # Handle empty arrays - always serialize to JSON, even if empty list
    event.characters_involved = json.dumps(payload.characters_involved)
```

This code:
- Uses `is not None` check (not truthiness check) ✓
- Always serializes with `json.dumps()` even for empty arrays ✓
- Has correct comment explaining the behavior ✓

The event creation endpoint (line 1213) was also already correctly implemented with the same pattern.

## Files Modified

1. **frontend/src/components/EventForm.tsx** (line 115-116)
   - Changed to always send `characters_involved` array, even when empty
   - This is the PRIMARY fix that resolves the issue

2. **backend/models.py** (lines 220-228)
   - Improved `Event.to_dict()` method for better edge case handling
   - Changed default from `None` to `[]`
   - Changed condition to use `is not None` check

## Testing

A comprehensive test script was created: `backend/test_empty_character_fix.py`

This test verifies:
1. Creating an event with characters
2. Removing some characters (partial removal)
3. Removing ALL characters (empty array) - **the critical test**
4. Verifying empty array persists correctly in database
5. Adding characters back

## Expected Behavior After Fix

1. **Creating event with no characters:** Works - stores empty array `[]`
2. **Editing event to remove some characters:** Works - updates array with remaining IDs
3. **Editing event to remove ALL characters:** **NOW WORKS** - stores empty array `[]`
4. **Database storage:** Empty arrays correctly stored as JSON string `"[]"`
5. **Event timeline display:** Shows "0 characters involved" or no character badge when array is empty
6. **Re-editing event:** When editing again, no characters are pre-selected (correct)

## Why This Pattern is Important

This fix demonstrates a common pitfall with empty arrays and optional fields:

**WRONG PATTERN (what we had):**
```typescript
field: array.length > 0 ? array : undefined
```
This omits the field when empty, preventing intentional "clear all" operations.

**CORRECT PATTERN (what we fixed to):**
```typescript
field: array  // Always include the array, even if empty
```
This allows the backend to distinguish between:
- Field not provided (don't update it)
- Field provided as empty array (clear it)

## Backend Pattern Review

The backend correctly uses this pattern throughout:

```python
# CORRECT - allows empty arrays
if payload.field is not None:
    model.field = json.dumps(payload.field)

# WRONG - would ignore empty arrays
if payload.field:  # Don't do this!
    model.field = json.dumps(payload.field)
```

The `is not None` check is crucial because:
- `[] is not None` → True (will update with empty array)
- `bool([])` → False (would skip empty array with truthiness check)

## Related Issues Fixed

This same pattern should be checked for other array fields in the codebase:
- ✓ Event characters_involved (fixed)
- Consider checking: Campaign settings, Roster character_ids, etc.

## Verification

After deploying this fix:
1. Navigate to an episode detail page
2. Create or edit an event with multiple characters selected
3. Edit the event and remove all characters
4. Click "Update"
5. Verify the event timeline shows no character badge or "0 characters"
6. Edit the event again - verify no characters are pre-selected
7. Success! The fix is working.
