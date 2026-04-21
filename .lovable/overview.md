# Project Overview — WorkFlowy

> **Updated:** 2026-04-21
> **Read priority:** FIRST (Phase 1 of `read memory` onboarding)

---

## What This Project Is

WorkFlowy is an outliner/knowledge-management web app modeled after the original WorkFlowy. Every item is a **unified Node** (id, parentId, content, itemType) supporting infinite nesting, mirroring, multi-select, board view, templates, search, sharing, and offline resilience.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS v4 (via `@tailwindcss/vite` in `src/index.css` `@theme` block) + shadcn/ui
- **State:** Zustand
- **Persistence:** SQLite (split-DB architecture; runtime decision pending — see `S003`)
- **Forbidden runtimes:** Go, PHP, Postgres, Supabase

## How To Navigate

| You need… | Go to… |
|-----------|--------|
| Onboarding sequence | `.lovable/prompts/01-read-memory-prompt.md` (or just say "read memory") |
| Hard prohibitions | `.lovable/strictly-avoid.md` |
| Lovable-internal active roadmap | `.lovable/plan.md` |
| Public handoff roadmap | `/plan.md` (repo root) |
| AI readiness report | `.lovable/reports/01-ai-readiness-report.md` |
| Pending suggestions (index) | `.lovable/suggestions.md` → per-file under `.lovable/memory/suggestions/` |
| Institutional memory | `.lovable/memory/index.md` |
| Coding rules | `spec/12-consolidated-guidelines/02-coding-guidelines.md` |
| Error management | `spec/12-consolidated-guidelines/03-error-management.md` |
| Spec authoring | `spec/01-spec-authoring-guide/00-overview.md` |
| App features | `spec/31-app/` |

## Key Conventions (One-Liners)

- **PascalCase** for DB columns, JSON keys, types, classes, enums.
- **camelCase** for variables/methods; **PascalCase** for files.
- **No `any`**, no nested `if`, max 15-line functions, max 300-line files.
- **Booleans** start with `is`/`has`; no negative names; no flag parameters.
- **Always brace** single-line `if`s; blank line before `return`/`throw`.
- **Bump at least minor version** on every code change.
- **Never** touch `.release/`.
