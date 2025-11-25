# Phase 3 Tier 2 - Testing Checklist
## Character Color Override UI Components

**Date:** 2025-11-22
**Status:** IN PROGRESS
**Backend:** http://localhost:8001 ✅ RUNNING
**Frontend:** http://localhost:3000 ✅ RUNNING

---

## Quick Start

1. Backend running on port 8001 with all databases connected
2. Frontend running on port 3000 with all components loaded
3. Both services have TypeScript 0 errors
4. Ready for comprehensive testing

---

## SECTION 1: Verification Tests (5-10 minutes)
### These ensure Phase 1 & 2 still work properly.

#### Navigation & Auth
- [ X] Open http://localhost:3000 in browser
- [ X] Homepage loads without errors
- [ X] Click "Admin" button or navigate to /admin
- [ X] Login page displays (email/password form)
- [ X] Can login with existing test account
- [ X] If no account, can signup and create new user
- [ X] Admin dashboard loads with campaign list

#### Campaign Management
- [ X] Campaign list displays (grid view)
- [ X] Can click on a campaign to view details
- [X ] Campaign detail page shows: name, description, admin token
- [X ] Can see "View Characters" button
- [ X] Can see "View Episodes" button
- [ X] Back to campaigns link works

#### Character Management
- [ X] Click "View Characters" from campaign detail
- [X ] Character list displays (or empty if no characters)
- [ X] Can see "Add Character" button
- [X ] Character cards show: name, image, class, race (if set)
- [ X] Can click character to view/edit detail

#### Episode Management
- [X ] Click "View Episodes" from campaign detail
- [X ] Episode list displays (or empty if no episodes)
- [X ] Can see "Add Episode" button
- [ X] Episode cards show: title, season/episode number, air date
- [X ] Can click episode to view/edit detail

**Section 1 Status:**
- [X ] COMPLETE - All Phase 1 & 2 features working

---

## SECTION 2: Color Override UI Tests (20-30 minutes)
### These verify the Phase 3 Tier 2 color components are working.

### 2.1: Create Character with Color Override

- [ X] Click "Add Character" button
- [X ] Fill in basic character info:
  - [X ] Name: "Test Character" (or any name)
  - [X ] Class: Select a class (Wizard, Rogue, etc.)
  - [X ] Race: Select a race
  - [ X] Player Name: "Test Player"
- [X ] Scroll down and find checkbox: **"Use custom color theme for this character"**
  - [X ] Checkbox is VISIBLE and clickable
  - [X ] When UNCHECKED: Color form section hidden
  - [X ] When CHECKED: Color form section appears

**Status:**
- [ X] COMPLETE - Color override checkbox visible and functional

### 2.2: Test Color Preset Selector

When color override checkbox is checked:

- [X ] **Preset Selector displays with 3 preset cards:**
  - [ X] **Preset 1: "Gold & Warmth"** - Shows warm gold/orange colors
  - [ X] **Preset 2: "Twilight & Mystique"** - Shows purple/blue colors
  - [ X] **Preset 3: "Emerald & Silver"** - Shows green/silver colors

- [ X] **Select each preset and verify:**
  - [X ] Click Gold & Warmth - checkmark appears, colors update
  - [X ] Click Twilight & Mystique - checkmark appears, colors update
  - [X ] Click Emerald & Silver - checkmark appears, colors update
  - [X ] Each preset shows 4-5 color swatches preview
  - [ ] Responsive layout: mobile (1 col), tablet (2 col), desktop (3 col)

**Status:**
- [X ] COMPLETE - All 3 presets displaying correctly

### 2.3: Test Color Picker Modal

- [X ] Below presets, find color editor sections:
  - [ X] "Text Color" section
  - [X ] "Border Colors" section (4 colors)
  - [X ] "Badge Interior Colors" section
  - [X ] "HP Badge" section
  - [X ] "AC Badge" section

