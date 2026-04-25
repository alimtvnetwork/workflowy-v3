# UI Design — Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — top-level rollup with real, traceable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Testable acceptance criteria for the UI Design domain (`spec/32-ui-design/`). Each criterion has a stable ID, points to an authoritative source spec, and can be verified by reading that source or — once SPEC-ONLY mode lifts — by an automated test (Vitest, axe-core, Playwright).

ID format: `AT-UIDESIGN-NN`. Each ID is unique within this folder.

---

## Coverage Map

| # | Subsection | Acceptance ID Range | Status |
|---|-----------|---------------------|--------|
| 1 | [`01-architecture/`](./01-architecture/00-overview.md) | AT-UIDESIGN-01..05 | ✅ Curated |
| 2 | [`02-state-and-data/`](./02-state-and-data/00-overview.md) | AT-UIDESIGN-06..09 | ✅ Curated |
| 3 | [`03-design-system/`](./03-design-system/00-overview.md) | AT-UIDESIGN-10..14 | ✅ Curated |
| 4 | [`04-editor/`](./04-editor/00-overview.md) | AT-UIDESIGN-15..19 | ✅ Curated |
| 5 | [`05-quality/`](./05-quality/00-overview.md) | AT-UIDESIGN-20..24 | ✅ Curated |
| 6 | [`06-workflowy-ui/`](./06-workflowy-ui/00-overview.md) | AT-UIDESIGN-25..28 | ✅ Curated |

---

## Criteria

### 1. Architecture (AT-UIDESIGN-01..05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-UIDESIGN-01 | Tech stack is React 18 + Vite 5 + TypeScript 5 + Tailwind v4 (CSS-first, `@theme` block in `src/index.css`); no other UI framework is introduced. | [`01-architecture/01-tech-stack.md`](./01-architecture/01-tech-stack.md) + `mem://architecture/tech-stack` |
| AT-UIDESIGN-02 | Every documented route in `02-routes.md` is reachable via React Router and has a corresponding page component. | [`01-architecture/02-routes.md`](./01-architecture/02-routes.md) |
| AT-UIDESIGN-03 | The component hierarchy diagram matches the actual `src/components/` tree (no orphan components, no missing parents). | [`01-architecture/03-component-hierarchy.md`](./01-architecture/03-component-hierarchy.md) |
| AT-UIDESIGN-04 | File organization follows the documented folder structure (components/, contexts/, lib/, types/, etc.) with no cross-layer imports that break the contract map. | [`01-architecture/04-file-organization.md`](./01-architecture/04-file-organization.md) |
| AT-UIDESIGN-05 | Every component listed in the contract map has its declared props verified by a TypeScript interface. | [`01-architecture/05-component-contract-map.md`](./01-architecture/05-component-contract-map.md) |

### 2. State & Data (AT-UIDESIGN-06..09)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-UIDESIGN-06 | A single state-management library is used for global state; per-component state uses local React hooks only. | [`02-state-and-data/01-state-management.md`](./02-state-and-data/01-state-management.md) |
| AT-UIDESIGN-07 | All data flow follows the documented direction (server → store → component → UI; events bubble back through documented channels). | [`02-state-and-data/02-data-flow.md`](./02-state-and-data/02-data-flow.md) |
| AT-UIDESIGN-08 | Branded types `ItemId` and `OwnerId` (and any other listed brands) are enforced — no raw `string` is accepted where a brand is required. | [`02-state-and-data/03-data-types.md`](./02-state-and-data/03-data-types.md) + `src/types/index.ts` |
| AT-UIDESIGN-09 | Zero `any` types appear in `src/`; verified by ESLint rule `@typescript-eslint/no-explicit-any: error`. | `mem://constraints/coding-guidelines` |

### 3. Design System (AT-UIDESIGN-10..14)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-UIDESIGN-10 | All colors are defined as HSL semantic tokens in `src/index.css` `@theme` block; no raw hex/rgb literals appear in component classes. | [`03-design-system/01-tokens-and-themes.md`](./03-design-system/01-tokens-and-themes.md) |
| AT-UIDESIGN-11 | Every Tailwind utility class that references a custom token resolves to a defined `@theme` value (verified by `scripts/spec-hygiene/16-check-tailwind-tokens.mjs`). | [`03-design-system/01-tokens-and-themes.md`](./03-design-system/01-tokens-and-themes.md) + hygiene script |
| AT-UIDESIGN-12 | Tailwind version is pinned to v4 via `@tailwindcss/vite`; no Tailwind v3 config file (`tailwind.config.{js,ts}`) exists. | [`03-design-system/03-tailwind-version-ssot.md`](./03-design-system/03-tailwind-version-ssot.md) |
| AT-UIDESIGN-13 | Both light and dark themes meet WCAG 2.1 AA contrast ratios on every documented surface. | [`03-design-system/01-tokens-and-themes.md`](./03-design-system/01-tokens-and-themes.md) + [`05-quality/01-accessibility.md`](./05-quality/01-accessibility.md) |
| AT-UIDESIGN-14 | Each documented design-token category (color / spacing / radius / font-size) lists its full vocabulary and there are no undocumented tokens in `@theme`. | [`03-design-system/02-low-severity-clarifications.md`](./03-design-system/02-low-severity-clarifications.md) |

