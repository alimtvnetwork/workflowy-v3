# Ui Design — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-20
> **Status:** Scaffold — populate per-section criteria during next refinement pass
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Testable acceptance criteria for the Ui Design domain. Each criterion is independently verifiable and traceable to a source spec file.

Criteria use the stable ID format `AT-${folder.toUpperCase().replace(/[^A-Z]/g, '')}-NN`.

---

## Coverage Map

| # | Subsection | Acceptance ID Range | Status |
|---|-----------|---------------------|--------|
| 1 | [`01-architecture/`](./01-architecture/00-overview.md) | AT-UIDESIGN-01..05 | 📝 To populate |
| 2 | [`02-state-and-data/`](./02-state-and-data/00-overview.md) | AT-UIDESIGN-06..10 | 📝 To populate |
| 3 | [`03-design-system/`](./03-design-system/00-overview.md) | AT-UIDESIGN-11..15 | 📝 To populate |
| 4 | [`04-editor/`](./04-editor/00-overview.md) | AT-UIDESIGN-16..20 | 📝 To populate |
| 5 | [`05-quality/`](./05-quality/00-overview.md) | AT-UIDESIGN-21..25 | 📝 To populate |

---

## Criteria

Per-subsection criteria are tracked in each subfolder's own `97-acceptance-criteria.md` (where present) or in the subsection's `00-overview.md` until extracted.

**Convention:** A criterion is *complete* when (a) it has a stable ID, (b) it references a source file, and (c) it is verifiable by reading the source or running an automated check.

---

## Verification

```bash
# List all referenced sources in this folder
grep -rn "AT-UIDESIGN-" spec/32-ui-design/

# Run hygiene checks
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`spec/19-glossary.md`](../19-glossary.md) — Terminology SSOT
- [`spec/20-enums-index.md`](../20-enums-index.md) — Enum registry

*Acceptance criteria scaffold v1.0.0 — created 2026-04-20 (H-2.1).*
