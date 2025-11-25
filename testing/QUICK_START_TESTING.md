# Quick Start Testing Guide

## Pre-Testing Checklist

- [ ] Backend running on port 8001
- [ ] Frontend running on port 3000
- [ ] Browser DevTools ready (F12)
- [ ] At least one campaign with characters and episodes created in admin

## 5-Minute Quick Test

### Step 1: Access Frontend (30 seconds)
```
Navigate to: http://localhost:3000
Expected: See home page
```

### Step 2: Find a Campaign (1 minute)
```
Look for "Campaigns" section or navigation
Click on any campaign
Expected: Campaign detail page with name, description, and stats
```

### Step 3: Test Character Search (1.5 minutes)
```
Click "View Roster" button
Type in search box: any character name
Expected: Results filter in real-time
```

### Step 4: View Character Detail (1 minute)
```
Click on any character card
Expected: Character detail page loads with full info
```

### Step 5: Check Episode Timeline (1.5 minutes)
```
Go back to campaign (click campaign name in breadcrumb)
Click "Episode Guide" button
Click any episode
Expected: Episode detail with events showing MM:SS timestamps
```

---

## Testing Workflow

### Option A: Quick Full Flow (15 minutes)
1. Campaign detail page ✓
2. Character roster ✓
3. Character search/filter ✓
4. Character detail ✓
5. Episode guide ✓
6. Episode detail ✓

### Option B: Focused Testing (10 minutes per feature)
Test one feature at a time:
- [ ] **Search & Filter** - Focus on character roster
- [ ] **Detail Pages** - Focus on character/episode content
- [ ] **Navigation** - Focus on breadcrumbs and links
- [ ] **Mobile Responsiveness** - Resize to 375px, test on phone

### Option C: Comprehensive Testing (1-2 hours)
Follow the full USER_TESTING_PLAN.md with all 30+ test cases

---

## What to Look For

### ✅ Looks Good Signals
- Text is readable
- Images load properly
- Buttons work when clicked
- No broken links (404 errors)
- Colors look intentional
- Layout doesn't break at different sizes

### ❌ Problem Signals
- Text overlapping or cut off
- Images not loading or stretched
- Buttons don't respond
- Console shows red errors (F12 → Console)
- Page won't load (spinning forever)
- Layout broken on phone/tablet
- Filters don't work

---

## How to Report Issues

### For Each Issue Found:

1. **What page were you on?**
   ```
   e.g., Character Detail Page
   ```

2. **What did you do?**
   ```
   e.g., Clicked on character card for "Vex"
   ```

3. **What happened?**
   ```
   e.g., Page didn't load, showed 404 error
   ```

4. **What should have happened?**
   ```
   e.g., Character detail page should load with name, image, and info
   ```

5. **Can you reproduce it?**
   ```
   [ ] Yes, every time
   [ ] Yes, sometimes
   [ ] No, can't reproduce
   ```

6. **Browser/Device:**
   ```
   Chrome, Firefox, Safari, Mobile, etc.
   ```

---

## Common Test Scenarios

### Test 1: Search Works
```
1. Go to character roster
2. Type "vex" in search box
3. See results filter to show only matching characters
✓ PASS if results update immediately
✗ FAIL if results don't filter or page needs refresh
```

### Test 2: Responsive Design
```
1. Open any page at full width
2. Resize browser window to 50% width (tablet)
3. Resize to 25% width (mobile)
✓ PASS if layout adjusts and text stays readable
✗ FAIL if text gets cut off or layout breaks
```

### Test 3: Links Work
```
1. On character roster page
2. Click a character card
3. Click "Back to Roster" link/button
4. Verify you're back at character roster
✓ PASS if navigation is smooth
✗ FAIL if wrong page loads or shows 404
```

### Test 4: No Console Errors
```
1. Open DevTools (F12)
2. Click Console tab
3. Navigate through pages
✓ PASS if no red error messages
✗ FAIL if red errors appear
```

---

## Tips for Testing

### 1. Take Your Time
- Don't rush through tests
- Notice small details
- Try different actions

### 2. Test on Real Devices
- Desktop browser
- Tablet (actual iPad if possible)
- Mobile phone (actual phone if possible)

### 3. Test Edge Cases
- What if character has no image?
- What if episode has no events?
- What if search returns no results?

### 4. Keyboard Navigation
- Use Tab key to navigate
- Use Enter key to activate
- Make sure everything is reachable

### 5. Developer Tools
- F12 opens DevTools
- Console tab shows errors
- Network tab shows API calls
- Look for red errors and 404s

---

## Quick Debugging

### Issue: Page Won't Load
1. Open DevTools (F12)
2. Check Network tab for red errors
3. Check Console tab for error message
4. Is backend running? (port 8001)
5. Is frontend running? (port 3000)

### Issue: Search Not Working
1. Check if typing updates results
2. Open Console (F12) for errors
3. Verify character data exists in database

### Issue: Layout Broken on Mobile
1. Resize browser to 375px
2. Check if images scale
3. Check if text wraps properly
4. Check if buttons are large enough

---

## Success Criteria

✅ **Testing is successful if:**
- All pages load without errors
- Search and filter work smoothly
- Navigation flows intuitively
- No broken links
- Responsive on mobile/tablet/desktop
- Text readable, images load properly
- No red console errors

❌ **Testing fails if:**
- Critical pages don't load
- Search/filter don't work
- Links go to 404
- Layout breaks on mobile
- Red errors in console
- Can't complete basic user journeys

---

## After Testing

1. **Summarize findings** in a simple document
2. **Note what works well** - praise goes here
3. **List issues found** - include severity
4. **Suggest improvements** - be constructive

---

## Need Help?

**Check the detailed test plan:** `USER_TESTING_PLAN.md`
**See all documentation:** `PHASE_3_TIER_3_COMPLETION_SUMMARY.md`
**Review technical details:** Backend/frontend READMEs

---

**Happy Testing! 🚀**