### 4. Editor (AT-UIDESIGN-15..19)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-UIDESIGN-15 | Rich text format is defined as a single canonical schema (e.g. ProseMirror JSON or HTML subset) and every documented mark/node is supported. | [`04-editor/01-rich-text-format.md`](./04-editor/01-rich-text-format.md) |
| AT-UIDESIGN-16 | Enter-key behavior follows the documented matrix (default = new sibling; Shift+Enter = soft break; behavior in headings / todos / code-blocks per spec). | [`04-editor/02-enter-key-rules.md`](./04-editor/02-enter-key-rules.md) |
| AT-UIDESIGN-17 | Drag-and-drop produces a fractional sort key (no full-list reordering) and updates `Item.parentId` + `sort_key` in a single transaction. | [`04-editor/03-drag-and-drop.md`](./04-editor/03-drag-and-drop.md) + `mem://features/editor-core` |
| AT-UIDESIGN-18 | Every interaction listed in `04-interaction-clarifications.md` has a documented keyboard equivalent (no mouse-only actions). | [`04-editor/04-interaction-clarifications.md`](./04-editor/04-interaction-clarifications.md) |
| AT-UIDESIGN-19 | Undo/redo covers every documented mutation (create, edit, delete, move, indent, outdent, type-change, multi-select bulk ops). | [`04-editor/05-additional-behaviors.md`](./04-editor/05-additional-behaviors.md) |

### 5. Quality (AT-UIDESIGN-20..24)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-UIDESIGN-20 | All interactive elements are keyboard-reachable; focus order matches DOM order; visible focus ring uses a documented token. | [`05-quality/01-accessibility.md`](./05-quality/01-accessibility.md) |
| AT-UIDESIGN-21 | Every interactive element has an accessible name (label, aria-label, or aria-labelledby). | [`05-quality/01-accessibility.md`](./05-quality/01-accessibility.md) |
| AT-UIDESIGN-22 | Initial paint of a 250-item view renders within the documented performance budget. | [`05-quality/02-performance.md`](./05-quality/02-performance.md) |
| AT-UIDESIGN-23 | Every async data fetch has a documented loading state, empty state, and error state. | [`05-quality/03-loading-empty-error-states.md`](./05-quality/03-loading-empty-error-states.md) |
| AT-UIDESIGN-24 | Toast notifications use the typed `useToast()` hook (variants: success / error / info / warning) and auto-dismiss at the documented default. | `src/contexts/ToastContext.tsx` + `src/contexts/ToastContext.test.tsx` |

### 6. Workflowy UI (AT-UIDESIGN-25..28)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-UIDESIGN-25 | All 10 sub-areas (navbar, search, right-panel, bullet, editor, sidebar, calendar, app-shell, integrations, mobile) have a populated `00-overview.md`. | [`06-workflowy-ui/00-overview.md`](./06-workflowy-ui/00-overview.md) |
| AT-UIDESIGN-26 | Search syntax (`#tag`, `is:`, `type:`) matches `mem://features/search-functionality` and the documented performance target is stated. | [`06-workflowy-ui/02-search/00-overview.md`](./06-workflowy-ui/02-search/00-overview.md) |
| AT-UIDESIGN-27 | The right panel hosts comments and notes with the documented open/close behavior; never replaces the main content area. | [`06-workflowy-ui/03-right-panel/`](./06-workflowy-ui/03-right-panel/) |
| AT-UIDESIGN-28 | Mobile layout collapses the sidebar into a drawer and preserves all 12 `ItemType` renderings without loss of functionality. | [`06-workflowy-ui/10-mobile/`](./06-workflowy-ui/10-mobile/) + [`spec/20-enums-index.md`](../20-enums-index.md) |

---

## Verification

```bash
# List every reference to these IDs
grep -rn "AT-UIDESIGN-" spec/32-ui-design/

# Run hygiene checks (link integrity, naming, enum sync, token sync, etc.)
node scripts/spec-hygiene/00-run-all.mjs

# Run frontend unit tests
bun test
```

A criterion is **complete** when:
1. It has a stable `AT-UIDESIGN-NN` ID,
2. It cites a source spec file (or named SSOT), and
3. It is verifiable today by reading the source, or post-implementation by an automated test.

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview of the UI Design domain
- [`spec/19-glossary.md`](../19-glossary.md) — Terminology SSOT
- [`spec/20-enums-index.md`](../20-enums-index.md) — Enum registry
- [`spec/31-app/97-acceptance-criteria.md`](../31-app/97-acceptance-criteria.md) — Sister rollup for the App domain

*Curated v2.0.0 — 2026-04-25 (UTC+8). Replaced the H-2.1 placeholder scaffold.*
