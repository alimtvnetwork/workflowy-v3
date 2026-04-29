# Design System — Acceptance Criteria I/O Fixtures

> **Version:** 1.0.0
> **Created:** 2026-04-28 (UTC+8)
> **Status:** Normative companion to [`97-acceptance-criteria.md`](./97-acceptance-criteria.md).
> **Format spec:** [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md)
> **Spawned by:** `.lovable/plans/00-active.md` § P2d.

---

## Purpose

One concrete I/O fixture per `AT-DESIGNSYS-001..034` row in this folder's prose rollup. All fixtures are pure-UI / static-analysis shape (no REST envelope) per the format SSOT's "two AT shapes that opt out of the JSON rows".

---

## Theme & Variables

### `AT-DESIGNSYS-001` — No hardcoded color literals in components

| Slot | Value |
|------|-------|
| **Given** | Repo at `src/components/**/*.{ts,tsx}`. |
| **Linter command** | `rg -nP "#[0-9a-fA-F]{3,8}\b\|rgb\(\|rgba\(\|\b(bg\|text\|border)-(white\|black\|gray-\d+\|red-\d+\|blue-\d+\|green-\d+)\b" src/components` |
| **Expected exit code** | `1` (no matches) |
| **Then** | Linter prints nothing; CI green. |
| **Side effects** | none |
| **Negative assertion** | `text-white`, `bg-black`, `#fff`, `rgb(0,0,0)` MUST NOT appear in `src/components/`. |

### `AT-DESIGNSYS-002` — Colors via `hsl(var(--token))`

| Slot | Value |
|------|-------|
| **Given** | Token `--primary` defined in `src/index.css` `@theme` block. |
| **Linter command** | `rg -nP "color:\|background(-color)?:\|border(-color)?:" src/ \| rg -v "hsl\(var\(--" \| rg -v "transparent\|inherit\|currentColor\|none"` |
| **Expected exit code** | `1` |
| **Then** | Every CSS color value resolves through `hsl(var(--…))`. |
| **Side effects** | none |
| **Negative assertion** | Direct `color: #1a1a1a` MUST fail the grep. |

### `AT-DESIGNSYS-003` — Changing `--primary` updates all primary surfaces

| Slot | Value |
|------|-------|
| **Given** | Storybook story `Button/Primary` rendered in headless Chromium. |
| **When** | Test mutates `:root { --primary: 0 100% 50%; }` and reads `getComputedStyle(button).backgroundColor`. |
| **Then** | Computed RGB equals `rgb(255, 0, 0)`; reverting the token restores the original RGB. |
| **Side effects** | none |
| **Negative assertion** | No element ignores the token change (i.e. retains old color). |

### `AT-DESIGNSYS-004` — `:root` and `.dark` define every token

| Slot | Value |
|------|-------|
| **Linter command** | `node scripts/spec-hygiene/16-check-tailwind-tokens.mjs --strict-pairs` |
| **Expected exit code** | `0` |
| **Then** | Set of tokens declared inside `:root { … }` equals set declared inside `.dark { … }`. |
| **Negative assertion** | A token defined only in `:root` MUST fail the script with `MISSING_DARK_TOKEN: --<name>`. |

### `AT-DESIGNSYS-005` — Theme toggle changes all surfaces/text/borders

| Slot | Value |
|------|-------|
| **Given** | App rendered with `<html class="">`. |
| **When** | Test toggles `document.documentElement.classList.add('dark')` and snapshots `getComputedStyle` for `body`, primary text node, and a bordered card. |
| **Then** | All three computed colors change; none retain their light-mode value. |
| **Side effects** | none |
| **Negative assertion** | No element keeps a light-mode color after `.dark` is applied. |

### `AT-DESIGNSYS-006` — WCAG AA 4.5:1 text contrast

| Slot | Value |
|------|-------|
| **Linter command** | `npx axe-core src/ --tags wcag2aa --rules color-contrast` |
| **Expected exit code** | `0` |
| **Then** | Every text-on-colored-background pair scores ≥ 4.5. |
| **Negative assertion** | A pair scoring 4.49 MUST fail CI. |

---

## Typography

### `AT-DESIGNSYS-007` — Headings use Ubuntu

| Linter command | `rg -nP "font-family:\s*(?!.*Ubuntu)" src/ \| rg -i "h[1-6]"` |
|---|---|
| **Expected exit code** | `1` |
| **Then** | Every heading-scope CSS rule includes `Ubuntu`. |
| **Negative assertion** | A heading using `Inter` or `Arial` MUST fail. |

