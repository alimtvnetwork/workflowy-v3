# Feature File Template

> **Version:** 1.0.0
> **Updated:** 2026-04-19
> **Parent:** [00-overview.md](./00-overview.md)
> **Scope:** Every file under `spec/31-app/01-features/` (and any other folder containing user-facing feature specifications).

---

## Why this template exists

A feature file is the **single source of truth** for one user-facing capability. It must be:

- **Self-contained** — a fresh AI session can implement the feature with zero clarifying questions.
- **Testable** — every behaviour has a measurable acceptance criterion.
- **Wired to code** — every UI surface maps to a component path + `data-testid`.
- **Atomic** — one capability per file. If two capabilities can ship independently, they belong in two files.

If a feature file is missing any of the five mandatory sections below, it **fails the spec-hygiene check** (`scripts/spec-hygiene/06-check-feature-shape.mjs`).

---

## Mandatory sections (in order)

Every feature file MUST contain these five `##` headings, in this order, with these exact spellings:

1. `## Inputs`
2. `## Outputs`
3. `## Edge Cases`
4. `## Acceptance Tests`
5. `## Component Contract`

Additional sections (`## Overview`, `## User Story`, `## Related`, etc.) are encouraged but optional. They may appear before, between, or after the mandatory five — order of optional sections is flexible.

---

## Section definitions

### 1. `## Inputs`

What the feature consumes. List every input the user, system, or upstream feature provides.

| Field | Type | Source | Required | Notes |
|-------|------|--------|----------|-------|
| `itemId` | `string` | URL / parent state | Yes | Stable across mirror/move/share |
| `viewMode` | `ViewMode` enum | UI toggle | No | Defaults to `Outline` |

- Be exhaustive — missing inputs are the #1 cause of rebuild failures.
- Always link enum types to their canonical definition (`spec/20-enums-index.md` once H-5.2 lands).

### 2. `## Outputs`

What the feature produces. Every persisted change, emitted event, side effect, and visible state.

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| Updated `Item.content` | ✅ DB | SQLite `Item` table | Triggers `item:updated` event |
| Optimistic UI render | ❌ | React state | Rolls back on save failure |

- Distinguish persisted outputs from ephemeral ones.
- If the feature emits events, name them and link to the event registry.

### 3. `## Edge Cases`

Every "what if" the implementer must handle. Format as a numbered list — each row will become an acceptance test.

1. User deletes an item that is currently mirrored in another view.
2. Network drops mid-save — local queue must persist the operation.
3. Concurrent edit from another tab — last-write-wins per `08-concurrency-and-sync.md` rules.
4. Item exceeds 250-per-view rendering limit — show "load more" sentinel.

- One edge case per row.
- Reference the global edge-case index (`spec/31-app/03-edge-cases/01-edge-cases.md`) when the same case applies cross-feature.

### 4. `## Acceptance Tests`

Concrete, machine-checkable behaviours. Each test has an ID (`AT-{feature}-{nn}`), a Given/When/Then body, and a `data-testid` reference.

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-MIRRORS-01 | An item with 2 mirrors exists | User edits content in mirror A | All mirrors reflect new content within 100 ms | `mirror-content` |
| AT-MIRRORS-02 | A mirror is the last instance | User deletes it | Original item is also deleted | `mirror-delete-confirm` |

- IDs must be globally unique within the spec.
- Every edge case from §3 must have at least one matching acceptance test.
- Tests are the contract — implementations are correct iff every AT row passes.

### 5. `## Component Contract`

The bridge from spec to code. Maps every UI surface to its component path and `data-testid` so reviewers can grep the codebase and find the implementation in one step.

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Mirror badge | `src/components/items/MirrorBadge.tsx` | `mirror-badge` | AT-MIRRORS-01, AT-MIRRORS-03 |
| Mirror delete confirm dialog | `src/components/items/MirrorDeleteDialog.tsx` | `mirror-delete-confirm` | AT-MIRRORS-02 |

- If the component does not exist yet, list the **planned path** — this is the implementation order.
- Every `data-testid` referenced in §4 must appear in this table.
- Component paths feed `spec/32-ui-design/01-architecture/01-component-contract-map.md` (M-3).

---

## Optional sections

Use any of these as needed; none are enforced:

- `## Overview` — one-paragraph summary at the top.
- `## User Story` — `As a {persona}, I want {capability}, so that {value}.`
- `## Visual Design` — link to mockups, screenshots, or `spec/32-ui-design/` files.
- `## Performance Targets` — latency, memory, render budgets.
- `## Telemetry` — what to log, what events to fire.
- `## Related` — cross-references to other feature files (mandatory in H-4.1 — add a `## Related` block to every file).

---

## Skeleton (copy-paste this)

```markdown
# {Feature Name}

> **Version:** 1.0.0
> **Updated:** YYYY-MM-DD
> **Parent:** [00-overview.md](./00-overview.md)

## Overview

One paragraph: what this feature is, who uses it, why it matters.

## User Story

As a {persona}, I want {capability}, so that {value}.

## Inputs

| Field | Type | Source | Required | Notes |
|-------|------|--------|----------|-------|
| ... | ... | ... | ... | ... |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| ... | ... | ... | ... |

## Edge Cases

1. ...
2. ...

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-{FEATURE}-01 | ... | ... | ... | ... |

## Component Contract

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| ... | `src/components/...` | `...` | AT-{FEATURE}-01 |

## Related

- [Sibling feature](./NN-other-feature.md) — why it relates
```

---

## Enforcement

- **Linter:** `scripts/spec-hygiene/06-check-feature-shape.mjs` (M-2.3) parses every file under `spec/31-app/01-features/` and fails if any of the five mandatory `##` headings are missing or out of order.
- **Acceptance coverage:** `scripts/spec-hygiene/08-check-acceptance-coverage.mjs` (H-2.2) cross-checks that every `## Edge Cases` row has at least one matching `## Acceptance Tests` row.
- **Contract map:** `scripts/spec-hygiene/07-extract-contract-map.mjs` (M-3.2) aggregates every `## Component Contract` table into the global map.

---

## Migration plan (M-2.2)

Retrofit one file at a time. Order:

1. `01-information-model.md` (foundational — sets the data model many ATs reference)
2. `03-layout-structure.md`
3. `04-page-content-area.md`
4. `05-interactions.md`
5. `06-item-context-menu.md`
6. `07-board-view.md`
7. `08-share-dialog.md`
8. `09-mirrors.md`
9. `10-today-view.md`
10. `11-trash-view.md`
11. `12-multi-select.md`
12. `13-templates.md`
13. `02-personas.md` (last — least Inputs/Outputs structure, may need optional-section-only treatment)

Each retrofit is one atomic task. Do not bulk-rewrite — review every file individually so existing content is preserved and only restructured.

---

## Related

- [03-required-files.md](./03-required-files.md) — file types every spec folder must contain
- [05-app-project-template.md](./05-app-project-template.md) — overall app spec scaffolding
- [12-file-length-cap.md](./12-file-length-cap.md) — 400-line soft / 800-line hard cap
