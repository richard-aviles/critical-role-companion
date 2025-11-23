# Phase 3 Tier 3 - Responsive Design & Styling Testing (Phase 8)

## Testing Scope
Verify all public-facing pages render correctly across mobile, tablet, and desktop breakpoints while maintaining visual hierarchy, readability, and accessibility.

---

## Page Testing Matrix

### 1. Campaign Detail Page (`/campaigns/[slug]`)

**Mobile (375px - 640px)**
- [ ] CampaignHeroSection text is readable without overflow
- [ ] Campaign image/banner scales proportionally
- [ ] Description text flows naturally
- [ ] CTA buttons (View Roster, Episode Guide) stack vertically
- [ ] CampaignStats cards display in single column
- [ ] Grid layout switches to `grid-cols-1`

**Tablet (641px - 1024px)**
- [ ] Hero section maintains aspect ratio
- [ ] Text size is comfortable for reading
- [ ] CTA buttons display side-by-side if space permits
- [ ] Stats cards show in 2 columns
- [ ] Max-width container (max-w-5xl) provides good margins

**Desktop (1025px+)**
- [ ] Full layout with max-w-5xl centered
- [ ] Stats cards in 3-column grid
- [ ] Proper spacing and padding throughout
- [ ] Links have visible hover states

---

### 2. Character Roster Page (`/campaigns/[slug]/characters`)

**Mobile (375px - 640px)**
- [ ] CharacterSearch inputs stack vertically
- [ ] Filter buttons are touch-friendly (min 44px height)
- [ ] Search input spans full width
- [ ] PublicCharacterCard displays in single column (`grid-cols-1`)
- [ ] Character image aspect ratio maintained
- [ ] Card content (name, class, race) readable without truncation
- [ ] Left border (4px) visible on cards

**Tablet (641px - 1024px)**
- [ ] Character cards display in 2 columns (`md:grid-cols-2`)
- [ ] Search section has adequate spacing
- [ ] Cards maintain consistent sizing
- [ ] Filter options readable and accessible

**Desktop (1025px+)**
- [ ] Character cards in 3-column grid (`lg:grid-cols-3`)
- [ ] Consistent card heights (CSS Grid alignment)
- [ ] Max-w-6xl container for wider layout
- [ ] Proper hover effects on cards (shadow, scale)

---

### 3. Character Detail Page (`/campaigns/[slug]/characters/[character-slug]`)

**Mobile (375px - 640px)**
- [ ] Image stacks on top (full width with border)
- [ ] Quick Info Card (level, class, race) readable
- [ ] Character name and description text readable
- [ ] Backstory section doesn't have excessive line length
- [ ] Color override section properly displayed
- [ ] Breadcrumb collapses if needed

**Tablet (641px - 1024px)**
- [ ] Image on left, info on right (2-column layout)
- [ ] Text columns maintain readability (not too wide)
- [ ] Color override indicator visible

**Desktop (1025px+)**
- [ ] Grid layout: `grid-cols-1 lg:grid-cols-3 gap-8`
- [ ] Left sidebar (lg:col-span-1) with image
- [ ] Right sidebar (lg:col-span-2) with details
- [ ] Proper proportions and spacing

---

### 4. Episode Guide Page (`/campaigns/[slug]/episodes`)

**Mobile (375px - 640px)**
- [ ] Title and description text readable
- [ ] PublicEpisodeTimeline cards display full width
- [ ] Episode number circles visible and properly sized
- [ ] Episode name and metadata readable
- [ ] Season headers with divider lines render correctly
- [ ] Arrow icon visible and properly positioned

**Tablet (641px - 1024px)**
- [ ] Timeline cards readable
- [ ] Proper spacing between episodes
- [ ] Season grouping clear and visible

**Desktop (1025px+)**
- [ ] Full timeline layout with proper spacing
- [ ] Episode cards maintain hover effects
- [ ] Timeline visual alignment preserved

---

### 5. Episode Detail Page (`/campaigns/[slug]/episodes/[episode-slug]`)

