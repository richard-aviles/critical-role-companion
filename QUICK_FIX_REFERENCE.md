# Quick Reference: Empty Character Array Fix

## What Was Fixed

Event updates now correctly handle removing ALL characters from an event.

## Changes Made

### 1. Frontend - EventForm.tsx (Line 115-116)

**Before:**
```typescript
characters_involved: formData.characters_involved.length > 0 ? formData.characters_involved : undefined,
```

**After:**
```typescript
// Always send characters_involved array, even if empty (to allow clearing all characters)
characters_involved: formData.characters_involved,
```

### 2. Backend - models.py (Lines 220-228)

**Before:**
```python
characters_array = None
if self.characters_involved:
    try:
        characters_array = json.loads(self.characters_involved)
    except (json.JSONDecodeError, TypeError):
        characters_array = []
```

**After:**
```python
# Handle None, empty string, and JSON string (including "[]")
characters_array = []
if self.characters_involved is not None:
    try:
        characters_array = json.loads(self.characters_involved)
    except (json.JSONDecodeError, TypeError):
        characters_array = []
```

## Testing

Run: `python backend/test_empty_character_fix.py`

Or test manually:
1. Edit an event with multiple characters
2. Remove all characters
3. Click Update
4. Verify no characters are shown in timeline
5. Edit event again - verify no characters are selected

## The Pattern

**Always use this pattern for optional array fields:**

Frontend:
```typescript
field: array  // NOT: array.length > 0 ? array : undefined
```

Backend:
```python
if payload.field is not None:  # NOT: if payload.field:
    model.field = json.dumps(payload.field)
```

This allows the backend to distinguish between:
- Field not provided → Don't update it
- Field provided as `[]` → Clear it
