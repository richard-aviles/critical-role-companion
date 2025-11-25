# Phase 3 Tier 3 - User Testing Plan

## Getting Started

### Environment Setup
Before testing, ensure:
- [ ] Backend server is running (port 8001)
- [ ] Frontend server is running (port 3000)
- [ ] You have at least one campaign with characters and episodes in the database
- [ ] Open browser developer tools (F12) to monitor for console errors

### Test Environment URLs
- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:8001`
- **Admin Panel:** `http://localhost:3000/admin`

---

## Test Categories

### 1. Campaign Discovery & Navigation
**Goal:** Verify users can find and access campaigns

#### Test 1.1: View Campaign List
```
Steps:
1. Navigate to http://localhost:3000
2. Look for available campaigns
3. Click on a campaign

Expected Results:
✓ Campaign detail page loads
✓ Campaign name displays prominently
✓ Campaign description is visible
✓ No console errors
✓ Page loads within 2 seconds
```
**Status:** [ X] PASS [ ] FAIL

**Issues Found:**
```
Not sure if this is an issue or not but the description is not shown on the list of campaigns page.  It only shows the Name and the Slug

```

---

#### Test 1.2: Campaign Detail Page Elements
```
Steps:
1. On campaign detail page
2. Look for the following sections:
   - Campaign name (large heading)
   - Campaign description
   - Character count stat
   - Episode count stat
   - "View Roster" button
   - "Episode Guide" button

Expected Results:
✓ All sections display correctly
✓ Text is readable and properly formatted
✓ Numbers are accurate (can verify in admin)
✓ Buttons have proper styling
✓ Buttons are clickable and navigate correctly
```
**Status:** [ ] PASS [ ] FAIL

**Issues Found:**
```


```

---

#### Test 1.3: Campaign Navigation Links
```
Steps:
1. On campaign detail page
2. Click "View Roster" button
3. Verify character roster page loads
4. Go back to campaign
5. Click "Episode Guide" button
6. Verify episode guide page loads

Expected Results:
✓ View Roster button navigates to /campaigns/[slug]/characters
✓ Episode Guide button navigates to /campaigns/[slug]/episodes
✓ No 404 errors
✓ Correct data loads for selected campaign
```
**Status:** [X ] PASS [ ] FAIL

**Issues Found:**
```


```

---

### 2. Character Roster & Search
**Goal:** Verify character listing and search functionality work correctly

#### Test 2.1: Load Character Roster
```
Steps:
1. Navigate to campaign detail page
2. Click "View Roster" button
3. Wait for page to load

Expected Results:
✓ Character roster page loads
✓ All active characters display
✓ Page shows character count (e.g., "12 Characters")
✓ No console errors
✓ Characters display in a grid layout
```
**Status:** [ X] PASS [ ] FAIL

**Issues Found:**
```


```

---

#### Test 2.2: Real-time Character Search
```
Steps:
1. On character roster page
2. Find the "Search by Name" input box
3. Type "Vex" (or any character name)
4. Watch the results update
5. Clear the search box
6. Type a non-existent name like "Xyz123"

Expected Results:
✓ Results filter in real-time (no button click needed)
✓ Character count updates (e.g., "1 of 12 characters")
✓ Only matching characters display
✓ Search is case-insensitive (works with "vex" or "VEX")
✓ Non-matching search shows "No characters match your search criteria"
✓ Clearing search shows all characters again
```
**Status:** [X ] PASS [ ] FAIL

**Issues Found:**
```


```

---

#### Test 2.3: Filter by Class
```
Steps:
1. On character roster page
2. Find the "Class" dropdown
3. Select a class (e.g., "Rogue")
4. Observe results filter
5. Select "All Classes" to reset
6. Select a different class

Expected Results:
✓ Class dropdown shows all available classes
✓ Results filter immediately
✓ Only characters with selected class display
✓ Character count updates
✓ "All Classes" option resets filter to show all characters
✓ Can combine with search (search + class filter work together)
```
**Status:** [ x] PASS [ ] FAIL

**Issues Found:**
```


```

---

