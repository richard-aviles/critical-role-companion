# Character Card Implementation Guide

**Recommended Approach**: Custom React Component
**Implementation Time**: 5-6 hours
**Difficulty Level**: Beginner to Intermediate

---

## Quick Start (30 minutes)

### Step 1: Review Current Component

Your `/frontend/src/components/CharacterCard.tsx` already exists and works well. The recommendations below enhance it with:
- Class-based color borders (D&D aesthetic)
- Variant support (compact, default, detailed)
- Color override badge support
- Improved responsive design

### Step 2: Copy Enhanced Version

Replace your current `CharacterCard.tsx` with the enhanced version below, or apply the changes incrementally.

### Step 3: Test in Grid

The grid layout in your characters page is already correct:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
```

This automatically handles:
- 📱 Mobile (320px): 1 column, full width
- 📱 Tablet (768px): 2 columns
- 🖥️ Desktop (1024px): 3 columns
- 🖥️ Large (1280px): 4 columns

No additional work needed!

---

## Implementation Details

### Phase 1: Enhanced Base Component (1 hour)

**File**: `/frontend/src/components/CharacterCard.tsx`

```tsx
'use client';

import { Character } from '@/lib/api';

interface CharacterCardProps {
  character: Character;
  variant?: 'default' | 'compact' | 'detailed';
  showOverride?: boolean;
  onEdit?: () => void;
  onView?: () => void;
}

/**
 * D&D Class to Color Mapping
 * Provides visual identification of character class at a glance
 */
const CLASS_COLORS: Record<string, string> = {
  'Barbarian': 'border-l-4 border-red-600',
  'Bard': 'border-l-4 border-purple-600',
  'Cleric': 'border-l-4 border-yellow-600',
  'Druid': 'border-l-4 border-green-600',
  'Fighter': 'border-l-4 border-gray-600',
  'Monk': 'border-l-4 border-blue-600',
  'Paladin': 'border-l-4 border-indigo-600',
  'Ranger': 'border-l-4 border-teal-600',
  'Rogue': 'border-l-4 border-slate-600',
  'Sorcerer': 'border-l-4 border-pink-600',
  'Warlock': 'border-l-4 border-violet-600',
  'Wizard': 'border-l-4 border-cyan-600',
};

/**
 * Image height variants
 */
const IMAGE_HEIGHT: Record<string, string> = {
  'default': 'h-64',    // 256px - standard
  'compact': 'h-48',    // 192px - smaller
  'detailed': 'h-80',   // 320px - larger for detailed view
};

/**
 * CharacterCard Component
 *
 * Displays a character's key information in a card format.
 * Features:
 * - Responsive image display
 * - Class-based color borders for D&D aesthetics
 * - Optional color override badge
 * - Variant sizes for different contexts
 * - Mobile-first responsive design
 */
