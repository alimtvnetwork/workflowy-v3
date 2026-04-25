# Plan: Restructure `spec/31-app/` and `spec/32-ui-design/`

> **Status:** Completed — 2026-04-19
> **Created:** 2026-04-18
> **Version:** 1.1.0
> **Scope:** `spec/31-app/`, `spec/32-ui-design/` only. Folders `01–24` and `33–36` are untouched.

---

## 1. Problems Identified

### `spec/31-app/`
| Issue | Detail |
|------|--------|
| Numbering gaps & ordering | `00, 01-project-workflow.md, 02-features/, 03-audits/, 04-axios-version-control.md, 99` — subfolders sit between sibling `.md` files, breaking visual grouping. |
| Mixed content types at one level | A 917-line workflow spec, a 90-line tooling rule, and two empty subfolders coexist with no logical separation. |
| Empty subfolders | `02-features/` and `03-audits/` only contain `.gitkeep` + `00-overview.md` — no actual specs. |
| Monolithic `01-project-workflow.md` | 917 lines spanning 19 top-level sections (personas → layout → board → mirrors → today → trash → shortcuts → templates → edge cases → phases). Should be split into a folder of focused files. |
| Tool-specific rule misplaced | `04-axios-version-control.md` is a coding-guideline-flavored rule, not an app workflow rule. |

### `spec/32-ui-design/`
| Issue | Detail |
|------|--------|
| Monolithic `01-frontend.md` | 1233 lines covering 18 distinct concerns (tech stack, routes, components, state, data flow, design system, rich text, DnD, accessibility, performance, states). Single file violates the spec authoring style applied elsewhere. |
| No subfolders | Everything lives at the root; no domain grouping. |

---

## 2. Proposed Target Structure

### `spec/31-app/` (new)
```
spec/31-app/
├── 00-overview.md                       # describes the whole app spec layer + sub-folders
├── 01-features/                         # renamed from 02-features (renumbered)
│   ├── 00-overview.md                   # what 'features' means + index
│   ├── 01-information-model.md          # from §1 of project-workflow
│   ├── 02-personas.md                   # from §0
│   ├── 03-layout-structure.md           # from §2
│   ├── 04-page-content-area.md          # from §3
│   ├── 05-interactions.md               # from §4
│   ├── 06-item-context-menu.md          # from §5
│   ├── 07-board-view.md                 # from §6
│   ├── 08-share-dialog.md               # from §7
│   ├── 09-mirrors.md                    # from §8
│   ├── 10-today-view.md                 # from §9
│   ├── 11-trash-view.md                 # from §10
│   ├── 12-multi-select.md               # from §12
│   ├── 13-templates.md                  # from §13
│   └── 99-consistency-report.md
├── 02-audits/                           # renamed from 03-audits (renumbered)
│   ├── 00-overview.md
│   └── 99-consistency-report.md
├── 03-workflows/                        # NEW — bucket for cross-feature flows
│   ├── 00-overview.md
│   ├── 01-keyboard-shortcuts.md         # from §11
│   ├── 02-template-application-flow.md  # from §13 flow detail
│   └── 99-consistency-report.md
├── 04-edge-cases/                       # NEW
│   ├── 00-overview.md
│   ├── 01-edge-cases.md                 # from §14
│   ├── 02-product-boundaries.md         # from §16
│   └── 99-consistency-report.md
├── 05-roadmap/                          # NEW
│   ├── 00-overview.md
│   ├── 01-implementation-phases.md      # from §15
│   ├── 02-resolved-decisions.md         # from §17
│   └── 99-consistency-report.md
├── 06-conventions/                      # NEW — app-scoped tool/code conventions
│   ├── 00-overview.md
│   ├── 01-axios-version-control.md      # moved from current 04-axios-version-control.md
│   └── 99-consistency-report.md
└── 99-consistency-report.md
```

The original monolith `01-project-workflow.md` is **deleted** after its sections are split. The cross-reference index (§18) becomes part of the new top-level `00-overview.md`.