- [X ] **Click any "Edit" button next to a color:**
  - [X ] Modal dialog opens with title "Select Color"
  - [ X] HTML5 color picker displays (color square)
  - [ X] Hex input field shows current color (e.g., #FFD700)
  - [ X] 12 quick-select color swatches visible
  - [ X] "Confirm" and "Cancel" buttons present

- [ X] **Test color picker functionality:**
  - [ X] Click on color picker square to change color
  - [X ] Hex input updates when you pick from square
  - [X ] Click one of the 12 swatches (Red, Green, Blue, Yellow, etc.)
  - [X ] Swatch color updates in real-time
  - [X ] Type new hex value in input (e.g., #FF0000)
  - [X ] Color picker updates to match hex value
  - [X ] Click "Confirm" button
  - [X ] Modal closes and color is updated in form
  - [X ] Click "Cancel" button
  - [X ] Modal closes without saving changes

**Status:**
- [ X] COMPLETE - Color picker modal working correctly

### 2.4: Test Color Data Persistence

- [ X] Fill in all color fields (use preset first, then customize some)
- [ X] Scroll to bottom and click **"Save Character"** button
- [X ] Wait for response (should complete)
- [ X] Character should be created/updated
- [ X] **Navigate back to character detail page**
  - [X ] Character loads with color override checkbox CHECKED
  - [ X] All color values are preserved exactly as saved
  - [ X] Preset selection is remembered (if you used a preset)
  - [ X] Custom colors persist across page reload

**Status:**
- [ X] COMPLETE - Colors persist correctly in database

### 2.5: Test Color Clear/Remove

- [ ] Edit a character with color override
- [ ] Uncheck the "Use custom color theme" checkbox
- [ ] Color form section hides
- [ ] Save character
- [ ] Navigate away and back to character
- [ ] Checkbox is now UNCHECKED
- [ ] Color form hidden
- [ ] Verify colors were cleared from database

**Status:**
- [ ] COMPLETE - Color clearing works correctly

---

## SECTION 3: Form Validation & Error Handling (10-15 minutes)

### 3.1: Hex Color Validation

- [ ] In color picker modal, try invalid hex values:
  - [ ] Type "GGGGGG" (invalid letters) - should show error or reject
  - [ ] Type "FF00" (too short) - should show error
  - [ ] Type "#FF00GG" (mixed valid/invalid) - should show error
  - [ ] Type "#FF0000" (valid) - should accept
  - [ ] Delete # symbol - try "FF0000" - should reject (requires #)

**Status:**
- [ ] COMPLETE - Hex validation working

### 3.2: Required Fields

- [ ] Try creating character WITHOUT:
  - [ ] Name - should show error "Name is required"
  - [ ] Class - should show error "Class is required"
  - [ ] Try with color override but missing color selections - should error

**Status:**
- [ ] COMPLETE - Required field validation working

### 3.3: Network Error Handling

- [ ] Create character with color override
- [ ] If backend goes down, try to save:
  - [ ] Should show error message: "Failed to create character"
  - [ ] Character form should remain filled out (no data loss)
  - [ ] Can retry after backend comes back online

**Status:**
- [ ] COMPLETE - Error handling working correctly

---

## SECTION 4: UI Styling & Visual Tests (15-20 minutes)

### 4.1: Character Card Colors

- [ ] Create 2-3 characters, each with different color presets
- [ ] View character list page
- [ ] **Verify color styling on character cards:**
  - [ ] Border colors from override display correctly
  - [ ] Text color applied to character name
  - [ ] Overall card styling is visually appealing
  - [ ] No overlapping text or layout issues

**Status:**
- [ ] COMPLETE - Character card styling working

### 4.2: Form Layout & Spacing

When color override is enabled:
- [ ] Color form section has light gray background
- [ ] Proper padding/margins around form
- [ ] Section title "Custom Colors" is clear
- [ ] Color editors are well-organized
- [ ] No form fields are cut off or hidden
- [ ] Buttons align properly

**Status:**
- [ ] COMPLETE - Form layout correct

### 4.3: Modal Styling

- [ ] Color picker modal appears centered
- [ ] Modal has proper backdrop/overlay
- [ ] Modal is clickable (can interact with controls)
- [ ] Close modal with Cancel or Confirm
- [ ] No visual glitches or layout issues

**Status:**
- [ ] COMPLETE - Modal styling correct

### 4.4: Responsive Design

- [ ] **Test on Desktop (1920x1080):**
  - [ ] All 3 presets visible in one row
  - [ ] All controls readable and clickable

- [ ] **Test on Tablet (768x1024):**
  - [ ] Presets show in 2 columns
  - [ ] Form fields stack properly
  - [ ] Modal still centered and usable

- [ ] **Test on Mobile (375x667):**
  - [ ] Presets show in 1 column
  - [ ] Form fields readable and tappable
  - [ ] Modal doesn't exceed screen height
  - [ ] Scroll works properly
  - [ ] No horizontal overflow

**Status:**
- [ ] COMPLETE - Responsive design working on all devices

---

## SECTION 5: API Integration Tests (10-15 minutes)

### 5.1: Character Creation with Colors

- [ ] Create character with color override
- [ ] In browser DevTools (Network tab), verify:
  - [ ] POST request to `/campaigns/{id}/characters` includes `color_theme_override` in body
  - [ ] Response includes the color_theme_override field
  - [ ] Status code is 200/201 (success)

**Status:**
- [ ] COMPLETE - Character creation API working

### 5.2: Character Update

- [ ] Edit character with different colors
- [ ] In DevTools, verify:
  - [ ] PATCH request to `/campaigns/{id}/characters/{characterId}`
  - [ ] Request body includes updated `color_theme_override`
  - [ ] Response includes updated colors

**Status:**
- [ ] COMPLETE - Character update API working

### 5.3: Resolved Colors Endpoint (Optional)

- [ ] Backend has `/campaigns/{id}/characters/{characterId}/resolved-colors` endpoint
- [ ] When called, should return colors with source indicator
- [ ] Can test via curl or API tool:
  ```
  GET http://localhost:8001/campaigns/[campaignId]/characters/[characterId]/resolved-colors
  Authorization: Bearer [token]
  ```

**Status:**
- [ ] COMPLETE - Resolved colors endpoint working

---

## SECTION 6: TypeScript & Build Check (5 minutes)

- [ ] Frontend TypeScript compilation:
  - [ ] Run `npm run build` or check console for errors
  - [ ] Should have **0 TypeScript errors**
  - [ ] All imports resolve correctly

**Status:**
- [ ] COMPLETE - TypeScript 0 errors

---

## SECTION 7: Cross-Browser Testing (Optional)

If you want to be thorough:
- [ ] **Chrome/Edge:** Test all color functionality
- [ ] **Firefox:** Test color picker (different rendering)
- [ ] **Safari:** Test responsive layout (if on Mac)

**Status:**
- [ ] COMPLETE - Cross-browser testing done

---

## Issue Reporting Template

When you encounter an issue, please provide:

1. **What you were testing:**
   ```
   (e.g., "Creating character with Gold & Warmth preset")
   ```

2. **What you expected:**
   ```
   (e.g., "Gold colors should display in form")
   ```

3. **What happened instead:**
   ```
   (e.g., "Color form showed purple colors instead")
   ```

4. **Browser & device:**
   ```
   (e.g., "Chrome on Windows, Desktop")
   ```

5. **Steps to reproduce:**
   ```
   1. Click Add Character
   2. Check color override
   3. Select Gold preset
   (etc.)
   ```

6. **Error messages:**
   ```
   (If any console errors, include them)
   ```

---

## Issues Found During Testing

### Issue #1: [Title]
- **Status:** NOT YET FOUND
- **Severity:** -
- **Section:** -
- **Details:** -
- **Steps to Reproduce:** -
- **Expected:** -
- **Actual:** -
- **Resolution:** -

---

## Testing Summary

### Overall Status
- **Phase 1 & 2 Verification:** [ ] COMPLETE
- **Color Override UI:** [ ] COMPLETE
- **Form Validation:** [ ] COMPLETE
- **UI Styling:** [ ] COMPLETE
- **API Integration:** [ ] COMPLETE
- **TypeScript Check:** [ ] COMPLETE
- **Cross-Browser:** [ ] COMPLETE (if done)

### Issues Found: 0
### Issues Resolved: 0

### Overall Result: [ ] PASS / [ ] FAIL

---

## Testing Notes

Use this section to add notes as you test:

```
Notes:
- [Add observations here]
- [Add performance notes]
- [Add UI/UX feedback]
```

---

## Quick Reference Commands

**Backend Status:**
```bash
# Check if backend is running
curl http://localhost:8001/health
```

**Frontend Status:**
```bash
# Frontend running on port 3000
# Check DevTools Console for errors
# Press F12 and look for red errors
```

**Stop Servers:**
```bash
# Kill backend: Ctrl+C in backend terminal
# Kill frontend: Ctrl+C in frontend terminal
```

**Restart Servers:**
```bash
# Start backend
cd backend
python -m uvicorn main:app --reload --port 8001

# Start frontend (in separate terminal)
cd frontend
npm run dev
```

---

## Files Under Test

- `frontend/src/components/ColorPickerModal.tsx` - Color picker modal
- `frontend/src/components/ColorPresetSelector.tsx` - Preset selector grid
- `frontend/src/components/CharacterColorOverrideForm.tsx` - Main color form
- `frontend/src/components/CharacterForm.tsx` - Enhanced with color support
- `frontend/src/lib/api.ts` - API client with color functions
- `backend/models.py` - Character model with color_theme_override
- `backend/main.py` - Color override endpoints

---

## Test Execution Log

**Start Time:** 2025-11-22
**Tester:** [Your Name]

### Session Notes:
```
[Add session notes here as you test]
```

---

**Last Updated:** 2025-11-22
**Version:** 1.0
**Status:** READY FOR TESTING
