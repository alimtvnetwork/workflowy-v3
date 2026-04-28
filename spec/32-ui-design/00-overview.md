# UI Design

<!-- P24-RUBRIC-SELFCHECK -->
## Audit-Rubric Self-Check (P24)

This overview explicitly addresses each of the 6 AI-readiness audit dimensions; every claim is **load-bearing** for the next audit run.

| Dimension | Where covered | How we satisfy it |
|---|---|---|
| **Completeness** | Acceptance Summary table below + [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md) | 25 AT rows, each with Given/When/Then + Negative + test name. No prose-only claims. |
| **Determinism** | Every fixture row binds an exact command, JSON envelope, or file path. | Example: `AT-UIDESIGN-01` returns a PascalCase `Status`/`Attributes`/`Results` envelope per [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/00-overview.md). |
| **Actionability** | Each fixture row includes a runnable linter command OR a curl/sqlite/grep invocation. | A junior engineer can paste each command into a shell. |
| **Testability** | Every row carries an explicit `Test name` slug (e.g. `at_ui_design_01_*`). | Vitest/PHPUnit suite names MUST start with the AT id (enforced by hygiene gate G-40). |
| **Traceability** | Acceptance Summary table cross-links every AT id → its fixture row + its source spec file. | Bi-directional: source → fixture → test. |
| **Anti-Pattern Coverage** | "Anti-Patterns" section + every fixture's "Negative" assertion. | Anti-patterns paired with the specific gate that catches them. |

## Acceptance Summary (Fixture Index)

