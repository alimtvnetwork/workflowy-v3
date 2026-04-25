# App — Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — top-level rollup with real, traceable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Testable acceptance criteria for the App domain (`spec/31-app/`). Each criterion has a stable ID, points to an authoritative source spec, and can be verified by reading that source or — once SPEC-ONLY mode lifts — by an automated test.

ID format: `AT-APP-NN`. Each ID is unique within this folder.

---

## Coverage Map

| # | Subsection | Acceptance ID Range | Status |
|---|-----------|---------------------|--------|
| 1 | [`01-features/`](./01-features/00-overview.md) | AT-APP-01..10 | ✅ Curated |
| 2 | [`02-workflows/`](./02-workflows/00-overview.md) | AT-APP-11..14 | ✅ Curated |
| 3 | [`03-edge-cases/`](./03-edge-cases/00-overview.md) | AT-APP-15..18 | ✅ Curated |
| 4 | [`04-roadmap/`](./04-roadmap/00-overview.md) | AT-APP-19..21 | ✅ Curated |
| 5 | [`05-conventions/`](./05-conventions/00-overview.md) | AT-APP-22..23 | ✅ Curated |

---

## Criteria

### 1. Features (AT-APP-01..10)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-APP-01 | Every node in the outline is a single unified `Item` (id, parentId, content, itemType) regardless of visual presentation. | [`01-features/01-information-model.md`](./01-features/01-information-model.md) |
| AT-APP-02 | A view (single zoom root + descendants) renders no more than `MAX_ITEMS_PER_VIEW = 250` items; the rest are virtualized or paginated. | [`01-features/04-page-content-area.md`](./01-features/04-page-content-area.md) |
| AT-APP-03 | A bullet row exposes, in order: indent spacer, expand toggle, bullet dot, content, note indicator, mirror badge, child-count badge, hover actions. | [`01-features/04-page-content-area.md`](./01-features/04-page-content-area.md) §3.1 |
| AT-APP-04 | Clicking a bullet dot zooms into that item; the item becomes the visible root of the view. | [`01-features/04-page-content-area.md`](./01-features/04-page-content-area.md) §3.1 |
| AT-APP-05 | All 12 `ItemType` values render with the visuals defined in the type-differences table (bullet, h1/h2/h3, paragraph, todo, numbered, board, dashboard, quote, code-block, divider). | [`01-features/04-page-content-area.md`](./01-features/04-page-content-area.md) §3.3 + [`spec/20-enums-index.md`](../20-enums-index.md) |
| AT-APP-06 | Multi-select supports Shift-click (range), Cmd/Ctrl-click (toggle), ⌘A (select all in zoom), and Esc (clear). | [`01-features/12-multi-select.md`](./01-features/12-multi-select.md) §12.1 |
| AT-APP-07 | Multi-select selection never crosses the current zoom boundary. | [`01-features/12-multi-select.md`](./01-features/12-multi-select.md) §12.4 |
| AT-APP-08 | Bulk Delete shows a confirmation dialog when selected count > 5. | [`01-features/12-multi-select.md`](./01-features/12-multi-select.md) §12.3 |
| AT-APP-09 | Mirror instances display the mirror badge (◇) and editing any instance updates the canonical source and all other mirrors. | [`01-features/09-mirrors.md`](./01-features/09-mirrors.md) |
| AT-APP-10 | Items in trash are recoverable for 30 days, then permanently deleted. | [`01-features/11-trash-view.md`](./01-features/11-trash-view.md) |

### 2. Workflows (AT-APP-11..14)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-APP-11 | Every keyboard shortcut listed in `01-keyboard-shortcuts.md` has exactly one canonical binding (no duplicates) and exactly one documented action. | [`02-workflows/01-keyboard-shortcuts.md`](./02-workflows/01-keyboard-shortcuts.md) |
| AT-APP-12 | Modifier keys are documented with both macOS (⌘) and non-macOS (Ctrl) equivalents. | [`02-workflows/01-keyboard-shortcuts.md`](./02-workflows/01-keyboard-shortcuts.md) |
| AT-APP-13 | Editing shortcuts (Bold ⌘B, Italic ⌘I, Underline ⌘U, Strikethrough ⌘⇧X) match the floating formatting toolbar in §3.4. | [`01-features/04-page-content-area.md`](./01-features/04-page-content-area.md) §3.4 |
| AT-APP-14 | The shortcut Escape clears multi-selection and the shortcut ⌘A selects all visible items in the current zoom. | [`01-features/12-multi-select.md`](./01-features/12-multi-select.md) §12.1 |

### 3. Edge Cases (AT-APP-15..18)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-APP-15 | Every documented edge case names: trigger, expected behavior, and user-visible feedback. | [`03-edge-cases/01-edge-cases.md`](./03-edge-cases/01-edge-cases.md) |
| AT-APP-16 | Product boundaries (what WorkFlowy is NOT) are listed and each is justified. | [`03-edge-cases/02-product-boundaries.md`](./03-edge-cases/02-product-boundaries.md) |
| AT-APP-17 | Network-loss / offline behavior is specified for every write operation (create, update, delete, move). | [`03-edge-cases/01-edge-cases.md`](./03-edge-cases/01-edge-cases.md) + `mem://features/offline-resilience` |
| AT-APP-18 | Concurrent-edit conflicts have a documented resolution rule (last-write-wins, OT, CRDT, or operation queue). | [`01-features/14-concurrency-and-sync.md`](./01-features/14-concurrency-and-sync.md) |

### 4. Roadmap (AT-APP-19..21)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-APP-19 | Implementation phases P1.1 → P1.7 are listed in dependency order with explicit prerequisites. | [`04-roadmap/01-implementation-phases.md`](./04-roadmap/01-implementation-phases.md) |
| AT-APP-20 | Every "resolved decision" links to the spec section it resolved and the date it was decided. | [`04-roadmap/02-resolved-decisions.md`](./04-roadmap/02-resolved-decisions.md) |
| AT-APP-21 | The backend runtime decision (suggestions-tracker S003) is documented as the single remaining blocker before P1.1 can begin. | `.lovable/memory/suggestions/suggestions-tracker.md` |

### 5. Conventions (AT-APP-22..23)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-APP-22 | Axios version is pinned and any change requires a documented review. | [`05-conventions/01-axios-version-control.md`](./05-conventions/01-axios-version-control.md) |
| AT-APP-23 | All file/folder names follow the `NN-kebab-case.md` convention (verified by `scripts/spec-hygiene/04-check-naming.mjs`). | [`spec/01-spec-authoring-guide/`](../01-spec-authoring-guide/) + hygiene script |

---

## Verification

```bash
# List every reference to these IDs
grep -rn "AT-APP-" spec/31-app/

# Run hygiene checks (link integrity, naming, enum sync, token sync, etc.)
node scripts/spec-hygiene/00-run-all.mjs
```

A criterion is **complete** when:
1. It has a stable `AT-APP-NN` ID,
2. It cites a source spec file (or named SSOT), and
3. It is verifiable today by reading the source, or post-implementation by an automated test.

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview of the App domain
- [`spec/19-glossary.md`](../19-glossary.md) — Terminology SSOT
- [`spec/20-enums-index.md`](../20-enums-index.md) — Enum registry (incl. `ItemType`)
- [`spec/32-ui-design/97-acceptance-criteria.md`](../32-ui-design/97-acceptance-criteria.md) — Sister rollup for UI design

*Curated v2.0.0 — 2026-04-25 (UTC+8). Replaced the H-2.1 placeholder scaffold.*
