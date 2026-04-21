# Applicable Projects & No-Hardcoded-Arrays Policy

> **Parent:** [00-overview.md](./00-overview.md)

---

## Applicable projects

This pattern is used by:

| Project | Config Location |
|---------|-----------------|
| Spec Management | `go-backend/configs/` |
| GSearch CLI | `backend/configs/` |
| BRun CLI | `backend/configs/` |
| AI Bridge | `backend/configs/` |
| Nexus Flow | `backend/configs/` |
| **WP SEO Publish CLI** | `backend/configs/` |

---

## CRITICAL: No hardcoded arrays

**All validation arrays, lookup tables, and configurable data MUST use the CW Config → Root DB pattern.**

See [`../02-features/05-validation-data-seeding/00-overview.md`](../02-features/05-validation-data-seeding/00-overview.md) for the complete implementation guide.

### Examples of data that must be seeded

- Transition words for SEO validation
- Stop words for RAG indexing
- Allowed file types for search
- Forbidden HTML tags
- Thresholds (sentence length, paragraph length, etc.)

### Why

- A single source of truth — change once in `config.seed.json`, applies everywhere on next boot.
- Versioned — every change shows up in `CHANGELOG.md` automatically.
- User-overridable — operators can tweak thresholds without a code release.
- Testable — fixtures load real seed data instead of duplicating arrays.
