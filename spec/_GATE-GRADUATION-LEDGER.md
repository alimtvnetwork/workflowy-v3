# Gate Graduation Ledger

> **Version:** 1.0.0
> **Created:** 2026-04-29 (UTC+8) — answers task #35 (gate-graduation tracking gap surfaced after #57/#58/#59 trio).
> **Status:** Active — single source of truth for every WARN-only hygiene gate's flip criteria + target date.
> **Parent:** [`_GATE-REGISTRY.md`](./_GATE-REGISTRY.md)
> **Authoritative pattern:** ADR-0031 (pending) — "Warn-only-with-STRICT-flip" gate-graduation pattern.

---

## Purpose

A WARN-only gate that lacks a documented **flip criterion** drifts into permanent advisory mode. The 2026-04-29 audit-tooling cycle shipped three diagnostic gates (`G-00-AUDIT-EXEMPTION-REVIEW`, `G-00-AT-FIX-COMPANION-SHAPE`, `G-00-PLACEHOLDER-DENSITY`) each with its own bespoke flip rule buried in the runner's `STRICT` constant or the registry row's prose. This ledger consolidates those rules so:

1. A single grep answers "which gates are still soft?" — eliminates the registry scan.
2. Every WARN-only gate is forced to declare a **measurable** flip criterion (no "eventually", no "TBD"). [^1]
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
| `G-01-DOD-CONDENSED-MIRRORS-OVERVIEW` | WARN | next overview-condensation pass completes (event-driven) | delete WARN branch | 2026-09-30 | 2026-04-29 | none yet |
| `G-00-OVERVIEW-AI-CONTRACT-PRESENT` | WARN (sub-tier only; top-tier already HARD) | sub-overview AI-Contract sweep scoped + landed | delete sub-tier WARN branch | 2026-09-30 | 2026-04-29 | none yet |
| `G-00-OVERVIEW-AI-CONTRACT-COMPLETE` | WARN (rules 3–5 only; rules 1–2 already HARD) | first content-quality sweep completes (rules 3, 4, 5 all clean for ≥7 days) | flip 3 rule flags in runner | 2026-08-31 | 2026-04-29 | none yet |
| `G-00-ADR-CONSEQUENCES-XLINK` | WARN | `spec/00-adrs/_LEDGER-G-00-ADR-CONSEQUENCES-XLINK-BASELINE.md` row count = 0 (current: 0 — registry says "30/30 cite downstream") | flip flag in runner | 2026-05-29 | 2026-04-29 | already drained — flip-eligible NOW |
| `G-00-AT-FIX-COMPANION-SHAPE` | WARN | `spec/_LEDGER-G-00-AT-FIX-COMPANION-SHAPE-BASELINE.md` row count = 0 (current: 19) | delete WARN branch in runner | 2026-05-13 | 2026-04-29 | #28 follow-up |
| `G-00-PLACEHOLDER-DENSITY` | WARN | global density ≤8% AND no scope >15% (current: 11.8%, 8 scopes >15%) | set `STRICT = true` in `59-check-placeholder-density.mjs` | 2026-07-29 | 2026-04-29 | #2/#3/#4/#7, #33 |

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

> Empty at v1.0.0. First flip candidate: `G-00-ADR-CONSEQUENCES-XLINK` (allow-list already drained; cooling 7-CI window starts 2026-04-29).

---

## Related

- [`spec/_GATE-REGISTRY.md`](./_GATE-REGISTRY.md) — canonical registry; this ledger is its time-axis projection
- [`spec/_AUDIT-EXEMPTIONS.md`](./_AUDIT-EXEMPTIONS.md) — sibling pattern (heuristic-override ledger, validated by `G-00-AUDIT-EXEMPTION-REVIEW`)
- [`spec/_LEDGER-G-00-AT-FIX-COMPANION-SHAPE-BASELINE.md`](./_LEDGER-G-00-AT-FIX-COMPANION-SHAPE-BASELINE.md) — driving-down ledger for `G-00-AT-FIX-COMPANION-SHAPE`
- [`spec/00-adrs/_LEDGER-G-00-ADR-CONSEQUENCES-XLINK-BASELINE.md`](./00-adrs/_LEDGER-G-00-ADR-CONSEQUENCES-XLINK-BASELINE.md) — driving-down ledger for `G-00-ADR-CONSEQUENCES-XLINK`
- [`mem://preferences/spec-implementability-percentage`](mem://preferences/spec-implementability-percentage) — the audit metric these gates feed
