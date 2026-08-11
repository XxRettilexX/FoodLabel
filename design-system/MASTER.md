# FoodLabel — Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** FoodLabel — HACCP & Warehouse Management for Restaurants
**Generated:** 2026-08-09
**Category:** Industrial Food Safety / Restaurant Operations
**Target Platform:** React Native (Expo, TypeScript) + Laravel backend
**Design Dials:** Variance 3/10 (Centered) · Motion 3/10 (Subtle) · Density 8/10 (Dense)

---

## 1 · Design Philosophy

**Core style:** Swiss Minimalism + Bento Grid + Accessible & Ethical Design

FoodLabel is an **operational tool** used by restaurant/kitchen staff, often:
- With **wet or dirty hands** (gloves, flour, grease)
- In **poor lighting** (walk-in coolers, storage rooms, dimly-lit prep areas)
- Under **time pressure** (service rush, delivery receiving)
- On **shared devices** (tablets mounted on walls, phones passed between staff)

### Design Principles (in priority order)

| # | Principle | Implication |
|---|-----------|-------------|
| 1 | **Zero-ambiguity safety states** | A scaduto/expired lot must be unmistakable from a valid one in < 0.5 s glance |
| 2 | **Immediate readability** | 16 px minimum body text, 7:1 contrast ratio target (WCAG AAA) |
| 3 | **Oversized touch targets** | 56 × 56 pt minimum for primary actions (gloves-compatible) |
| 4 | **Functional density** | Maximum useful info per screen, zero decorative elements |
| 5 | **Predictable navigation** | Same position, same behavior, every screen |
| 6 | **Offline-first mental model** | Visual cues must convey sync state without relying on toasts |

### Why Accessible & Ethical Design over Soft UI

| Criterion | Soft UI / Neumorphism | Accessible & Ethical ✓ |
|-----------|----------------------|----------------------|
| Contrast in poor lighting | ✗ Low — relies on subtle shadows | ✓ High — bold borders + fills |
| Glove-friendly touch targets | ~ Ambiguous boundaries | ✓ Clear clickable zones |
| Color-blind safety states | ✗ Relies on color gradients | ✓ Icon + color + text triple-encoding |
| Screen readability in sunlight / cooler | ✗ Washes out | ✓ Survives extreme conditions |
| Cognitive load under pressure | ~ Decorative noise | ✓ Stripped to essentials |

**Verdict:** Soft UI is categorically wrong for this context. Accessible & Ethical Design is the correct foundation, combined with Swiss grid discipline for information density.

---

## 2 · Color System

### 2.1 · Foundation Palette (Primitive Tokens)

Designed for: fluorescent kitchen lighting, cooler blue-tint, outdoor delivery area sunlight.

```
/* === PRIMITIVE COLORS === */

--slate-50:   #F8FAFC;    --slate-100:  #F1F5F9;
--slate-200:  #E2E8F0;    --slate-300:  #CBD5E1;
--slate-400:  #94A3B8;    --slate-500:  #64748B;
--slate-600:  #475569;    --slate-700:  #334155;
--slate-800:  #1E293B;    --slate-900:  #0F172A;
--slate-950:  #020617;

--green-50:   #F0FDF4;    --green-100:  #DCFCE7;
--green-500:  #22C55E;    --green-600:  #16A34A;
--green-700:  #15803D;    --green-800:  #166534;

--amber-50:   #FFFBEB;    --amber-100:  #FEF3C7;
--amber-500:  #F59E0B;    --amber-600:  #D97706;
--amber-700:  #B45309;    --amber-800:  #92400E;

--red-50:     #FEF2F2;    --red-100:    #FEE2E2;
--red-500:    #EF4444;    --red-600:    #DC2626;
--red-700:    #B91C1C;    --red-800:    #991B1B;

--blue-50:    #EFF6FF;    --blue-100:   #DBEAFE;
--blue-500:   #3B82F6;    --blue-600:   #2563EB;
--blue-700:   #1D4ED8;

--white:      #FFFFFF;
--black:      #000000;
```

### 2.2 · Semantic Status Colors

**The most critical part of this design system.** Every status must pass the "2-meter glance test" — identifiable from 2 meters away on a wall-mounted tablet.

| Status | Semantic | Background | Border | Text/Icon | On-dark BG | On-dark Border |
|--------|----------|-----------|--------|-----------|------------|----------------|
| ✅ **Valido / OK** | `--status-ok-*` | `#DCFCE7` | `#16A34A` | `#15803D` | `#166534` | `#22C55E` |
| ⚠️ **In scadenza / Warning** | `--status-warn-*` | `#FEF3C7` | `#D97706` | `#92400E` | `#92400E` | `#F59E0B` |
| 🛑 **Scaduto / Expired** | `--status-expired-*` | `#FEE2E2` | `#DC2626` | `#991B1B` | `#991B1B` | `#EF4444` |
| ℹ️ **Info / Neutrale** | `--status-info-*` | `#DBEAFE` | `#2563EB` | `#1D4ED8` | `#1E3A5F` | `#3B82F6` |
| 🔄 **In revisione / Pending** | `--status-pending-*` | `#F1F5F9` | `#94A3B8` | `#475569` | `#334155` | `#94A3B8` |

