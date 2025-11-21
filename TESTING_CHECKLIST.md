# Phase 2 Testing Checklist

**Last Updated:** 2025-11-21
**Phase:** Phase 2 - Character & Episode Management
**Status:** Ready for Testing

---

## Overview

This document provides a comprehensive manual testing checklist for Phase 2 features. Use this checklist to verify all functionality works correctly across different browsers, screen sizes, and scenarios.

## Test Environment Setup

### Prerequisites
- [ ] Backend server running (`cd backend && uvicorn main:app --reload`)
- [ ] Frontend server running (`cd frontend && npm run dev`)
- [ ] Database accessible and migrated
- [ ] Test user account created
- [ ] Test campaign created

### Browser Testing Matrix
Test on at least 2 browsers from this list:
- [ ] Chrome/Edge (Chromium-based)
- [ ] Firefox
- [ ] Safari (macOS/iOS)

### Screen Size Testing
Test on at least 3 viewport sizes:
- [ ] Mobile (320px - 767px)
- [ ] Tablet (768px - 1023px)
- [ ] Desktop (1024px+)

---

## 1. Character Management Flow

### 1.1 Navigate to Characters
- [ ] Log in to admin dashboard
- [ ] Navigate to campaign detail page
- [ ] Click "Characters" tab or button
- [ ] Verify character list page loads
- [ ] Verify page shows "No characters" message if empty
- [ ] Verify "Add Character" button is visible

### 1.2 Create Character (No Image)
- [ ] Click "Add Character" button
- [ ] Verify form displays with all fields:
  - [ ] Name (required)
  - [ ] Class
  - [ ] Race
  - [ ] Player Name
  - [ ] Level (1-20)
  - [ ] Description (textarea)
  - [ ] Backstory (textarea)
  - [ ] Is Active (checkbox/toggle)
- [ ] Fill in only required fields (Name)
- [ ] Submit form
- [ ] Verify redirects to character detail page
- [ ] Verify character appears in list
- [ ] Verify slug generated correctly from name

### 1.3 Create Character (With Image)
- [ ] Click "Add Character" button
- [ ] Fill in character information
- [ ] Test image upload with JPG file (< 5MB)
  - [ ] Drag and drop image to upload area
  - [ ] Verify preview shows uploaded image
  - [ ] Submit form
  - [ ] Verify character created with image
- [ ] Test image upload with PNG file
  - [ ] Use file picker to select image
  - [ ] Verify preview shows
  - [ ] Submit and verify
- [ ] Test image upload with WEBP file
  - [ ] Upload and verify

### 1.4 Character List Display
- [ ] Verify character cards display in grid layout
- [ ] Verify each card shows:
  - [ ] Character image (if uploaded)
  - [ ] Character name
  - [ ] Class and race
  - [ ] Level
  - [ ] Player name (if set)
  - [ ] Active/Inactive indicator
- [ ] Verify grid layout responsive:
  - [ ] Mobile: 1 column
  - [ ] Tablet: 2 columns
  - [ ] Desktop: 3-4 columns
- [ ] Verify cards are clickable
- [ ] Click on a card, verify navigates to detail page

### 1.5 Character Detail Page
- [ ] Navigate to character detail page
- [ ] Verify all fields display correctly:
  - [ ] Character image (large display)
  - [ ] Name
  - [ ] Class and race
  - [ ] Player name
  - [ ] Level
  - [ ] Description (full text)
  - [ ] Backstory (full text)
  - [ ] Active status
- [ ] Verify "Edit" button present
- [ ] Verify "Delete" button present
- [ ] Verify "Back to List" navigation

### 1.6 Update Character (Text Fields)
- [ ] From character list, click "Edit" on a character
- [ ] OR from detail page, click "Edit" button
- [ ] Verify form loads with existing data pre-filled
- [ ] Modify text fields:
  - [ ] Change name
  - [ ] Change class
  - [ ] Change level
  - [ ] Update description
- [ ] Submit form
- [ ] Verify redirects to detail page
- [ ] Verify changes reflected on detail page
- [ ] Verify changes reflected on list page