export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  variant = 'default',
  showOverride = false,
  onEdit,
  onView,
}) => {
  // SVG placeholder for missing images
  const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="48" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';

  // Get class-based color or default gray
  const borderClass = CLASS_COLORS[character.class_name] || 'border-l-4 border-gray-400';

  // Get image height based on variant
  const imageHeight = IMAGE_HEIGHT[variant];

  return (
    <div
      className={`
        bg-white rounded-lg shadow-md overflow-hidden
        hover:shadow-lg transition-shadow duration-200
        ${borderClass}
      `}
    >
      {/* Character Image Container */}
      <div className={`relative w-full ${imageHeight} bg-gray-200 overflow-hidden`}>
        <img
          src={character.image_url || placeholderImage}
          alt={character.name}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = placeholderImage;
          }}
        />

        {/* Color Override Indicator Badge */}
        {showOverride && character.color_override && (
          <div
            className="absolute top-2 right-2 w-6 h-6 rounded-full shadow-lg border-2 border-white"
            style={{ backgroundColor: character.color_override }}
            title={`Color: ${character.color_override}`}
          />
        )}
      </div>

      {/* Character Information Section */}
      <div className="p-4">
        {/* Name - with truncation for long names */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
          {character.name}
        </h3>

        {/* Stats Grid */}
        <div className="space-y-1 mb-4">
          {/* Class */}
          {character.class_name && (
            <div className="flex items-center text-sm">
              <span className="text-gray-600 font-medium mr-2">Class:</span>
              <span className="text-gray-900 font-semibold">{character.class_name}</span>
            </div>
          )}

          {/* Race */}
          {character.race && (
            <div className="flex items-center text-sm">
              <span className="text-gray-600 font-medium mr-2">Race:</span>
              <span className="text-gray-900">{character.race}</span>
            </div>
          )}

          {/* Player Name */}
          {character.player_name && (
            <div className="flex items-center text-sm">
              <span className="text-gray-600 font-medium mr-2">Player:</span>
              <span className="text-gray-900 italic">{character.player_name}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onView}
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            View
          </button>
          <button
            onClick={onEdit}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * CharacterCardSkeleton Component
 *
 * Loading state for character cards.
 * Prevents layout shift while data is loading.
 */
export const CharacterCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse border-l-4 border-gray-300">
      {/* Image placeholder */}
      <div className="w-full h-64 bg-gray-300" />

      {/* Content placeholder */}
      <div className="p-4">
        {/* Title skeleton */}
        <div className="h-6 bg-gray-300 rounded mb-3 w-3/4" />

        {/* Stats skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>

        {/* Buttons skeleton */}
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-gray-300 rounded" />
          <div className="flex-1 h-10 bg-gray-300 rounded" />
        </div>
      </div>
    </div>
  );
};
```

**What Changed:**
- Added `CLASS_COLORS` mapping for D&D class aesthetics
- Added `variant` prop for size variations
- Added `showOverride` prop to display color override badge
- Improved documentation with comments
- Color override badge positioned absolutely over image
- Enhanced visual hierarchy and spacing

**Time to Implement:** 15 minutes (copy-paste)
**Testing Time:** 5 minutes (verify in your grid)
**Total Phase 1:** 20 minutes

---

### Phase 2: Responsive Mobile Improvements (30 minutes)

Add better touch targets and responsive button layout:

**File**: `/frontend/src/components/CharacterCard.tsx`

**Update the buttons section:**
```tsx
{/* Action Buttons - Responsive */}
<div className="flex flex-col sm:flex-row gap-2">
  <button
    onClick={onView}
    className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 active:bg-blue-800 transition-colors"
  >
    View
  </button>
  <button
    onClick={onEdit}
    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors"
  >
    Edit
  </button>
</div>
```

**What Changed:**
- `flex-col sm:flex-row` - Stacked on mobile, side-by-side on sm+ (640px)
- `active:bg-blue-800` - Better mobile feedback
- Larger touch targets on mobile

**Time to Implement:** 5 minutes
**Testing Time:** 10 minutes
**Total Phase 2:** 15 minutes

---

### Phase 3: Adding Variants (30 minutes)

Create different card sizes for different contexts:

**Usage Examples:**
```tsx
// Compact - For lists or dense layouts
<CharacterCard variant="compact" character={character} />

// Default - Standard grid layout
<CharacterCard variant="default" character={character} />

// Detailed - For highlight/feature sections
<CharacterCard variant="detailed" character={character} />
```

**What Variants Do:**
- `compact` (h-48): 192px image - smaller, faster to scan
- `default` (h-64): 256px image - standard grid
- `detailed` (h-80): 320px image - feature/hero displays

**Usage in Your Grid:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {characters.map((character) => (
    <CharacterCard
      key={character.id}
      character={character}
      variant="default" {/* Can be compact or detailed */}
      showOverride={true}
      onView={() => handleViewCharacter(character.id)}
      onEdit={() => handleEditCharacter(character.id)}
    />
  ))}
</div>
```

**Time to Implement:** 5 minutes (already in code)
**Testing Time:** 10 minutes
**Total Phase 3:** 15 minutes

---

### Phase 4: Color Override Support (30 minutes)

Enable color override badges from Phase 3 implementation:

**In Your Character List Page:**
```tsx
<CharacterCard
  key={character.id}
  character={character}
  variant="default"
  showOverride={true} {/* Show the color badge */}
  onView={() => handleViewCharacter(character.id)}
  onEdit={() => handleEditCharacter(character.id)}
/>
```

**The badge appears automatically if:**
1. `showOverride={true}` is passed
2. `character.color_override` is not null/undefined

**Visual Result:**
- Small circular badge in top-right of image
- Uses the actual color from `character.color_override`
- White border for visibility
- Tooltip shows the hex color value

**Time to Implement:** 5 minutes (just add `showOverride={true}`)
**Testing Time:** 10 minutes
**Total Phase 4:** 15 minutes

---

### Phase 5: Dark Mode Support (15 minutes) [OPTIONAL]

Add dark mode classes for future needs:

```tsx
{/* Character Information Section - with dark mode */}
<div className="p-4 bg-white dark:bg-gray-900">
  {/* Name */}
  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 truncate">
    {character.name}
  </h3>

  {/* Stats Grid */}
  <div className="space-y-1 mb-4">
    {character.class_name && (
      <div className="flex items-center text-sm">
        <span className="text-gray-600 dark:text-gray-400 font-medium mr-2">Class:</span>
        <span className="text-gray-900 dark:text-gray-100 font-semibold">{character.class_name}</span>
      </div>
    )}
    {/* ... other stats ... */}
  </div>
</div>
```