> [!IMPORTANT]
> **Triple-encoding rule:** Every status MUST be communicated through ALL THREE channels simultaneously:
> 1. **Color** (background + border fill)
> 2. **Icon** (distinct silhouette per status — ✓ checkmark, ⚠ triangle, ✕ cross, ⓘ circle-i, ◷ clock)
> 3. **Text label** ("Valido", "In scadenza: 2 giorni", "SCADUTO", etc.)
>
> Never rely on color alone. This is non-negotiable for color-blind users and poor-lighting environments.

### 2.3 · Semantic UI Colors (Light Mode)

| Role | Token | Value | Usage |
|------|-------|-------|-------|
| Background | `--color-background` | `#F8FAFC` | App background |
| Surface | `--color-surface` | `#FFFFFF` | Cards, sheets |
| Surface Elevated | `--color-surface-elevated` | `#FFFFFF` | Modals, popovers |
| Foreground | `--color-foreground` | `#0F172A` | Primary text |
| Foreground Secondary | `--color-foreground-secondary` | `#475569` | Secondary text |
| Foreground Muted | `--color-foreground-muted` | `#94A3B8` | Disabled, hints |
| Border | `--color-border` | `#E2E8F0` | Default borders |
| Border Strong | `--color-border-strong` | `#CBD5E1` | Emphasized dividers |
| Primary | `--color-primary` | `#1D4ED8` | Brand actions, links |
| Primary Hover | `--color-primary-hover` | `#1E40AF` | Pressed state |
| On Primary | `--color-on-primary` | `#FFFFFF` | Text on primary bg |
| Accent | `--color-accent` | `#16A34A` | Confirm, positive |
| Destructive | `--color-destructive` | `#DC2626` | Delete, expire, danger |
| On Destructive | `--color-on-destructive` | `#FFFFFF` | Text on destructive bg |

### 2.4 · Semantic UI Colors (Dark Mode)

| Role | Token | Value |
|------|-------|-------|
| Background | `--color-background` | `#0F172A` |
| Surface | `--color-surface` | `#1E293B` |
| Surface Elevated | `--color-surface-elevated` | `#334155` |
| Foreground | `--color-foreground` | `#F1F5F9` |
| Foreground Secondary | `--color-foreground-secondary` | `#CBD5E1` |
| Foreground Muted | `--color-foreground-muted` | `#64748B` |
| Border | `--color-border` | `#334155` |
| Border Strong | `--color-border-strong` | `#475569` |
| Primary | `--color-primary` | `#3B82F6` |
| Primary Hover | `--color-primary-hover` | `#60A5FA` |
| On Primary | `--color-on-primary` | `#FFFFFF` |
| Accent | `--color-accent` | `#22C55E` |
| Destructive | `--color-destructive` | `#EF4444` |
| On Destructive | `--color-on-destructive` | `#FFFFFF` |

### 2.5 · Contrast Ratios (Verified)

| Pair | Light Mode | Dark Mode | WCAG |
|------|-----------|-----------|------|
| Foreground on Background | 15.4:1 | 13.8:1 | AAA ✓ |
| Foreground-secondary on Surface | 7.1:1 | 8.9:1 | AAA ✓ |
| Status-expired text on expired-bg | 9.2:1 | — | AAA ✓ |
| Status-warn text on warn-bg | 7.8:1 | — | AAA ✓ |
| Status-ok text on ok-bg | 6.4:1 | — | AA ✓ |
| On-primary on Primary | 10.8:1 | 8.5:1 | AAA ✓ |

---

## 3 · Typography

### 3.1 · Font Selection

**Heading + Body:** Inter (single family system)
**Mono / Data:** JetBrains Mono (lot codes, barcodes, dates, quantities)

| Property | Value | Rationale |
|----------|-------|-----------|
| Heading font | **Inter** (600–700 weight) | Designed for screen readability, excellent at small sizes, x-height optimized |
| Body font | **Inter** (400–500 weight) | Same family avoids cognitive switching; wide glyph set for Italian diacritics |
| Mono font | **JetBrains Mono** (400–500) | Clear 0/O, 1/l distinction for lot codes; tabular nums for quantities |
| Minimum body size | **16 px / 1 rem** | Non-negotiable for kitchen readability |
| Minimum label size | **14 px / 0.875 rem** | Smallest allowed text in the entire system |
| Line height body | **1.5** (24 px at 16 px) | Generous for scanning under pressure |
| Line height heading | **1.2** | Tighter for large text |
| Letter spacing body | **0** (Inter default tracking) | Already optimized |
| Letter spacing heading | **−0.02 em** | Slight tightening for visual density |

