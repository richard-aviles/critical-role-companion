# Phase 3 Tier 3 - Integration Testing (Phase 9)

## Testing Overview
Comprehensive integration tests for the public campaign website to verify all pages render correctly, data loads from API, navigation works end-to-end, and user interactions function properly.

---

## Test Scenarios

### 1. Campaign Discovery & Navigation

#### Test 1.1: Navigate from Home to Campaign
```
1. Start at /
2. Select a campaign
3. Verify campaign detail page loads
4. Check campaign name, description, stats display
5. Verify links to character roster and episode guide are present
```

**Expected Results:**
- Page loads without errors
- Campaign data fetches correctly
- Stats display correct counts
- CTA buttons are clickable and navigate properly

---

#### Test 1.2: Campaign Detail Page Elements
```
1. On campaign detail page
2. Verify CampaignHeroSection renders with:
   - Campaign name (h1)
   - Description text
   - Character count and episode count
   - "View Roster" button
   - "Episode Guide" button
3. Verify CampaignStats section displays:
   - Total characters card
   - Total episodes card
   - Campaign info card
   - Quick links
```

**Expected Results:**
- All sections render correctly
- Text is readable and properly formatted
- Buttons have proper styling and hover states
- Colors follow design guidelines

---

### 2. Character Roster & Filtering

#### Test 2.1: Load Character Roster
```
1. Navigate to /campaigns/[slug]/characters
2. Wait for page to load
3. Verify all active characters display
4. Check character count shows correct number
```

**Expected Results:**
- Page loads without errors
- Characters display in responsive grid
- Loading spinner appears briefly during load
- No "no results" message if characters exist

---

#### Test 2.2: Character Search Functionality
```
1. On character roster page
2. Type in search box (e.g., "Vex")
3. Verify results filter in real-time
4. Check results count updates
5. Try searching for non-existent character
6. Verify "No characters match" message appears
```

**Expected Results:**
- Search is case-insensitive
- Results update immediately without page reload
- Character count updates accurately
- Empty state shows appropriate message

---

#### Test 2.3: Character Filter by Class
```
1. On character roster page
2. Select a class from dropdown (e.g., "Rogue")
3. Verify only characters with that class display
4. Select different class
5. Verify results update
```

**Expected Results:**
- Filter dropdown shows all available classes
- Results update immediately
- Combined filters work (search + class + race)
- Results count reflects filters

---

#### Test 2.4: Character Filter by Race
```
1. On character roster page
2. Select a race from dropdown (e.g., "Half-Elf")
3. Verify only characters with that race display
4. Try combining race + class filters
```

**Expected Results:**
- Filter dropdown shows all available races
- Race filter works independently
- Multiple filters stack correctly
- Results are accurate

---

#### Test 2.5: Character Sort Options
```
1. On character roster page
2. Change sort to "Class"
3. Verify characters sort by class alphabetically
4. Change sort to "Race"
5. Verify characters sort by race alphabetically
```

**Expected Results:**
- Sort dropdown shows all options
- Sort applies correctly
- Sorts work with active filters
- Results update immediately

---

#### Test 2.6: Reset Filters Button
```
1. On character roster page
2. Apply multiple filters (search, class, race)
3. Click "Reset" button
4. Verify all filters clear and all characters display
```

**Expected Results:**
- Reset button is only enabled when filters are active
- All fields clear when reset is clicked
- Full character list displays after reset

---

### 3. Character Detail Page

#### Test 3.1: Character Detail Navigation
```
1. On character roster page
2. Click on a character card
3. Verify character detail page loads
4. Check URL is /campaigns/[slug]/characters/[character-slug]
```

**Expected Results:**
- Page loads without errors
- Correct character data displays
- URL structure is correct
- Page title shows character name

---

#### Test 3.2: Character Detail Content
```
1. On character detail page
2. Verify display of:
   - Character image with border (colored from override)
   - Character name (colored)
   - Class, race, level, player name in quick info
   - Full description in overview section
   - Backstory section (if exists)
   - Color override indicator (if override exists)
3. Verify all text is readable and properly formatted
```

**Expected Results:**
- Image loads and displays properly
- Color overrides apply correctly
- Text has proper typography and hierarchy
- No overflow or text wrapping issues
- Sections display in correct order

---

#### Test 3.3: Character Color Overrides
```
1. Navigate to character with color override
2. Verify custom colors display:
   - Character name uses custom text color
   - Image border uses custom border color
   - Badge uses custom color
3. Compare with character without override
```

**Expected Results:**
- Custom colors apply correctly
- Colors are readable and have proper contrast
- Fallback colors work for characters without overrides
- Styling is consistent

