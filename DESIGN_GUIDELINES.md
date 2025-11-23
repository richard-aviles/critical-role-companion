# Critical Role Companion - UI/UX Design Guidelines

**Version:** 1.0
**Last Updated:** 2025-11-22
**Status:** Production Ready for Phase 3 Tier 3 (Public Campaign Pages)

---

## Executive Summary

The Critical Role Companion adopts a professional, modern design system optimized for tabletop RPG communities. Built on a blue-gray foundation with curated accent colors, the design prioritizes clarity, accessibility, and visual hierarchy to serve both admin users (campaign managers) and public viewers (stream audiences). This design system draws inspiration from industry-standard RPG tools (D&D Beyond, Baldur's Gate 3) while maintaining simplicity and performance. The implementation uses Tailwind CSS with a consistent 8px spacing scale, system-native typography, and component-based patterns that scale across desktop, tablet, and mobile devices.

---

## 1. Color Palette

### Primary Colors

These colors form the core UI foundation and should be used consistently across all interfaces.

#### Blue (Primary Action Color)
- **Brand Blue:** `#3b82f6` (Tailwind: `blue-600`)
  - **Usage:** Primary buttons, active states, important links, brand logo
  - **Context:** Conveys trust, action, and modernity - perfect for RPG interfaces
  - **Hex Reference:** `rgb(59, 130, 246)`
  - **Dark Variant:** `#2563eb` (Tailwind: `blue-700`) - for hover/active states
  - **Light Variant:** `#93c5fd` (Tailwind: `blue-300`) - for backgrounds
  - **Very Light:** `#dbeafe` (Tailwind: `blue-100`) - for subtle highlights

#### Gray (Secondary/Neutral)
- **Base Gray:** `#6b7280` (Tailwind: `gray-500`)
  - **Usage:** Secondary text, disabled states, subtle borders
  - **Context:** Professional, non-intrusive
- **Dark Gray:** `#374151` (Tailwind: `gray-700`)
  - **Usage:** Body text, form labels
- **Darker Gray:** `#111827` (Tailwind: `gray-900`)
  - **Usage:** Headings, high-contrast text
- **Light Gray:** `#e5e7eb` (Tailwind: `gray-200`)
  - **Usage:** Borders, dividers, light backgrounds
- **Lighter Gray:** `#f3f4f6` (Tailwind: `gray-100`)
  - **Usage:** Card backgrounds, subtle sections
- **Lightest Gray:** `#f9fafb` (Tailwind: `gray-50`)
  - **Usage:** Page backgrounds, subtle containers

### Accent Colors

Use accent colors sparingly and strategically. They should draw attention to important states and notifications.

#### Success Green
- **Color:** `#10b981` (Tailwind: `green-500`)
  - **Usage:** Success messages, published/active status, confirmation actions
  - **Hex Reference:** `rgb(16, 185, 133)`
  - **Light Variant:** `#d1fae5` (Tailwind: `green-100`) - for backgrounds
  - **Text Variant:** `#047857` (Tailwind: `green-700`) - for text/badges

#### Danger Red
- **Color:** `#ef4444` (Tailwind: `red-500`)
  - **Usage:** Error messages, dangerous actions (delete), warnings
  - **Hex Reference:** `rgb(239, 68, 68)`
  - **Light Variant:** `#fee2e2` (Tailwind: `red-100`) - for backgrounds
  - **Text Variant:** `#7f1d1d` (Tailwind: `red-900`) - for text/badges

#### Warning Orange
- **Color:** `#f59e0b` (Tailwind: `amber-500`)
  - **Usage:** Warning messages, pending/draft status, caution actions
  - **Hex Reference:** `rgb(245, 158, 11)`
  - **Light Variant:** `#fef3c7` (Tailwind: `amber-100`) - for backgrounds
  - **Text Variant:** `#92400e` (Tailwind: `amber-900`) - for text/badges

#### Info/Secondary Blue
- **Color:** `#06b6d4` (Tailwind: `cyan-500`)
  - **Usage:** Information messages, secondary actions, metadata
  - **Light Variant:** `#cffafe` (Tailwind: `cyan-100`) - for backgrounds

### Character Color Presets

Three predefined color themes for character cards (Phase 3 Tier 2):

#### Preset A: Gold & Warmth
- **Primary Border:** `#d97706` (Tailwind: `amber-600`)
- **Secondary Border:** `#f59e0b` (Tailwind: `amber-500`)
- **Text Color:** `#78350f` (Tailwind: `amber-900`)
- **Badge Color:** `#fbbf24` (Tailwind: `amber-400`)
- **Usage:** Warm, welcoming characters (bards, paladins, rogues with noble background)

#### Preset B: Twilight & Mystique
- **Primary Border:** `#8b5cf6` (Tailwind: `violet-500`)
- **Secondary Border:** `#6366f1` (Tailwind: `indigo-500`)
- **Text Color:** `#3730a3` (Tailwind: `indigo-900`)
- **Badge Color:** `#a78bfa` (Tailwind: `violet-300`)
- **Usage:** Mysterious, magical characters (wizards, warlocks, clerics)

#### Preset C: Emerald & Silver
- **Primary Border:** `#059669` (Tailwind: `emerald-600`)
- **Secondary Border:** `#10b981` (Tailwind: `emerald-500`)
- **Text Color:** `#064e3b` (Tailwind: `emerald-900`)
- **Badge Color:** `#6ee7b7` (Tailwind: `emerald-300`)
- **Usage:** Natural, stealthy characters (rangers, monks, druids)

### Background Colors

#### Light Mode
- **Page Background:** `#ffffff` (white)
  - Used for page body and main content areas
- **Card Background:** `#ffffff` (white)
  - Used for individual card containers
- **Section Background:** `#f9fafb` (Tailwind: `gray-50`)
  - Used for grouped sections, subtle differentiation
- **Input Background:** `#ffffff` (white)
  - Used for form fields and inputs

#### Dark Mode (Future - If Implemented)
- **Page Background:** `#0a0a0a`
- **Card Background:** `#1a1a1a`
- **Section Background:** `#141414`
- **Input Background:** `#1a1a1a`

### Text Colors

#### Primary Text
- **Color:** `#111827` (Tailwind: `gray-900`)
  - **Usage:** Headings, primary body text, high-contrast text
  - **Contrast Ratio:** 21:1 against white (AAA compliant)

#### Secondary Text
- **Color:** `#374151` (Tailwind: `gray-700`)
  - **Usage:** Subheadings, meta information, descriptions
  - **Contrast Ratio:** 11.5:1 against white (AAA compliant)

#### Tertiary/Muted Text
- **Color:** `#6b7280` (Tailwind: `gray-500`)
  - **Usage:** Labels, placeholders, disabled text, timestamps
  - **Contrast Ratio:** 5.5:1 against white (AA compliant)

#### Inverted (Light on Dark)
- **Primary:** `#ffffff` (white)
  - **Usage:** Text on dark backgrounds, button text
  - **Contrast Ratio:** 21:1 against `gray-900` (AAA compliant)
- **Secondary:** `#f3f4f6` (Tailwind: `gray-100`)
  - **Usage:** Secondary text on dark backgrounds

---

## 2. Typography System

System-native fonts are used for optimal performance and consistency across platforms.

### Font Stack
```css
font-family: Arial, Helvetica, sans-serif;
```

**Rationale:** System fonts load instantly, ensure consistency, and match users' OS expectations. Arial/Helvetica are universally available and highly legible.

### Heading Scale

#### H1 - Page Title
- **Size:** 32px (2rem / Tailwind: `text-4xl`)
- **Weight:** 700 (bold)
- **Line Height:** 1.25 (tight, 40px)
- **Letter Spacing:** -0.02em
- **Usage:** Main page heading, campaign title, character name (public pages)
- **Example:** "Critical Role Campaign Archive"
- **Margin Bottom:** 32px (4 × 8px)

#### H2 - Section Heading
- **Size:** 24px (1.5rem / Tailwind: `text-2xl`)
- **Weight:** 600 (semibold)
- **Line Height:** 1.33 (32px)
- **Letter Spacing:** -0.01em
- **Usage:** Major section headings, feature titles
- **Example:** "Character Roster" or "Episode Guide"
- **Margin Bottom:** 24px (3 × 8px)

#### H3 - Subsection Heading
- **Size:** 20px (1.25rem / Tailwind: `text-xl`)
- **Weight:** 600 (semibold)
- **Line Height:** 1.4 (28px)
- **Usage:** Card titles, component headings, subsections
- **Example:** "Wizard Stats" or "Recent Episodes"
- **Margin Bottom:** 16px (2 × 8px)

#### H4 - Minor Heading
- **Size:** 18px (1.125rem / Tailwind: `text-lg`)
- **Weight:** 600 (semibold)
- **Line Height:** 1.5 (27px)
- **Usage:** Tertiary headings, modal titles
- **Example:** "Set Color Override"
- **Margin Bottom:** 12px (1.5 × 8px)

### Body Text
- **Size:** 16px (1rem / Tailwind: `text-base`)
- **Weight:** 400 (normal)
- **Line Height:** 1.5 (24px / Tailwind: `leading-relaxed`)
- **Letter Spacing:** 0
- **Usage:** Primary paragraph text, descriptions, form labels
- **Color:** `gray-900` for primary, `gray-700` for secondary
- **Margin Bottom:** Between paragraphs: 16px (2 × 8px)

### Small/Label Text
- **Size:** 14px (0.875rem / Tailwind: `text-sm`)
- **Weight:** 500 (medium)
- **Line Height:** 1.43 (20px)
- **Usage:** Form labels, helper text, badges, timestamps
- **Color:** `gray-600` (Tailwind: `gray-600`)
- **Example:** "Character Class" label in forms

### Code/Monospace Text
- **Font Stack:** `Monaco, Menlo, 'Courier New', monospace`
- **Size:** 13px (0.8125rem)
- **Weight:** 400
- **Line Height:** 1.5
- **Usage:** Code blocks, system values, technical tokens
- **Background:** `gray-100` with `gray-700` text
- **Border Radius:** 4px
- **Padding:** 8px 12px

### Typography Hierarchy Examples

```
Page Title (H1)
  32px, bold, -40px margin-bottom

Section Heading (H2)
  24px, semibold, -24px margin-bottom

Card Title (H3)
  20px, semibold, -16px margin-bottom

Body Text
  16px, regular, -16px margin-bottom between paragraphs

Form Label (Small)
  14px, medium, gray-600
```

---

## 3. Spacing & Layout

The design system uses an 8px baseline grid for all spacing, margins, and padding. This ensures visual consistency and makes scaling across devices predictable.

### Spacing Scale

All spacing uses multiples of 8px. This provides:
- Consistency across the entire application
- Scalability to different screen sizes
- Mathematical relationship between spacing values
- Easy maintenance and updates

```
4px  = 0.5 × 8px  (xs)
8px  = 1 × 8px    (sm)
12px = 1.5 × 8px  (xs-md)
16px = 2 × 8px    (md)
24px = 3 × 8px    (lg)
32px = 4 × 8px    (xl)
40px = 5 × 8px    (2xl)
48px = 6 × 8px    (3xl)
56px = 7 × 8px    (4xl)
64px = 8 × 8px    (5xl)
```

### Padding Guidelines

#### Card Padding
- **Small Cards:** 16px padding (character cards, episode cards)
- **Medium Cards:** 24px padding (detail sections, forms)
- **Large Cards:** 32px padding (full-width sections, modals)

**Tailwind Classes:** `p-4` (16px), `p-6` (24px), `p-8` (32px)

#### Form Field Padding
- **Input Fields:** 12px vertical, 16px horizontal
  - `py-3 px-4` in Tailwind
- **Form Labels:** 8px bottom margin

#### Button Padding
- **Small Buttons:** 8px vertical, 12px horizontal (`py-2 px-3`)
- **Regular Buttons:** 10px vertical, 16px horizontal (`py-2.5 px-4`)
- **Large Buttons:** 12px vertical, 20px horizontal (`py-3 px-5`)

### Margin Guidelines

#### Between Sections
- **Major Sections:** 48px margin (`mb-12` in Tailwind)
- **Subsections:** 32px margin (`mb-8`)
- **Related Items:** 16px margin (`mb-4`)

#### Heading Bottom Margin (Space After)
- **H1:** 32px (`mb-8`)
- **H2:** 24px (`mb-6`)
- **H3:** 16px (`mb-4`)
- **H4:** 12px (`mb-3`)
- **Body Text:** 16px between paragraphs (`mb-4`)

### Grid & Responsive Layout

#### Column Structure
- **Desktop (≥1024px):** 12 columns
- **Tablet (768px-1023px):** 8 columns
- **Mobile (<768px):** 4 columns

#### Card Grid Layouts
- **Desktop:** Up to 4 columns per row
  - `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- **Tablet:** 2-3 columns per row
  - `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Mobile:** Single column
  - `grid-cols-1`

#### Gap Sizes
- **Between Cards:** 24px gap (`gap-6`)
- **Between Elements:** 16px gap (`gap-4`)
- **Between Related Items:** 8px gap (`gap-2`)

**Tailwind Gap Classes:** `gap-2`, `gap-4`, `gap-6`, `gap-8`

### Whitespace Best Practices

1. **Breathing Room:** Always provide whitespace around important elements
2. **Proximity Principle:** Group related items closer, separate unrelated items
3. **Visual Hierarchy:** Use whitespace to guide user's eye
4. **Mobile First:** Ensure adequate padding on mobile (minimum 16px margins)

**Example - Card with Proper Whitespace:**
```
[16px padding]
H3 Title (20px font)
[16px margin-bottom]
Card description text (16px font)
[16px margin-bottom]
[Footer buttons]
[16px padding]
```

---

## 4. Component Patterns

### Button Styles

All buttons should have consistent sizing, spacing, and interaction patterns.

#### Primary Button
- **Background:** `#3b82f6` (blue-600)
- **Text Color:** white
- **Padding:** `py-2.5 px-4` (Tailwind)
- **Border Radius:** `rounded-md` (4px)
- **Hover State:** `#2563eb` (blue-700) background
- **Active State:** `#1d4ed8` (blue-800) background
- **Disabled State:** `#9ca3af` (gray-400) background, cursor-not-allowed
- **Font Weight:** 500 (medium)
- **Font Size:** 14px-16px
- **Transition:** `transition-colors` (200ms)

**Usage:** Primary actions (Create, Save, Submit, View, Edit)

**Code Example:**
```tsx
<button className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
  Primary Action
</button>
```

#### Secondary Button
- **Background:** white
- **Border:** 1px solid `#d1d5db` (gray-300)
- **Text Color:** `#374151` (gray-700)
- **Padding:** `py-2.5 px-4`
- **Border Radius:** `rounded-md`
- **Hover State:** `#f3f4f6` (gray-100) background
- **Active State:** `#e5e7eb` (gray-200) background
- **Font Weight:** 500
- **Font Size:** 14px-16px

**Usage:** Secondary actions (Cancel, Back, Edit, More Options)

**Code Example:**
```tsx
<button className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors">
  Secondary Action
</button>
```

#### Danger Button (Delete)
- **Background:** `#ef4444` (red-500)
- **Text Color:** white
- **Padding:** `py-2.5 px-4`
- **Border Radius:** `rounded-md`
- **Hover State:** `#dc2626` (red-600) background
- **Active State:** `#b91c1c` (red-700) background
- **Font Weight:** 500
- **Font Size:** 14px-16px

**Usage:** Destructive actions (Delete, Remove, Clear)

**Code Example:**
```tsx
<button className="px-4 py-2.5 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 active:bg-red-700 transition-colors">
  Delete
</button>
```

#### Ghost/Tertiary Button
- **Background:** transparent
- **Text Color:** `#3b82f6` (blue-600)
- **Padding:** `py-2.5 px-4`
- **Border Radius:** `rounded-md`
- **Hover State:** `#dbeafe` (blue-100) background
- **Active State:** `#bfdbfe` (blue-200) background
- **Font Weight:** 500
- **Font Size:** 14px-16px

**Usage:** Tertiary actions (Help, Info, Learn More)

**Code Example:**
```tsx
<button className="px-4 py-2.5 text-blue-600 hover:bg-blue-100 active:bg-blue-200 rounded-md transition-colors">
  Tertiary Action
</button>
```

### Button States

**Hover State:**
- Background color darkens by 1 shade
- Cursor changes to pointer
- Shadow may slightly increase

**Active/Pressed State:**
- Background color darkens by 2 shades
- Subtle inset effect (optional)

**Disabled State:**
- Background becomes gray-400
- Text becomes gray-500
- Cursor becomes not-allowed
- Opacity: 65%
- No hover effects

**Focus State (for accessibility):**
- Outline: 2px solid `#3b82f6`
- Outline offset: 2px
- Required for keyboard navigation

### Card Layout Patterns

#### Character Card (Public View)
```
┌─────────────────────────┐
│                         │
│    [Character Image]    │  ← 256px height (h-64)
│    (aspect-ratio: 1:1)  │
│                         │
├─────────────────────────┤
│ Character Name (H3)     │  ← 20px bold
│ [16px margin-bottom]    │
├─────────────────────────┤
│ Class: Wizard           │  ← 14px, gray-600
│ Race: Elf               │
│ Player: Sam Riegel      │
│ [24px margin-bottom]    │
├─────────────────────────┤
│  [View Button] [Edit]   │  ← Secondary actions
└─────────────────────────┘
```

**Technical Implementation:**
```tsx
<div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
  <div className="relative w-full h-64 bg-gray-200">
    <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
  </div>

  <div className="p-4">
    <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>

    <div className="space-y-1 mb-4">
      <div className="text-sm">
        <span className="font-medium text-gray-600">Class:</span>
        <span className="text-gray-900">{className}</span>
      </div>
      {/* More stats */}
    </div>

    <div className="flex gap-2">
      <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
        View
      </button>
      <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
        Edit
      </button>
    </div>
  </div>
</div>
```

#### Episode Card
```
┌──────────────────────────┐
│ [S01E03] [Published]     │  ← Status badges
├──────────────────────────┤
│ The Expedition Begins     │  ← 18px bold
│ [8px margin-bottom]      │
├──────────────────────────┤
│ 📅 Nov 12, 2015          │  ← Meta info
│ ⏱️  4h 23m               │
│ [16px margin-bottom]     │
├──────────────────────────┤
│  [View] [Edit]           │  ← Actions
└──────────────────────────┘
```

#### Form Section
```
┌──────────────────────────┐
│ Field Label              │  ← 14px bold
│ [8px margin-bottom]      │
│ [Input field]            │  ← 16px content
│ [12px margin-bottom]     │
│ Helper text (optional)   │  ← 12px gray-600
│ [24px margin-bottom]     │
├──────────────────────────┤
│ Next Field...            │
└──────────────────────────┘
```

### Form Field Patterns

#### Text Input
- **Height:** 40px (`py-3 px-4`)
- **Border:** 1px solid `#d1d5db` (gray-300)
- **Border Radius:** 4px (`rounded-md`)
- **Background:** white
- **Font Size:** 16px
- **Focus State:**
  - Border color: `#3b82f6` (blue-600)
  - Outline: 2px solid blue-200
  - Outline offset: 2px

#### Text Area
- **Min Height:** 120px
- **Max Height:** 400px
- **Padding:** `py-3 px-4`
- **Border:** 1px solid gray-300
- **Resize:** vertical
- **Font Size:** 14px

#### Select/Dropdown
- **Height:** 40px
- **Padding:** `py-3 px-4`
- **Border:** 1px solid gray-300
- **Border Radius:** 4px
- **Arrow Icon:** Built-in or custom

#### Checkbox
- **Size:** 18px × 18px
- **Border Radius:** 3px
- **Checked Background:** blue-600
- **Label Margin:** 8px left

#### Radio Button
- **Size:** 18px × 18px
- **Border Radius:** 50%
- **Checked Background:** blue-600
- **Label Margin:** 8px left

### Error/Success Message Patterns

#### Error Message
- **Background:** `#fee2e2` (red-100)
- **Text Color:** `#7f1d1d` (red-900)
- **Border:** 1px solid `#fecaca` (red-200)
- **Padding:** 12px 16px
- **Border Radius:** 4px
- **Icon:** ✕ or ⚠️ (left side)
- **Margin Bottom:** 16px

**Code Example:**
```tsx
<div className="bg-red-100 border border-red-200 text-red-900 px-4 py-3 rounded-md flex gap-3">
  <svg className="w-5 h-5 flex-shrink-0">...</svg>
  <p>An error occurred. Please try again.</p>
</div>
```

#### Success Message
- **Background:** `#d1fae5` (green-100)
- **Text Color:** `#047857` (green-700)
- **Border:** 1px solid `#a7f3d0` (green-200)
- **Padding:** 12px 16px
- **Border Radius:** 4px
- **Icon:** ✓ (left side)
- **Margin Bottom:** 16px

#### Warning Message
- **Background:** `#fef3c7` (amber-100)
- **Text Color:** `#92400e` (amber-900)
- **Border:** 1px solid `#fde68a` (amber-200)
- **Padding:** 12px 16px
- **Border Radius:** 4px
- **Icon:** ⚠️ (left side)

#### Info Message
- **Background:** `#cffafe` (cyan-100)
- **Text Color:** `#164e63` (cyan-900)
- **Border:** 1px solid `#a5f3fc` (cyan-200)
- **Padding:** 12px 16px
- **Border Radius:** 4px
- **Icon:** ℹ️ (left side)

### Navigation Patterns

#### Sticky Header (Admin Interface)
```
┌──────────────────────────────────────┐
│  [CR Logo] App Name    |  User    ☰  │  ← sticky top
├──────────────────────────────────────┤
│ [Main Content Area]                  │
└──────────────────────────────────────┘
```

**Implementation:**
```tsx
<header className="bg-white shadow sticky top-0 z-40">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
    <div className="flex justify-between items-center">
      {/* Logo/Home */}
      {/* Title */}
      {/* User Menu */}
    </div>
  </div>
</header>
```

#### Breadcrumb Navigation
- **Font Size:** 14px
- **Text Color:** gray-600
- **Separator:** "/" character with 8px margins
- **Active Link:** blue-600
- **Hover State:** underline, darker blue

**Example:** `Home / Campaigns / Campaign Name / Characters / Character Name`

#### Tab Navigation
- **Font Size:** 14px
- **Padding:** 12px 16px
- **Border Bottom:** 2px solid transparent
- **Active State:**
  - Border color: blue-600
  - Text color: blue-600
- **Inactive State:**
  - Text color: gray-600
  - Hover: gray-900

---

## 5. Character Card Specification

The character card is a critical component for both admin and public views. It displays essential character information with support for custom color theming.

### Card Dimensions

#### Desktop (≥1024px)
- **Width:** Responsive (4 columns, ~25% of container)
- **Typical Width:** 280-320px
- **Height:** Auto (content-based)

#### Tablet (768px-1023px)
- **Width:** Responsive (2-3 columns, ~33-50% of container)
- **Typical Width:** 300-350px

#### Mobile (<768px)
- **Width:** 100% of container
- **Padding:** 16px margins on sides

### Image Display

- **Aspect Ratio:** 1:1 (square)
- **Height:** 256px (h-64 in Tailwind)
- **Object-fit:** `cover` (maintains aspect, fills space)
- **Fallback Image:** Gray placeholder with "No Image" text
- **Loading:** `lazy` loading attribute
- **Alt Text:** Character name (accessibility)

**Image Handling Code:**
```tsx
const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="..." width="400" height="400"%3E...%3C/svg%3E';

<div className="relative w-full h-64 bg-gray-200">
  <img
    src={character.image_url || placeholderImage}
    alt={character.name}
    loading="lazy"
    className="w-full h-full object-cover"
    onError={(e) => {
      (e.target as HTMLImageElement).src = placeholderImage;
    }}
  />
</div>
```

### Character Information Display

#### Name (Card Title)
- **Font Size:** 20px (H3 style)
- **Font Weight:** 700 (bold)
- **Color:** gray-900 (primary text)
- **Margin Bottom:** 16px
- **Max Lines:** 2 (with `line-clamp-2`)
- **Color Override:** When custom theme applied, use override text color

#### Character Stats/Attributes (Recommended Order)

1. **Class** (e.g., "Wizard", "Rogue")
   - Label: "Class:" (14px, medium, gray-600)
   - Value: Character class (14px, normal, gray-900)
   - Separator: 2px margin between label and value

2. **Race** (e.g., "Half-Elf", "Dwarf")
   - Same styling as class

3. **Level** (if tracked)
   - Format: "Level 8" or "Lvl 8"
   - Color: gray-900

4. **Player Name** (NPC vs PC indicator)
   - Label: "Player:" or "Played by:"
   - Format: Actual player name or "NPC"

5. **Status** (Optional - for admin only)
   - Active/Inactive badge
   - Colors: green-100 bg / green-700 text (active)
   - Colors: gray-100 bg / gray-600 text (inactive)

**Layout Code:**
```tsx
<div className="p-4">
  <h3 className="text-xl font-bold text-gray-900 mb-2">
    {character.name}
  </h3>

  <div className="space-y-1 mb-4">
    {character.class_name && (
      <div className="flex items-center text-sm">
        <span className="text-gray-600 font-medium mr-2">Class:</span>
        <span className="text-gray-900">{character.class_name}</span>
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
        <span className="text-gray-900">{character.player_name}</span>
      </div>
    )}
  </div>

  <div className="flex gap-2">
    <button className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
      View
    </button>
    <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50">
      Edit
    </button>
  </div>
</div>
```

### Color Override Integration

When a character has a custom color theme:

1. **Card Border** (if colored):
   - Border color: Use `border_colors[0]` from override
   - Border width: 2px
   - Example: `border-l-4` (left border accent)

2. **Character Name**:
   - Text color: Use `text_color` from override
   - Weight: Keep bold (700)

3. **Stats Badges** (if implementing):
   - Background: Use `badge_colors[0]` from override
   - Text: white or auto-contrast
   - Example: HP display in badge

4. **Hover State**:
   - Shadow increases on hover
   - Transition: `transition-shadow` 200ms

**Color Application Code:**
```tsx
<div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
     style={character.color_theme_override && {
       borderLeft: `4px solid ${character.color_theme_override.border_colors[0]}`,
     }}>

  {/* Image */}

  <div className="p-4">
    <h3 className="text-xl font-bold mb-2"
        style={character.color_theme_override && {
          color: character.color_theme_override.text_color,
        }}>
      {character.name}
    </h3>
    {/* Rest of content */}
  </div>
</div>
```

### Hover & Interaction States

#### Hover State (Desktop)
- **Shadow:** Increases from `shadow-md` to `shadow-lg`
- **Cursor:** Changes to pointer
- **Transform:** Optional slight scale (1.02x) - use sparingly
- **Duration:** 200ms transition

#### Mobile Tap State
- **Shadow:** Temporary increase
- **No transform:** Avoid scale on mobile (feels delayed)
- **Feedback:** Use opacity or color change instead

---

## 6. Admin Interface Consistency

Admin pages should follow consistent patterns for forms, buttons, navigation, and data display.

### Admin Layout Structure

```
┌──────────────────────────────────────────┐
│ [Header: Logo - Title - User - Logout]   │ ← Sticky, z-40
├──────────────────────────────────────────┤
│ [Breadcrumb Navigation]                  │ ← gray-600
├──────────────────────────────────────────┤
│                                          │
│  [Page Title]                            │ ← H1, 32px bold
│  [Page Description]                      │ ← Optional, gray-600
│                                          │
│  [Add/Create Button] [Search/Filter]     │ ← Top right buttons
│                                          │
│  [Main Content Grid/List]                │
│  [Pagination if needed]                  │
│                                          │
└──────────────────────────────────────────┘
```

### Admin Header Component

**Specifications:**
- **Background:** white
- **Height:** 64px (py-4)
- **Shadow:** `shadow` (subtle drop shadow)
- **Sticky:** `sticky top-0 z-40`
- **Max Width:** `max-w-7xl` centered with padding
- **Layout:** Flex with space-between

**Content:**
- **Left:** Logo + App name + optional page title
- **Right:** User email + Logout button

**Navigation:** Links/breadcrumbs in gray-700, hover underline

### Form Patterns

#### Form Container
- **Max Width:** 600px for single-column forms
- **Width:** 100% on mobile, constrained on desktop
- **Padding:** 24px on desktop, 16px on mobile
- **Background:** white or gray-50
- **Border Radius:** 8px
- **Shadow:** `shadow-sm` (optional)

#### Form Section
- **Margin Between Fields:** 24px (space-y-6)
- **Margin Between Sections:** 32px (space-y-8)
- **Group Related Fields:** Use section dividers

#### Field Layout
```
┌─────────────────────────┐
│ Label *                 │  ← 14px bold, red asterisk if required
│ [16px margin-bottom]    │
│ [Input field]           │  ← 40px height
│ [8px margin-bottom]     │
│ Helper text or error    │  ← 12px gray-600
│ [24px margin-bottom]    │
└─────────────────────────┘
```

#### Multi-Column Forms
- **Desktop (≥1024px):** 2 columns
  - Use `grid grid-cols-2 gap-6`
- **Tablet (768px-1023px):** 1-2 columns (flexible)
  - Use `grid grid-cols-1 md:grid-cols-2 gap-6`
- **Mobile (<768px):** 1 column
  - Use `grid grid-cols-1 gap-4`

### Data Display (Tables/Lists)

#### Table Header
- **Background:** gray-50
- **Text:** gray-900, 14px bold
- **Padding:** 12px 16px
- **Border Bottom:** 1px solid gray-200
- **Sticky:** Optional `sticky top-0`

#### Table Row
- **Padding:** 12px 16px
- **Height:** 48px (3 × 16px)
- **Border Bottom:** 1px solid gray-200
- **Hover State:** Background becomes gray-50

#### Table Cell Content
- **Text Size:** 14px
- **Text Color:** gray-900 (primary), gray-600 (secondary)
- **Alignment:** Left-aligned for text, right-aligned for numbers
- **Truncation:** Use `truncate` for long text, tooltip on hover

### Error Handling Display

#### Form Field Error
```
Field Label *
[Input field] ← 1px red-500 border, red-100 background
Error message ← 12px, red-700, icon (!)
```

**Code:**
```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Field Label
  </label>
  <input
    className={`w-full px-4 py-3 border rounded-md ${
      error
        ? 'border-red-500 bg-red-50'
        : 'border-gray-300 bg-white'
    }`}
  />
  {error && (
    <p className="text-sm text-red-700 mt-2 flex gap-1">
      <span>⚠️</span> {error}
    </p>
  )}
</div>
```

#### Page-Level Error
- **Display:** Top of page, below header
- **Style:** Full-width alert box
- **Background:** red-100, red-700 text, red-200 border
- **Actions:** Dismiss button, optional retry button

#### Loading State
- **Skeleton Screens:** Gray placeholders that pulse
- **Spinners:** Centered, blue-600 color, subtle animation
- **Text:** "Loading..." with optional ellipsis animation
- **Disable Buttons:** Gray out, disable interaction

### Button Placement Conventions

#### Page Header Buttons
```
[← Back] [Page Title]          [Add New] [Search ▼]
```
- **Left:** Back/navigation buttons
- **Center:** Page title
- **Right:** Primary actions (Create, Export, etc.)

#### Form Buttons
```
[Cancel] [Save]
```
- **Left:** Secondary (Cancel, Reset)
- **Right:** Primary (Save, Submit)
- **Spacing:** 12px between buttons

#### Card Action Buttons
```
[View] [Edit] [Delete]
```
- **Layout:** Horizontal, full-width within card
- **Spacing:** 8px gaps
- **Primary:** View or Edit (full-width on mobile)
- **Danger:** Delete (right-aligned, distinct color)

### Status Badges

#### Published Badge
- **Background:** green-100
- **Text:** green-700
- **Border:** green-200
- **Text:** "Published"

#### Draft Badge
- **Background:** gray-100
- **Text:** gray-700
- **Border:** gray-200
- **Text:** "Draft"

#### Active Badge
- **Background:** green-100
- **Text:** green-700
- **Text:** "Active"

#### Inactive Badge
- **Background:** gray-100
- **Text:** gray-600
- **Text:** "Inactive"

---

## 7. Public Campaign Page Design

Public pages are read-only, optimized for viewers, and should emphasize visual appeal while maintaining performance.

### Public Campaign Homepage

#### Hero Section
```
┌──────────────────────────────────────┐
│      [Campaign Background Image]     │  ← Full width, 300-400px height
│                                      │
│  Campaign Title                      │  ← H1, white text, centered
│  Tagline or Description              │  ← H2, gray-100, centered
│                                      │
│  [View Characters] [View Episodes]   │  ← Blue buttons
└──────────────────────────────────────┘
```

**Specifications:**
- **Height:** 300px (mobile), 400px (desktop)
- **Background Image:** Campaign image or pattern
- **Overlay:** Dark gradient (0.5 opacity, black to transparent)
- **Text Alignment:** Center
- **Text Color:** white
- **Buttons:** Primary style (blue), prominent placement

#### Campaign Stats Section
```
Characters: 5    Episodes: 48    Status: Active    Duration: 2 Years
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Specifications:**
- **Layout:** 4 columns on desktop, responsive
- **Stats Format:** Number (bold) + Label
- **Background:** gray-50 or white
- **Padding:** 32px vertical, 16px horizontal
- **Border:** Bottom border gray-200

#### Navigation Links Section
```
[Character Roster] [Episode Guide] [Timeline] [About Campaign]
```

**Specifications:**
- **Style:** Horizontal card/pill buttons
- **Background:** blue-600 (primary color)
- **Text:** white
- **Padding:** 12px 24px
- **Border Radius:** 24px (pill shape)
- **Gap:** 16px between buttons

### Character Roster Page

#### Grid Layout
```
[Character 1] [Character 2] [Character 3] [Character 4]
[Character 5] [Character 6] [Character 7] [Character 8]
```

**Specifications:**
- **Desktop:** 4 columns (`grid-cols-4`)
- **Tablet:** 2-3 columns (`grid-cols-2 lg:grid-cols-3`)
- **Mobile:** 1 column
- **Gap:** 24px (`gap-6`)
- **Max Content Width:** 1200px

#### Search/Filter Bar
```
[🔍 Search by name]  [Filter by Class ▼]  [Filter by Race ▼]
```

**Specifications:**
- **Position:** Top of roster, full width
- **Layout:** Flex with gap-4
- **Search Input:**
  - Placeholder: "Search characters..."
  - Icon: Magnifying glass
  - Width: Flex-grow
- **Filter Dropdowns:**
  - Options: All, Class A, Class B, etc.
  - Default: "All"

### Episode Guide Page

#### Timeline View
```
┌─────────────────────────────────────────┐
│ Season 1                                │
│                                         │
│ • Episode 1 (Jan 14, 2015)- 4h 23m    │
│ • Episode 2 (Jan 21, 2015) - 3h 59m   │
│                                         │
│ Season 2                                │
│                                         │
│ • Episode 1 (Oct 21, 2015) - 3h 37m   │
│ • Episode 2 (Oct 28, 2015) - 4h 12m   │
└─────────────────────────────────────────┘
```

**Specifications:**
- **Episode Card Style:** Minimal, text-based
- **Season Header:** Bold, gray-900, 20px
- **Episode Item:**
  - Bullet point
  - Title (blue-600, hover underline)
  - Metadata: Date, runtime (gray-600)
  - Padding: 12px left
- **Spacing:** 8px between items, 24px between seasons

### Character Detail Page

#### Layout Structure
```
┌───────────────────────────────────────┐
│ [Character Image]  │  Character Info  │  ← Sidebar layout
│   (250-300px)      │                  │
│                    │ Name (H1)        │
│                    │ Class: X, Level Y │
│                    │ Player: Name     │
│                    │                  │
│                    │ Description      │
│                    │                  │
│                    │ Backstory        │
└───────────────────────────────────────┘
```

**Specifications:**
- **Desktop:** 2-column layout (30% image, 70% content)
- **Tablet:** 1-column with image above
- **Mobile:** Full-width, stacked
- **Image:** Rounded corners, `rounded-lg`
- **Info Box:** `bg-gray-50`, padding 24px, rounded corners
- **Spacing:** 32px gap between columns

---

## 8. Accessibility Standards

All interfaces must meet WCAG 2.1 AA minimum standards.

### Color Contrast Ratios

**Text Color Contrast:**
- **Primary Text (gray-900 on white):** 21:1 (AAA)
- **Secondary Text (gray-700 on white):** 11.5:1 (AAA)
- **Tertiary Text (gray-600 on white):** 7:1 (AA)
- **Body Text on gray-50 background:** 18:1 (AAA)

**Interactive Elements:**
- **Button text on button background:** Minimum 4.5:1
- **Links:** Minimum 4.5:1, underlined or distinct from surrounding text
- **Focus indicators:** 3:1 minimum contrast with adjacent colors

**Non-Text Contrast:**
- **Borders and icons:** Minimum 3:1 against background
- **Form input borders:** 3:1 against page background
- **Disabled states:** 3:1 if meaningful

### Color Usage Rules

1. **Never rely only on color** to convey information
   - Use icons, text, patterns, or borders
   - Example: Don't use color alone for error state - add icon and message

2. **Status Indicators** should include text or icon
   ```
   ✓ Active (not just green)
   ✕ Error (not just red)
   ⚠ Warning (not just orange)
   ```

3. **Links** should be underlined or bold in addition to color
   ```
   Don't: <a className="text-blue-600">Link</a>
   Do:    <a className="text-blue-600 underline">Link</a>
   ```

4. **Character Color Overrides** must maintain minimum contrast
   - Ensure text color has 4.5:1 contrast with background
   - Use white text on dark override colors
   - Fall back to gray-900 if custom color too light

### Focus States for Keyboard Navigation

**Button Focus:**
```tsx
className="focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
```

**Form Input Focus:**
```tsx
className="focus:ring-2 focus:ring-blue-300 focus:border-blue-600"
```

**Link Focus:**
```tsx
className="focus:outline-2 focus:outline-offset-2 focus:outline-blue-600 underline"
```

**Focus Ring Specifications:**
- **Color:** blue-600 (`#3b82f6`)
- **Width:** 2px (`outline-2`)
- **Offset:** 2px (`outline-offset-2`)
- **Visible:** High contrast against background

### Minimum Text Sizing

- **Body Text:** Minimum 14px (16px preferred)
- **Form Labels:** Minimum 14px
- **Helper Text:** Minimum 12px (not critical content)
- **Headings:** Proportional scale (see Typography section)

### ARIA Labels & Accessibility

**Form Labels:**
```tsx
<label htmlFor="character-name" className="block text-sm font-medium">
  Character Name
</label>
<input id="character-name" type="text" />
```

**Icon Buttons (no visible text):**
```tsx
<button aria-label="Delete character">
  <TrashIcon />
</button>
```

**Landmark Navigation:**
```tsx
<header><!-- Header content --></header>
<main><!-- Main content --></main>
<footer><!-- Footer content --></footer>
```

**Semantic HTML:**
- Use `<button>` for buttons, not `<div>`
- Use `<h1>`, `<h2>`, etc. for headings
- Use `<nav>` for navigation
- Use `<article>` for content sections

### Keyboard Navigation

All interactive elements must be keyboard accessible:
- **Tab:** Move to next element
- **Shift+Tab:** Move to previous element
- **Enter:** Activate button
- **Space:** Toggle checkbox/radio
- **Arrow Keys:** Navigate menu/select options
- **Esc:** Close modals/dropdowns

---

## 9. Visual Examples & ASCII Sketches

### Example 1: Character Roster Page (Desktop)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Critical Role Companion                                    User  Logout │ ← Header
├─────────────────────────────────────────────────────────────────────────┤
│ Campaigns > Exandria Unlimited > Characters                             │ ← Breadcrumb
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Character Roster                                                       │
│  Explore the adventurers of Exandria Unlimited                         │
│                                                                         │
│  [🔍 Search]  [Filter: All Classes ▼]  [Filter: All Races ▼]        │
│                                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │
│  │             │ │             │ │             │ │             │     │
│  │  [IMAGE]    │ │  [IMAGE]    │ │  [IMAGE]    │ │  [IMAGE]    │     │
│  │             │ │             │ │             │ │             │     │
│  ├─────────────┤ ├─────────────┤ ├─────────────┤ ├─────────────┤     │
│  │ Vax'ildan   │ │ Keyleth     │ │ Percival    │ │ Grog Strongj│     │
│  │ Rogue, Lvl 8│ │ Druid, Lvl 7│ │ Fighter, L7 │ │ Barb., Lvl 7│     │
│  │ Player: Sam │ │ Player: Mar │ │ Player: Mat │ │ Player: Tra │     │
│  │ [View][Edit]│ │ [View][Edit]│ │ [View][Edit]│ │ [View][Edit]│     │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘     │
│                                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │
│  │             │ │             │ │             │ │             │     │
│  │  [IMAGE]    │ │  [IMAGE]    │ │  [IMAGE]    │ │  [IMAGE]    │     │
│  │             │ │             │ │             │ │             │     │
│  ├─────────────┤ ├─────────────┤ ├─────────────┤ ├─────────────┤     │
│  │ Scanlan     │ │ Pike        │ │ Taryon      │ │ Fjord       │     │
│  │ Bard, Lvl 8 │ │ Cleric, Lvl │ │ Artificer,L │ │ Warlock, Lvl│     │
│  │ Player: Sam │ │ Player: Ash │ │ Player: Sam │ │ Player: Tra │     │
│  │ [View][Edit]│ │ [View][Edit]│ │ [View][Edit]│ │ [View][Edit]│     │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Example 2: Character Card with Color Override

```
┌─────────────────────────────────────┐
│ ▌                                   │
│ ▌      [Character Portrait]         │ ← Left border using preset color
│ ▌      (Image, 1:1 aspect)          │
│ ▌                                   │
├─────────────────────────────────────┤
│ Character Name (Custom Color Text)  │ ← Text color from override
│                                     │
│ Class:  Wizard                      │
│ Race:   Elf                         │
│ Player: Sam Riegel                  │
│                                     │
│ [View Character] [Edit (Admin)]     │
└─────────────────────────────────────┘
```

### Example 3: Admin Form Layout

```
┌────────────────────────────────────────────────┐
│ Header [Back] Campaign: Example Campaign       │ ← Sticky header
├────────────────────────────────────────────────┤
│                                                │
│ Create New Character                           │ ← H1
│                                                │
│ ┌────────────────────────────────────────────┐ │
│ │ Character Information                      │ │ ← Form section
│ ├────────────────────────────────────────────┤ │
│ │ Character Name *                           │ │ ← Required field
│ │ [Input field________________________]       │ │
│ │                                            │ │
│ │ Class *                                    │ │
│ │ [Dropdown: Select a class________]        │ │
│ │                                            │ │
│ │ Race *                                     │ │
│ │ [Dropdown: Select a race_________]        │ │
│ │                                            │ │
│ │ Player Name                                │ │
│ │ [Input field________________________]       │ │
│ │                                            │ │
│ │ Level                                      │ │
│ │ [Input: 1 - 20________________]            │ │
│ ├────────────────────────────────────────────┤ │
│ │ Character Image                            │ │ ← Form section
│ ├────────────────────────────────────────────┤ │
│ │ [Choose File] [Upload Image]               │ │
│ │ or drag & drop image here                  │ │
│ │                                            │ │
│ ├────────────────────────────────────────────┤ │
│ │ Color Theme (Admin Only)                   │ │
│ ├────────────────────────────────────────────┤ │
│ │ ☐ Use custom color theme                   │ │ ← Checkbox
│ │                                            │ │
│ │ [Color override form if checked]           │ │
│ │                                            │ │
│ └────────────────────────────────────────────┘ │
│                                                │
│ [Cancel] [Save Character]                      │ ← Form actions
│                                                │
└────────────────────────────────────────────────┘
```

### Example 4: Episode Timeline

```
Season 1
─────────────────────────────────

◆ The Return of Liam O'Brien (Nov 12, 2015) — 4h 23m
  S01E001 · Battle, Roleplay, Discovery

◆ Breach in the Fog (Nov 19, 2015) — 3h 59m
  S01E002 · Exploration, Roleplay

◆ Debates and Downcast (Nov 26, 2015) — 4h 12m
  S01E003 · Roleplay, Discovery

Season 2
─────────────────────────────────

◆ Onward to Vasselheim (Oct 20, 2015) — 3h 37m
  S02E001 · Exploration, Combat

◆ The Alchemy (Oct 27, 2015) — 4h 05m
  S02E002 · Roleplay, Discovery
```

### Example 5: Color Palette Visual

```
PRIMARY COLORS
┌──────────────┬──────────────┬──────────────┐
│ Brand Blue   │ Base Gray    │ Light Gray   │
│ #3b82f6      │ #6b7280      │ #e5e7eb      │
│ Blue-600     │ Gray-500     │ Gray-200     │
└──────────────┴──────────────┴──────────────┘

ACCENT COLORS
┌──────────────┬──────────────┬──────────────┐
│ Success      │ Danger       │ Warning      │
│ #10b981      │ #ef4444      │ #f59e0b      │
│ Green-500    │ Red-500      │ Amber-500    │
└──────────────┴──────────────┴──────────────┘

CHARACTER PRESETS
┌──────────────┬──────────────┬──────────────┐
│ Gold & Warmth│ Twilight     │ Emerald      │
│ Primary:     │ Primary:     │ Primary:     │
│ #d97706      │ #8b5cf6      │ #059669      │
│ Amber-600    │ Violet-500   │ Emerald-600  │
└──────────────┴──────────────┴──────────────┘
```

### Example 6: Typography Hierarchy

```
H1 - Page Title
────────────────────────────────────────────
The Critical Role Companion Project
32px, Bold, Gray-900
[32px margin-bottom]

H2 - Section Heading
────────────────────────────────────────────
Campaign Management System
24px, Semibold, Gray-900
[24px margin-bottom]

H3 - Card Title
────────────────────────────────────────────
Character Roster
20px, Semibold, Gray-900
[16px margin-bottom]

Body Text
────────────────────────────────────────────
This is a paragraph of body text that describes the
page content. It uses 16px size with 1.5 line height
for optimal readability. Multiple paragraphs are
separated by 16px margin.
16px, Regular, Gray-900
[16px margin-bottom]

Small / Label Text
────────────────────────────────────────────
Character Class:  Wizard
14px, Medium, Gray-600 (label), Gray-900 (value)
```

---

## 10. Implementation Checklist

Use this checklist when implementing Phase 3 Tier 3 (Public Campaign Pages) and beyond.

### Component Implementation

- [ ] **Character Card Component**
  - [ ] Image display with proper aspect ratio (1:1)
  - [ ] Color override styling applied
  - [ ] Hover state implemented
  - [ ] Mobile responsive layout
  - [ ] Accessibility: alt text, focus states

- [ ] **Form Components**
  - [ ] Input fields with proper padding
  - [ ] Labels associated with inputs
  - [ ] Error message display
  - [ ] Focus state styling
  - [ ] Disabled state handling

- [ ] **Button Components**
  - [ ] Primary button style
  - [ ] Secondary button style
  - [ ] Danger button style
  - [ ] Disabled state
  - [ ] Hover/active states
  - [ ] Focus outline visible

- [ ] **Navigation Components**
  - [ ] Header/nav bar sticky positioning
  - [ ] Breadcrumb navigation
  - [ ] Tab navigation (if used)
  - [ ] Mobile menu toggle (if needed)

### Spacing & Layout

- [ ] **Padding Consistency**
  - [ ] Cards: 16px padding
  - [ ] Forms: 24px padding
  - [ ] Buttons: 10px vertical, 16px horizontal
  - [ ] Input fields: 12px vertical, 16px horizontal

- [ ] **Margin Consistency**
  - [ ] Between sections: 48px
  - [ ] Between subsections: 32px
  - [ ] Between items: 16px
  - [ ] After headings: per scale above

- [ ] **Grid Layout**
  - [ ] Desktop: 4 columns for cards
  - [ ] Tablet: 2-3 columns
  - [ ] Mobile: 1 column
  - [ ] Gap: 24px consistent

### Color & Contrast

- [ ] **Color Contrast Verified**
  - [ ] Primary text on white: 21:1 (AAA)
  - [ ] Secondary text: 11.5:1 (AAA)
  - [ ] Tertiary text: 7:1 (AA minimum)
  - [ ] Interactive elements: 4.5:1 minimum

- [ ] **Character Color Overrides**
  - [ ] Borders display custom colors
  - [ ] Text color contrast checked
  - [ ] Badges/accents styled properly
  - [ ] Fallback colors defined

- [ ] **Status Indicators**
  - [ ] Success states: green with icon/text
  - [ ] Error states: red with icon/text
  - [ ] Warning states: orange with icon/text
  - [ ] Not relying on color alone

### Responsive Design

- [ ] **Mobile (< 768px)**
  - [ ] Single column layout
  - [ ] Proper padding/margins
  - [ ] Touch-friendly button size (44px)
  - [ ] Images scale properly
  - [ ] No horizontal scroll

- [ ] **Tablet (768px - 1023px)**
  - [ ] 2-column layout for cards
  - [ ] Balanced spacing
  - [ ] Images display at appropriate size
  - [ ] Forms are single or dual column

- [ ] **Desktop (≥ 1024px)**
  - [ ] 4-column card layout
  - [ ] Content constrained to max-width
  - [ ] Full-size images
  - [ ] Multi-column forms supported

### Typography

- [ ] **Font Sizes Applied**
  - [ ] H1: 32px
  - [ ] H2: 24px
  - [ ] H3: 20px
  - [ ] Body: 16px
  - [ ] Small: 14px

- [ ] **Font Weights Correct**
  - [ ] Headings: 600-700
  - [ ] Body: 400
  - [ ] Labels: 500

- [ ] **Line Heights Applied**
  - [ ] Headings: 1.25-1.4
  - [ ] Body: 1.5
  - [ ] Tight text: 1.125

### Accessibility

- [ ] **Keyboard Navigation**
  - [ ] Tab order is logical
  - [ ] Focus visible on all interactive elements
  - [ ] No keyboard traps
  - [ ] Forms can be filled with keyboard only

- [ ] **Screen Reader Ready**
  - [ ] Semantic HTML used
  - [ ] ARIA labels where needed
  - [ ] Form labels associated with inputs
  - [ ] Icon buttons have labels
  - [ ] Images have alt text

- [ ] **Color Accessibility**
  - [ ] Not relying on color alone
  - [ ] Icons used with color changes
  - [ ] Text used with icons
  - [ ] Links are underlined

---

## References & Research Sources

This design guide was developed based on research from industry-leading RPG tools and professional admin dashboard design practices:

### Character Card & RPG UI Design
- [Character Sheet Design as User Interface II - Homebrew and Hacking](https://homebrewandhacking.com/2023/08/02/character-sheet-design-as-user-interface-ii-practical-results/)
- [D&D Beyond Character Sheets](https://www.dndbeyond.com/resources/1779-d-d-character-sheets)
- [Game UI Database](https://www.gameuidatabase.com/)
- [Baldur's Gate 3 Interface Design](https://www.gamepressure.com/baldurs-gate-iii/interface/zad9f7)

### Admin Dashboard Design
- [Dashboard Design: 15 Best Practices & Examples 2024 - Shaheer Malik](https://www.shaheermalik.com/blog/dashboard-design-15-best-practices-of-dashboard-design)
- [Admin Dashboard Design: Best Practices & Features - CompanionLink](https://www.companionlink.com/blog/2024/06/admin-dashboards-how-to-create-a-good-one/)
- [Best Practices for Admin Dashboard Design - Rosalie, Medium](https://medium.com/@rosalie24/best-practices-for-admin-dashboard-design-a-designers-guide-3854e8349157)
- [Dashboard Design Principles 2025 - DesignRush](https://www.designrush.com/agency/ui-ux-design/dashboard/trends/dashboard-design-principles)

### Color & Gaming UI
- [Colors in Game UI - Dakota Galayde](https://www.galaydegames.com/blog/colors-i-)
- [Gaming Color Palettes - Coolors](https://coolors.co/palettes/popular/gaming)
- [Blue and Gray UI Color Scheme - SchemeColor](https://www.schemecolor.com/blue-and-gray-ui-color-palette.php)

### Typography & Spacing
- [How to Structure an Effective Typographic Hierarchy - Toptal](https://www.toptal.com/designers/typography/typographic-hierarchy)
- [Introduction to Typography Hierarchy - Uxcel](https://uxcel.com/blog/beginners-guide-to-typographic-hierarchy)
- [Material Design 3 Typography](https://m3.material.io/styles/typography/applying-type)
- [The 8pt Grid: Consistent Spacing in UI Design - Chris Godby, Prototypr](https://blog.prototypr.io/the-8pt-grid-consistent-spacing-in-ui-design-with-sketch-577e4f0fd520)
- [Spacing Best Practices - Cieden](https://cieden.com/book/sub-atomic/spacing/spacing-best-practices)

### Card Design
- [Cards Design Pattern - UI Patterns](https://ui-patterns.com/patterns/cards)
- [Card UI Design Examples and Best Practices - Eleken](https://www.eleken.co/blog-posts/card-ui-examples-and-best-practices-for-product-owners)
- [Cards: UI-Component Definition - Nielsen Norman Group](https://www.nngroup.com/articles/cards-component/)
- [Card UI Design: Fundamentals and Examples - Justinmind](https://www.justinmind.com/ui-design/cards)

### Buttons & Interaction
- [Button States Explained – How to Design Them - UXPin](https://www.uxpin.com/studio/blog/button-states/)
- [Button States: Communicate Interaction - Nielsen Norman Group](https://www.nngroup.com/articles/button-states-communicate-interaction/)
- [14 Rules to Design Accessible Buttons - UX Design World](https://uxdworld.com/design-accessible-buttons/)

### Accessibility
- [Color Contrast - Accessibility, MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Understanding_WCAG/Perceivable/Color_contrast)
- [WebAIM: Contrast and Color Accessibility](https://webaim.org/articles/contrast/)
- [WCAG Color Contrast Ratios - Accessibility Checker](https://www.accessibilitychecker.org/wcag-guides/ensure-the-contrast-between-foreground-and-background-colors-meets-wcag-2-aa-minimum-contrast-ratio-thresholds/)
- [Understanding Success Criterion 1.4.3: Contrast (Minimum) - W3C WAI](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-22 | Initial comprehensive design guidelines document |

**Created for:** Phase 3 Tier 3 Implementation (Public Campaign Pages)
**Project:** Critical Role Companion
**Status:** Production Ready
**Maintained by:** Development Team

---

**Last Updated:** 2025-11-22
**Next Review:** After Phase 3 Tier 3 completion (recommend quarterly reviews)

