# Error-Code Registry (sub-folder) — Acceptance Criteria (dispatch)

> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8) — replaces auto-generated v0.1.0 stub. The substantive ACs already live one folder up.
> **Status:** Dispatch — delegates to the parent rollup `AT-ERRORCODEREGISTRY-NN`.
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

This sub-folder contains the **detailed registry material** (overview, collision-resolution, module ranges, detailed codes, GEN/SM/LM families, format/usage). Its acceptance criteria are not separate — they are the parent folder's `AT-ERRORCODEREGISTRY-NN` rollup, which already cites the files in this sub-folder.

This file exists only to satisfy the `12-check-required-files.mjs` invariant.

---

## Coverage Map

| Source file in this sub-folder | Canonical AC location |
|-------------------------------|------------------------|
| [`01-overview.md`](./01-overview.md) | [`../97-acceptance-criteria.md`](../97-acceptance-criteria.md) §`AT-ERRORCODEREGISTRY-01` and §`AT-ERRORCODEREGISTRY-03` |
| [`02-collision-resolution.md`](./02-collision-resolution.md) | [`../97-acceptance-criteria.md`](../97-acceptance-criteria.md) §`AT-ERRORCODEREGISTRY-03` |
| [`03-module-error-ranges.md`](./03-module-error-ranges.md) | [`../97-acceptance-criteria.md`](../97-acceptance-criteria.md) §`AT-ERRORCODEREGISTRY-03` |
| [`04-detailed-error-codes.md`](./04-detailed-error-codes.md) | [`../97-acceptance-criteria.md`](../97-acceptance-criteria.md) (per-code rows) |
| [`05-gen-sm-lm-errors.md`](./05-gen-sm-lm-errors.md) | [`../97-acceptance-criteria.md`](../97-acceptance-criteria.md) (GEN/SM/LM family rows) |
| [`06-format-and-usage.md`](./06-format-and-usage.md) | [`../97-acceptance-criteria.md`](../97-acceptance-criteria.md) (format rows) |

---

## How to add a registry criterion

Add it to the parent rollup [`../97-acceptance-criteria.md`](../97-acceptance-criteria.md) using the next free `AT-ERRORCODEREGISTRY-NN`. **Do not** create an `AT-REGISTRY-NN` namespace here — it is intentionally retired.

---

## Verification

```bash
grep -rn "AT-REGISTRY-" spec/ && echo "DEFECT: AT-REGISTRY-* should not exist" || echo "OK"
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Sub-folder overview
- [`../97-acceptance-criteria.md`](../97-acceptance-criteria.md) — Canonical AC rollup
- [`../00-overview.md`](../00-overview.md) — Parent overview
- `.lovable/reports/02-ai-readiness-report-post-a27.md` — Trigger of this file

---

*Replaced auto-generated stub 2026-04-26 (polish #5, A-28 wave-1).*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../../97a-acceptance-criteria-fixtures.md`](../../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