### 1.7 Update Character (Replace Image)
- [ ] Edit character that has an image
- [ ] Upload new image to replace existing
- [ ] Verify preview shows new image
- [ ] Submit form
- [ ] Verify old image replaced with new image
- [ ] Verify old image cleaned up from R2 (check network tab - DELETE request)

### 1.8 Update Character (Remove Image)
- [ ] Edit character that has an image
- [ ] Remove/clear the image
- [ ] Submit form
- [ ] Verify image removed from character
- [ ] Verify image deleted from R2

### 1.9 Delete Character
- [ ] From character list, click "Delete" on a character
- [ ] OR from detail page, click "Delete" button
- [ ] Verify confirmation dialog appears
- [ ] Cancel deletion, verify character still exists
- [ ] Click "Delete" again
- [ ] Confirm deletion
- [ ] Verify character removed from list
- [ ] Navigate to old detail URL
- [ ] Verify shows 404 or "Character not found"
- [ ] If character had image, verify image deleted from R2

### 1.10 Character Form Validation
- [ ] Try to submit form without required fields
  - [ ] Verify error message shows
  - [ ] Verify form does not submit
- [ ] Try to upload invalid file type (e.g., .txt, .pdf)
  - [ ] Verify error message shows
  - [ ] Verify file rejected
- [ ] Try to upload image larger than 5MB
  - [ ] Verify error message shows
  - [ ] Verify upload rejected
- [ ] Try to set level < 1 or > 20
  - [ ] Verify validation prevents invalid level

---

## 2. Episode Management Flow

### 2.1 Navigate to Episodes
- [ ] From campaign detail, click "Episodes" tab/button
- [ ] Verify episode list page loads
- [ ] Verify page shows "No episodes" message if empty
- [ ] Verify "Add Episode" button visible

### 2.2 Create Episode
- [ ] Click "Add Episode" button
- [ ] Verify form displays with all fields:
  - [ ] Name (required)
  - [ ] Episode Number
  - [ ] Season
  - [ ] Description (textarea)
  - [ ] Air Date (date picker)
  - [ ] Runtime (minutes)
  - [ ] Is Published (checkbox/toggle)
- [ ] Fill in all fields
- [ ] Submit form
- [ ] Verify redirects to episode detail page
- [ ] Verify episode appears in list/timeline

### 2.3 Episode List/Timeline Display
- [ ] Verify episodes display in timeline format
- [ ] Verify each episode card shows:
  - [ ] Episode name
  - [ ] Season and episode number (S1E1 format)
  - [ ] Air date (if set)
  - [ ] Runtime (if set)
  - [ ] Description (truncated if long)
  - [ ] Published status indicator
- [ ] Verify episodes sorted by season/episode number
- [ ] Verify timeline responsive on mobile
- [ ] Click on episode, verify navigates to detail

### 2.4 Episode Detail Page (Empty)
- [ ] Navigate to newly created episode
- [ ] Verify episode information displays
- [ ] Verify "No events" message shows
- [ ] Verify "Add Event" button present
- [ ] Verify "Edit Episode" button present
- [ ] Verify "Delete Episode" button present
- [ ] Verify "Back to List" navigation

### 2.5 Create Event in Episode
- [ ] From episode detail, click "Add Event"
- [ ] Verify event form displays:
  - [ ] Name (required)
  - [ ] Description (textarea)
  - [ ] Timestamp (seconds into episode)
  - [ ] Event Type (dropdown: combat, roleplay, discovery, exploration)
  - [ ] Characters Involved (multi-select or text)
- [ ] Fill in event details
- [ ] Submit event
- [ ] Verify event appears in timeline
- [ ] Verify event positioned at correct timestamp

### 2.6 Event Timeline Display
- [ ] Create multiple events in one episode (at least 3)
- [ ] Verify events display in timeline order (by timestamp)
- [ ] Verify each event shows:
  - [ ] Event name
  - [ ] Timestamp (formatted as MM:SS or HH:MM:SS)
  - [ ] Event type badge/tag
  - [ ] Description (truncated if long)