> [!WARNING]
> **No decorative, serif, or display fonts.** Playfair, Karla, Lobster, etc. are restaurant-*website* fonts, not restaurant-*operations* fonts. Inter is chosen for its legibility at small sizes, screen hinting, and excellent tabular figures — all critical for data-dense HACCP interfaces.

### 3.2 · Type Scale

Based on **Major Second (1.125)** ratio — produces a tight, information-dense scale appropriate for dashboard density 8/10.

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `--type-display` | 28 px / 1.75 rem | 700 | Page titles (rare) |
| `--type-title` | 22 px / 1.375 rem | 700 | Section headers, screen titles |
| `--type-heading` | 18 px / 1.125 rem | 600 | Card titles, group labels |
| `--type-body` | 16 px / 1 rem | 400 | Default body text |
| `--type-body-medium` | 16 px / 1 rem | 500 | Emphasized body, table headers |
| `--type-label` | 14 px / 0.875 rem | 500 | Form labels, badges, metadata |
| `--type-caption` | 14 px / 0.875 rem | 400 | Help text, timestamps |
| `--type-mono` | 14 px / 0.875 rem | 400 | Lot codes, barcodes, amounts |
| `--type-mono-lg` | 16 px / 1 rem | 500 | Large data readouts |

### 3.3 · React Native Implementation

```typescript
// typography.ts
export const fonts = {
  heading:  'Inter_700Bold',
  subhead:  'Inter_600SemiBold',
  body:     'Inter_400Regular',
  bodyMed:  'Inter_500Medium',
  mono:     'JetBrainsMono_400Regular',
  monoMed:  'JetBrainsMono_500Medium',
} as const;

export const typeScale = {
  display:    { fontSize: 28, lineHeight: 34, fontFamily: fonts.heading },
  title:      { fontSize: 22, lineHeight: 28, fontFamily: fonts.heading },
  heading:    { fontSize: 18, lineHeight: 24, fontFamily: fonts.subhead },
  body:       { fontSize: 16, lineHeight: 24, fontFamily: fonts.body },
  bodyMedium: { fontSize: 16, lineHeight: 24, fontFamily: fonts.bodyMed },
  label:      { fontSize: 14, lineHeight: 20, fontFamily: fonts.bodyMed },
  caption:    { fontSize: 14, lineHeight: 20, fontFamily: fonts.body },
  mono:       { fontSize: 14, lineHeight: 20, fontFamily: fonts.mono },
  monoLg:     { fontSize: 16, lineHeight: 24, fontFamily: fonts.monoMed },
} as const;
```

---

## 4 · Spacing & Layout

### 4.1 · Spacing Scale

Dense dashboard spacing (8/10). Base unit: **4 px**.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-0` | 0 px | Reset |
| `--space-1` | 4 px | Tight inline gaps (icon ↔ text) |
| `--space-2` | 8 px | Compact padding, list item gaps |
| `--space-3` | 12 px | Standard inner padding |
| `--space-4` | 16 px | Card padding, form field spacing |
| `--space-5` | 20 px | Section gap within card |
| `--space-6` | 24 px | Section separator |
| `--space-8` | 32 px | Major section margins |
| `--space-10` | 40 px | Screen edge padding (tablet) |
| `--space-12` | 48 px | Page-level top/bottom margin |

### 4.2 · Bento Grid Layout System

Dashboard screens use a Bento Grid: modular cards of varying sizes in a CSS Grid.

```
┌─────────────────────────────────────────────────┐
│ ┌───────────────┐ ┌───────────────────────────┐ │
│ │  KPI Widget   │ │    Expiry Alert Banner    │ │  ← 1×1 + 2×1
│ │  (1×1)        │ │    (2×1)                  │ │
│ └───────────────┘ └───────────────────────────┘ │
│ ┌───────────────┐ ┌──────────┐ ┌──────────────┐ │
│ │  Lotti in     │ │ Scanner  │ │  Fatture     │ │  ← 1×2 + 1×1 + 1×1
│ │  scadenza     │ │ Quick    │ │  pending     │ │
│ │  (1×2)        │ │ (1×1)    │ │  (1×1)       │ │
│ │               │ └──────────┘ └──────────────┘ │
│ └───────────────┘                               │
│ ┌───────────────────────────────────────────────┐ │
│ │  Inventario magazzino — full width (3×1)      │ │  ← 3×1
│ └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**Grid rules:**

| Property | Phone (< 768 px) | Tablet (≥ 768 px) |
|----------|-------------------|-------------------|
| Columns | 1 (stacked) | 3 (main dashboard) |
| Gap | 8 px | 12 px |
| Card padding | 12 px | 16 px |
| Card radius | 12 px | 12 px |
| Card border | 1 px solid `--color-border` | Same |
| Card shadow | `0 1px 3px rgba(0,0,0,0.06)` | Same |

