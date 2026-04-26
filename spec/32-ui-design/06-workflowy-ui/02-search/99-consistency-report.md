# 99 — Consistency Report

> **Version:** 1.1.0 · **Updated:** 2026-04-25 (UTC+8) · **Status:** ✅ Authored
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Audit method:** Manual cross-reference walk + file inventory at authoring time. S05 cross-phase audit appended 2026-04-25.

---

## Health Score: **99 / 100** ✅

| Category | Score | Notes |
|----------|-------|-------|
| File completeness | 20/20 | All 16 files declared in overview exist |
| Cross-ref integrity | 20/20 | Phase 8 reverse-link added 2026-04-25; Phase 5 palette confirmed enumerated |
| AC coverage | 20/20 | 20/20 ACs map to ≥ 1 spec file |
| Token discipline | 19/20 | 4 NEW tokens documented; not yet added to `@theme` (deferred) |
| Deferral hygiene | 20/20 | All backend/storage references explicitly deferred |

Deductions:
- **−1** `--accent-active` + `--highlight` token pairs must be added to `@theme` before Phase 2 implementation begins (intentional — spec-only mode)

Resolved since 1.0.0:
- ✅ Phase 8 reverse cross-link to Phase 2 `⌘K` added in [`../08-app-shell/00-overview.md`](../08-app-shell/00-overview.md) § Global Hotkey Registration
- ✅ Phase 5 highlight palette confirmed fully enumerated (11 hex values) in [`../05-editor/04-color-palettes.md`](../05-editor/04-color-palettes.md)

---

## File Inventory

| # | File | Exists | Lines (target) | Status |
|---|------|--------|----------------|--------|
| 00 | `00-overview.md` | ✅ | ≤ 200 | ✅ |
| 01 | `01-popover-anatomy.md` | ✅ | ≤ 300 | ✅ |
| 02 | `02-filter-tab-rail.md` | ✅ | ≤ 250 | ✅ |
| 03 | `03-hint-and-suggestions.md` | ✅ | ≤ 350 | ✅ |
| 04 | `04-right-action-icons.md` | ✅ | ≤ 300 | ✅ |
| 05 | `05-token-system.md` | ✅ | ≤ 250 | ✅ |
| 06 | `06-query-grammar.md` | ✅ | ≤ 400 | ✅ |
| 07 | `07-results-and-highlighting.md` | ✅ | ≤ 250 | ✅ |
| 08 | `08-keyboard-shortcuts.md` | ✅ | ≤ 200 | ✅ |
| 09 | `09-states-and-edge-cases.md` | ✅ | ≤ 350 | ✅ |
| 10 | `10-accessibility.md` | ✅ | ≤ 250 | ✅ |
| 11 | `11-design-tokens.md` | ✅ | ≤ 250 | ✅ |
| 12 | `12-icon-map.md` | ✅ | ≤ 150 | ✅ |
| 13 | `13-data-contracts.md` | ✅ | ≤ 300 | ✅ |
| 97 | `97-acceptance-criteria.md` | ✅ | ≤ 250 | ✅ |
| 99 | `99-consistency-report.md` | ✅ | ≤ 100 | ✅ (this file) |

Archive: `_archive-v1/` — 4 files (`README.md`, `01-overlay.md`, `02-filter-syntax.md`, `99-consistency-report.md`) ✅

**Total: 16 active spec files + 4 archived = 20 files.**

---

## Cross-reference Integrity

| Source → Target | Status |
|-----------------|--------|
| `00-overview.md` → all 15 sub-files | ✅ All resolve |
| `01..13` → `00-overview.md` (parent ref) | ✅ All present |
| `10-accessibility.md` → `11-design-tokens.md` § 5 contrast | ✅ |
| `11-design-tokens.md` → `../../03-design-system/03-tailwind-version-ssot.md` | ✅ |
| `12-icon-map.md` → Phase 4 item-type icons | ⏳ Forward-ref (Phase 4 done) |
| `12-icon-map.md` → Phase 5 highlight palette hex | ⏳ Forward-ref (palette resolved at parent; sub-mapping populated in Phase 5) |
| `08-keyboard-shortcuts.md` → Phase 8 global hotkey reg | ⏳ Forward-ref (Phase 8 done; reverse link should be added) |
| `09-states-and-edge-cases.md` → Phase 10 mobile sheet | ⏳ Forward-ref (Phase 10 deferred — acceptable) |
| `13-data-contracts.md` → `mem://constraints/backend-runtime-deferred` | ✅ |
| `97-acceptance-criteria.md` → all 13 sub-spec files | ✅ All resolve |

**No broken links. 4 forward-refs are intentional and documented.**

---

## AC Coverage Summary

20 acceptance criteria spread across 7 categories:

| Category | Count | IDs |
|----------|-------|-----|
| Open/Close & Focus | 4 | OC-01..04 |
| Tab Rail | 2 | TAB-05, TAB-06 |
| Hint & Suggestions | 2 | HINT-07, HINT-08 |
| Token System | 4 | TOK-09..12 |
| Results & Highlighting | 4 | RES-13..16 |
| A11y & Responsive | 2 | A11Y-17, A11Y-18 |
| Saved & Motion | 2 | EXT-19, EXT-20 |

Every sub-spec file (01–13) has at least one AC covering it. ✅

---

## Deferrals Registry

| Item | Owning concern | Resolved here? |
|------|----------------|----------------|
| Saved Searches storage adapter | Backend runtime | ❌ Deferred (per memory rule) |
| Full-text indexing engine | Backend runtime | ❌ Deferred |
| Mobile sheet pixel layout | Phase 10 | ❌ Deferred |
| Highlight color enumeration | Phase 5 § palette | ❌ Forward-ref only |
| `⌘K` global hotkey binding registration | Phase 8 app shell | ❌ Forward-ref only |
| 4 NEW design tokens in `@theme` | Implementation prerequisite | ❌ Documented, not added |

All deferrals are explicit and traceable. ✅

---

## Recommended follow-ups (post-Phase-2)

1. Add reverse cross-link from Phase 8 hotkey section to `08-keyboard-shortcuts.md`.
2. When Phase 5 palette hex values land, update `12-icon-map.md` § Highlight color suggestions.
3. Add the 4 NEW tokens (`--highlight`, `--highlight-foreground`, `--accent-active`, `--accent-active-foreground`) to `src/index.css` `@theme` before any Phase 2 implementation work begins.

---

## Sign-off

Phase 2 (Search Popover v2.0.0) is **spec-complete**. No blocking gaps for implementation handoff.