**Optional** - Only implement if dark mode is a requirement.

**Time to Implement:** 10 minutes
**Testing Time:** 5 minutes
**Total Phase 5:** 15 minutes

---

## Testing Checklist

After each phase, test:

### Visual Testing
- [ ] Cards display correctly on mobile (< 640px)
- [ ] Cards display correctly on tablet (640-1024px)
- [ ] Cards display correctly on desktop (> 1024px)
- [ ] Class-based colors appear correctly
- [ ] Color override badge appears (if showOverride=true)
- [ ] Skeleton loading state works
- [ ] Placeholder shows for missing images

### Interaction Testing
- [ ] View button click works
- [ ] Edit button click works
- [ ] Hover state shows shadow increase
- [ ] Touch feedback on mobile
- [ ] Links are keyboard accessible

### Performance Testing
```bash
# In your frontend directory
npm run build

# Check bundle size
ls -lh .next/static/chunks
```

### Responsive Testing
```bash
# Test in Chrome DevTools
# Toggle device toolbar (Cmd+Shift+M or Ctrl+Shift+M)

# Test breakpoints:
# 375px (mobile)
# 768px (tablet)
# 1024px (desktop)
# 1280px (large)
```

---

## Quick Implementation (Copy-Paste Ready)

### Complete Enhanced CharacterCard.tsx

```tsx
'use client';

import { Character } from '@/lib/api';

interface CharacterCardProps {
  character: Character;
  variant?: 'default' | 'compact' | 'detailed';
  showOverride?: boolean;
  onEdit?: () => void;
  onView?: () => void;
}

const CLASS_COLORS: Record<string, string> = {
  'Barbarian': 'border-l-4 border-red-600',
  'Bard': 'border-l-4 border-purple-600',
  'Cleric': 'border-l-4 border-yellow-600',
  'Druid': 'border-l-4 border-green-600',
  'Fighter': 'border-l-4 border-gray-600',
  'Monk': 'border-l-4 border-blue-600',
  'Paladin': 'border-l-4 border-indigo-600',
  'Ranger': 'border-l-4 border-teal-600',
  'Rogue': 'border-l-4 border-slate-600',
  'Sorcerer': 'border-l-4 border-pink-600',
  'Warlock': 'border-l-4 border-violet-600',
  'Wizard': 'border-l-4 border-cyan-600',
};

const IMAGE_HEIGHT: Record<string, string> = {
  'default': 'h-64',
  'compact': 'h-48',
  'detailed': 'h-80',
};

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  variant = 'default',
  showOverride = false,
  onEdit,
  onView,
}) => {
  const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="48" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';

  const borderClass = CLASS_COLORS[character.class_name] || 'border-l-4 border-gray-400';
  const imageHeight = IMAGE_HEIGHT[variant];

  return (
    <div
      className={`
        bg-white rounded-lg shadow-md overflow-hidden
        hover:shadow-lg transition-shadow duration-200
        ${borderClass}
      `}
    >
      <div className={`relative w-full ${imageHeight} bg-gray-200 overflow-hidden`}>
        <img
          src={character.image_url || placeholderImage}
          alt={character.name}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = placeholderImage;
          }}
        />

        {showOverride && character.color_override && (
          <div
            className="absolute top-2 right-2 w-6 h-6 rounded-full shadow-lg border-2 border-white"
            style={{ backgroundColor: character.color_override }}
            title={`Color: ${character.color_override}`}
          />
        )}
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
          {character.name}
        </h3>

        <div className="space-y-1 mb-4">
          {character.class_name && (
            <div className="flex items-center text-sm">
              <span className="text-gray-600 font-medium mr-2">Class:</span>
              <span className="text-gray-900 font-semibold">{character.class_name}</span>
            </div>
          )}

          {character.race && (
            <div className="flex items-center text-sm">
              <span className="text-gray-600 font-medium mr-2">Race:</span>
              <span className="text-gray-900">{character.race}</span>
            </div>
          )}

          {character.player_name && (
            <div className="flex items-center text-sm">
              <span className="text-gray-600 font-medium mr-2">Player:</span>
              <span className="text-gray-900 italic">{character.player_name}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onView}
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            View
          </button>
          <button
            onClick={onEdit}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export const CharacterCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse border-l-4 border-gray-300">
      <div className="w-full h-64 bg-gray-300" />
      <div className="p-4">
        <div className="h-6 bg-gray-300 rounded mb-3 w-3/4" />
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-gray-300 rounded" />
          <div className="flex-1 h-10 bg-gray-300 rounded" />
        </div>
      </div>
    </div>
  );
};
```

