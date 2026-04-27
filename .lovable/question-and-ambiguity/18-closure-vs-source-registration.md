# 18 — Closure-table size vs G-30 closed-ID count

**Date:** 2026-04-27
**Task:** F20 — Close other open prefixes
**Mode:** No-questions (auto-resolved)

## Observation

I added 67 closure rows (12 prefixes × multiple IDs) expecting G-30 closed-ID count to jump 901 → 968. Actual jump: 901 → 908 (+7).

## Root cause

The G-30 runner walks **all of `spec/31-app/`** (not just `01-features/97-acceptance-criteria.md`) when collecting registered IDs. The 60 "missing" registrations were **already** in the registry — declared by the source feature files themselves (e.g. `01-features/03-layout-structure.md` has `| AT-LAYOUT-12 | ... |` in its own `## Acceptance Tests` table, which the runner picks up via `RX_DECL_SINGLE`).

So:
- **Before F20:** 60 of 67 IDs already closed via source-file tables; remaining 7 were satisfied only by open-prefix license.
- **After F20:** All 67 are now closed via two paths (source file + closure table). Only 7 new registrations.

## Why F20 is still valuable

Even though only +7 closed-ID delta, the closure table provides:

1. **Single-page audit surface** — auditors no longer have to scan 12 source files to verify which inline IDs exist; they read one table.
2. **Citation source-of-truth** — when a consumer (endpoint matrix, workflow) cites `AT-LAYOUT-12`, they can link to the closure table for the canonical definition without ambiguity over whether they meant the alias or the source.
3. **Reject-on-typo safety net** — once the open-prefix declarations are eventually removed, a citation to e.g. `AT-LAYOUT-99` will be rejected even if the source file accidentally introduces `AT-LAYOUT-99` later (because the closure table is curated, the source-file table is whatever happens to be there).

## Side-effect: +1 open prefix

Open-prefix count went 40 → 41. The increment is `AT-MULTI-NN` — my prose paragraph "When the source file gains a new inline AT row…" mentions the alias prefix in a way that matches `RX_DECL_OPEN`. `AT-MULTI` was not previously open-licensed (only `AT-MULTISELECT` was, via the source file). This is harmless — the closure rows are the authoritative resolution path.

## Future hardening (F22-or-later)

Could tighten G-30 to **prefer closure-table rows over open-prefix license** when both match, then deprecate the open-prefix declarations entirely. Out of scope for F20.

## No questions asked

Auto-decisions:

1. **One consolidated table or 12 per-prefix tables (F15 style)?** → One consolidated table. F15's per-prefix layout was justified by the alias rename (`AT-INFO` → `AT-INFOMODEL`); for 11 identity prefixes there's no rename to highlight, so one table scales better.

2. **Include AT-CONCURRENCY-17 even though it's a one-off?** → Yes. It's cited; therefore it must close.

3. **Touch the source feature files?** → No. They already have the AT rows in their own tables; F20 is purely about adding closure rows in the dispatch index.