#### Test 2.4: Filter by Race
```
Steps:
1. On character roster page
2. Find the "Race" dropdown
3. Select a race (e.g., "Half-Elf")
4. Observe results filter
5. Select "All Races" to reset
6. Try combining race filter with class filter

Expected Results:
✓ Race dropdown shows all available races
✓ Results filter immediately
✓ Only characters with selected race display
✓ Character count updates
✓ "All Races" option resets filter
✓ Multiple filters (race + class + search) work together
```
**Status:** [x ] PASS [ ] FAIL

**Issues Found:**
```


```

---

#### Test 2.5: Sort Options
```
Steps:
1. On character roster page
2. Find the "Sort By" dropdown
3. Select "Name"
4. Verify characters are sorted alphabetically by name
5. Select "Class"
6. Verify characters are sorted alphabetically by class
7. Select "Race"
8. Verify characters are sorted alphabetically by race

Expected Results:
✓ Characters sort alphabetically by selected option
✓ Sort works with active filters
✓ Changing sort immediately updates order
✓ Default sort is "Name"
```
**Status:** [x ] PASS [ ] FAIL

**Issues Found:**
```


```

---

#### Test 2.6: Reset Filters Button
```
Steps:
1. On character roster page
2. Apply multiple filters:
   - Search for a character
   - Select a class
   - Select a race
   - Change sort option
3. Look for "Reset" button
4. Click "Reset" button
5. Observe all filters clear

Expected Results:
✓ Reset button is visible when filters are active
✓ Reset button is disabled when no filters active
✓ Clicking Reset clears:
   - Search field
   - Class filter
   - Race filter
   - Sort returns to "Name"
✓ All characters display again
✓ Results counter shows full character count
```
**Status:** [ X] PASS [ ] FAIL

**Issues Found:**
```


```

---

### 3. Character Detail Page
**Goal:** Verify character detail information displays correctly

#### Test 3.1: Navigate to Character Detail
```
Steps:
1. On character roster page
2. Click on a character card
3. Wait for character detail page to load

Expected Results:
✓ Character detail page loads
✓ URL shows /campaigns/[slug]/characters/[character-slug]
✓ Character name displays as large heading
✓ No 404 errors
✓ Page content loads within 2 seconds
```
**Status:** [X ] PASS [ ] FAIL

**Issues Found:**
```


```

---

#### Test 3.2: Character Information Display
```
Steps:
1. On character detail page
2. Check for the following information:
   - Character image/portrait (left side)
   - Character name (colored)
   - Quick info card with:
     - Level
     - Class
     - Race
     - Player name
   - Overview section (character description)
   - Backstory section (if available)

Expected Results:
✓ Image displays and loads properly
✓ Name is readable and properly colored
✓ All quick info fields display
✓ Description text is readable
✓ Backstory preserves line breaks and formatting
✓ Character image has a colored border (from color override)
✓ No text overflow or formatting issues
```
**Status:** [ X] PASS [ ] FAIL

**Issues Found:**
```


```

---

#### Test 3.3: Character Color Overrides
```
Steps:
1. Navigate to a character detail page
2. Observe the following elements:
   - Character name color (should match override)
   - Image border color (should be colored)
   - Level badge color (should match)
3. Go back and check another character
4. Compare colors between characters

Expected Results:
✓ Character name uses custom color (if override exists)
✓ Image border is colored distinctly
✓ Level badge uses custom color
✓ Different characters have different colors
✓ Colors are readable and have good contrast
✓ Characters without overrides use default colors (blue)
```
**Status:** [X ] PASS [ ] FAIL

**Issues Found:**
```


```

---

#### Test 3.4: Character Detail Navigation
```
Steps:
1. On character detail page
2. Look for breadcrumb at top (Campaign Name > Characters > Character Name)
3. Click the "Characters" link in breadcrumb
4. Verify returns to character roster
5. Click on a different character
6. Verify correct character detail loads

Expected Results:
✓ Breadcrumb displays correctly
✓ All breadcrumb links work
✓ Navigation returns to correct roster page
✓ URL updates correctly
✓ Page content changes to new character
```
**Status:** [X ] PASS [ ] FAIL