### `AT-DESIGNSYS-008` — Body uses Poppins

| Linter command | `rg -nP "body\s*\{[^}]*font-family" src/index.css \| rg "Poppins"` |
|---|---|
| **Expected exit code** | `0` |
| **Then** | Body font-family stack contains `Poppins`. |

### `AT-DESIGNSYS-009` — Code blocks use Ubuntu Mono / JetBrains Mono

| Linter command | `rg -nP "(pre\|code)\s*\{[^}]*font-family" src/ \| rg -P "Ubuntu Mono\|JetBrains Mono"` |
|---|---|
| **Expected exit code** | `0` |

### `AT-DESIGNSYS-010` — H1 / H2 use gradient text

| Given | `<h1>` and `<h2>` rendered in Storybook. |
|---|---|
| **When** | Test reads `getComputedStyle(h1).backgroundImage`. |
| **Then** | Value matches `/linear-gradient\(/`; `-webkit-background-clip` is `text`. |
| **Negative assertion** | A flat-color heading MUST fail. |

### `AT-DESIGNSYS-011` — No skipped heading levels

| Linter command | `rg -nP "<h[1-6]" src/ --type tsx \| node scripts/spec-hygiene/02-check-headers.mjs --document-order` |
|---|---|
| **Expected exit code** | `0` |
| **Negative assertion** | A page jumping from `<h1>` to `<h3>` MUST fail. |

---

## Motion & Transitions

### `AT-DESIGNSYS-012` — Hover transitions ≤ 300 ms

| Linter command | `rg -nP "transition[^;]*\b(\d+)ms" src/ \| awk -F'[ ms]' '{ for(i=1;i<=NF;i++) if($i+0>300) exit 1 }'` |
|---|---|
| **Expected exit code** | `0` |
| **Negative assertion** | `transition: all 500ms` MUST fail. |

### `AT-DESIGNSYS-013` — No JS animation libraries

| Linter command | `rg -n "from ['\"]\\b(framer-motion\|gsap\|anime\|lottie-web)\\b" src/` |
|---|---|
| **Expected exit code** | `1` |

### `AT-DESIGNSYS-014` — `prefers-reduced-motion` disables animations

| Linter command | `rg -nP "@media\s*\(prefers-reduced-motion:\s*reduce\)" src/index.css` |
|---|---|
| **Expected exit code** | `0` |
| **Then** | Block contains `animation: none` and `transition: none` rules. |

### `AT-DESIGNSYS-015` — Link underline sweeps right-to-left on hover

| Given | `<a class="link-underline">…</a>` rendered. |
|---|---|
| **When** | Test reads `::after` pseudo width at `transform-origin`. |
| **Then** | `transform-origin` resolves to `right` initially; on `:hover`, `transform: scaleX(1)` from right edge. |

### `AT-DESIGNSYS-016` — CTA buttons use slide-text animation

| Given | `<Button variant="cta">` rendered. |
|---|---|
| **When** | Test inspects DOM: button contains a child wrapper translated on hover (not just `color` change). |
| **Then** | `transform` includes `translateY` or `translateX` on `:hover`; pure `color` transition fails. |

---

## Code Blocks

### `AT-DESIGNSYS-017` — Code blocks dark in both themes

| Given | `<CodeBlock>` rendered in `:root` and in `.dark`. |
|---|---|
| **Then** | Computed `background-color` luminance < 0.2 in both modes. |

### `AT-DESIGNSYS-018` — Language badge color dot per language

| Given | `<CodeBlock language="ts">` and `<CodeBlock language="py">`. |
|---|---|
| **Then** | The `.lang-dot` `background-color` differs between the two; mapping is keyed by `language` prop. |

### `AT-DESIGNSYS-019` — Font-size controls 12px..32px

| Given | Code block focused. |
|---|---|
| **When** | Press `Ctrl+=` 20 times then `Ctrl+-` 20 times. |
| **Then** | `font-size` is clamped to `[12px, 32px]` inclusive; no value escapes the range. |

### `AT-DESIGNSYS-020` — Line click pins/unpins

| Given | Code block with 5 lines. |
|---|---|
| **When** | Click line 3. |
| **Then** | Line 3 element gains `data-pinned="true"` and `background-color` resolves to `hsl(var(--primary) / 0.15)`. Click again → `data-pinned="false"`. |