- [ ] Verify timeline scrollable if many events
- [ ] Verify timeline responsive on mobile
- [ ] Verify different event types have different visual indicators

### 2.7 Update Event
- [ ] Click on event in timeline to edit
- [ ] OR click "Edit" button on event card
- [ ] Verify form loads with existing event data
- [ ] Modify event fields:
  - [ ] Change name
  - [ ] Update timestamp
  - [ ] Change event type
  - [ ] Update description
- [ ] Submit update
- [ ] Verify event updated in timeline
- [ ] Verify event re-positioned if timestamp changed

### 2.8 Delete Event
- [ ] Click "Delete" on event (in timeline or detail)
- [ ] Verify confirmation dialog appears
- [ ] Cancel deletion, verify event still exists
- [ ] Click "Delete" again and confirm
- [ ] Verify event removed from timeline
- [ ] Verify timeline updates immediately

### 2.9 Update Episode
- [ ] From episode list, click "Edit" on episode
- [ ] OR from detail page, click "Edit Episode"
- [ ] Verify form loads with existing data
- [ ] Update episode fields:
  - [ ] Change name
  - [ ] Update episode number
  - [ ] Change air date
  - [ ] Modify description
  - [ ] Toggle published status
- [ ] Submit update
- [ ] Verify redirects to detail page
- [ ] Verify changes reflected
- [ ] Verify events still present

### 2.10 Delete Episode (Cascade)
- [ ] Create episode with multiple events (3+)
- [ ] Note the event count
- [ ] Delete the episode
- [ ] Verify confirmation dialog warns about cascade delete
- [ ] Confirm deletion
- [ ] Verify episode removed from list
- [ ] Verify all events also deleted
- [ ] Verify cannot access old episode URL (404)
- [ ] Verify cannot access old event URLs (404)

### 2.11 Episode Form Validation
- [ ] Try to submit form without required fields
  - [ ] Verify error messages
  - [ ] Verify form does not submit
- [ ] Try to set invalid episode number (negative)
  - [ ] Verify validation error
- [ ] Try to set invalid runtime (negative)
  - [ ] Verify validation error
- [ ] Try to set timestamp in event beyond episode runtime
  - [ ] Verify warning or validation (if implemented)

---

## 3. Cross-Feature Integration Tests

### 3.1 Campaign → Characters → Episodes Flow
- [ ] Create new campaign
- [ ] Add 3+ characters to campaign
- [ ] Add 2+ episodes to campaign
- [ ] Create events in episodes
- [ ] Verify all features accessible from campaign detail
- [ ] Verify navigation between features works
- [ ] Verify data scoped correctly to campaign

### 3.2 Character-Episode Linking
- [ ] Create character
- [ ] Create episode
- [ ] Add event mentioning the character
- [ ] Verify character linked to event (if linking implemented)
- [ ] Navigate from event to character (if links implemented)

### 3.3 Campaign Deletion (Full Cascade)
- [ ] Create campaign with:
  - [ ] 5+ characters (some with images)
  - [ ] 3+ episodes
  - [ ] 10+ events
- [ ] Delete the campaign
- [ ] Verify confirmation dialog shows
- [ ] Confirm deletion
- [ ] Verify all characters deleted
- [ ] Verify all character images deleted from R2
- [ ] Verify all episodes deleted
- [ ] Verify all events deleted
- [ ] Verify campaign removed from list

---

## 4. Error Scenarios & Edge Cases

### 4.1 Authentication & Authorization
- [ ] Try to access character page without login
  - [ ] Verify redirects to login page
- [ ] Try to access another user's campaign/character
  - [ ] Verify shows 403 Forbidden or redirects
- [ ] Try to edit another user's character
  - [ ] Verify access denied

### 4.2 404 Not Found Handling
- [ ] Navigate to non-existent character ID
  - [ ] Verify shows 404 page or error message
- [ ] Navigate to non-existent episode ID
  - [ ] Verify shows 404 page or error message
- [ ] Navigate to non-existent campaign ID
  - [ ] Verify shows 404 page or error message

