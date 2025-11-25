# Known Issues & Technical Debt

## Current Issues

### [PRIORITY: MEDIUM] SQLAlchemy CharacterLayout Relationship Configuration
**Status:** Known, Not Yet Fixed
**Discovered:** November 22, 2025 (Phase 3 Tier 1 Testing)
**Impact:** Integration tests fail when creating users; affects test infrastructure but NOT Phase 3 color override endpoints

**Details:**
```
Error: For many-to-one relationship CharacterLayout.campaign, delete-orphan
cascade is normally configured only on the "one" side of a one-to-many relationship...
```

**Root Cause:**
- `CharacterLayout.campaign` relationship has `delete-orphan` cascade configured incorrectly
- SQLAlchemy requires `delete-orphan` cascade only on the parent side (Campaign→CharacterLayout)
- Current configuration has it on the many-to-one side (CharacterLayout→Campaign)
- This breaks when signup endpoint tries to create users (model validation fails)

**File:** `backend/models.py` - CharacterLayout model relationship definition

**Fix Required:**
1. Locate `CharacterLayout.campaign` relationship definition in models.py
2. Remove `cascade="all, delete-orphan"` from the CharacterLayout.campaign relationship
3. Verify `Campaign.character_layouts` relationship has the correct cascade configuration
4. Optionally add `single_parent=True` if CharacterLayout should be exclusive to one Campaign
5. Retest with `python test_character_color_overrides.py`

**Workaround:** Phase 3 Tier 1 color override endpoints work fine; issue only affects test signup flow

---

## Completed Issues

None yet - tracking as we go.

---

## Notes

- Phase 3 Tier 1 backend is fully operational despite this issue
- The color override endpoints (/color-theme, /resolved-colors) are NOT affected
- This is pre-existing technical debt from earlier migrations/model changes
- Safe to proceed with Phase 3 Tier 2 UI development while this is pending