**Issues Found:**
```


```

---

### 4. Episode Guide & Timeline
**Goal:** Verify episode listing and timeline display

#### Test 4.1: Load Episode Guide
```
Steps:
1. Navigate to campaign detail page
2. Click "Episode Guide" button
3. Wait for page to load

Expected Results:
✓ Episode guide page loads
✓ Shows episode count (e.g., "45 Episodes")
✓ Episodes display in timeline format
✓ Episodes grouped by season
✓ Season headers visible (e.g., "Season 1", "Season 2")
✓ No console errors
```
**Status:** [ X] PASS [ ] FAIL

**Issues Found:**
```


```

---

#### Test 4.2: Episode Timeline Layout
```
Steps:
1. On episode guide page
2. Examine episode cards for:
   - Episode number in circle (e.g., "1")
   - Episode name
   - Episode description (truncated to 2 lines)
   - Air date with calendar emoji (📅)
   - Runtime with clock emoji (⏱️)
3. Check visual elements:
   - Season divider lines
   - Hover effects (shadow should increase)

Expected Results:
✓ Episode cards display all information
✓ Episode number visible in blue circle
✓ Episode name and description readable
✓ Date formatted correctly (e.g., "Jan 12, 2023")
✓ Runtime shows in minutes (e.g., "180 min")
✓ Emojis display correctly
✓ Hover effect shows darker shadow
✓ Season headers have divider lines
```
**Status:** [ X] PASS [ ] FAIL

**Issues Found:**
```


```

---

#### Test 4.3: Navigate to Episode Detail
```
Steps:
1. On episode guide page
2. Click on an episode card
3. Wait for episode detail page to load

Expected Results:
✓ Episode detail page loads
✓ URL shows /campaigns/[slug]/episodes/[episode-slug]
✓ Correct episode data displays
✓ No 404 errors
✓ Page content loads within 2 seconds
```
**Status:** [X ] PASS [ ] FAIL

**Issues Found:**
```


```

---

### 5. Episode Detail Page
**Goal:** Verify episode information and event timeline

#### Test 5.1: Episode Metadata Display
```
Steps:
1. On episode detail page
2. Check for:
   - Season/Episode badge (e.g., "S1E1")
   - Episode title
   - Air date
   - Runtime
   - Episode description

Expected Results:
✓ Badge shows season and episode number (S#E#)
✓ Title displays as large heading
✓ Air date formatted clearly (e.g., "January 12, 2023")
✓ Runtime shows in minutes
✓ Description displays in summary section
✓ All text readable and properly formatted
```
**Status:** [ X] PASS [ ] FAIL

**Issues Found:**
```


```

---

#### Test 5.2: Event Timeline Display
```
Steps:
1. On episode detail page
2. Scroll to "Key Events" section
3. Examine each event for:
   - Blue circle marker
   - Event name
   - Event type badge (if exists)
   - Timestamp in MM:SS format
   - Event description
4. Check timeline visual elements:
   - Vertical line connecting events
   - No line after final event

Expected Results:
✓ Timeline markers (circles) visible
✓ Timeline line connects events
✓ Event names display correctly
✓ Event type badges styled properly
✓ Timestamps formatted as MM:SS (e.g., "12:34")
✓ Event descriptions are readable
✓ Final event has no connector line below it
✓ No overflow or layout issues
```
**Status:** [ X] PASS [ ] FAIL

**Issues Found:**
```


```

---

#### Test 5.3: Episode with No Events
```
Steps:
1. Find an episode with no events
2. Navigate to episode detail page
3. Scroll to Key Events section

Expected Results:
✓ "No events recorded for this episode yet." message displays
✓ Page layout still looks good
✓ Message is helpful and clear
✓ No broken elements or layout issues
```
**Status:** [ X] PASS [ ] FAIL

**Issues Found:**
```


```

---