---

#### Test 3.4: Character Detail Navigation Back
```
1. On character detail page
2. Click "Back to Roster" button
3. Verify returns to character roster page
4. Check filters/sorts are preserved if any
```

**Expected Results:**
- Navigation works correctly
- Returns to correct campaign's roster
- Breadcrumb links work
- No data loss during navigation

---

### 4. Episode Guide & Timeline

#### Test 4.1: Load Episode Guide
```
1. Navigate to /campaigns/[slug]/episodes
2. Wait for episodes to load
3. Verify all published episodes display
4. Check episodes grouped by season
```

**Expected Results:**
- Page loads without errors
- Episodes display in timeline format
- Seasons are grouped correctly
- Episode count is accurate

---

#### Test 4.2: Episode Timeline Rendering
```
1. On episode guide page
2. Verify PublicEpisodeTimeline displays:
   - Season headers with divider lines
   - Episode cards with proper styling
   - Episode number in circle
   - Episode name and description
   - Air date with emoji
   - Runtime with emoji
3. Verify timeline visual markers render correctly
```

**Expected Results:**
- Timeline layout is readable
- Visual elements display properly
- Text is readable and properly formatted
- No overflow or alignment issues
- Responsive on mobile/tablet/desktop

---

#### Test 4.3: Navigate to Episode Detail
```
1. On episode guide page
2. Click on an episode card
3. Verify episode detail page loads
4. Check URL is /campaigns/[slug]/episodes/[episode-slug]
```

**Expected Results:**
- Navigation works correctly
- Correct episode data displays
- Page loads without errors
- URL structure is correct

---

### 5. Episode Detail Page

#### Test 5.1: Episode Detail Content
```
1. On episode detail page
2. Verify display of:
   - Season/Episode badge (S#E#)
   - Episode title
   - Air date (formatted)
   - Runtime
   - Episode description/summary
   - "Key Events" section header
```

**Expected Results:**
- All content displays correctly
- Date is formatted properly
- Text is readable and properly formatted
- Sections are in correct order
- No overflow issues

---

#### Test 5.2: Episode Events Timeline
```
1. On episode detail page with events
2. Verify each event displays:
   - Timeline marker (blue circle)
   - Connector line to next event
   - Event name (h3)
   - Event type badge (if exists)
   - Timestamp in MM:SS format
   - Event description
3. Verify final event has no connector line
```

**Expected Results:**
- Timeline markers render correctly
- Timeline layout is readable
- Timestamps format correctly (MM:SS)
- Connector lines align properly
- Text is readable without overflow

---

#### Test 5.3: Episode with No Events
```
1. Navigate to episode with no events
2. Verify "No events recorded for this episode yet." message displays
3. Verify appropriate empty state rendering
```

**Expected Results:**
- Empty state message displays appropriately
- Page doesn't have layout issues
- Message is helpful and clear

---

#### Test 5.4: Episode Detail Navigation
```
1. On episode detail page
2. Click "Back to Episode Guide" link
3. Verify returns to episode guide page
4. Check breadcrumb navigation links work
```

**Expected Results:**
- Navigation works correctly
- Returns to correct campaign's episode guide
- Breadcrumb links navigate properly
- URL structure updates correctly

---

### 6. API Integration

#### Test 6.1: Public API Endpoints
```
1. Test /public/campaigns/{slug}
   - GET returns campaign with stats
   - Returns 404 for non-existent campaign
2. Test /public/campaigns/{slug}/characters
   - GET returns active characters array
   - Returns empty array if no characters
3. Test /public/campaigns/{slug}/characters/{character_slug}
   - GET returns character with color overrides
   - Returns 404 for non-existent character
4. Test /public/campaigns/{slug}/episodes
   - GET returns published episodes
   - Episodes ordered by season/episode number
   - Returns empty array if no episodes
5. Test /public/campaigns/{slug}/episodes/{episode_slug}
   - GET returns episode with events
   - Events included in response
   - Returns 404 for non-existent episode
```

**Expected Results:**
- All endpoints respond correctly
- Response schemas are correct
- Data is properly formatted
- Error responses are appropriate

---

#### Test 6.2: Data Consistency
```
1. Load campaign from API
2. Verify character_count matches actual character count
3. Verify episode_count matches actual episode count
4. Check character color overrides are included
5. Verify event data includes all required fields
```

**Expected Results:**
- Counts are accurate
- All required fields present
- Data types are correct
- No missing or corrupted data

---

### 7. Page Performance & Loading States