---

## File-by-File Changes

### File 1: `/frontend/src/components/CharacterCard.tsx`

**Change Type**: Enhancement
**Lines Changed**: ~50
**Time to Implement**: 5 minutes (copy-paste)
**Breaking Changes**: None (backward compatible)

Replace with the enhanced version above.

### File 2: `/frontend/src/app/admin/campaigns/[id]/characters/page.tsx`

**Change Type**: Minor enhancement
**Lines Changed**: 2
**Time to Implement**: 2 minutes

Change line 157 from:
```tsx
<CharacterCard
  key={character.id}
  character={character}
  onView={() => handleViewCharacter(character.id)}
  onEdit={() => handleEditCharacter(character.id)}
/>
```

To:
```tsx
<CharacterCard
  key={character.id}
  character={character}
  variant="default"
  showOverride={true}
  onView={() => handleViewCharacter(character.id)}
  onEdit={() => handleEditCharacter(character.id)}
/>
```

**Why**: Enables variant system and color override badges.

---

## Deployment Steps

1. **Update Component**
   ```bash
   # Copy enhanced CharacterCard.tsx
   cp CARD_APPROACH_EVALUATION.md frontend/src/components/CharacterCard.tsx
   ```

2. **Update Character List Page**
   ```bash
   # Update the page.tsx to use new props
   # See File 2 above
   ```

3. **Test Locally**
   ```bash
   cd frontend
   npm run dev
   # Visit http://localhost:3000/admin/campaigns/[id]/characters
   ```

4. **Build for Production**
   ```bash
   npm run build
   # Check for TypeScript errors
   npm run lint
   ```

5. **Deploy**
   ```bash
   # Your deployment process
   ```

---

## Troubleshooting

### Issue: Cards look too large/small on mobile
**Solution**: Adjust the `IMAGE_HEIGHT` values
```tsx
const IMAGE_HEIGHT: Record<string, string> = {
  'default': 'h-56',  // Smaller on mobile
  'compact': 'h-40',
  'detailed': 'h-72',
};
```

### Issue: Class colors not appearing
**Solution**: Verify `character.class_name` matches the `CLASS_COLORS` keys exactly
```tsx
// Debug: Add console.log
console.log('Class name:', character.class_name);
console.log('Available colors:', Object.keys(CLASS_COLORS));
```

### Issue: Color override badge not showing
**Solution**: Verify two conditions:
1. `showOverride={true}` is passed
2. `character.color_override` has a value

```tsx
{/* Debug indicator */}
{!showOverride && <span>Override not enabled</span>}
{!character.color_override && <span>No color override value</span>}
```

### Issue: Grid not responsive on mobile
**Solution**: Verify Tailwind is processing your breakpoints
```bash
# Check your globals.css for @import "tailwindcss"
cat frontend/src/app/globals.css
```

---

## Performance Optimization (Optional)

### Use Next.js Image Component (for faster loads)

Replace:
```tsx
<img
  src={character.image_url || placeholderImage}
  alt={character.name}
  loading="lazy"
  className="w-full h-full object-cover"
/>
```

With:
```tsx
import Image from 'next/image';

<Image
  src={character.image_url || placeholderImage}
  alt={character.name}
  fill
  className="object-cover"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

**Benefits:**
- Automatic image optimization
- WebP format for supported browsers
- Lazy loading built-in
- Reduces image file sizes by 30-40%

**Time to Implement**: 10 minutes

---

## Summary

**Recommended Implementation Schedule:**

```
Hour 1:
- Copy enhanced CharacterCard.tsx
- Test in browser
- Verify class colors appear

Hour 2:
- Update character list page props
- Test variants (compact, default, detailed)
- Verify responsive layout

Hour 3:
- Add color override badge support
- Test with Phase 3 color data
- Performance testing

Hour 4:
- Optional: Add dark mode support
- Optional: Switch to Next.js Image component
- Build and deploy
```

**Total Time**: 4-5 hours for full implementation

---

## Next Steps

1. **Start with Phase 1** - Just copy the enhanced component
2. **Test immediately** - Verify no regressions
3. **Add variants gradually** - One phase at a time
4. **Deploy** - When confident
5. **Gather feedback** - From team/users
6. **Iterate** - Adjust colors, sizes as needed

---

**Document Generated**: 2025-11-22
**Status**: Ready for Implementation
**Next Step**: Begin with Phase 1 enhancement