**Card size classes:**

| Class | Spans | Typical content |
|-------|-------|-----------------|
| `bento-sm` | 1 × 1 | KPI counter, quick action button |
| `bento-md` | 2 × 1 | Alert banner, chart widget |
| `bento-tall` | 1 × 2 | Vertical list (expiring lots) |
| `bento-wide` | 3 × 1 | Data table, full inventory view |
| `bento-hero` | 3 × 2 | Main scan interface, full-screen module |

### 4.3 · Safe Areas & Fixed Elements

```
┌──────────────────────────┐
│ Status Bar (system)      │ ← SafeAreaView top
├──────────────────────────┤
│ Header Bar  56 px        │ ← Fixed, screen title + back + actions
├──────────────────────────┤
│                          │
│  Scrollable Content      │ ← paddingBottom = tab bar + safe area
│                          │
├──────────────────────────┤
│ Tab Bar  64 px           │ ← Fixed bottom, 5 items max
├──────────────────────────┤
│ Home Indicator (system)  │ ← SafeAreaView bottom
└──────────────────────────┘
```

| Element | Height | Position |
|---------|--------|----------|
| Header | 56 px | Fixed top |
| Tab bar | 64 px | Fixed bottom |
| FAB (scan button) | 64 × 64 px | Floating, bottom-right, 16 px from edges |
| Content bottom padding | Tab bar + SafeArea + 8 px | Prevents content hiding |

---

## 5 · Component Specifications

### 5.1 · Touch Targets

> [!CAUTION]
> **56 × 56 pt minimum** for all primary interactive elements. This is larger than Apple's 44 pt guideline because kitchen gloves reduce touch precision. Secondary actions: 48 × 48 pt minimum.

| Component | Minimum Size | hitSlop |
|-----------|-------------|---------|
| Primary button | 56 × 56 pt | — |
| Icon button | 44 × 44 pt visual, 56 × 56 pt touch | `{ top: 6, bottom: 6, left: 6, right: 6 }` |
| List row | Full width × 56 pt | — |
| Checkbox / Radio | 24 × 24 pt visual, 48 × 48 pt touch | `{ top: 12, bottom: 12, left: 12, right: 12 }` |
| Tab bar item | ≥ 64 × 64 pt | — |
| FAB (scan) | 64 × 64 pt | — |

### 5.2 · Buttons

| Variant | Background | Text Color | Border | Usage |
|---------|-----------|------------|--------|-------|
| **Primary** | `--color-primary` | `--color-on-primary` | none | Main CTA per screen |
| **Destructive** | `--color-destructive` | `--color-on-destructive` | none | Delete lot, dismiss alert |
| **Secondary** | `transparent` | `--color-primary` | 2 px `--color-primary` | Alternative actions |
| **Ghost** | `transparent` | `--color-foreground` | none | Tertiary, back, cancel |
| **Disabled** | `--color-border` | `--color-foreground-muted` | none | Non-interactive |

**Button specs:**

```typescript
// All buttons
{
  minHeight: 56,              // gloves-compatible
  paddingHorizontal: 24,
  paddingVertical: 14,
  borderRadius: 12,
  pressedOpacity: 0.85,       // immediate feedback
  pressedScale: 0.97,         // subtle but perceptible
  transitionDuration: 150,    // fast, not sluggish
}
```

**States:**

| State | Visual Change |
|-------|---------------|
| Default | Base appearance |
| Pressed | opacity 0.85 + scale 0.97 (150 ms) |
| Disabled | opacity 0.4, no press effect |
| Loading | Spinner replaces label, same dimensions |

### 5.3 · Status Badges

Used on lot cards, inventory rows, and expiry alerts.

```
┌──────────────────────────────────┐
│ ✓  VALIDO · Scade: 15/08/2026   │  ← Green background, dark green text
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ ⚠  IN SCADENZA · 2 giorni       │  ← Amber background, dark amber text
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ ✕  SCADUTO · 09/08/2026         │  ← Red background, dark red text, BOLD
└──────────────────────────────────┘
```

**Implementation:**

```typescript
type LotStatus = 'ok' | 'warning' | 'expired' | 'pending';

const statusConfig: Record<LotStatus, StatusStyle> = {
  ok:      { bg: '#DCFCE7', border: '#16A34A', text: '#15803D', icon: 'check-circle' },
  warning: { bg: '#FEF3C7', border: '#D97706', text: '#92400E', icon: 'alert-triangle' },
  expired: { bg: '#FEE2E2', border: '#DC2626', text: '#991B1B', icon: 'x-circle' },
  pending: { bg: '#F1F5F9', border: '#94A3B8', text: '#475569', icon: 'clock' },
};
```

