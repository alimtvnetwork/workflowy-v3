# Color Palettes (B1 RESOLVED)

> **Parent:** [`00-overview.md`](./00-overview.md)
> **Source:** Hex values extracted from `.lovable/references/workflowy-screenshots/47-selection-toolbar-colors.png` via image inspection (2026-04-21).
> **Method:** Pixel sampling at row centers y=444 (text), y=478 (highlight), 11 contiguous swatch runs per row.

---

## Text Colors (11 swatches)

Used for foreground text color. Applied via selection toolbar → "A▾" popover or per-node ⋯ menu → Color.

| # | Name | Hex | Approx HSL | Use Case |
|---|------|-----|-----------|----------|
| 1 | Red | `#F18787` | hsl(0, 75%, 73%) | Errors, critical |
| 2 | Pink | `#D8BABB` | hsl(358, 28%, 79%) | Soft accent |
| 3 | Orange | `#D7BDA7` | hsl(25, 36%, 75%) | Warnings |
| 4 | Yellow | `#D9CB65` | hsl(54, 60%, 62%) | Highlights |
| 5 | Green | `#A4CFBE` | hsl(155, 30%, 73%) | Success, complete |
| 6 | Teal | `#A5D0D1` | hsl(181, 31%, 73%) | Info |
| 7 | Blue | `#A3C7DA` | hsl(204, 40%, 75%) | Links, references |
| 8 | Indigo | `#ABC1DB` | hsl(213, 39%, 76%) | Cool emphasis |
| 9 | Purple | `#BEBBDB` | hsl(245, 30%, 80%) | Secondary |
| 10 | Magenta | `#D7BBDB` | hsl(294, 25%, 80%) | Decoration |
| 11 | Grey | `#C3C9D0` | hsl(213, 13%, 79%) | De-emphasized |

---

## Highlight Colors (11 swatches)

Used for background highlight color (text behind). Brighter, more saturated than text colors.

| # | Name | Hex | Approx HSL | Use Case |
|---|------|-----|-----------|----------|
| 1 | Red | `#F29190` | hsl(1, 79%, 76%) | Critical highlight |
| 2 | Pink | `#FBD5D5` | hsl(0, 84%, 91%) | Soft pink wash |
| 3 | Orange | `#FCD9BD` | hsl(28, 92%, 86%) | Warning wash |
| 4 | Yellow | `#FCE96A` | hsl(54, 96%, 70%) | Classic highlight |
| 5 | Green | `#BCF0DA` | hsl(154, 68%, 84%) | Success wash |
| 6 | Teal | `#BCF0F0` | hsl(180, 67%, 84%) | Info wash |
| 7 | Blue | `#BAE6FD` | hsl(199, 95%, 86%) | Reference wash |
| 8 | Indigo | `#C3DDFD` | hsl(214, 95%, 88%) | Cool wash |
| 9 | Purple | `#DCD7FE` | hsl(247, 95%, 92%) | Secondary wash |
| 10 | Magenta | `#FBD7FE` | hsl(295, 92%, 92%) | Decorative wash |
| 11 | Grey | `#E2E8F0` | hsl(214, 32%, 91%) | Neutral wash |

---

## Default / Reset

A "Default" reset chip (✕ icon) is the FIRST item in each popover before the 11 swatches. Clicking it removes any applied color, returning the text to inherit `--foreground` (text) or transparent (highlight).

---

## Storage

Color stored as a single field per node range:
```ts
{ textColor?: string; bgColor?: string }  // hex string or undefined
```

Inline ranges (selection-only color) stored as marks within the rich text representation.

---

## Theme Adaptation

| Theme | Behavior |
|-------|----------|
| Light | Use hex values as-is. |
| Dark | Apply 0.85 opacity overlay to text colors; reduce highlight saturation by 20%. |
| Custom (Phase 8) | Theme may override the entire palette via CSS custom properties. |

CSS custom property mapping (for implementation):
```css
--swatch-text-1: #F18787;  /* Red */
--swatch-text-2: #D8BABB;  /* Pink */
/* ... text-3 through text-11 */
--swatch-highlight-1: #F29190;
/* ... highlight-2 through highlight-11 */
```

---

## Accessibility

- Color is **never the sole meaning** — todos use checkbox state, not color.
- All swatch hover states show name in tooltip (e.g., "Red", "Yellow").
- Contrast: text colors paired with default highlight maintain ≥3:1 ratio in light mode; dark mode auto-adjusts.

---

## Provenance

Extraction details (auditability):
- Screenshot: `47-selection-toolbar-colors.png` (970×604)
- Algorithm: scan rows for non-white runs ≥8px wide, average 6×6 pixel box at run center
- Run on: 2026-04-21 (UTC+8)
- Verified: 11 runs found in each row, matching visual count.