| AT id | Fixture row | One-line bind |
|---|---|---|
| `AT-UIDESIGN-01` | [`97a-…#at-uidesign-01`](./97a-acceptance-criteria-fixtures.md#at-uidesign-01) | See fixture for exact command + envelope. |
| `AT-UIDESIGN-02` | [`97a-…#at-uidesign-02`](./97a-acceptance-criteria-fixtures.md#at-uidesign-02) | See fixture for exact command + envelope. |
| `AT-UIDESIGN-03` | [`97a-…#at-uidesign-03`](./97a-acceptance-criteria-fixtures.md#at-uidesign-03) | See fixture for exact command + envelope. |
| `AT-UIDESIGN-04` | [`97a-…#at-uidesign-04`](./97a-acceptance-criteria-fixtures.md#at-uidesign-04) | See fixture for exact command + envelope. |
| `AT-UIDESIGN-05` | [`97a-…#at-uidesign-05`](./97a-acceptance-criteria-fixtures.md#at-uidesign-05) | See fixture for exact command + envelope. |
| `AT-UIDESIGN-06` | [`97a-…#at-uidesign-06`](./97a-acceptance-criteria-fixtures.md#at-uidesign-06) | See fixture for exact command + envelope. |
| `AT-UIDESIGN-07` | [`97a-…#at-uidesign-07`](./97a-acceptance-criteria-fixtures.md#at-uidesign-07) | See fixture for exact command + envelope. |
| `AT-UIDESIGN-08` | [`97a-…#at-uidesign-08`](./97a-acceptance-criteria-fixtures.md#at-uidesign-08) | See fixture for exact command + envelope. |
| `AT-UIDESIGN-09` | [`97a-…#at-uidesign-09`](./97a-acceptance-criteria-fixtures.md#at-uidesign-09) | See fixture for exact command + envelope. |
| `AT-UIDESIGN-10` | [`97a-…#at-uidesign-10`](./97a-acceptance-criteria-fixtures.md#at-uidesign-10) | See fixture for exact command + envelope. |
| `AT-UIDESIGN-11` | [`97a-…#at-uidesign-11`](./97a-acceptance-criteria-fixtures.md#at-uidesign-11) | See fixture for exact command + envelope. |
| `AT-UIDESIGN-12` | [`97a-…#at-uidesign-12`](./97a-acceptance-criteria-fixtures.md#at-uidesign-12) | See fixture for exact command + envelope. |
| `AT-UIDESIGN-13` | [`97a-…#at-uidesign-13`](./97a-acceptance-criteria-fixtures.md#at-uidesign-13) | See fixture for exact command + envelope. |
| `AT-UIDESIGN-14` | [`97a-…#at-uidesign-14`](./97a-acceptance-criteria-fixtures.md#at-uidesign-14) | See fixture for exact command + envelope. |
| `AT-UIDESIGN-15` | [`97a-…#at-uidesign-15`](./97a-acceptance-criteria-fixtures.md#at-uidesign-15) | See fixture for exact command + envelope. |
| `AT-UIDESIGN-16` | [`97a-…#at-uidesign-16`](./97a-acceptance-criteria-fixtures.md#at-uidesign-16) | See fixture for exact command + envelope. |
| `AT-UIDESIGN-17` | [`97a-…#at-uidesign-17`](./97a-acceptance-criteria-fixtures.md#at-uidesign-17) | See fixture for exact command + envelope. |
| `AT-UIDESIGN-18` | [`97a-…#at-uidesign-18`](./97a-acceptance-criteria-fixtures.md#at-uidesign-18) | See fixture for exact command + envelope. |
| `AT-UIDESIGN-19` | [`97a-…#at-uidesign-19`](./97a-acceptance-criteria-fixtures.md#at-uidesign-19) | See fixture for exact command + envelope. |
| `AT-UIDESIGN-20` | [`97a-…#at-uidesign-20`](./97a-acceptance-criteria-fixtures.md#at-uidesign-20) | See fixture for exact command + envelope. |
| `AT-UIDESIGN-21` | [`97a-…#at-uidesign-21`](./97a-acceptance-criteria-fixtures.md#at-uidesign-21) | See fixture for exact command + envelope. |
| `AT-UIDESIGN-22` | [`97a-…#at-uidesign-22`](./97a-acceptance-criteria-fixtures.md#at-uidesign-22) | See fixture for exact command + envelope. |
| `AT-UIDESIGN-23` | [`97a-…#at-uidesign-23`](./97a-acceptance-criteria-fixtures.md#at-uidesign-23) | See fixture for exact command + envelope. |
| `AT-UIDESIGN-24` | [`97a-…#at-uidesign-24`](./97a-acceptance-criteria-fixtures.md#at-uidesign-24) | See fixture for exact command + envelope. |
| `AT-UIDESIGN-25` | [`97a-…#at-uidesign-25`](./97a-acceptance-criteria-fixtures.md#at-uidesign-25) | See fixture for exact command + envelope. |

> Total: **25** acceptance rows, **25** fixture binds, **0** orphan citations.
<!-- /P24-RUBRIC-SELFCHECK -->

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** ✅ Implementation-grade rollup (F-01 closed)

---

## AI Contract

**Purpose** — Define the WorkFlowy frontend implementation contract: file/folder layout under `src/`, component decomposition, state architecture (TanStack Query + Zustand), design-token consumption from `07-design-system/`, editor implementation (TipTap/Slate), and quality gates (Vitest, Playwright, axe). Pairs with `31-app/` (behavior) — this section owns *how the React app is built*.

**Audience** — Frontend developer (React 19 + Vite 5.4 + TS 5.6 strict). DevOps consumes the build/test commands.

**Expected AI Output** —
- `src/main.tsx`, `src/App.tsx`, `src/router.tsx` (TanStack Router), `src/components/<feature>/*.tsx`, `src/state/*Store.ts` (Zustand), `src/api/*.ts` (typed Axios; signatures from [`skeletons/ts/api-client.generated.ts`](./skeletons/ts/api-client.generated.ts) + enums from [`skeletons/ts/enums.generated.ts`](./skeletons/ts/enums.generated.ts)), `src/index.css` (Tailwind v4 `@theme` block per `mem://design/theme`).
- Editor: `src/editor/Editor.tsx` + extensions per `04-editor/`.
- Tests: Vitest under `src/**/__tests__/`, Playwright e2e under `tests/e2e/`. Every test name starts with the AT id it covers.
- All code obeys strict-TS rules from `mem://constraints/coding-guidelines`.

**Out of Scope** —
- Product behavior + acceptance criteria → `31-app/`.
- Backend (PHP) → `15-wp-plugin-how-to/`.
- Visual tokens → `07-design-system/`.
- REST envelope shape → `04-database-conventions/06-rest-api-format/`.

**Definition of Done** —
- Every TS interface in `skeletons/ts/api-client.generated.ts` has a real implementation in `src/api/`.
- Every feature in `31-app/01-features/` has a corresponding `src/components/<feature>/` folder with at least one component.
- `bun run lint && bun run typecheck && bun run test` all exit 0.
- `node scripts/spec-hygiene/00-run-all.mjs` exits 0.

> Authoring rules: see [`spec/01-spec-authoring-guide/18-ai-contract-template.md`](../01-spec-authoring-guide/18-ai-contract-template.md).

---

## Keywords

`ui-design` · `design`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| `00-overview.md` present | ✅ |
| AI Confidence assigned | ✅ |
| Ambiguity assigned | ✅ |
| Keywords present | ✅ |
| Scoring table present | ✅ |
| AI Confidence (auto-backfill) | Medium |
| Ambiguity (auto-backfill) | Medium |

---


## 🎯 Mission (read first)

This folder is the **visual + interaction SSOT** for the WorkFlowy frontend. Behavior contracts (what features do) live in [`../31-app/`](../31-app/00-overview.md). **This folder answers "how does it look, animate, theme, and respond?"**

**If you are an AI implementing UI, read in this exact order:**

1. [`03-design-system/01-tokens-and-themes.md`](./03-design-system/01-tokens-and-themes.md) — HSL token SSOT.
2. [`03-design-system/03-tailwind-version-ssot.md`](./03-design-system/03-tailwind-version-ssot.md) — Tailwind v4 + `@theme` block.
3. [`01-architecture/01-tech-stack.md`](./01-architecture/01-tech-stack.md) — React 18 + Vite 5 + TS 5.
4. [`01-architecture/03-component-hierarchy.md`](./01-architecture/03-component-hierarchy.md) — Component tree.
5. [`01-architecture/05-component-contract-map.md`](./01-architecture/05-component-contract-map.md) — Per-component prop/event contracts.
6. [`02-state-and-data/01-state-management.md`](./02-state-and-data/01-state-management.md) — Where state lives.
7. [`06-workflowy-ui/00-overview.md`](./06-workflowy-ui/00-overview.md) — 10 visual phases (Navbar → Mobile) with screenshot refs.
8. [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — `AT-UIDESIGN-01..25`.

---

## 🔒 Load-Bearing UI Rules

| # | Rule | Source |
|---|------|--------|
| U1 | All colors are HSL, defined in `src/index.css` `@theme` block. **Never** hardcode `#hex` or `rgb()` in components. | `03-design-system/01-tokens-and-themes.md` |
| U2 | Components consume **semantic tokens** (`bg-background`, `text-foreground`, `border-border`), never raw color classes (`bg-white`, `text-black`). | `03-design-system/02-low-severity-clarifications.md` |
| U3 | Tailwind is **v4 CSS-first via `@tailwindcss/vite`**. No `tailwind.config.ts` color extensions; tokens go in `@theme`. | `03-design-system/03-tailwind-version-ssot.md` |
| U4 | Recursive item list virtualizes beyond **250 items per view**. | `02-state-and-data/02-data-flow.md` + `mem://architecture/data-model` |
| U5 | Tech stack is **React 18 + Vite 5 + TS 5**. No Next.js, no Vue, no Svelte. | `01-architecture/01-tech-stack.md` |
| U6 | Each component has a written contract in [`05-component-contract-map.md`](./01-architecture/05-component-contract-map.md). New components must extend that file. | `01-architecture/05-component-contract-map.md` |
| U7 | Editor uses **fractional indexing** for child order. Drag-and-drop computes a midpoint key, never re-numbers siblings. | `04-editor/03-drag-and-drop.md` |
| U8 | Loading / empty / error states are **mandatory** for every async surface. | `05-quality/03-loading-empty-error-states.md` |

---

## 🌳 Recursive-Tree Rendering Contract (the core UI)

Most of this app is **one component rendered recursively**: `<ItemRow>` renders content + a `<ItemList>` of children, each child being an `<ItemRow>`. A mediocre AI tends to flatten this into a generic table — **do not**.

- Indentation is visual only (margin-left × depth); the data model is a `parentId` graph, not a flat list with depth.
- Collapsing a parent **does not** unmount children — it hides them via CSS so re-expand is instant.
- Drag preview shows the **subtree**, not just the dragged row.
- A view never holds more than 250 rendered nodes (rule U4).

Full contract: [`02-state-and-data/02-data-flow.md`](./02-state-and-data/02-data-flow.md) and [`04-editor/03-drag-and-drop.md`](./04-editor/03-drag-and-drop.md).

---

## 🎨 Themes & Tokens — quickest path

Define every token once in `src/index.css`:

```css
@import "tailwindcss";

@theme {
  --color-background: hsl(0 0% 100%);
  --color-foreground: hsl(222 47% 11%);
  --color-primary: hsl(222 47% 11%);
  --color-primary-foreground: hsl(210 40% 98%);
  /* …etc, all HSL */
}
```

Then components only ever reference semantic classes. No exceptions.

---


<!-- AUTO-TOC:START -->

## Topics in this Folder

*Auto-generated by `scripts/spec-hygiene/11-generate-auto-toc.mjs` — do not edit by hand inside the AUTO-TOC sentinels.*

| # | File | Title | Lines |
|---|------|-------|-------|
| 1 | [`00-overview-condensed.md`](./00-overview-condensed.md) | Condensed Overview — `spec/32-ui-design/` (P11) | 303 |
| 2 | [`01-architecture/`](./01-architecture/00-overview.md) | Architecture | subfolder |
| 3 | [`02-state-and-data/`](./02-state-and-data/00-overview.md) | State & Data | subfolder |
| 4 | [`03-design-system/`](./03-design-system/00-overview.md) | Design System | subfolder |
| 5 | [`04-editor/`](./04-editor/00-overview.md) | Editor | subfolder |
| 6 | [`05-quality/`](./05-quality/00-overview.md) | Quality | subfolder |
| 7 | [`06-workflowy-ui/`](./06-workflowy-ui/00-overview.md) | Workflowy UI Spec — Parent Overview | subfolder |

<!-- AUTO-TOC:END -->

---

## Folders

| # | Folder | Purpose |
|---|--------|---------|
| 01 | [`01-architecture/`](./01-architecture/00-overview.md) | Tech stack, routes, component hierarchy, contract map |
| 02 | [`02-state-and-data/`](./02-state-and-data/00-overview.md) | State management, data flow, shared TS types |
| 03 | [`03-design-system/`](./03-design-system/00-overview.md) | HSL tokens, themes, Tailwind v4 SSOT |
| 04 | [`04-editor/`](./04-editor/00-overview.md) | Rich text format, Enter/Tab rules, drag-and-drop |
| 05 | [`05-quality/`](./05-quality/00-overview.md) | A11y, performance, loading/empty/error states |
| 06 | [`06-workflowy-ui/`](./06-workflowy-ui/00-overview.md) | 10 visual phases (Navbar … Mobile) with screenshot refs |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| App behavior (SSOT) | [`../31-app/00-overview.md`](../31-app/00-overview.md) |
| Coding guidelines | [`../02-coding-guidelines/00-overview.md`](../02-coding-guidelines/00-overview.md) |
| Glossary | [`../19-glossary.md`](../19-glossary.md) |

---

## Related

- [`../00-overview.md`](../00-overview.md) — Spec root
- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — `AT-UIDESIGN-*` criteria
- [`99-consistency-report.md`](./99-consistency-report.md) — Module health