**Mobile (375px - 640px)**
- [ ] Season/Episode badge displays properly
- [ ] Episode title readable (may wrap)
- [ ] Metadata (air date, runtime) displays on separate lines
- [ ] Description text readable with proper line height
- [ ] Event timeline markers visible
- [ ] Event timestamps (MM:SS) formatted correctly
- [ ] Event descriptions don't cause horizontal overflow
- [ ] Timeline connector lines visible (w-0.5)

**Tablet (641px - 1024px)**
- [ ] Metadata displays on same line if space permits
- [ ] Event timeline easy to follow
- [ ] All text readable

**Desktop (1025px+)**
- [ ] Full 5xl max-width container
- [ ] Proper spacing and padding
- [ ] Timeline visual hierarchy maintained

---

## Accessibility & WCAG Compliance

### Color Contrast (WCAG AA Standard)
- [ ] Text on background: 4.5:1 ratio for normal text, 3:1 for large text
- [ ] Character color overrides maintain readable contrast
- [ ] Links are distinguishable from surrounding text
- [ ] Focus states clearly visible

### Interactive Elements
- [ ] All buttons have focus indicators
- [ ] Links have visible hover/focus states
- [ ] Touch targets minimum 44x44px (buttons, links)
- [ ] Form inputs properly labeled and accessible

### Typography
- [ ] Font sizes scale appropriately for screen size
- [ ] Line height sufficient for readability (1.5-1.6)
- [ ] Text doesn't have excessive line length (max 75-80 chars on desktop)

---

## Color & Design Consistency

### Using DESIGN_GUIDELINES.md
- [ ] Primary color (blue-600): Consistent across all CTAs
- [ ] Text colors: Proper hierarchy (gray-900 for headers, gray-700 for body)
- [ ] Spacing: Consistent use of 8px base unit (p-6 = 24px, gap-8 = 32px)
- [ ] Border radius: Rounded-lg (8px) for cards, rounded-full for badges
- [ ] Character color overrides: Proper CSS variable application

### Shadow & Elevation
- [ ] Cards use consistent shadow (shadow for resting, shadow-lg for hover)
- [ ] Hover effects use shadow-lg transition
- [ ] Subtle transitions on interactive elements

---

## Performance Considerations

- [ ] Images load properly and scale responsively
- [ ] No layout shift during image load (use proper aspect ratios)
- [ ] Fonts load efficiently
- [ ] CSS classes are minimal and optimized

---

## Testing Tools & Methods

1. **Browser DevTools Responsive Mode**
   - Test at: 375px, 640px, 768px, 1024px, 1920px
   - Check mobile phone presets (iPhone SE, iPhone 14, Pixel 5)
   - Check tablet presets (iPad Air, iPad Pro)

2. **Real Device Testing (if available)**
   - Mobile phone (portrait & landscape)
   - Tablet (portrait & landscape)
   - Desktop browser at various window sizes

3. **Color Contrast Checker**
   - Use WebAIM Contrast Checker for color combinations
   - Verify character color overrides maintain AA compliance

4. **Accessibility Validator**
   - Use axe DevTools or WAVE browser extension
   - Check for accessibility violations

---

## Issue Resolution Log

### Issues Found
(To be filled in during testing)

1. **Issue**: [Description]
   - **Page**: [Which page]
   - **Breakpoint**: [Mobile/Tablet/Desktop]
   - **Severity**: [Critical/High/Medium/Low]
   - **Fix Applied**: [Solution]
   - **Status**: [Pending/Fixed/Verified]

---

## Sign-Off

- [ ] All pages tested at breakpoints: 375px, 768px, 1024px, 1920px
- [ ] All interactive elements properly sized and accessible
- [ ] Color contrast meets WCAG AA standards
- [ ] Design consistency verified against DESIGN_GUIDELINES.md
- [ ] No critical layout issues or overflow
- [ ] Mobile, tablet, and desktop optimizations complete
- [ ] Ready for Phase 9 (Integration Testing)