### `spec/32-ui-design/` (new)
```
spec/32-ui-design/
├── 00-overview.md
├── 01-architecture/
│   ├── 00-overview.md
│   ├── 01-tech-stack.md                 # from §1
│   ├── 02-routes.md                     # from §2
│   ├── 03-component-hierarchy.md        # from §3
│   ├── 04-file-organization.md          # from §8
│   └── 99-consistency-report.md
├── 02-state-and-data/
│   ├── 00-overview.md
│   ├── 01-state-management.md           # from §4
│   ├── 02-data-flow.md                  # from §5
│   ├── 03-data-types.md                 # from §7
│   └── 99-consistency-report.md
├── 03-design-system/
│   ├── 00-overview.md
│   ├── 01-tokens-and-themes.md          # from §6
│   ├── 02-low-severity-clarifications.md # from §6F
│   └── 99-consistency-report.md
├── 04-editor/
│   ├── 00-overview.md
│   ├── 01-rich-text-format.md           # from §6A
│   ├── 02-enter-key-rules.md            # from §6B
│   ├── 03-drag-and-drop.md              # from §6C
│   ├── 04-interaction-clarifications.md # from §6D
│   ├── 05-additional-behaviors.md       # from §6E
│   └── 99-consistency-report.md
├── 05-quality/
│   ├── 00-overview.md
│   ├── 01-accessibility.md              # from §9
│   ├── 02-performance.md                # from §10
│   ├── 03-loading-empty-error-states.md # from §11
│   └── 99-consistency-report.md
└── 99-consistency-report.md
```

The original monolith `01-frontend.md` is **deleted** after the split.

---

## 3. Reference Updates Required

After splits, these files must be re-pathed:
- `.lovable/memory/index.md` and `.lovable/memory/docs/specifications.md`
- `.lovable/prompts/01-read-memory-prompt.md`
- `.lovable/plan.md`
- `spec/readme.md`
- `spec/31-app/00-overview.md`, `spec/32-ui-design/00-overview.md`
- Any `99-consistency-report.md` referencing the old monoliths
- `plan.md` (root) — phase tables that cite "Workflow §X" or "Frontend §Y"

A `grep -rln "01-project-workflow\|01-frontend" .lovable spec` pass will catch all of them after restructuring.

---

## 4. Versioning

Per `.lovable/user-preferences`: every code/spec change bumps at least the minor version.
- `spec/31-app/00-overview.md`: 1.0 → 1.2.0
- `spec/32-ui-design/00-overview.md`: 1.0 → 1.2.0
- New folders start at 1.0.0
- Each split file inherits the source version and bumps to the next minor.

---

## 5. Execution Order (when approved)

1. **Phase A — `spec/31-app/`**
   1. Create new subfolder skeletons (`00-overview.md`, `99-consistency-report.md`, `.gitkeep`).
   2. Split `01-project-workflow.md` section-by-section into target files.
   3. Move `04-axios-version-control.md` → `06-conventions/01-axios-version-control.md`.
   4. Renumber `02-features` → `01-features`, `03-audits` → `02-audits`.
   5. Delete the monolith.
   6. Update `00-overview.md` with the new file inventory.
2. **Phase B — `spec/32-ui-design/`**
   1. Create new subfolder skeletons.
   2. Split `01-frontend.md` section-by-section.
   3. Delete the monolith.
   4. Update `00-overview.md`.
3. **Phase C — Reference repair**
   1. `grep` for stale paths across `.lovable/` and `spec/`.
   2. Fix every hit; verify with a second grep.
4. **Phase D — Verify**
   1. Re-run cross-reference audit.
   2. Update each touched `99-consistency-report.md`.

---

## 6. Decision Points for User

Before execution, please confirm:

| # | Question | Default |
|---|----------|---------|
| Q1 | Approve the proposed `31-app/` subfolder names (`features`, `audits`, `workflows`, `edge-cases`, `roadmap`, `conventions`)? | Yes |
| Q2 | Approve the proposed `32-ui-design/` subfolder names (`architecture`, `state-and-data`, `design-system`, `editor`, `quality`)? | Yes |
| Q3 | Should the existing monolith files be **deleted** after the split, or **archived** to `.lovable/archive/`? | Delete (git keeps history) |
| Q4 | Execute Phase A and Phase B together, or A first then review before B? | A+B together |

---

*End of plan.*
