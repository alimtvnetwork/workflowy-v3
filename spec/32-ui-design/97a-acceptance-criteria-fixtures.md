# UI Design — Acceptance Criteria I/O Fixtures

> **Version:** 1.0.0
> **Created:** 2026-04-28 (UTC+8)
> **Status:** Normative companion to [`97-acceptance-criteria.md`](./97-acceptance-criteria.md).
> **Format spec:** [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md)
> **Spawned by:** `.lovable/plans/00-active.md` § P2d.

---

## Purpose

I/O fixtures for `AT-UIDESIGN-01..25`. The 11 sub-section AT files under `01-architecture/`, `02-state-and-data/`, `03-design-system/`, `04-editor/`, `05-quality/`, and `06-workflowy-ui/**/` are dispatch detail of these 25 rollup criteria — each subsection AT row is a more granular phrasing of the parent rollup AT. Per the P2b precedent, only novel rollup-level fixtures are codified here. Subsection rollups inherit by reference.

---

## Tech stack & architecture

### `AT-UIDESIGN-01` — React 18 + Vite 5 + TS 5; no other frameworks

| Slot | Value |
|------|-------|
| **Linter command** | `node -e "const p=require('./package.json');const d={...p.dependencies,...p.devDependencies};process.exit(d.react?.startsWith('^18')&&d.vite?.startsWith('^5')&&d.typescript?.startsWith('^5')&&!d.next&&!d.vue&&!d['@angular/core']&&!d.svelte?0:1)"` |
| **Expected exit code** | `0` |
| **Negative assertion** | `next`, `vue`, `@angular/core`, `svelte` MUST NOT appear in `package.json`. |

### `AT-UIDESIGN-02` — Single `routes` module

| Linter command | `rg -lP "createBrowserRouter\|<Routes>" src/` |
|---|---|
| **Expected** | Exactly one matching file (e.g. `src/routes.tsx` or `src/App.tsx`). |
| **Negative assertion** | Two or more files declaring routes MUST fail. |

### `AT-UIDESIGN-03` — `AppLayout` wraps every route via `<Outlet />`

| Given | `src/components/layout/AppLayout.tsx`. |
|---|---|
| **Linter command** | `rg -nP "<Outlet" src/components/layout/AppLayout.tsx` |
| **Expected exit code** | `0` |
| **Then** | Route table nests every page under `<AppLayout>`; orphan routes fail the contract test. |

### `AT-UIDESIGN-04` — Folder layout matches spec

| Linter command | `node scripts/spec-hygiene/12-check-required-files.mjs --root src` |
|---|---|
| **Expected exit code** | `0` |
| **Then** | `src/components/layout/`, `src/components/ui/`, `src/pages/`, `src/hooks/`, `src/lib/`, `src/types/` all present. |

### `AT-UIDESIGN-05` — Component contract map matches code

| Linter command | `node scripts/spec-hygiene/07-extract-contract-map.mjs --diff` |
|---|---|
| **Expected exit code** | `0` |
| **Negative assertion** | Adding a new component without an entry in `01-architecture/05-component-contract-map.md` MUST fail. |

---

## Design system & theming

### `AT-UIDESIGN-06` — HSL tokens in `@theme`; no hex/rgb in components

| Linter command | `rg -nP "@theme\s*\{" src/index.css && rg -nP "#[0-9a-fA-F]{3,8}\|rgb\(" src/components` |
|---|---|
| **Expected exit code** | First `0`, second `1`. |

### `AT-UIDESIGN-07` — Semantic Tailwind classes only

| Linter command | `rg -nP "\b(bg\|text\|border)-(white\|black\|gray-\d+\|slate-\d+\|zinc-\d+\|red-\d+\|blue-\d+\|green-\d+\|yellow-\d+)\b" src/components` |
|---|---|
| **Expected exit code** | `1` |
| **Negative assertion** | `text-white`, `bg-slate-900` MUST NOT appear in `src/components/**`. |

### `AT-UIDESIGN-08` — Tailwind v4 via `@tailwindcss/vite`; no legacy color extensions

| Linter command | `node -e "const p=require('./package.json');const d={...p.dependencies,...p.devDependencies};process.exit(d['@tailwindcss/vite']?0:1)" && rg -nP "extend:\s*\{[^}]*colors:" tailwind.config.* 2>/dev/null` |
|---|---|
| **Expected exit code** | First `0`, second `1` (no matches). |

### `AT-UIDESIGN-09` — Theme is token-driven; toggle changes only `@theme` vars

| Given | App rendered. |
|---|---|
| **When** | Toggle `.dark` on `<html>` and diff each component's `className` set before/after. |
| **Then** | Diff is empty (zero class changes); only computed CSS values change. |

---

## State & data

### `AT-UIDESIGN-10` — State management approach matches spec

| Linter command | `rg -lP "from ['\"]redux['\"]\|from ['\"]@reduxjs" src/` |
|---|---|
| **Expected exit code** | `1` (no matches, unless spec mandates Redux — currently it does not). |

### `AT-UIDESIGN-11` — Tree render; collapsed children stay mounted (CSS-hidden)

| Given | Item with 3 children, collapsed. |
|---|---|
| **Then** | DOM contains 3 child nodes with `[hidden]` or `display:none`; React reconciler reports same fiber instances after expand → no remount. |
| **Negative assertion** | Children MUST NOT be removed from the DOM when collapsed. |

### `AT-UIDESIGN-12` — ≤ 250 rendered nodes per view