### 4.3 Invalid Image Upload
- [ ] Upload image with wrong extension
  - [ ] Verify error message shows
  - [ ] Verify upload rejected
- [ ] Upload corrupt image file
  - [ ] Verify error handling
- [ ] Upload file larger than 5MB
  - [ ] Verify size validation
  - [ ] Verify clear error message
- [ ] Upload non-image file (.txt, .pdf, .exe)
  - [ ] Verify file type validation

### 4.4 Network Error Handling
- [ ] Disconnect network during form submission
  - [ ] Verify error message shows
  - [ ] Verify form allows retry
  - [ ] Verify data not lost
- [ ] Slow network simulation
  - [ ] Verify loading states show
  - [ ] Verify UI remains responsive

### 4.5 Navigation & State Management
- [ ] Navigate away from form without saving
  - [ ] Verify confirmation dialog (if implemented)
  - [ ] OR accept data loss (document behavior)
- [ ] Use browser back button during workflow
  - [ ] Verify app state correct
  - [ ] Verify data reloads properly
- [ ] Refresh page on detail view
  - [ ] Verify data reloads from server
  - [ ] Verify page displays correctly
- [ ] Open character in new tab
  - [ ] Verify data loads correctly
  - [ ] Verify can edit independently

### 4.6 Special Characters & Unicode
- [ ] Create character with special characters in name:
  - [ ] "Vax'ildan" (apostrophe)
  - [ ] "Fjord Stonë" (diacritic)
  - [ ] "Beauregard Lionett" (long name)
  - [ ] "Caleb Widogast (Bren)" (parentheses)
- [ ] Verify slug generation handles special chars
- [ ] Verify display correct on all pages
- [ ] Create episode with emoji in description
  - [ ] Verify saves correctly
  - [ ] Verify displays correctly

### 4.7 Long Text Content
- [ ] Create character with very long description (1000+ chars)
  - [ ] Verify saves correctly
  - [ ] Verify truncated on list view
  - [ ] Verify full text on detail view
- [ ] Create episode with very long description
  - [ ] Verify same behavior
- [ ] Create event with long name
  - [ ] Verify displays without breaking layout

---

## 5. Responsive Design Tests

### 5.1 Mobile (320px - 767px)
- [ ] Character list:
  - [ ] 1 column grid
  - [ ] Cards full width
  - [ ] Touch targets adequate size
  - [ ] Images scale properly
- [ ] Character detail:
  - [ ] Stacked layout (image above content)
  - [ ] Buttons accessible
  - [ ] Text readable (font sizes)
- [ ] Character form:
  - [ ] Form fields full width
  - [ ] Labels readable
  - [ ] Submit button accessible
- [ ] Episode timeline:
  - [ ] Events stacked vertically
  - [ ] Timestamps readable
  - [ ] Event cards fit screen width

### 5.2 Tablet (768px - 1023px)
- [ ] Character list:
  - [ ] 2 column grid
  - [ ] Cards properly sized
  - [ ] Spacing appropriate
- [ ] Character detail:
  - [ ] Sidebar + content layout OR stacked
  - [ ] Image and text balanced
- [ ] Episode timeline:
  - [ ] Timeline format OR stacked events
  - [ ] Proper spacing

### 5.3 Desktop (1024px+)
- [ ] Character list:
  - [ ] 3-4 column grid
  - [ ] Cards properly sized
  - [ ] Hover states work
- [ ] Character detail:
  - [ ] Sidebar with image
  - [ ] Content area with details
  - [ ] Optimal use of space
- [ ] Episode timeline:
  - [ ] Full timeline view
  - [ ] Events positioned chronologically
  - [ ] Zoom/pan (if implemented)

### 5.4 Extra Wide Screens (1920px+)
- [ ] Content centered or constrained
- [ ] No excessive whitespace
- [ ] Layout remains usable

---

## 6. Performance Tests

### 6.1 Character Loading Performance
- [ ] Load campaign with 10+ characters
  - [ ] Verify page loads in < 2 seconds
  - [ ] Verify images load progressively
  - [ ] Verify no layout shift during load