#### Test 5.4: Episode Navigation
```
Steps:
1. On episode detail page
2. Look for breadcrumb (Campaign > Episodes > Episode Name)
3. Click "Episodes" in breadcrumb
4. Verify returns to episode guide
5. Click back button if available
6. Verify navigation works

Expected Results:
✓ Breadcrumb displays correctly
✓ All breadcrumb links functional
✓ Returns to correct episode guide
✓ URL updates correctly
✓ Back navigation works as expected
```
**Status:** [X ] PASS [ ] FAIL

**Issues Found:**
```


```

---

### 6. Responsive Design Testing
**Goal:** Verify pages work on different screen sizes

#### Test 6.1: Desktop Testing (1920px)
```
Steps:
1. Open browser at full width (1920px)
2. Navigate through all pages:
   - Campaign detail
   - Character roster
   - Character detail
   - Episode guide
   - Episode detail

Expected Results:
✓ All pages display correctly at full width
✓ Content has proper margins (not stretched to edges)
✓ All elements visible and readable
✓ No horizontal scrolling needed
✓ Grid layouts show 3 columns for cards
✓ All hover effects work
```
**Status:** [ X] PASS [ ] FAIL

**Issues Found:**
```


```

---

#### Test 6.2: Tablet Testing (768px)
```
Steps:
1. Resize browser to 768px width
2. Navigate through all pages
3. Check:
   - Text readable without zoom
   - Cards stack properly (2 columns)
   - Buttons large enough to touch
   - No horizontal overflow
   - Images scale properly

Expected Results:
✓ All text readable at 768px
✓ Character cards in 2-column grid
✓ Buttons touch-friendly (44px+ size)
✓ Search filters display properly
✓ No horizontal scrolling needed
✓ Timeline readable
```
**Status:** [ X] PASS [ ] FAIL

**Issues Found:**
```


```

---

#### Test 6.3: Mobile Testing (375px)
```
Steps:
1. Resize browser to 375px width (mobile size)
2. Test on actual mobile device if available
3. Navigate through all pages
4. Check:
   - All text readable without zoom
   - Touch targets large (44px+)
   - Single column layouts
   - Images scale properly
   - No horizontal overflow
   - Forms are full-width

Expected Results:
✓ All text readable without zoom
✓ Cards in single column (1 column grid)
✓ Buttons and links 44px minimum height
✓ Search inputs full-width
✓ Dropdowns functional on mobile
✓ Images load and scale properly
✓ Timeline scrollable without overflow
```
**Status:** [ X] PASS [ ] FAIL

**Issues Found:**
```


```

---

### 7. Error Handling
**Goal:** Verify graceful error handling

#### Test 7.1: Non-existent Campaign
```
Steps:
1. Navigate to http://localhost:3000/campaigns/nonexistent
2. Observe error page

Expected Results:
✓ Shows "Campaign Not Found" message
✓ Error message is helpful
✓ "Back to Home" button displays
✓ Back button works
✓ No console errors (except 404 from API)
```
**Status:** [ X] PASS [ ] FAIL

**Issues Found:**
```


```

---

#### Test 7.2: Non-existent Character
```
Steps:
1. Navigate to campaign detail
2. Manually edit URL to: /campaigns/[slug]/characters/nonexistent
3. Observe error page

Expected Results:
✓ Shows "Character Not Found" message
✓ Error message is helpful
✓ "Back to Roster" button displays
✓ Back button navigates to character roster
✓ No console errors
```
**Status:** [X ] PASS [ ] FAIL

**Issues Found:**
```


```

---

#### Test 7.3: Non-existent Episode
```
Steps:
1. Navigate to campaign detail
2. Manually edit URL to: /campaigns/[slug]/episodes/nonexistent
3. Observe error page

Expected Results:
✓ Shows "Episode Not Found" message
✓ Error message is helpful
✓ "Back to Episode Guide" button displays
✓ Back button navigates to episode guide
✓ No console errors
```
**Status:** [X ] PASS [ ] FAIL

**Issues Found:**
```


```

---

### 8. Performance
**Goal:** Verify pages load quickly

