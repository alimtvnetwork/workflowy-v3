# Workflows — Acceptance Criteria (dispatch)

> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8) — replaces auto-generated v0.1.0 stub (closes F-AUD27-02 from `02-ai-readiness-report-post-a27.md`).
> **Status:** Dispatch index — workflow ATs are folded into the canonical `AT-APP-43..57` range.
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Workflow acceptance criteria do **not** live in their own `AT-WORKFLOWS-NN` namespace. They were folded into the canonical app-rollup range during polish #2 / A-26 wave-2 to avoid namespace fragmentation. This file is the dispatch index that maps each workflow file to its canonical IDs in [`spec/31-app/97-acceptance-criteria.md`](../97-acceptance-criteria.md).

---

## Coverage Map

| # | Workflow file | Canonical IDs | Domain |
|---|---------------|---------------|--------|
| 1 | [`01-keyboard-shortcuts.md`](./01-keyboard-shortcuts.md) | (cross-cutting — see per-feature ACs in the canonical rollup) | Editor / navigation |
| 2 | [`02-template-application-flow.md`](./02-template-application-flow.md) | `AT-APP-43..46` | Templates |
| 3 | [`03-share-invite-flow.md`](./03-share-invite-flow.md) | `AT-APP-47..51` | Share / invite |
| 4 | [`04-trash-restore-flow.md`](./04-trash-restore-flow.md) | `AT-APP-52..57` | Trash / restore |

Each workflow file already exposes a "Canonical" column in its own `## Acceptance Tests` section (added in A-26 wave-2, file v1.1.0+).

---

## How to add a new workflow criterion

1. Add the rule to the **canonical rollup** [`../97-acceptance-criteria.md`](../97-acceptance-criteria.md) using the next free `AT-APP-NN`.
2. Reference that ID from the workflow file's "Canonical" column.
3. **Do not** create an `AT-WORKFLOWS-NN` namespace — it is intentionally retired.

---

## Verification

```bash
# Confirm no AT-WORKFLOWS-NN IDs are referenced anywhere
grep -rn "AT-WORKFLOWS-" spec/ && echo "DEFECT: AT-WORKFLOWS-* should be retired" || echo "OK"

# Confirm the 4 canonical rows exist
grep -E "AT-APP-(43|44|45|46|47|48|49|50|51|52|53|54|55|56|57)" spec/31-app/97-acceptance-criteria.md | wc -l
# Expected: 15
```

---

## Related

- [`../97-acceptance-criteria.md`](../97-acceptance-criteria.md) — Canonical app rollup (`AT-APP-NN`)
- [`00-overview.md`](./00-overview.md) — Parent overview
- `.lovable/reports/02-ai-readiness-report-post-a27.md` — F-AUD27-02 finding closed by this file

---

*Replaced auto-generated stub 2026-04-26 (polish #5, A-28 wave-1).*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../97a-acceptance-criteria-fixtures.md`](../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
