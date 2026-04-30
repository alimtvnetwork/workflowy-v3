# Project Overview — WorkFlowy — REDIRECTED

> **⚠️ This on-disk file is NOT the source of truth.**
> **Canonical SSOT:** `mem://index.md` (loaded into every AI prompt as `<memory/index>`).
>
> **Last sync:** 2026-04-30 by NEW-13-FOLLOWUP Task P (broad `.lovable/` legacy drift sweep).
> **Reason for redirect:** the prior content (dated 2026-04-21) carried 7 critical
> drifts vs current canonical state:
>
> 1. Claimed React 18 — actual is **React 19**.
> 2. Claimed state library is Zustand — no such tooling in current spec.
> 3. Claimed runtime decision pending — **RESOLVED 2026-04-25**: WordPress plugin (PHP 8.1+ + SQLite).
> 4. Listed PHP as forbidden — actually **REQUIRED** (WordPress plugin runtime).
> 5. Linked to the now-deleted `.lovable/memory/index.md` (eliminated by Task M/O).
> 6. Claimed `max 300-line files` — actual cap is **400 lines** (spec/01-spec-authoring-guide/12-file-length-cap.md).
> 7. Did not mention SPEC-ONLY mode (active since 2026-04-28) or the trigger phrases.
>
> Keeping the stale content was a parallel-SSOT class identical to the one
> eliminated for `.lovable/memory/index.md`. Redirect chosen to preserve
> backward-compat with any onboarding script that paths to this file.

## For all project overview information

**Read `mem://index.md`** — the Core block is the project overview, and the
Memories section indexes every detailed memory file (data model, ADR
invariants, backend runtime, coding guidelines, design system, features).

## How to navigate (current pointers, validated 2026-04-30)

| You need… | Go to… |
|-----------|--------|
| Project Core invariants | `mem://index.md` (loaded as `<memory/index>` in every prompt) |
| Hard prohibitions | `.lovable/strictly-avoid.md` |
| Lovable-internal active roadmap | `.lovable/plan.md` |
| Public handoff roadmap | `/plan.md` (repo root) |
| Pending suggestions index | `.lovable/suggestions.md` (pointer to `.lovable/memory/suggestions/`) |
| Coding rules | `spec/02-coding-guidelines/` (consolidated guidelines folder) |
| Error management | `spec/03-error-manage/` |
| Spec authoring guide | `spec/01-spec-authoring-guide/00-overview.md` |
| App features | `spec/31-app/` |
| Gate registry | `spec/_GATE-REGISTRY.md` |
| ADR index | `spec/00-adrs/` |

## Do NOT add content here

- Adding rules here creates a parallel SSOT — guaranteed drift (just demonstrated by the 7-drift baseline above).
- The only acceptable edits to this file are: (a) updating the "Last sync" date on a future drift sweep, (b) updating the navigation table when canonical paths change, (c) deleting it once no onboarding script paths to `.lovable/overview.md`.