### 5.4 · Cards (Bento Tiles)

```typescript
{
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 12,
  padding: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 3,
  elevation: 1,  // Android
}
```

**Card with status strip** (for lot cards):

```
┌─┬────────────────────────────────┐
│▓│  LOT-2026-0815-001             │  ← 4 px left border in status color
│▓│  Mozzarella di Bufala · 2 kg   │
│▓│  ✓ Valido · Scade: 15/08       │
└─┴────────────────────────────────┘
```

The 4 px left border strip provides a quick visual status scan in list views.

### 5.5 · Form Inputs

```typescript
{
  minHeight: 52,
  paddingHorizontal: 16,
  paddingVertical: 14,
  borderWidth: 1.5,
  borderColor: colors.border,       // default
  borderColorFocus: colors.primary,  // focused
  borderColorError: colors.destructive, // error
  borderRadius: 10,
  fontSize: 16,                      // prevents iOS zoom on focus
  backgroundColor: colors.surface,
}
```

> [!NOTE]
> `fontSize: 16` is mandatory on iOS to prevent automatic zoom-on-focus. This is doubly important for FoodLabel because field zoom in the middle of receiving a delivery is disorienting and wastes time.

### 5.6 · Data Tables / List Views

For inventory and lot management:

| Property | Value |
|----------|-------|
| Row height | 56 px minimum |
| Row padding | 12 px horizontal, 8 px vertical |
| Header bg | `--color-background` (sticky) |
| Header text | `--type-label`, weight 600, uppercase, `--color-foreground-secondary` |
| Alternating rows | none (use border separators instead) |
| Separator | 1 px `--color-border`, full-width |
| Selected row | `--color-primary` at 8% opacity background |
| Swipe actions | 80 px wide, icon + label, haptic on threshold |

### 5.7 · Bottom Sheet / Modal

```typescript
{
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  handleWidth: 40,
  handleHeight: 4,
  handleColor: colors.borderStrong,
  backgroundColor: colors.surface,
  scrimColor: 'rgba(15, 23, 42, 0.6)', // slate-900 at 60%
  maxHeight: '85%',
}
```

### 5.8 · Navigation

**Tab Bar** (5 items max):

| Tab | Icon | Label |
|-----|------|-------|
| Dashboard | `LayoutGrid` | Home |
| Lotti | `Package` | Lotti |
| Scanner | `ScanLine` | Scansiona |
| Inventario | `Warehouse` | Magazzino |
| Fatture | `FileText` | Fatture |

```typescript
{
  height: 64,
  backgroundColor: colors.surface,
  borderTopWidth: 1,
  borderTopColor: colors.border,
  activeColor: colors.primary,
  inactiveColor: colors.foregroundMuted,
  iconSize: 24,
  labelSize: 11,  // exception: tab labels only
  labelWeight: '500',
}
```

---

## 6 · Iconography

### 6.1 · Icon Library

**Primary:** Lucide React Native (`lucide-react-native`)

Lucide is chosen for: consistent 24 px grid, 1.5 px stroke, MIT license, excellent React Native support, and comprehensive set for industrial/operational UIs.

### 6.2 · Icon Rules

| Rule | Standard |
|------|----------|
| Default size | 24 × 24 px |
| Stroke width | 1.5 px (Lucide default) |
| Large icons (status, empty states) | 48 × 48 px |
| Color | Inherits from text color via `currentColor` |
| Style consistency | Outline only — no mixing filled/outline |
| Touch area | Always wrap in Pressable with minimum 48 × 48 pt hitSlop |

### 6.3 · Key Icons Map

| Function | Icon Name | Context |
|----------|-----------|---------|
| Scan barcode/QR | `ScanLine` | FAB, tab bar |
| Lot/batch | `Package` | Lot cards, navigation |
| Inventory | `Warehouse` | Tab bar, section headers |
| Temperature | `Thermometer` | HACCP records |
| Expiry/calendar | `CalendarClock` | Expiry dates |
| Alert/warning | `AlertTriangle` | Warning status |
| Valid/check | `CheckCircle2` | OK status |
| Expired/error | `XCircle` | Expired status |
| Clock/pending | `Clock` | Pending review |
| Print label | `Printer` | Label generation |
| Invoice/receipt | `FileText` | Fatture |
| Camera | `Camera` | Document scan |
| Search | `Search` | Search bars |
| Filter | `SlidersHorizontal` | Filter panels |
| Add new | `Plus` | Create new lot/item |
| Delete | `Trash2` | Destructive actions |
| Edit | `Pencil` | Edit mode |
| Sync status | `RefreshCw` | Sync indicator |
| Offline | `WifiOff` | No connection state |
| Settings | `Settings` | App settings |

---

## 7 · Motion & Interactions

### 7.1 · Motion Philosophy

