# Roadmap — Acceptance Criteria (dispatch)

> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8) — replaces auto-generated v0.1.0 stub (closes F-AUD27-02 from `02-ai-readiness-report-post-a27.md`).
> **Status:** Dispatch index — the roadmap folder has no normative ACs of its own; it dispatches to the implementation-checklist file and the global app rollup.
> **Type:** Dispatch Index — **no `AT-ROADMAP-NN` IDs by design.** The verification block at the bottom of this file enforces the no-`AT-ROADMAP-*` rule via `grep`.
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

The roadmap folder is **planning material**, not normative spec. It does not own any `AT-ROADMAP-NN` IDs. Acceptance criteria for the things the roadmap describes live in:

- The per-phase pre-flight gates in [`03-implementation-checklist.md`](./03-implementation-checklist.md) (64 atomic checks; A-27).
- The canonical app rollup [`spec/31-app/97-acceptance-criteria.md`](../97-acceptance-criteria.md) (`AT-APP-NN`).
- The per-feature `97-acceptance-criteria.md` files inside each `spec/31-app/01-features/<feature>/` and `spec/31-app/02-workflows/` folder.

---

## Coverage Map

| # | Source file | Where its criteria live |
|---|-------------|-------------------------|
| 1 | [`01-implementation-phases.md`](./01-implementation-phases.md) | Per-phase checks in [`03-implementation-checklist.md`](./03-implementation-checklist.md) |
| 2 | [`02-resolved-decisions.md`](./02-resolved-decisions.md) | Each decision points at its source memory entry / spec section; nothing testable here. |
| 3 | [`03-implementation-checklist.md`](./03-implementation-checklist.md) | Self-contained — 64 checks across Phase 0 + P1.1–P5 + cross-cutting gates. **This file is the SSOT for "what gates each implementation phase."** |

---

## How to add a roadmap criterion

1. If the rule gates a **build phase** (P1.x, P2, …): add it as a checkbox in the matching phase section of [`03-implementation-checklist.md`](./03-implementation-checklist.md). Bump that file's minor version.
2. If the rule is a **product invariant** (data-model, behaviour, UX): add it to the canonical app rollup [`../97-acceptance-criteria.md`](../97-acceptance-criteria.md).
3. **Do not** create an `AT-ROADMAP-NN` namespace.

---

## Verification

```bash
# Confirm no AT-ROADMAP-NN IDs are referenced anywhere
grep -rn "AT-ROADMAP-" spec/ && echo "DEFECT: AT-ROADMAP-* should not exist" || echo "OK"

# Confirm the implementation checklist is in place
test -f spec/31-app/04-roadmap/03-implementation-checklist.md && echo "OK" || echo "MISSING"
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`01-implementation-phases.md`](./01-implementation-phases.md) — Phase definitions
- [`03-implementation-checklist.md`](./03-implementation-checklist.md) — Per-phase pre-flight gates (A-27)
- [`../97-acceptance-criteria.md`](../97-acceptance-criteria.md) — Canonical app rollup (`AT-APP-NN`)
- `.lovable/reports/02-ai-readiness-report-post-a27.md` — F-AUD27-02 finding closed by this file

---

*Replaced auto-generated stub 2026-04-26 (polish #5, A-28 wave-1).*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../97a-acceptance-criteria-fixtures.md`](../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
