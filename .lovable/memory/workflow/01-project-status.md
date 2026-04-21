# Project Status — WorkFlowy

> **Updated:** 2026-04-21 (Workflowy spec consolidation — screenshot inspection + phase plan)

## Latest Session Summary (2026-04-21)
- ✅ Saved + visually inspected 28 Workflowy reference screenshots (img-40 → img-67) to `.lovable/references/workflowy-screenshots/`.
- ✅ Re-inspected img-50–59 visually (had only filename-indexed before) — captured 6 new locked facts (3-dot handle position, breadcrumb truncation `…`, in-content 3-dot menu order, slash-menu definitive order, code-block single-node behavior, focused-node H1 rendering).
- ✅ User decisions locked: **H1–H5** kept (slash menu shows H1–H3, we extend); **Code Block forward** = N siblings merge into ONE node with internal line breaks; **Email-to-Workflowy** deferred to Phase 9; **Quick Add** = global `⌘⇧N` web modal that appends to Inbox (no PWA in v1).
- ✅ Earlier decisions reconfirmed: Sidebar `collapsible="offcanvas"`; default sidebar items = Today, Home, Inbox, Drafts, Mentions, Calendar, Trash, + New node; Hotkeys img-65 canonical; Handbook = both structure AND English content; phases run sequentially 1 → 8.
- ✅ Published full **10-phase Workflowy spec consolidation plan** (8 active + 2 deferred) — see `.lovable/plans/03-workflowy-spec-consolidation.md`.
- ⏳ Awaiting user "go" to start **Phase 1 (Navbar & Breadcrumb)** — first file: `spec/32-ui-design/01-architecture/02-navbar.md`.
- ⏳ 4 cross-cutting blockers parked: 11+11 hex swatches from img-47, sidebar drag semantics (move vs mirror), launch theme list, LinkedIn integration scope.

## Previous Session Summary (2026-04-20)
- ✅ Locked spec edit scope to folders **18+** only; folders 01–17 READ-ONLY (codified in `.lovable/strictly-avoid.md`).
- ✅ Marked R3-1 (400-line cap split) **VOID**.
- ✅ Audited consistency reports across spec/31–36: 0 broken cross-refs, all 17 required files present; **5 structural/metadata issues found** (tracked in `.lovable/pending-issues/01-spec-31-36-audit-findings.md`).
- ✅ Created Write Memory protocol: `.lovable/prompts/02-write-memory-prompt.md` + index entry in `.lovable/prompt.md`.
- ✅ Established `.lovable/pending-issues/` and `.lovable/solved-issues/` folders.
- ⏳ User decision needed: Approach A (renumber spec/31-app/03→02) vs Approach B (create empty 02-audits/) — see pending issue 01.



## Current State