- [ ] Load campaign with 50+ characters
  - [ ] Verify pagination OR virtualization
  - [ ] Verify smooth scrolling

### 6.2 Episode Loading Performance
- [ ] Load campaign with 10+ episodes
  - [ ] Verify timeline loads quickly
  - [ ] Verify no lag when scrolling
- [ ] Load episode with 20+ events
  - [ ] Verify event timeline renders smoothly
  - [ ] Verify updates responsive

### 6.3 Image Loading Performance
- [ ] Load character with high-res image (4-5MB)
  - [ ] Verify loads in < 2 seconds
  - [ ] Verify placeholder while loading
- [ ] Load character list with 10+ images
  - [ ] Verify lazy loading works
  - [ ] Verify images load as scroll

### 6.4 Build Performance
- [ ] Run `npm run build` in frontend
  - [ ] Verify build completes successfully
  - [ ] Check bundle size (should be reasonable)
  - [ ] Check for warnings
- [ ] Run production build
  - [ ] Verify app runs in production mode
  - [ ] Verify no console errors

### 6.5 Browser Performance
- [ ] Open DevTools Performance tab
- [ ] Interact with character list (scroll, click)
  - [ ] Verify no memory leaks
  - [ ] Verify smooth 60fps
- [ ] Create/update/delete operations
  - [ ] Verify no performance degradation
- [ ] Check React DevTools (if installed)
  - [ ] Verify no unnecessary re-renders
  - [ ] Verify component hierarchy reasonable

---

## 7. Accessibility Tests (Optional but Recommended)

### 7.1 Keyboard Navigation
- [ ] Navigate character list with Tab key
- [ ] Activate buttons with Enter/Space
- [ ] Navigate forms with Tab
- [ ] Submit forms with Enter

### 7.2 Screen Reader Support
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Verify labels announced correctly
- [ ] Verify form errors announced
- [ ] Verify navigation landmarks present

### 7.3 Color Contrast
- [ ] Verify text readable on backgrounds
- [ ] Verify buttons have adequate contrast
- [ ] Verify status indicators distinguishable

---

## 8. Data Consistency Tests

### 8.1 Concurrent Operations
- [ ] Open character in two browser tabs
- [ ] Edit in both tabs simultaneously
- [ ] Save in tab 1, then tab 2
- [ ] Verify last write wins (or conflict handling)

### 8.2 Slug Uniqueness
- [ ] Create two characters with same name
  - [ ] Verify slugs made unique (e.g., slug-1, slug-2)
  - [ ] OR verify error about duplicate
- [ ] Create two episodes with same name
  - [ ] Verify same behavior

### 8.3 Referential Integrity
- [ ] Verify character cannot exist without campaign
- [ ] Verify episode cannot exist without campaign
- [ ] Verify event cannot exist without episode
- [ ] Verify deleting parent deletes children

---

## Test Completion Checklist

After completing all tests, verify:

- [ ] All critical paths tested
- [ ] At least 2 browsers tested
- [ ] At least 3 screen sizes tested
- [ ] All error scenarios tested
- [ ] All CRUD operations tested
- [ ] Performance acceptable
- [ ] No console errors in browser
- [ ] No TypeScript errors in dev mode
- [ ] Build completes successfully
- [ ] Documentation updated

---

## Known Issues

Document any known issues found during testing:

1. **Issue:** [Description]
   - **Severity:** Critical / High / Medium / Low
   - **Steps to Reproduce:** [Steps]
   - **Expected:** [Expected behavior]
   - **Actual:** [Actual behavior]
   - **Workaround:** [If any]

2. [Add more as needed]

---

## Test Results Summary

**Date Tested:** _______________
**Tester:** _______________
**Browser(s):** _______________
**OS:** _______________

**Results:**
- Total test cases: _____
- Passed: _____
- Failed: _____
- Skipped: _____

**Overall Status:** PASS / FAIL / NEEDS REVIEW

**Notes:**
[Any additional notes or observations]

---

## Sign-off

**Tester Signature:** _______________
**Date:** _______________

**Reviewer Signature:** _______________
**Date:** _______________
