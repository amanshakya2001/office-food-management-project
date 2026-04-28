# Office Food Manager — Brand Guidelines

> Version 1.0 · April 2025 · Internal / Personal App

---

## 1. Brand Personality

Office Food Manager is a **personal daily-use utility**. The design language reflects:

- **Warm & grounded** — turmeric/saffron accent palette inspired by Indian food culture
- **Purposeful density** — information-rich without feeling cluttered
- **Dark-first** — a deep charcoal canvas that reduces eye strain during daily use
- **Trustworthy** — clear status indicators, no ambiguity about sync state

---

## 2. Color Palette

### Primary Brand Color — Turmeric / Saffron

| Role | Token | Hex | Usage |
|------|-------|-----|-------|
| Accent | `ACCENT` | `#E8A020` | Primary CTA buttons, active nav icon |
| Accent Text | `ACCENT_TEXT` | `#F5C55A` | Readable text on dark accent backgrounds |
| Accent Muted | `ACCENT_MUTED` | `#2A2210` | Info banners, pending badge fill |
| Accent Border | `ACCENT_BORDER` | `#3A2C08` | Border on pending badge |

### Background Hierarchy

| Role | Token | Hex | Usage |
|------|-------|-----|-------|
| App Background | `BG` | `#0F0E0C` | Root screen background |
| Surface | `SURFACE` | `#1A1915` | Cards, list backgrounds, input fill |
| Card | `CARD` | `#222118` | Elevated cards (stat tiles) |

### Borders

| Role | Token | Hex | Usage |
|------|-------|-----|-------|
| Default | `BORDER` | `#2E2C25` | Dividers, input outlines |
| Light | `BORDER_LIGHT` | `#3A3830` | Secondary borders, pill outlines |

### Status Colors

| State | Base | Muted Bg | Text | Border |
|-------|------|----------|------|--------|
| Success / Synced | `#4CAF7D` | `#0F2018` | `#6FCF97` | `#1F4A2F` |
| Error / Not Linked | `#E05252` | `#2A1010` | `#F47F7F` | `#4A1F1F` |
| Info / Link | `#5B9BD5` | `#101825` | `#7BB8F0` | — |

### Text Hierarchy

| Level | Token | Hex | Usage |
|-------|-------|-----|-------|
| Primary | `TEXT_PRIMARY` | `#F0EDE6` | Headings, list titles, input values |
| Secondary | `TEXT_SECONDARY` | `#9C9885` | Labels, subtitles |
| Tertiary | `TEXT_TERTIARY` | `#5C5A50` | Captions, section headers, hints |

### Avatar Colors (deterministic)

Avatars use a 5-color palette assigned by `name.charCodeAt(0) % 5`.
Fill = base color + `33` (20% opacity). Border = base + `66` (40% opacity).

| Index | Color | Hex |
|-------|-------|-----|
| 0 | Amber | `#C17D2A` |
| 1 | Teal | `#2A7D5C` |
| 2 | Blue | `#2A5C7D` |
| 3 | Rose | `#7D2A5C` |
| 4 | Green | `#5C7D2A` |

---

## 3. Typography

### Fonts

| Family | Use case |
|--------|----------|
| **DM Sans** | All UI text — headings, labels, buttons, body |
| **DM Mono** | Meal descriptions, phone numbers, CSV column names |

Install: `npx expo install @expo-google-fonts/dm-sans @expo-google-fonts/dm-mono`

### Type Scale

| Name | Size | Weight | Usage |
|------|------|--------|-------|
| `eyebrow` | 11sp | 500 | App name label above screen title |
| `screenTitle` | 22sp | 700 | Main heading in TopBar |
| `screenSubtitle` | 13sp | 400 | Secondary line in TopBar |
| `sectionLabel` | 11sp | 600 | Section headers (ALL CAPS, wide tracking) |
| `listItemTitle` | 15sp | 600 | Primary row text |
| `listItemSubtitle` | 13sp | 400 | Secondary row text |
| `mealDescription` | 13sp | 400 | Monospaced meal entry text |
| `heroNumber` | 26sp | 700 | Per-person share large display |
| `statValue` | 22sp | 700 | Stat card values |
| `costValue` | 16sp | 700 | Cost in list rows |
| `btnPrimary` | 15sp | 700 | Primary button label |
| `btnSecondary` | 15sp | 500 | Secondary button label |
| `badge` | 11sp | 500 | Status badge text |
| `navLabel` | 10sp | 400/600 | Bottom nav tab labels |

### Letter Spacing Rules

- Screen titles and large numbers: `-0.02em` (tight)
- Section labels: `+0.08em` (airy, uppercase)
- App eyebrow: `+0.10em` (widest)
- Badges: `+0.04em`

