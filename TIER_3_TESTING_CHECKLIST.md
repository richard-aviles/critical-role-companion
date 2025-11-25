# Phase 3 Tier 3 - Epic Fantasy Styling Testing Checklist

## Overview
This checklist verifies that all Epic Fantasy design system styling has been properly applied across the entire application in both light and dark modes.

**Frontend URL:** http://localhost:3001
**Backend API:** http://localhost:8001

---

## Color System Reference
- **Primary (Purple):** #6B46C1 - Campaigns, Primary Actions
- **Secondary (Sapphire):** #0369A1 - Characters (text, accents)
- **Tertiary (Emerald):** #047857 - Episodes (badges, links)
- **Text:** #1f2937 (default), #111827 (labels), #FFFFFF (values)
- **Backgrounds:** bg-gray-50 (light), bg-gray-950 (dark)
- **Cards:** bg-white (light), bg-gray-800 (dark)

---

## PUBLIC PAGES - Campaign Browser

### 1. Home Page (`/`)
**Light Mode:**
- [ ] Background is light gray (bg-gray-50)
- [ ] Campaign cards have white backgrounds
- [ ] Campaign names are dark gray/black (#1f2937 or #111827)
- [ ] "3 Characters | 3 Episodes" text is visible and readable
- [ ] Cards have subtle shadows
- [ ] All text has sufficient contrast

**Dark Mode:**
- [ ] Background is very dark (bg-gray-950)
- [ ] Campaign cards have dark gray backgrounds (bg-gray-800)
- [ ] Text is white/light gray and easily readable
- [ ] Cards have stronger shadows (dark:shadow-lg)
- [ ] Purple accents visible but not overwhelming

---

## PUBLIC PAGES - Campaign Detail

### 2. Campaign Overview (`/campaigns/[slug]`)
**Light Mode:**
- [ ] Hero section has proper background color
- [ ] Campaign stats box background is correct (bg-gray-50)
- [ ] Section titles are dark and bold
- [ ] All stat values are readable
- [ ] Footer has gray-900 background with border-top

**Dark Mode:**
- [ ] Hero section background is dark (bg-gray-800)
- [ ] Stats background is dark gray (bg-gray-900)
- [ ] All text is white/light gray
- [ ] Footer is darker (bg-gray-950)
- [ ] All elements have proper dark mode contrast

---

## PUBLIC PAGES - Characters Section

### 3. Characters Roster (`/campaigns/[slug]/characters`)
**Light Mode:**
- [ ] Page background is light gray (bg-gray-50)
- [ ] Heading "Characters" is large (text-4xl) and dark
- [ ] Search & Filter section is visible
  - [ ] Label "Search & Filter" is visible in dark gray (#111827)
  - [ ] Input fields have white backgrounds
  - [ ] Placeholder text is readable
- [ ] Character cards display properly
  - [ ] Cards have white backgrounds
  - [ ] Character names are readable
  - [ ] Character classes and races are visible
  - [ ] Images display with color borders
- [ ] Filter buttons work
  - [ ] Active filters show purple accent (bg-purple-50)
  - [ ] Hover states work correctly

**Dark Mode:**
- [ ] Page background is dark (bg-gray-950)
- [ ] Search & Filter section background is dark gray (bg-gray-800)
- [ ] Labels are light gray (dark:text-gray-300)
- [ ] Input fields have dark background (dark:bg-gray-700)
- [ ] Text in inputs is white (dark:text-white)
- [ ] Character cards have dark background (bg-gray-800)
- [ ] All text is properly visible

### 4. Character Detail (`/campaigns/[slug]/characters/[character-slug]`)
**Light Mode:**
- [ ] Character name is visible and bold (#1f2937)
- [ ] Character level is VISIBLE (not hidden) - shows number clearly
  - [ ] Label "Level" is visible in gray (#6b7280)
  - [ ] Level VALUE is white (#FFFFFF) and stands out
- [ ] Class and Race are readable
- [ ] Character image has color border (matches character theme)
- [ ] Description and Backstory sections are readable
- [ ] Color override indicator (if present) shows theme color
- [ ] Footer has dark background with top border

**Dark Mode:**
- [ ] All text is white/light gray
- [ ] Level section has proper contrast
  - [ ] Label is light gray
  - [ ] Level VALUE is white
- [ ] Description text is readable
- [ ] Image border is visible
- [ ] Buttons have dark:hover states
- [ ] Footer is properly styled

---

## PUBLIC PAGES - Episodes Section

### 5. Episodes Guide (`/campaigns/[slug]/episodes`)
**Light Mode:**
- [ ] Page background is light gray (bg-gray-50)
- [ ] Heading "Episode Guide" is large and dark
- [ ] Episode cards display with proper spacing
  - [ ] Card backgrounds are white
  - [ ] Season/Episode badge is visible (emerald theme)
  - [ ] Episode names are readable
  - [ ] Air dates are visible
- [ ] Footer is styled correctly

**Dark Mode:**
- [ ] Page background is dark (bg-gray-950)
- [ ] Episode cards have dark background (bg-gray-800)
- [ ] Season badge has dark emerald theme (dark:bg-emerald-900/20)
- [ ] All text is white/light gray
- [ ] Hover effects work

### 6. Episode Detail (`/campaigns/[slug]/episodes/[episode-slug]`)
**Light Mode:**
- [ ] Heading is large (text-5xl) and dark
- [ ] Episode badge (S1E1) shows emerald theme
- [ ] Air date and runtime are readable
- [ ] Description text is readable
- [ ] Events timeline displays properly
  - [ ] Timeline dots are green (emerald)
  - [ ] Event names are readable
  - [ ] Event timestamps are visible
  - [ ] Connecting lines are visible
- [ ] Back link is purple

**Dark Mode:**
- [ ] All text is white/light gray
- [ ] Episode badge has dark emerald background
- [ ] Timeline dots are emerald (dark:bg-emerald-500)
- [ ] Event cards have dark background
- [ ] Description text is readable
- [ ] Links have proper dark:hover states

---

## ADMIN PAGES - Authentication

### 7. Login Page (`/admin/login`)
**Light Mode:**
- [ ] Background is gradient (purple-600 to purple-700)
- [ ] Card is white with shadow
- [ ] Text is dark and readable
- [ ] Form inputs have white background
- [ ] Sign Up / Login buttons work
- [ ] Mode toggle works

**Dark Mode:**
- [ ] Background is dark purple gradient (dark:from-purple-900 to dark:to-purple-950)
- [ ] Card has dark background (dark:bg-gray-800)
- [ ] Text is white/light
- [ ] Form inputs have dark background (dark:bg-gray-700)
- [ ] Button text is visible

---

## ADMIN PAGES - Dashboard

### 8. Admin Dashboard (`/admin`)
**Light Mode:**
- [ ] Welcome section has white background with purple left border
- [ ] Text is readable
- [ ] "Your Campaigns" section displays
- [ ] Campaign list items are readable
- [ ] "View All Campaigns" link is purple

**Dark Mode:**
- [ ] Welcome section background is dark gray (dark:bg-gray-800)
- [ ] Purple left border is visible
- [ ] All text is white/light
- [ ] Campaign items have proper dark styling
- [ ] Links have dark:hover states

### 9. Campaigns List (`/admin/campaigns`)
**Light Mode:**
- [ ] Background is light gray
- [ ] Page title is bold
- [ ] Campaign count text is readable
- [ ] "New Campaign" button is purple with white text
  - [ ] Button has font-semibold
  - [ ] Hover state darkens button
- [ ] Campaign cards display properly
  - [ ] Card backgrounds are white
  - [ ] Campaign names are readable
  - [ ] Admin token is truncated and readable
  - [ ] "Manage" button is blue
  - [ ] "Copy Token" button is blue
  - [ ] "Copied!" state is green

**Dark Mode:**
- [ ] Background is dark gray (dark:bg-gray-950)
- [ ] Cards have dark background (dark:bg-gray-800)
- [ ] All text is white/light gray
- [ ] "New Campaign" button is dark purple (dark:bg-purple-700)
- [ ] Hover states work correctly
- [ ] "Copied!" state shows green

### 10. Campaign Management (`/admin/campaigns/[id]`)
**Light Mode:**
- [ ] Tab navigation displays (Characters, Episodes, Events, Settings)
- [ ] Active tab shows purple underline
- [ ] Tab content area has white background
- [ ] Form elements are readable
- [ ] Submit buttons are purple with white text
- [ ] Cancel buttons have proper styling
- [ ] Loading spinners are purple (if applicable)

**Dark Mode:**
- [ ] Tab navigation has proper dark styling
- [ ] Active tab underline is purple
- [ ] Content area background is dark (dark:bg-gray-800)
- [ ] Form inputs have dark background (dark:bg-gray-700)
- [ ] All text is white/light
- [ ] Buttons have proper dark:hover states
- [ ] Loading spinners are purple

### 11. Characters in Admin (`/admin/campaigns/[id]/characters`)
**Light Mode:**
- [ ] Character list displays with grid layout
- [ ] Cards have white backgrounds
- [ ] Character names are readable
- [ ] Action buttons are blue
- [ ] Add Character button is purple

**Dark Mode:**
- [ ] Cards have dark background (dark:bg-gray-800)
- [ ] All text is white/light
- [ ] Buttons have proper dark styling

### 12. Episodes in Admin (`/admin/campaigns/[id]/episodes`)
**Light Mode:**
- [ ] Episode list displays properly
- [ ] Episode badges show season/number
- [ ] Air dates are readable
- [ ] Action buttons are styled correctly
- [ ] Add Episode button is purple

**Dark Mode:**
- [ ] All styling follows dark mode pattern
- [ ] Episode badges have dark theme
- [ ] Buttons have proper dark:hover states

### 13. Create Campaign (`/admin/campaigns/new`)
**Light Mode:**
- [ ] Form displays with white background
- [ ] Labels are dark and readable (#111827)
- [ ] Input fields have white backgrounds
- [ ] Submit button is purple with white text
  - [ ] Button has font-semibold
  - [ ] Hover state works
- [ ] Cancel button is visible

**Dark Mode:**
- [ ] Form background is dark (dark:bg-gray-800)
- [ ] Labels are light gray (dark:text-gray-300)
- [ ] Input fields have dark background (dark:bg-gray-700)
- [ ] Input text is white (dark:text-white)
- [ ] Input borders are dark gray (dark:border-gray-600)
- [ ] Submit button is dark purple (dark:bg-purple-700)
- [ ] All elements have proper contrast

---

## UTILITY COMPONENTS - Form Elements

### 14. Color Picker Modal (Character Override)
**Light Mode:**
- [ ] Modal has white background
- [ ] Title is dark and readable
- [ ] Color input shows current color
- [ ] Hex input field displays value
- [ ] Quick select swatches are visible
- [ ] Save button is purple with white text
- [ ] Cancel button is visible

**Dark Mode:**
- [ ] Modal background is dark (dark:bg-gray-800)
- [ ] Title is white (dark:text-white)
- [ ] All inputs have dark background (dark:bg-gray-700)
- [ ] Text in inputs is white (dark:text-white)
- [ ] Borders are dark gray (dark:border-gray-600)
- [ ] Save button is dark purple (dark:bg-purple-700)
- [ ] Swatches are visible in dark mode

### 15. Color Preset Selector
**Light Mode:**
- [ ] Preset cards are visible
- [ ] Selected preset has purple border and background
- [ ] Preset colors are displayed
- [ ] Custom option is available
- [ ] Labels are readable

**Dark Mode:**
- [ ] Preset cards have dark background (dark:bg-gray-800)
- [ ] Selected preset has dark purple theme
- [ ] All text is white/light
- [ ] Color previews are visible

### 16. Event Form
**Light Mode:**
- [ ] All form fields display properly
- [ ] Labels are dark (#111827)
- [ ] Input fields have white backgrounds
- [ ] Character checkboxes work
- [ ] Submit button is purple
- [ ] Error messages (if any) are readable

**Dark Mode:**
- [ ] Form background is dark (dark:bg-gray-800)
- [ ] Labels are light gray (dark:text-gray-300)
- [ ] Input fields have dark background (dark:bg-gray-700)
- [ ] Input text is white (dark:text-white)
- [ ] Checkboxes have purple accent (dark:text-purple-400)
- [ ] Submit button is dark purple

### 17. Confirm Dialog
**Light Mode:**
- [ ] Dialog has white background
- [ ] Warning section is readable
- [ ] Delete button is red
- [ ] Cancel button is visible
- [ ] Dialog has shadow

**Dark Mode:**
- [ ] Dialog background is dark (dark:bg-gray-800)
- [ ] Warning section has red theme (dark:bg-red-900/20)
- [ ] All text is white/light (dark:text-gray-300)
- [ ] Delete button is dark red (dark:bg-red-700)
- [ ] Cancel button has proper dark styling

### 18. Image Upload Field
**Light Mode:**
- [ ] Upload area background is light
- [ ] Upload icon is visible
- [ ] Help text is readable
- [ ] File info is displayed
- [ ] Change/Remove buttons work
- [ ] Image preview shows with color border

**Dark Mode:**
- [ ] Upload area background is dark (dark:bg-gray-800)
- [ ] Upload icon is gray (dark:text-gray-500)
- [ ] Help text is light gray (dark:text-gray-300)
- [ ] Buttons have dark styling
- [ ] Image preview border is visible
- [ ] Drop zone states work correctly

---

## RESPONSIVE DESIGN

### 19. Mobile View (use browser DevTools)
**Portrait (iPhone X: 375px width)**
- [ ] All pages are responsive
- [ ] Text sizes are readable
- [ ] Buttons are touchable (min 44px height)
- [ ] Forms stack vertically
- [ ] Images scale properly
- [ ] Navigation is accessible

**Tablet (iPad: 768px width)**
- [ ] Two-column layouts display properly
- [ ] Cards are appropriately sized
- [ ] Forms are readable
- [ ] All elements have proper spacing

**Desktop (1440px width)**
- [ ] Three-column layouts display correctly
- [ ] Spacing is balanced
- [ ] All elements are properly aligned

---

## CONTRAST & ACCESSIBILITY

### 20. Text Contrast Verification
**Light Mode:**
- [ ] Dark text on light backgrounds (pass WCAG AA)
- [ ] All headings are readable
- [ ] All body text is readable
- [ ] All form labels are visible
- [ ] All buttons have readable text

**Dark Mode:**
- [ ] Light text on dark backgrounds (pass WCAG AA)
- [ ] All headings are readable
- [ ] All body text is readable
- [ ] All form labels are visible
- [ ] All buttons have readable text

### 21. Color Independence
- [ ] Users don't rely solely on color to understand information
- [ ] All buttons have text labels
- [ ] All badges have supporting text
- [ ] Form errors have text descriptions

---

## INTERACTIVE ELEMENTS

### 22. Button Hover States
**Light Mode:**
- [ ] Purple buttons darken on hover
- [ ] Blue buttons darken on hover
- [ ] Red buttons darken on hover
- [ ] All buttons show clear feedback

**Dark Mode:**
- [ ] Purple buttons lighten on hover (dark:bg-purple-600)
- [ ] All buttons show clear feedback
- [ ] Hover states are visible

### 23. Form Input States
**Light Mode:**
- [ ] Focused inputs have purple outline/border
- [ ] Placeholder text is visible
- [ ] Error states show red border/text
- [ ] Disabled inputs are grayed out

**Dark Mode:**
- [ ] Focused inputs have purple border (dark:border-purple-500)
- [ ] Placeholder text is visible
- [ ] Error states are red with dark theme
- [ ] Disabled inputs are properly styled

### 24. Loading States
- [ ] All loading spinners are purple
  - [ ] Light mode: border-purple-600
  - [ ] Dark mode: dark:border-purple-500
- [ ] Spinner animation is smooth
- [ ] Loading text is readable

### 25. Navigation Links
- [ ] Links have proper colors
- [ ] Hover states work
- [ ] Visited states (if applicable) work
- [ ] Active states are clear

---

## PERFORMANCE CHECKS

### 26. Page Load Times
- [ ] Home page loads quickly
- [ ] Campaign pages load within 2-3 seconds
- [ ] No layout shifts during loading
- [ ] Images load progressively

### 27. No Console Errors
- [ ] Open DevTools Console (F12)
- [ ] Navigate through pages
- [ ] Verify no red error messages
- [ ] Verify no CSS warnings

---

## FINAL VERIFICATION

### 28. Theme Toggle (if applicable)
- [ ] Theme toggle works correctly
- [ ] Dark mode applies to all pages
- [ ] Light mode applies to all pages
- [ ] Preference is remembered (if using localStorage)

### 29. Print Stylesheet (optional)
- [ ] Pages print without dark backgrounds
- [ ] Text is readable in print preview
- [ ] Images print correctly

### 30. Cross-Browser Testing
- [ ] Chrome/Edge: All styles apply correctly
- [ ] Firefox: All styles apply correctly
- [ ] Safari: All styles apply correctly (if available)

---

## Sign-Off

**Date Tested:** _______________

**Tested By:** _______________

**Overall Status:**
- [ ] PASS - All tests passed
- [ ] PASS WITH NOTES - See notes below
- [ ] FAIL - See issues below

**Notes/Issues:**
```
[Add any notes or issues found during testing]
```

---

## Summary of Changes Completed

✅ **5 Public Campaign Pages** - Epic Fantasy styling applied
- Campaign detail page
- Character roster page
- Character detail page
- Episodes page
- Episode detail page

✅ **8 Admin Pages** - Epic Fantasy styling applied
- Login page
- Dashboard
- Campaigns list
- Campaign detail
- Characters list
- Episodes list
- Character detail (admin)
- Episode detail (admin)

✅ **8 Utility Components** - Epic Fantasy colors applied
- ColorPickerModal
- ColorPresetSelector
- EventForm
- EventCard
- ConfirmDialog
- ImageUploadField
- AuthForm (verified)
- CharacterColorOverrideForm

✅ **Full Dark Mode Support** - Applied throughout
- All backgrounds have dark variants
- All text has dark variants
- All buttons have dark:hover states
- All form inputs have dark styling
- Loading spinners use purple theme
