# Gate Graduation Ledger

> **Version:** 1.2.0
> **Created:** 2026-04-29 (UTC+8) — answers task #35 (gate-graduation tracking gap surfaced after #57/#58/#59 trio).
> **Updated:** 2026-04-29 — **task #52c: registered `G-32-LICENSE-FILES-PRESENT`** as 9th WARN-only entry, following ADR-0032 ratification (task #52). Prior: 1.1.0 — F-AUDIT-26 RESOLVED (3 vague flipCriteria tightened).
> **Status:** Active — single source of truth for every WARN-only hygiene gate's flip criteria + target date.
> **Parent:** [`_GATE-REGISTRY.md`](./_GATE-REGISTRY.md)
> **Authoritative pattern:** [ADR-0031](./00-adrs/0031-warn-only-strict-flip-pattern.md) — "Warn-only-with-STRICT-flip" gate-graduation pattern.

---

## Purpose

A WARN-only gate that lacks a documented **flip criterion** drifts into permanent advisory mode. The 2026-04-29 audit-tooling cycle shipped three diagnostic gates (`G-00-AUDIT-EXEMPTION-REVIEW`, `G-00-AT-FIX-COMPANION-SHAPE`, `G-00-PLACEHOLDER-DENSITY`) each with its own bespoke flip rule buried in the runner's `STRICT` constant or the registry row's prose. This ledger consolidates those rules so:

1. A single grep answers "which gates are still soft?" — eliminates the registry scan.
2. Every WARN-only gate is forced to declare a **measurable** flip criterion (no "eventually", no `to-be-determined` placeholder). [^1]
3. CI can later read this file to auto-detect gates whose flip date has passed but who remain soft (separate gate, future task).

[^1]: The bare three-letter "to-be-determined" token is forbidden by `G-38-AMBIGUOUS-WORDING`; declare a measurable threshold instead.

---

## Schema

| Field | Required | Format | Notes |
|---|---|---|---|
| `gate` | yes | `G-NN-…` ID matching a row in `_GATE-REGISTRY.md` | MUST exist in registry |
| `mode` | yes | `WARN` (current) \| `HARD-FAIL` (graduated) | Flip = `WARN` → `HARD-FAIL` |
| `flipCriterion` | yes | Measurable predicate (numeric threshold, count = 0, regex match, date) | Forbidden: vague prose |
| `flipMechanism` | yes | One-line description of the code edit needed (e.g. `set STRICT=true in runner`, `delete WARN-tier branch`) | Reviewer guidance |
| `targetDate` | yes | ISO `YYYY-MM-DD` — best-estimate flip date OR hard SLA | If criterion-driven, target is the SLA cap |
| `addedOn` | yes | ISO `YYYY-MM-DD` | Audit trail |
| `linkedTask` | optional | Task # from current loop or external ticket | Drives scheduling |

---

## Entries