#### Test 7.1: Loading States
```
1. Navigate to campaign detail
2. Verify loading spinner displays
3. Verify text "Loading..." displays
4. Verify page fully loads and spinner disappears
```

**Expected Results:**
- Loading state displays appropriately
- Loading spinner is visible
- Page renders when data loads
- No errors or stuck loading states

---

#### Test 7.2: Error Handling
```
1. Try to access /campaigns/nonexistent
2. Verify error page displays
3. Verify error message is helpful
4. Verify "Back to Home" link works
5. Try to access character in non-existent campaign
6. Verify appropriate error handling
```

**Expected Results:**
- Error pages display appropriately
- Error messages are helpful
- Navigation back works
- No blank or broken pages
- Graceful degradation

---

### 8. Breadcrumb Navigation

#### Test 8.1: Campaign Detail Breadcrumb
```
1. On campaign detail page /campaigns/[slug]
2. Verify breadcrumb shows: Home > Campaign Name
3. Click campaign name link
4. Verify stays on campaign page
```

**Expected Results:**
- Breadcrumb displays correctly
- Links are functional
- Navigation works as expected

---

#### Test 8.2: Character Detail Breadcrumb
```
1. On character detail page /campaigns/[slug]/characters/[character-slug]
2. Verify breadcrumb shows: Campaign > Characters > Character Name
3. Click campaign link
4. Verify navigates to campaign detail
5. Click characters link
6. Verify navigates to character roster
```

**Expected Results:**
- Breadcrumb displays correctly
- All links are functional
- Navigation is accurate
- Correct pages load

---

#### Test 8.3: Episode Detail Breadcrumb
```
1. On episode detail page /campaigns/[slug]/episodes/[episode-slug]
2. Verify breadcrumb shows: Campaign > Episodes > Episode Name
3. Click campaign link
4. Verify navigates correctly
5. Click episodes link
6. Verify navigates to episode guide
```

**Expected Results:**
- Breadcrumb displays correctly
- All links are functional
- Navigation is accurate

---

## Manual Testing Checklist

### Desktop (1920px+)
- [ ] Campaign detail page displays correctly
- [ ] Character roster loads with proper grid
- [ ] Character cards display with colors
- [ ] Character detail page shows full layout
- [ ] Episode guide displays timeline
- [ ] Episode detail shows events timeline
- [ ] All navigation links work
- [ ] Hover effects on cards and links work
- [ ] All interactive elements functional

### Tablet (768px)
- [ ] All pages responsive on tablet size
- [ ] Grid layouts adapt (2 columns)
- [ ] Text readable without zoom
- [ ] Touch targets large enough (44px+)
- [ ] No overflow on any element
- [ ] Search filters display correctly
- [ ] Character cards stack properly

### Mobile (375px)
- [ ] All pages responsive on mobile
- [ ] Single column layouts work
- [ ] Text readable without zoom
- [ ] Touch targets large enough (44px+)
- [ ] No horizontal overflow
- [ ] Form inputs full-width
- [ ] Images scale properly
- [ ] Timeline readable and scrollable
- [ ] Navigation works on small screen

---

## Test Coverage Metrics

### Required Test Categories
- [ ] Page Navigation (7 tests)
- [ ] Character Management (6 tests)
- [ ] Episode Management (4 tests)
- [ ] API Integration (2 tests)
- [ ] Performance & Errors (2 tests)
- [ ] Navigation (3 tests)
- **Total: 24 test scenarios**

### Manual Testing Breakpoints
- [ ] Desktop (1920px)
- [ ] Tablet (768px)
- [ ] Mobile (375px)

---

## Success Criteria

### All Tests Pass If:
✅ All 24 test scenarios complete successfully
✅ No errors in browser console
✅ No broken links or 404s
✅ All API calls succeed
✅ Data displays correctly on all pages
✅ Navigation flows are intuitive
✅ Responsive design works on all breakpoints
✅ Loading and error states work properly
✅ Character color overrides display correctly
✅ Search, filter, and sort functions work accurately

---

## Test Results Log

### Test Execution Date: [TO BE FILLED]
- [ ] Test environment verified
- [ ] Backend API running
- [ ] Frontend app running
- [ ] All test scenarios executed

### Issues Found During Testing
(To be filled in as tests are run)

| Test | Issue | Severity | Status |
|------|-------|----------|--------|
| | | | |

### Sign-Off

- [ ] All 24 test scenarios passed
- [ ] Manual testing completed on mobile/tablet/desktop
- [ ] No critical or blocking issues
- [ ] Ready for Phase 10 (Documentation & Polish)