| Given | List with 1000 items. |
|---|---|
| **Then** | `document.querySelectorAll('[data-item-row]').length <= 250`; remaining nodes virtualized or paginated. |

### `AT-UIDESIGN-13` — Shared TS types imported, not redefined

| Linter command | `rg -nP "^(export )?(interface\|type) Item\b" src/ \| wc -l` |
|---|---|
| **Expected** | Exactly `1` (the canonical declaration in `src/types/index.ts`). |

---

## Editor

### `AT-UIDESIGN-14` — Rich-text format matches spec serialized form

| Given | Editor content `"hello **bold** world"`. |
|---|---|
| **When** | Serialize via documented adapter. |
| **Then** | Output equals the literal JSON shape in `04-editor/01-rich-text-format.md`'s sample (deep-equal). |

### `AT-UIDESIGN-15` — Enter-key behavior matches spec exactly

> Cross-references `AT-APP-12` fixture in `spec/31-app/97a-acceptance-criteria-fixtures.md`.

| Given | Item `itm_A` content `"hello"`, caret at end. |
|---|---|
| **When** | Press `Enter`. |
| **Then** | New sibling `itm_B` after `itm_A`, empty content, focused. Empty `itm_A` + caret-at-start + Enter → sibling **before**. |

### `AT-UIDESIGN-16` — Drag-drop fractional-index midpoint; no re-numbering

| Given | Siblings sorted as `A(sort=1.0)`, `B(sort=2.0)`, `C(sort=3.0)`. |
|---|---|
| **When** | Drag `C` between `A` and `B`. |
| **Then** | `C.sort` becomes `1.5` (midpoint); `A.sort` and `B.sort` unchanged. Drag preview DOM contains the full subtree of `C`. |
| **Negative assertion** | No bulk renumbering of siblings; no `UPDATE Item SET SortOrder = …` for `A` or `B`. |

### `AT-UIDESIGN-17` — Tab indents under prev sibling; Shift+Tab outdents

| Given | Siblings `A`, `B` (B after A); caret in `B`. |
|---|---|
| **When** | Press `Tab`. |
| **Then** | `B.parentId` becomes `A.id`; `B.sort` reset to first-child slot; only `B` mutated. Shift+Tab on a deeply nested item makes its `parentId` = grandparent. |

---

## Quality

### `AT-UIDESIGN-18` — WCAG 2.1 AA

| Linter command | `npx axe-core src/ --tags wcag21aa` |
|---|---|
| **Expected exit code** | `0` |

### `AT-UIDESIGN-19` — Performance budgets met

| Linter command | `npx lighthouse-ci --budget-path=.lighthouseci/budget.json` |
|---|---|
| **Expected exit code** | `0` |
| **Then** | FCP < documented budget; bundle size < documented budget per `05-quality/02-performance.md`. |

### `AT-UIDESIGN-20` — Loading + empty + error states on every async surface

| Given | Any data-fetching component. |
|---|---|
| **Then** | Three storybook stories per component: `*.loading`, `*.empty`, `*.error` — all render non-blank UI. Missing any of the three fails the snapshot suite. |
| **Negative assertion** | A component MUST NOT render `null` while loading. |

---

## Workflowy UI phases (visual SSOT)

Each phase fixture below points at its phase-specific subsection rollup; granular gestures live in those rollups.

### `AT-UIDESIGN-21` — Navbar matches Phase 1 spec

| Given | `<Navbar>` rendered with breadcrumb of 8 segments at 600 px viewport. |
|---|---|
| **Then** | Middle segments collapse to `…`; back/forward buttons disabled when history empty (`disabled` attribute present). |

### `AT-UIDESIGN-22` — Search popover behaves as command palette

| When | Press `Ctrl+K`. |
|---|---|
| **Then** | Popover opens, focus-trapped; `Esc` closes; `↑/↓` move highlight; `Enter` activates the highlighted result. |

### `AT-UIDESIGN-23` — Bullet anatomy + per-bullet menu

| Given | Item bullet rendered. |
|---|---|
| **When** | Click bullet (not text). |
| **Then** | Context menu opens anchored to the bullet, contains the documented action set; clicking outside dismisses. |

### `AT-UIDESIGN-24` — Editor visuals match Phase 5

| Given | Editor with selection across 3 items. |
|---|---|
| **Then** | Cursor color = `hsl(var(--primary))`; selection background = `hsl(var(--primary) / 0.20)`; inline `@mention` and `#tag` tokens render with the documented chip styling. |

### `AT-UIDESIGN-25` — App shell — themes, fonts, settings, app menu

| Given | App shell rendered. |
|---|---|
| **When** | Open Settings → Appearance → toggle theme; change font size. |
| **Then** | `<html class>` updates to `dark`/`""`; root `font-size` updates; both persist in `localStorage` under documented keys. |

---

## Verification

```bash
grep -rn "AT-UIDESIGN-" spec/32-ui-design/97a-acceptance-criteria-fixtures.md | wc -l   # → 25
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Prose rollup (`AT-UIDESIGN-01..25`)
- [`spec/31-app/97a-acceptance-criteria-fixtures.md`](../31-app/97a-acceptance-criteria-fixtures.md) — Cross-ref for editor + interaction fixtures
- [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md) — Format SSOT
- [`.lovable/plans/p2-coverage.md`](../../.lovable/plans/p2-coverage.md) — Coverage tracker

*P2d/B — created 2026-04-28 (UTC+8). Covers 25/25 UI-design rollup ATs.*
