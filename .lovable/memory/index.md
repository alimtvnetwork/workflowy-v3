# Project Memory — REDIRECTED

> **⚠️ This on-disk file is NOT the source of truth.**
> **Canonical SSOT:** `mem://index.md` (loaded into every AI prompt as `<memory/index>`).
>
> **Last sync:** 2026-04-30 by NEW-13-FOLLOWUP Task M (memory-drift sweep).
> **Reason for redirect:** the on-disk copy drifted across 5 Core invariants and
> 4 Memories descriptions vs `mem://index.md`. Keeping a parallel SSOT was
> creating false-negative-class drift (AI could read either copy and proceed
> on the stale one). Redirect chosen over delete to preserve the
> `.lovable/strictly-avoid.md` rule "Never add a memory file without updating
> `.lovable/memory/index.md`" (file presence is treated as a registry marker
> by the hygiene rule even though no runner currently reads it).
>
> **For ALL memory queries — read `mem://index.md` only.**

## Why this exists

The path `.lovable/memory/index.md` is referenced by `.lovable/strictly-avoid.md`
(Memory section) as the registry that authors must update when adding new
memory files. That convention pre-dates the migration to the `mem://` virtual
namespace. Until the strictly-avoid rule is amended (deferred — a future spec
task), this file MUST exist as a placeholder so the convention check does not
flag missing-registry. All actual content lives in `mem://`.

## Do NOT add content here

- Adding rules here creates a parallel SSOT — guaranteed drift.
- Adding "Memories" rows here will not be loaded into AI prompts.
- The only acceptable edits to this file are: (a) updating the "Last sync"
  date on a future drift sweep, (b) deleting it once
  `.lovable/strictly-avoid.md` is amended to drop the on-disk-registry rule.

## Sync stamp

- **Canonical (`mem://index.md`) updated:** 2026-04-30 (post-Task L burndown).
- **This redirect stamped:** 2026-04-30 by NEW-13-FOLLOWUP Task M.