---

## 4. Spacing System

Base unit = **4dp**. All spacing is a multiple of 4.

| Token | Value | Primary use |
|-------|-------|-------------|
| `xs` | 4dp | Tight gaps between inline elements |
| `sm` | 8dp | Icon–text gaps, badge internal |
| `md` | 16dp | Card padding, section gap |
| `lg` | 20dp | **Screen horizontal gutter** |
| `xl` | 24dp | Top/status bar spacing |

**Screen horizontal gutter is always 20dp** — apply to all list rows, cards, buttons, and section labels.

---

## 5. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4dp | Inline code chips |
| `sm` | 8dp | Meal description input |
| `md` | 10dp | Inputs, banners, radio rows |
| `lg` | 12dp | **Cards, buttons, stat tiles** |
| `xl` | 20dp | Badges, pills, chips |
| `full` | 9999dp | Avatars, dots, radio fill |

---

## 6. Component Patterns

### Primary Button
- Background: `ACCENT` (`#E8A020`)
- Text: `BG` (`#0F0E0C`) — always black on saffron
- Height: 48dp, radius: 12dp, font: 15sp/700
- Full-width in screen actions

### Secondary Button
- Background: transparent
- Border: 1dp `BORDER_LIGHT`
- Text: `TEXT_PRIMARY`
- Same dimensions as primary

### Status Badges
Two variants — use consistently:

| State | Fill | Text | Border |
|-------|------|------|--------|
| ✓ Synced | `GREEN_MUTED` | `GREEN_TEXT` | `GREEN_BORDER` |
| ⏳ Pending | `ACCENT_MUTED` | `ACCENT_TEXT` | `ACCENT_BORDER` |
| SW Linked | `GREEN_MUTED` | `GREEN_TEXT` | `GREEN_BORDER` |
| Not Linked | `RED_MUTED` | `RED_TEXT` | `RED_BORDER` |

All badges: 3dp/8dp padding, 20dp radius, 11sp/500 font.

### Avatars
- Size variants: 22 / 28 / 32 / 36 / 40dp
- Shape: circle (`radius: full`)
- Fill: `avatarColor(name) + '33'`
- Border: `avatarColor(name) + '66'`, 1.5dp width
- Content: 2-character uppercase initials, `font-size = size × 0.35`

### List Rows
- Padding: 14dp vertical, 20dp horizontal
- Divider: 1dp `BORDER`, 4dp vertical margin
- Active/selected: `ACCENT_MUTED` background + `ACCENT` border

### Input Fields
- Background: `SURFACE`
- Border: 1dp `BORDER`
- Radius: 10dp
- Padding: 12dp/14dp
- Filled value color: `TEXT_PRIMARY`
- Empty placeholder color: `TEXT_TERTIARY`
- Label above: 13sp/500 `TEXT_SECONDARY`

### Info Banner (Accent tinted)
- Background: `ACCENT_MUTED`
- Border: 1dp `ACCENT` at 20% opacity (`#E8A02033`)
- Radius: 10dp
- Text: `ACCENT_TEXT`

### Bottom Navigation
- Background: `BG`
- Top border: 1dp `BORDER`
- Active icon: `ACCENT`, active label: `ACCENT_TEXT`, weight 600
- Idle icon + label: `TEXT_TERTIARY`, weight 400
- 4 tabs: Home, People, Export, Settings

---

## 7. Iconography

The design uses **text/unicode symbols** as lightweight icons for MVP:

| Symbol | Meaning |
|--------|---------|
| `⊞` | Home |
| `◎` | People |
| `↓` | Export / Download |
| `⊙` | Settings |
| `✓` | Connected / Synced |
| `⏳` | Pending |
| `→` | Mapping arrow |
| `+` | Add new |

For production, replace with a proper icon library (e.g. `react-native-vector-icons` / `@expo/vector-icons` with MaterialCommunityIcons or Phosphor).

---

## 8. Do / Don't

| ✅ Do | ❌ Don't |
|-------|---------|
| Use `ACCENT` only for the primary action or active state | Use `ACCENT` decoratively on multiple elements |
| Keep screen gutter strictly at 20dp | Vary horizontal padding per screen |
| Show sync status on every day entry card | Hide or de-emphasise sync state |
| Use `DM Mono` for meal descriptions and phone numbers | Mix fonts within the same data row |
| Show "Awaiting cost" in italic `ACCENT_TEXT` | Leave cost fields blank/empty without a hint |
| Use the full date format `Thu 24 Apr 2025` | Use shortened dates like "24/4" or "Apr 24" |
| Give the last person the rounding remainder in Splitwise | Round all shares independently (causes validation error) |

---

*— End of Brand Guidelines —*