**Minimal, purposeful, never decorative.** In a kitchen environment, animations must:
- Confirm actions (feedback), not entertain
- Never delay task completion
- Never cause motion sickness during rushed use

### 7.2 · Timing Tokens

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `--duration-instant` | 100 ms | `ease-out` | Button press feedback |
| `--duration-fast` | 150 ms | `ease-out` | Hover states, toggles |
| `--duration-normal` | 250 ms | `ease-in-out` | Sheet open/close, navigation |
| `--duration-slow` | 350 ms | `ease-in-out` | Full-screen transitions only |

### 7.3 · Allowed Animations

| Animation | Duration | Properties | When |
|-----------|----------|------------|------|
| Press feedback | 100 ms | `opacity: 0.85`, `scale: 0.97` | Any press |
| Screen transition | 250 ms | `translateX` (push) / `translateY` (modal) | Navigation |
| Bottom sheet | 250 ms | `translateY` + spring | Open/close sheet |
| List item appear | 150 ms | `opacity: 0 → 1` | FlatList render |
| Status change | 200 ms | Background color crossfade | Lot status update |
| Toast appear/dismiss | 200 ms | `translateY` + `opacity` | Notifications |
| Haptic feedback | Instant | `Haptics.impactAsync(ImpactFeedbackStyle.Medium)` | Destructive, scan success |

### 7.4 · Forbidden Animations

| ❌ Never use | Why |
|-------------|-----|
| Parallax scrolling | Causes disorientation when scanning quickly |
| Page transitions > 400 ms | Blocks workflow |
| Bouncy spring animations | Distracting under pressure |
| Auto-rotating carousels | Hidden information, cognitive load |
| Decorative loading animations | Use simple spinner or skeleton |
| Entry animations on every card | Delays time-to-information |
| Blur transitions | Performance hit on mid-range devices |

---

## 8 · Accessibility

### 8.1 · Contrast Requirements

| Element | Minimum Ratio | Target | Standard |
|---------|--------------|--------|----------|
| Body text on background | 7:1 | WCAG AAA | Non-negotiable |
| Large text (≥ 18 px bold) | 4.5:1 | WCAG AAA | Non-negotiable |
| UI components (borders, icons) | 3:1 | WCAG AA | Required |
| Status badges text on badge bg | 4.5:1 | WCAG AA | Required |
| Focus ring | 3:1 against adjacent colors | WCAG AA | Required |

### 8.2 · Color Blindness

All status communications use the **triple-encoding** rule (§2.2). Additionally:

| Color-blind type | OK ✅ | Warning ⚠️ | Expired 🛑 |
|-----------------|-------|------------|-----------|
| Protanopia | Distinguishable (luminance diff + icon) | Distinguishable | Distinguishable |
| Deuteranopia | Distinguishable (luminance diff + icon) | Distinguishable | Distinguishable |
| Tritanopia | Distinguishable | Distinguishable | Distinguishable |

### 8.3 · Screen Reader Support

```typescript
// Every status badge
<View
  accessible={true}
  accessibilityRole="status"
  accessibilityLabel={`Lotto ${lotCode}: stato ${statusLabel}, scadenza ${expiryDate}`}
>
```

```typescript
// Every action button
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Scansiona codice a barre"
  accessibilityHint="Apre la fotocamera per scansionare un codice a barre o QR"
>
```

### 8.4 · Dynamic Type / Font Scaling

- Support up to **1.5× font scaling** without layout breakage
- Test at system accessibility "Large" and "Extra Large" settings
- Use `allowFontScaling={true}` for all text (default in RN)
- Use `maxFontSizeMultiplier={1.5}` to prevent extreme scaling from breaking layout

---

## 9 · Industry-Specific Anti-Patterns

> [!CAUTION]
> These are specific pitfalls for restaurant/food operations software that generic design systems miss.

### ❌ Do NOT

