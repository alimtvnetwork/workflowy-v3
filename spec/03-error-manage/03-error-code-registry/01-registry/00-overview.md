# Error-Code Registry — Sub-Folder Overview

> **Version:** 1.0.0
> **Created:** 2026-04-26 (UTC+8) — closes F-AUD27-03 from `02-ai-readiness-report-post-a27.md` (folder previously had no `00-overview.md`).
> **Parent:** [`../00-overview.md`](../00-overview.md)

---

## Purpose

This sub-folder contains the **detailed registry** material for the error-code system: the registry overview, collision-resolution rules, module-range allocations, the detailed code tables, the GEN/SM/LM family enumerations, and the format/usage guide.

Content begins at [`01-overview.md`](./01-overview.md) — that file is the **substantive** registry overview (it predates the `00-overview.md` convention being applied to leaf sub-folders, and is preserved at its existing path because three other spec files link to it directly).

---

## Files

| # | File | Description |
|---|------|-------------|
| 01 | [`01-overview.md`](./01-overview.md) | Registry overview — start here |
| 02 | [`02-collision-resolution.md`](./02-collision-resolution.md) | Resolution rules when projects compete for the same code range |
| 03 | [`03-module-error-ranges.md`](./03-module-error-ranges.md) | Allocated numeric ranges per module |
| 04 | [`04-detailed-error-codes.md`](./04-detailed-error-codes.md) | Per-code definitions |
| 05 | [`05-gen-sm-lm-errors.md`](./05-gen-sm-lm-errors.md) | GEN / SM / LM family enumerations |
| 06 | [`06-format-and-usage.md`](./06-format-and-usage.md) | Wire-format and usage rules |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Parent | [`../00-overview.md`](../00-overview.md) |
| Master JSON | [`../error-codes-master.json`](../error-codes-master.json) |
| Acceptance criteria | [`../97-acceptance-criteria.md`](../97-acceptance-criteria.md) (`AT-ERRORCODEREGISTRY-NN`) |

---

## Related

**In this section:**

- [`01-overview.md`](./01-overview.md) — Registry overview (the substantive entry point)
- [`02-collision-resolution.md`](./02-collision-resolution.md)
- [`03-module-error-ranges.md`](./03-module-error-ranges.md)
- [`04-detailed-error-codes.md`](./04-detailed-error-codes.md)
- [`05-gen-sm-lm-errors.md`](./05-gen-sm-lm-errors.md)
- [`06-format-and-usage.md`](./06-format-and-usage.md)

**See also:**

- [`../00-overview.md`](../00-overview.md) — Parent overview
- `.lovable/reports/02-ai-readiness-report-post-a27.md` — F-AUD27-03 finding closed by this file

---

*Created 2026-04-26 (polish #5, A-28 wave-1) to satisfy the `12-check-required-files.mjs` invariant for nested folders containing topic files.*
