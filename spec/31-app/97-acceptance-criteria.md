# App — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-20
> **Status:** Scaffold — populate per-section criteria during next refinement pass
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Testable acceptance criteria for the App domain. Each criterion is independently verifiable and traceable to a source spec file.

Criteria use the stable ID format `AT-${folder.toUpperCase().replace(/[^A-Z]/g, '')}-NN`.

---

## Coverage Map

| # | Subsection | Acceptance ID Range | Status |
|---|-----------|---------------------|--------|
| 1 | [`01-features/`](./01-features/00-overview.md) | AT-APP-01..05 | 📝 To populate |
| 2 | [`03-workflows/`](./03-workflows/00-overview.md) | AT-APP-06..10 | 📝 To populate |
| 3 | [`04-edge-cases/`](./04-edge-cases/00-overview.md) | AT-APP-11..15 | 📝 To populate |
| 4 | [`05-roadmap/`](./05-roadmap/00-overview.md) | AT-APP-16..20 | 📝 To populate |
| 5 | [`06-conventions/`](./06-conventions/00-overview.md) | AT-APP-21..25 | 📝 To populate |

---

## Criteria

Per-subsection criteria are tracked in each subfolder's own `97-acceptance-criteria.md` (where present) or in the subsection's `00-overview.md` until extracted.

**Convention:** A criterion is *complete* when (a) it has a stable ID, (b) it references a source file, and (c) it is verifiable by reading the source or running an automated check.

---

## Verification

```bash
# List all referenced sources in this folder
grep -rn "AT-APP-" spec/31-app/

# Run hygiene checks
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`spec/19-glossary.md`](../19-glossary.md) — Terminology SSOT
- [`spec/20-enums-index.md`](../20-enums-index.md) — Enum registry

*Acceptance criteria scaffold v1.0.0 — created 2026-04-20 (H-2.1).*