- **Phase:** Pre-implementation (specification complete, no code yet)
- **No package.json, no Vite config, no src/ folder** — project is documentation-only
- **Build error expected** — no code exists yet; will resolve when Phase 1.1 is implemented
- **Architecture:** Split SQLite (spec'd) — runtime decision pending (S003)
- **Frontend:** React 18 + TypeScript + Vite + Tailwind + shadcn/ui (planned)
- **Frontend spec score:** 100/100 (26 gaps identified and fixed)
- **Backend spec:** NOT yet analyzed for gaps (blocked by S003)

## What Has Been Done ✅

| Item | Status | Notes |
|------|--------|-------|
| Read all spec files (4 files, ~2900 lines) | ✅ Done | Sessions 1–3 |
| Read all guidance files (39 files, ~3000+ lines) | ✅ Done | Sessions 1–3 |
| Read all legacy docs (3 files, ~900 lines) | ✅ Done | Sessions 1–2 |
| Frontend failure analysis (26 gaps) | ✅ Done | All 26 fixed in spec §6A–§6F |
| Reliability risk report | ✅ Done | `.lovable/memory/workflow/03-reliability-risk-report.md` |
| Coding rules summary | ✅ Done | `.lovable/memory/workflow/02-coding-rules-summary.md` |
| Suggestions tracker | ✅ Done | `.lovable/memory/suggestions/suggestions-tracker.md` |
| Implementation roadmap | ✅ Done | `plan.md` (5 phases) |

## What Is Pending ❌

| Item | Blocker | Notes |
|------|---------|-------|
| Phase 1.1 — Bootstrap Project | None | Ready to start |
| Phase 1.2 — Design System Setup | Phase 1.1 | Ready after bootstrap |
| Phase 1.3 — App Layout Shell | Phase 1.2 | Ready after design system |
| Phase 1.4 — Core Outliner | S003 for persistence | Can start with in-memory state |
| Phase 1.5–1.7 | S003 | Blocked by backend decision |
| S003 — Backend Runtime Decision | User decision | CRITICAL BLOCKER |
| S002 — Column Naming Mismatch | User approval | Blocks clean backend schema |
| S005 — Backend Failure Analysis | S003 | Cannot analyze until runtime chosen |

## Spec Reading Status

| File | Lines | Status |
|------|-------|--------|
| `spec/01-PROJECT-WORKFLOW.spec.md` | 882 | ✅ Read and memorized |
| `spec/02-FRONTEND.spec.md` | ~1050 | ✅ Read and memorized (includes §6A–§6F gap fixes) |
| `spec/03-BACKEND.spec.md` | 436 | ✅ Read (backend gap analysis pending — S005) |
| `spec/04-SYSTEM-ARCHITECTURE.spec.md` | 536 | ✅ Read |
| `guidance/` (39 files) | ~3000+ | ✅ All read |
| `docs/` (3 legacy files) | ~900 | ✅ Read (outdated — S001) |

## Key Artifacts

| Artifact | Location |
|----------|----------|
| Reliability risk report | `.lovable/memory/workflow/03-reliability-risk-report.md` |
| Frontend failure analysis (26/26 fixed) | `.lovable/memory/workflow/04-frontend-failure-analysis.md` |
| Coding rules quick reference | `.lovable/memory/workflow/02-coding-rules-summary.md` |
| Suggestions tracker (single file) | `.lovable/memory/suggestions/suggestions-tracker.md` |
| Implementation roadmap | `plan.md` |

## Active Blockers

| Blocker | Suggestion | Impact |
|---------|-----------|--------|
| Backend runtime undefined | S003 | Blocks auth, persistence, file uploads |
| Column naming mismatch | S002 | Blocks clean backend implementation |

## Immediately Actionable (no blockers)

1. Phase 1.1 — Bootstrap Project
2. Phase 1.2 — Design System Setup
3. Phase 1.3 — App Layout Shell

## Rules (from guidance/)

- PascalCase file names, camelCase variables, PascalCase types
- PascalCase DB columns (`NodeId`, `CreatedAt`)
- `is`/`has` prefix on all booleans; no negative boolean names
- Zero nested `if` — absolute ban
- Max 15 lines per function body
- No file > 300 lines
- `strict: true` in tsconfig, zero `any`
- Guard clauses / early returns for flat code
- Any code change bumps at least minor version (except `.release/` folder)
- `.release/` folder: never touch, never modify

## Do NOT Touch

- `.release/` folder
- `.gitignore`, `bun.lock`, `package-lock.json` — read-only
- **`spec/01-…` through `spec/17-…` (all folders 01-17) — READ-ONLY.** Never edit, split, restructure, or run hygiene/auto-TOC scripts that touch them. Editable spec scope is folders **18 and above** only (18-spec-issues, 31-app, 32-ui-design, 33-feedback-report, 34-activity-feed, 35-enforcement-rules, 36-user-management, plus root files like 19-glossary.md, 20-enums-index.md, 21-ai-readiness-audit-round-2.md, 99-consistency-report.md, spec-index.md).
- **R3-1 (400-line cap split task) is VOID** — it targeted 02-coding-guidelines which is now read-only. Do not resume or suggest it.

## Issues Log

No implementation issues yet — project is still in documentation/planning phase. Issues will be tracked in `.lovable/memory/issues/` once implementation begins, with each issue as a separate file containing: root cause, solution, iteration count, learnings, and what not to repeat.