### `AT-DESIGNSYS-021` — Shift-click selects line range

| When | Click line 2, then Shift+Click line 5. |
|---|---|
| **Then** | Lines 2..5 inclusive carry `data-selected="true"`. |
| **Negative assertion** | Lines 1 and 6 MUST NOT be selected. |

### `AT-DESIGNSYS-022` — Fullscreen fills viewport with 2rem inset

| When | Click the fullscreen toggle. |
|---|---|
| **Then** | Element bounding rect equals `viewport - 2rem` on all four sides; `position: fixed`; `z-index >= 50`. |

### `AT-DESIGNSYS-023` — Escape exits fullscreen

| Given | Fullscreen mode active. |
|---|---|
| **When** | Press `Escape`. |
| **Then** | Element returns to its original parent and bounding rect; `position` reverts. |

### `AT-DESIGNSYS-024` — Copy button "Copied ✓" for 2 s

| When | Click copy button at `t=0`. |
|---|---|
| **Then** | Button label = `"Copied ✓"` for `t ∈ [0, 2000]ms`; reverts to `"Copy"` at `t ≥ 2000ms ± 50ms`. |

### `AT-DESIGNSYS-025` — Tree blocks show 📁 / 📄 prefixes

| Given | `<CodeBlock variant="tree">` containing folder + file lines. |
|---|---|
| **Then** | Folder lines start with `📁`, file lines with `📄`; rendered DOM contains both glyphs. |

---

## Navigation

### `AT-DESIGNSYS-026` — Header icon hover scale(1.05)

| When | Hover header icon. |
|---|---|
| **Then** | `getComputedStyle(icon).transform` matrix decodes to scale ≈ 1.05. |

### `AT-DESIGNSYS-027` — Menu item hover gradient underline sweep

| Then | Menu item `::after` pseudo has `linear-gradient` background and `scaleX` transitions on `:hover`. |
|---|---|

### `AT-DESIGNSYS-028` — Dropdown items primary-tinted hover

| Then | `getComputedStyle(item:hover).background-color` resolves to `hsl(var(--primary) / 0.10..0.20)`. |
|---|---|

### `AT-DESIGNSYS-029` — Sidebar collapses to sheet < 768 px

| When | Set viewport to 600 px wide. |
|---|---|
| **Then** | Sidebar element gains `data-variant="sheet"` and is hidden by default; trigger button is visible. |

### `AT-DESIGNSYS-030` — `Ctrl+B` toggles sidebar

| When | Press `Ctrl+B` from app root with sidebar visible. |
|---|---|
| **Then** | Sidebar `data-state` flips `expanded`↔`collapsed` per press. |
| **Negative assertion** | No effect when focus is inside a contenteditable that captures the key. |

---

## Page Consistency

### `AT-DESIGNSYS-031` — New pages follow section pattern templates

| Linter command | `node scripts/spec-hygiene/06-check-feature-shape.mjs --pages src/pages` |
|---|---|
| **Expected exit code** | `0` |

### `AT-DESIGNSYS-032` — No new fonts introduced per page

| Linter command | `rg -nP "font-family:" src/pages \| rg -vP "Ubuntu\|Poppins\|JetBrains Mono"` |
|---|---|
| **Expected exit code** | `1` |

### `AT-DESIGNSYS-033` — Interactive elements follow state language

| Then | Every `button`/`a`/`[role=button]` exposes `:hover`, `:focus-visible`, `:active`, `:disabled` styles distinct from base. |
|---|---|
| **Linter command** | `node scripts/spec-hygiene/06-check-feature-shape.mjs --interactive-states` |

### `AT-DESIGNSYS-034` — Responsive at mobile/tablet/desktop

| When | Render each page at 375 / 768 / 1280 px viewports. |
|---|---|
| **Then** | No element exceeds viewport width; horizontal scroll = 0; primary navigation reachable at all three widths. |

---

## Verification

```bash
grep -rn "AC-0" spec/07-design-system/97a-acceptance-criteria-fixtures.md | wc -l   # → 34
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Prose rollup (`AT-DESIGNSYS-001..034`)
- [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md) — Format SSOT
- [`.lovable/plans/p2-coverage.md`](../../.lovable/plans/p2-coverage.md) — Coverage tracker

*P2d/A — created 2026-04-28 (UTC+8). Covers 34/34 design-system rollup ATs.*