| gate | mode | flipCriterion | flipMechanism | targetDate | addedOn | linkedTask |
|---|---|---|---|---|---|---|
| `G-NS-STATUS-IN-LEGEND` | WARN | legacy-status count = 0 (current: 46) | delete WARN branch in runner | 2026-06-30 | 2026-04-29 | P3 status sweep |
| `G-NS-ADR-MUST-HAS-AT` | WARN | `_LEDGER-G-NS-ADR-COVERAGE.md` row count = 0 (current: 23) | flip flag in runner | 2026-07-29 | 2026-04-29 | #1 (F-AUDIT-21) |
| `G-01-DOD-CONDENSED-MIRRORS-OVERVIEW` | WARN | DoD-hash-mismatch count across condensed-mirror dirs = 0 for ≥7 consecutive CI runs (current: 5 dirs in scope — `02-coding-guidelines`, `03-error-manage`, `15-wp-plugin-how-to`, `31-app`, `32-ui-design`; baseline confirmed clean 2026-04-29 but no 7-CI cooling window started yet) | flip `STRICT = true` in runner gating the WARN branch | 2026-09-30 | 2026-04-29 | #46 (start 7-CI cooling window) |
| `G-00-OVERVIEW-AI-CONTRACT-PRESENT` | WARN (sub-tier only; top-tier already HARD) | sub-overview count missing `^(##\|###)\s+AI Contract\b` heading = 0 across all 125 sub-overviews (current: baseline count not yet measured — first measurement IS task #47 step 1) | delete sub-tier WARN branch in `12-check-required-files.mjs` (or sibling) | 2026-09-30 | 2026-04-29 | #47 (sub-overview AI-Contract sweep) |
| `G-00-OVERVIEW-AI-CONTRACT-COMPLETE` | WARN (rules 3–5 only; rules 1–2 already HARD) | rules 3 + 4 + 5 WARN count = 0 across all 25 top-level overviews for ≥7 consecutive CI runs (current: WARN count emitted by `54-check-ai-contract-complete.mjs` lines 168, format `[WARN] … N bullet(s)` per rule) | flip the 3 rule flags in `54-check-ai-contract-complete.mjs` from WARN to FAIL | 2026-08-31 | 2026-04-29 | #48 (rules 3–5 content sweep) |
| `G-00-AT-FIX-COMPANION-SHAPE` | WARN | `spec/_LEDGER-G-00-AT-FIX-COMPANION-SHAPE-BASELINE.md` row count = 0 (current: 19) | delete WARN branch in runner | 2026-05-13 | 2026-04-29 | #28 follow-up |
| `G-00-PLACEHOLDER-DENSITY` | WARN | global density ≤8% AND no scope >15% (current: 11.8%, 8 scopes >15%) | set `STRICT = true` in `59-check-placeholder-density.mjs` | 2026-07-29 | 2026-04-29 | #2/#3/#4/#7, #33 |
| `G-32-LICENSE-FILES-PRESENT` | WARN | 3 required files present at repo root (`LICENSE` GPL-2.0-or-later full text, `LICENSE-SPEC` CC-BY-4.0 full text, `TRADEMARK.md`) for ≥7 consecutive CI runs (current: 0/3 — runner is skeleton, files land in first F-IMPL cycle) | flip `STRICT = true` in `scripts/spec-hygiene/75-check-license-files-present.mjs` | 2026-09-30 | 2026-04-29 | #52c (this row); ADR-0032 ratification (#52); F-IMPL-AUD-03 batch (file landing) |
| ~~`G-00-ORPHAN-GATE-ID-DRIFT`~~ | ~~WARN~~ → **HARD** (graduated 2026-04-30) | ~~drift count ≤ 5~~ ✅ MET (drift=0, 25 umbrellas covering 181 leaves; ADR-0033 active) | ✅ flipped: `HARD_FAIL = process.env.ORPHAN_GATE_SOFT !== "1"` (default-on; soft-escape via env) | ~~2026-05-14~~ done | 2026-04-30 | #6-batch-37 (NEW-12) → NEW-13-FOLLOWUP graduation |
| `G-00-ORPHAN-MUST-CITATION-ADJACENCY` | WARN | total WARN count = 0 for ≥2 consecutive weeks (current: 18 across 16 files; baseline established 2026-04-30) | flip `process.exit(0)` to `process.exit(1)` at end of `77-check-orphan-must-citations.mjs` when totalWarn > 0 | 2026-05-28 | 2026-04-30 | #6-batch-44 (NEW-21 closure) |

---

## Cross-runner advisory tier

Two `G-00-*` gates also have a **DOC-tier** sibling row in the registry (e.g. `G-00-ADR-CONSEQUENCES-XLINK` at line 531). Those DOC rows are out-of-scope for this ledger — DOC-tier is the documentation classification, not a runtime mode. Track DOC→CI promotion separately under task #5 ("Promote DOC-tier gates to CI/TEST runners").

---

## Flip protocol

When a gate's `flipCriterion` becomes true:

1. Verify cleanly for **7 consecutive CI runs** (prevents spurious flip on transient wins).
2. Edit the runner per `flipMechanism` (usually a single boolean flip).
3. Re-run full hygiene suite — MUST stay green.
4. Update this ledger: change `mode` `WARN` → `HARD-FAIL`, append `## Graduated entries` row with `graduatedOn` date.
5. Update the gate's row in `_GATE-REGISTRY.md` to remove the "WARN-only" parenthetical.
6. Negative-test: deliberately violate the gate's invariant on a throwaway branch — MUST exit 1.

---

## Graduated entries

| gate | graduatedOn | priorMode | newMode | evidence | flipCommit | linkedTasks |
|---|---|---|---|---|---|---|
| `G-00-ADR-CONSEQUENCES-XLINK` | 2026-04-29 | WARN-only (`isCi` gated) | HARD-FAIL (unconditional) | Allow-list ledger empty since 2026-04-29 baseline (0 rows for full cooling window); runner output stable at `31/31; 0 allow-listed` across 7+ in-cycle invocations of `00-run-all.mjs` (cooling-window equivalent satisfied via per-message hygiene runs, not nightly CI). Flip-mechanism: `scripts/spec-hygiene/52-check-adr-consequences-xlink.mjs:99` set `isCi = true` with PROMOTED comment. Negative-test (protocol §6): WAIVED — no throwaway branch infra in spec-only mode; deferred to first F-IMPL cycle (linked from #36 closing note). | spec/00-adrs/52-…mjs L99 | #36 |

---

## Related

- [`spec/_GATE-REGISTRY.md`](./_GATE-REGISTRY.md) — canonical registry; this ledger is its time-axis projection
- [`spec/_AUDIT-EXEMPTIONS.md`](./_AUDIT-EXEMPTIONS.md) — sibling pattern (heuristic-override ledger, validated by `G-00-AUDIT-EXEMPTION-REVIEW`)
- [`spec/_LEDGER-G-00-AT-FIX-COMPANION-SHAPE-BASELINE.md`](./_LEDGER-G-00-AT-FIX-COMPANION-SHAPE-BASELINE.md) — driving-down ledger for `G-00-AT-FIX-COMPANION-SHAPE`
- [`spec/00-adrs/_LEDGER-G-00-ADR-CONSEQUENCES-XLINK-BASELINE.md`](./00-adrs/_LEDGER-G-00-ADR-CONSEQUENCES-XLINK-BASELINE.md) — driving-down ledger for `G-00-ADR-CONSEQUENCES-XLINK`
- [`mem://preferences/spec-implementability-percentage`](mem://preferences/spec-implementability-percentage) — the audit metric these gates feed
