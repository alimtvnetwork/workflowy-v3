# Wp Plugin How To — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-20
> **Status:** Scaffold — populate per-section criteria during next refinement pass
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Testable acceptance criteria for the Wp Plugin How To domain. Each criterion is independently verifiable and traceable to a source spec file.

Criteria use the stable ID format `AT-${folder.toUpperCase().replace(/[^A-Z]/g, '')}-NN`.

---

## Coverage Map

| # | Subsection | Acceptance ID Range | Status |
|---|-----------|---------------------|--------|
| 1 | [`02-enums-and-coding-style/`](./02-enums-and-coding-style/00-overview.md) | AT-WPPLUGINHOWTO-01..05 | 📝 To populate |
| 2 | [`04-logging-and-error-handling/`](./04-logging-and-error-handling/00-overview.md) | AT-WPPLUGINHOWTO-06..10 | 📝 To populate |
| 3 | [`05-helpers-responses-and-integration/`](./05-helpers-responses-and-integration/00-overview.md) | AT-WPPLUGINHOWTO-11..15 | 📝 To populate |
| 4 | [`07-reference-implementations/`](./07-reference-implementations/00-overview.md) | AT-WPPLUGINHOWTO-16..20 | 📝 To populate |
| 5 | [`08-wordpress-integration-patterns/`](./08-wordpress-integration-patterns/00-overview.md) | AT-WPPLUGINHOWTO-21..25 | 📝 To populate |
| 6 | [`09-testing-patterns/`](./09-testing-patterns/00-overview.md) | AT-WPPLUGINHOWTO-26..30 | 📝 To populate |
| 7 | [`10-deployment-patterns/`](./10-deployment-patterns/00-overview.md) | AT-WPPLUGINHOWTO-31..35 | 📝 To populate |
| 8 | [`11-frontend-and-template-patterns/`](./11-frontend-and-template-patterns/00-overview.md) | AT-WPPLUGINHOWTO-36..40 | 📝 To populate |
| 9 | [`12-design-system/`](./12-design-system/00-overview.md) | AT-WPPLUGINHOWTO-41..45 | 📝 To populate |
| 10 | [`13-admin-ui-patterns/`](./13-admin-ui-patterns/00-overview.md) | AT-WPPLUGINHOWTO-46..50 | 📝 To populate |
| 11 | [`14-rest-api-conventions/`](./14-rest-api-conventions/00-overview.md) | AT-WPPLUGINHOWTO-51..55 | 📝 To populate |
| 12 | [`15-settings-architecture/`](./15-settings-architecture/00-overview.md) | AT-WPPLUGINHOWTO-56..60 | 📝 To populate |
| 13 | [`16-error-handling-extraction/`](./16-error-handling-extraction/00-overview.md) | AT-WPPLUGINHOWTO-61..65 | 📝 To populate |
| 14 | [`19-micro-orm-and-root-db/`](./19-micro-orm-and-root-db/00-overview.md) | AT-WPPLUGINHOWTO-66..70 | 📝 To populate |
| 15 | [`20-end-to-end-walkthrough/`](./20-end-to-end-walkthrough/00-overview.md) | AT-WPPLUGINHOWTO-71..75 | 📝 To populate |

---

## Criteria

Per-subsection criteria are tracked in each subfolder's own `97-acceptance-criteria.md` (where present) or in the subsection's `00-overview.md` until extracted.

**Convention:** A criterion is *complete* when (a) it has a stable ID, (b) it references a source file, and (c) it is verifiable by reading the source or running an automated check.

---

## Verification

```bash
# List all referenced sources in this folder
grep -rn "AT-WPPLUGINHOWTO-" spec/15-wp-plugin-how-to/

# Run hygiene checks
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`spec/19-glossary.md`](../19-glossary.md) — Terminology SSOT
- [`spec/20-enums-index.md`](../20-enums-index.md) — Enum registry

*Acceptance criteria scaffold v1.0.0 — created 2026-04-20 (H-2.1).*