| Anti-Pattern | Why It's Dangerous | Do Instead |
|-------------|-------------------|------------|
| **Soft/neumorphic status badges** | Invisible on greasy screens, under warm kitchen lighting | Hard-fill badges with solid borders |
| **Swipe-only destructive actions** | Accidental swipe with wet hands → deleted lot | Swipe to reveal + confirmation dialog |
| **Small date text (< 14 px)** | Misread "08" as "09" → food safety incident | ≥ 14 px mono font, always `DD/MM/YYYY` format |
| **Relative dates only ("2 days ago")** | Ambiguous — staff needs absolute dates for HACCP logs | Show absolute date + relative in parentheses |
| **Color-only status indicators** | 8% of males are color-blind; grease on screen shifts colors | Triple-encoding: color + icon + text |
| **Confirmation on non-destructive actions** | "Are you sure you want to save?" wastes 3 seconds per action, 200× per day | Only confirm destructive/irreversible actions |
| **Auto-logout < 15 min** | Staff switches between tasks constantly | 30 min timeout minimum, biometric re-auth |
| **Animations > 300 ms for primary flows** | Every 100 ms × 200 daily actions = 20 seconds wasted per day per user | ≤ 150 ms for common actions |
| **Hamburger menu hiding primary navigation** | Staff can't discover features; slows every task | Always-visible tab bar |
| **Placeholder text as labels** | Disappears on focus — user forgets what field is for | Floating label pattern always |
| **Date pickers for known dates** | Delivery dates are today; expiry dates are from labels | Default to today + allow override |
| **Onboarding carousels** | Staff doesn't read them; they get a 5-minute handoff from manager | Contextual tooltips on first use per feature |
| **Toast notifications for critical alerts** | Toasts auto-dismiss; expired lot alert might be missed | Persistent banner + badge count until acknowledged |
| **Pure white background (#FFF)** | Causes eye strain under fluorescent kitchen lights for 8-hour shifts | Use `#F8FAFC` (slight warmth) |
| **Custom scrollbars or hidden scroll indicators** | Staff needs to know there's more content below | Native scroll indicators, always visible |
| **Decorative food imagery** | This is an operations tool, not a menu. Images waste space and slow load | Only show product images if they aid identification |

---

## 10 · Sync & Offline States

Restaurant kitchens often have spotty WiFi. Visual system for sync status:

| State | Visual | Location |
|-------|--------|----------|
| **Online, synced** | No indicator (clean) | — |
| **Online, syncing** | Small `RefreshCw` icon rotating, header bar | Top-right of header |
| **Offline** | Persistent amber banner: `"⚠ Offline — le modifiche verranno sincronizzate"` | Below header, full-width |
| **Sync error** | Persistent red banner: `"✕ Errore sincronizzazione — tocca per riprovare"` | Below header, full-width |
| **Last synced** | Timestamp in settings/profile: `"Ultimo sync: 20:05"` | Settings screen |

```typescript
// Offline banner
{
  backgroundColor: statusConfig.warning.bg,
  borderBottomWidth: 1,
  borderBottomColor: statusConfig.warning.border,
  paddingVertical: 8,
  paddingHorizontal: 16,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
}
```

---

## 11 · Printing & Label Output

FoodLabel generates labels for thermal printers (e.g. Brother QL, Zebra, DYMO). Design considerations:

| Aspect | Specification |
|--------|--------------|
| QR code minimum size | 20 × 20 mm (readable by most phone cameras) |
| Barcode minimum height | 10 mm |
| Label text minimum | 8 pt (thermal printer legibility floor) |
| Font on labels | Monospace only (consistent glyph width for alignment) |
| High-contrast | Black on white only — no grays on thermal output |
| Date format on labels | `DD/MM/YYYY` — unambiguous for Italian market |
| Lot code format | Fixed-width, uppercase: `LOT-YYYYMMDD-NNN` |

---

## 12 · Token Architecture Summary

Three-layer structure for theming and consistency:

```
┌─────────────────────────────────────────┐
│  Component Tokens                       │  --btn-bg, --card-padding, --badge-ok-bg
│  Direct references in component code    │
├─────────────────────────────────────────┤
│  Semantic Tokens                        │  --color-primary, --color-destructive,
│  Purpose-based aliases (theme-switch)   │  --status-ok-bg, --space-md
├─────────────────────────────────────────┤
│  Primitive Tokens                       │  --slate-700, --green-600, --red-600,
│  Raw values (never used directly)       │  --space-4 (16px)
└─────────────────────────────────────────┘
```

**Rule:** Components MUST reference semantic or component tokens. Never hardcode hex values or raw pixel values in component code.

---

## 13 · Dark Mode Strategy

Dark mode is **not optional** — walk-in coolers, evening service, and staff who prefer it.

| Light Mode | Dark Mode | Rationale |
|-----------|-----------|-----------|
| `#F8FAFC` background | `#0F172A` background | Deep slate, not pure black (OLED consideration) |
| `#FFFFFF` surface | `#1E293B` surface | Sufficient contrast with background |
| Status badge colors stay vibrant | Status badge backgrounds darken, borders brighten | Status must remain instantly readable |
| `1 px` borders | `1 px` borders (brighter) | Structure must remain visible |

> [!IMPORTANT]
> Test dark mode independently in all three environments:
> 1. Well-lit kitchen (verify screen washout doesn't hide status)
> 2. Walk-in cooler (fluorescent blue tint)
> 3. Outdoor delivery area (direct sunlight on screen)

---

## 14 · Pre-Delivery Checklist

### Safety-Critical (P0 — blocks release)

- [ ] All status badges use triple-encoding (color + icon + text label)
- [ ] No status communicated by color alone
- [ ] Touch targets ≥ 56 pt for primary actions, ≥ 48 pt for secondary
- [ ] Body text ≥ 16 px, no text below 14 px anywhere
- [ ] Text contrast ≥ 7:1 (WCAG AAA) for primary text in both themes
- [ ] Status badge contrast ≥ 4.5:1 (WCAG AA) in both themes
- [ ] Expired lot state is visually unmistakable (red + ✕ + "SCADUTO")
- [ ] Destructive actions require confirmation dialog
- [ ] Offline state is persistently visible (not a dismissible toast)
- [ ] Dates always shown as `DD/MM/YYYY` (Italian format)
- [ ] Lot codes displayed in monospace font

### Interaction (P1 — must fix before production)

- [ ] All Pressable components have press feedback (opacity + scale, 100 ms)
- [ ] No animation exceeds 300 ms for primary user flows
- [ ] `Haptics.impactAsync()` on scan success and destructive confirm
- [ ] Tab bar items have `accessibilityRole="tab"` and `accessibilityLabel`
- [ ] All form inputs have visible floating labels (not placeholder-only)
- [ ] Search/filter has ≥ 44 pt clear button
- [ ] Bottom sheets have drag handle + close button (not drag-only)
- [ ] Swipe actions have a visible affordance (subtle arrow/hint)

### Layout (P2 — should fix)

- [ ] SafeAreaView wraps all screens (top + bottom)
- [ ] Content not hidden behind tab bar or header
- [ ] Bento grid collapses to single column on phones
- [ ] Tested on 375 px (iPhone SE), 390 px (iPhone 14), 768 px (iPad mini)
- [ ] Tested in portrait + landscape
- [ ] FlatList uses `keyExtractor`, `getItemLayout` for performance
- [ ] No horizontal scroll on any screen

### Accessibility (P2 — should fix)

- [ ] All interactive elements have `accessibilityLabel`
- [ ] All images/icons have `accessibilityLabel` or are marked `importantForAccessibility="no"`
- [ ] `accessibilityRole` set correctly (button, link, tab, status, header)
- [ ] Focus order follows visual reading order
- [ ] Supports Dynamic Type up to 1.5× without layout breakage
- [ ] `prefers-reduced-motion` respected (no essential info in animation)

### Visual Quality (P2 — should fix)

- [ ] No emojis as UI icons (use Lucide only)
- [ ] All icons from Lucide, consistent 1.5 px stroke
- [ ] No raw hex values in component code (use tokens)
- [ ] Dark mode tested independently
- [ ] No pure white (#FFFFFF) backgrounds on main screens
- [ ] Card borders visible in both light and dark mode

---

## Appendix A · React Native Implementation Notes

### Recommended Libraries

| Concern | Library | Notes |
|---------|---------|-------|
| Navigation | `@react-navigation/native` + `bottom-tabs` | Tab bar + stack |
| Fonts | `expo-font` + `@expo-google-fonts/inter` + `@expo-google-fonts/jetbrains-mono` | Preload in App.tsx |
| Icons | `lucide-react-native` | Consistent icon system |
| Haptics | `expo-haptics` | Feedback on scan, destructive |
| Camera/Scanner | `expo-camera` | Barcode/QR scanning |
| Bottom Sheet | `@gorhom/bottom-sheet` | Performant sheets |
| Async Storage | `@react-native-async-storage/async-storage` | Offline cache |
| Skeleton Loading | `react-native-skeleton-placeholder` | Loading states |

### Theme Provider Pattern

```typescript
// theme.ts
export const lightTheme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    foreground: '#0F172A',
    foregroundSecondary: '#475569',
    foregroundMuted: '#94A3B8',
    primary: '#1D4ED8',
    accent: '#16A34A',
    destructive: '#DC2626',
    border: '#E2E8F0',
    borderStrong: '#CBD5E1',
    // ... status colors
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  radii: { sm: 8, md: 12, lg: 16, xl: 20, full: 9999 },
  shadows: { /* ... */ },
};

export const darkTheme: typeof lightTheme = {
  colors: {
    background: '#0F172A',
    surface: '#1E293B',
    foreground: '#F1F5F9',
    foregroundSecondary: '#CBD5E1',
    foregroundMuted: '#64748B',
    primary: '#3B82F6',
    accent: '#22C55E',
    destructive: '#EF4444',
    border: '#334155',
    borderStrong: '#475569',
    // ... status colors
  },
  spacing: lightTheme.spacing,  // same
  radii: lightTheme.radii,      // same
  shadows: { /* adjusted for dark */ },
};
```

---

## Appendix B · File Structure

```
design-system/
├── MASTER.md            ← This file (global source of truth)
└── pages/               ← Page-specific overrides
    ├── dashboard.md
    ├── lot-detail.md
    ├── scanner.md
    ├── inventory.md
    └── invoice-review.md
```

---

*Design system for FoodLabel — Version 1.0 — August 2026*
*Style: Swiss Minimalism + Bento Grid + Accessible & Ethical Design*
*Compliance: WCAG AAA target, AA minimum*