#### Test 8.1: Page Load Times
```
Steps:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Load each page and check load time:
   - Campaign detail
   - Character roster
   - Character detail
   - Episode guide
   - Episode detail

Expected Results:
✓ Campaign detail loads in < 2 seconds
✓ Character roster loads in < 2 seconds
✓ Character detail loads in < 2 seconds
✓ Episode guide loads in < 2 seconds
✓ Episode detail loads in < 2 seconds
✓ No failed network requests (no red 404/500)
```
**Status:** [ X] PASS [ ] FAIL

**Issues Found:**
```


```

---

#### Test 8.2: Search Performance
```
Steps:
1. On character roster page
2. Type in search box
3. Observe response time

Expected Results:
✓ Results filter in real-time (instant, not delayed)
✓ No lag when typing
✓ Character count updates immediately
✓ Smooth interaction without freezing
```
**Status:** [X ] PASS [ ] FAIL

**Issues Found:**
```


```

---

### 9. Console & Network Errors
**Goal:** Verify no critical errors in background

#### Test 9.1: Browser Console
```
Steps:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate through all pages
4. Check for red error messages

Expected Results:
✓ No red console errors
✓ No 404 errors for API calls (except intentional tests)
✓ No 500 server errors
✓ No TypeScript compilation warnings
✓ Network tab shows only successful requests (200/304 status)
```
**Status:** [ X] PASS [ ] FAIL

**Issues Found:**
```


```

---

### 10. Accessibility
**Goal:** Verify basic accessibility features

#### Test 10.1: Keyboard Navigation
```
Steps:
1. On any page
2. Press Tab key to navigate through links and buttons
3. Verify you can navigate to:
   - All links
   - All buttons
   - Search inputs
   - Filter dropdowns
4. Press Enter on focused elements
5. Verify they activate correctly

Expected Results:
✓ Tab key navigates through all interactive elements
✓ Focus indicator visible (blue outline or highlight)
✓ Links and buttons activate with Enter key
✓ Dropdowns work with arrow keys
✓ Can reach all page content without mouse
```
**Status:** [ X] PASS [ ] FAIL

**Issues Found:**
```


```

---

#### Test 10.2: Color Contrast
```
Steps:
1. On character detail page
2. Check readability of:
   - Character name (colored text)
   - Description text on white background
   - Event timeline text
   - Buttons and links

Expected Results:
✓ All text readable against background
✓ No white text on light backgrounds
✓ Colors meet WCAG AA standard (good contrast)
✓ Character color overrides still readable
✓ Links distinguishable from regular text
```
**Status:** [ X] PASS [ ] FAIL

**Issues Found:**
```


```

---

## Quick Reference: Test URLs

**Campaign Pages:**
- Campaign Detail: `http://localhost:3000/campaigns/[campaign-slug]`
- Character Roster: `http://localhost:3000/campaigns/[campaign-slug]/characters`
- Character Detail: `http://localhost:3000/campaigns/[campaign-slug]/characters/[character-slug]`
- Episode Guide: `http://localhost:3000/campaigns/[campaign-slug]/episodes`
- Episode Detail: `http://localhost:3000/campaigns/[campaign-slug]/episodes/[episode-slug]`

**Example (if you have a campaign with slug "critical-role"):**
- `http://localhost:3000/campaigns/critical-role`
- `http://localhost:3000/campaigns/critical-role/characters`
- `http://localhost:3000/campaigns/critical-role/episodes`

---

## Summary Results

### Overall Test Results
- Total Tests: 30+
- Passed: [ ]
- Failed: [ ]
- Success Rate: [ ]%

### Critical Issues Found
```




```

### Minor Issues Found
```




```

### Recommended Fixes
```




```

### Notes & Observations
```




```

---

## Tester Information

**Tester Name:**
**Testing Date:**
**Browser/Device:**
**Screen Sizes Tested:** [ ] Desktop (1920px) [ ] Tablet (768px) [ ] Mobile (375px)
**Backend Running:** [ ] Yes [ ] No
**Frontend Running:** [ ] Yes [ ] No

---

## Sign-Off

- [ ] All critical tests passed
- [ ] No blocking issues found
- [ ] Ready for deployment
- [ ] Additional testing needed

**Tester Signature:** _________________ **Date:** _________
