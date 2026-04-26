# Consistency Report — 07-db-diagram

> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8)
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## 🛑 Read this first — what this report does NOT cover

> **The two-score model.** This report measures *structural hygiene* only — file presence, kebab-case naming, unique numeric prefixes, broken Markdown links, Mermaid syntax validity. It does **not** measure *schema correctness* (whether the ERDs match the feature specs and `04-database-conventions/`).
>
> **Content audits live elsewhere.** Schema-vs-spec drift is tracked in the Content Audit Tracker below.

---

## Module Health — Structural

| Criterion | Status |
|-----------|--------|
| `00-overview.md` present | ✅ |
| `99-consistency-report.md` present | ✅ |
| `97-acceptance-criteria.md` present | ✅ (auto-stub) |
| Lowercase kebab-case naming | ✅ |
| Unique numeric sequence prefixes | ✅ (00..07) |
| Markdown links resolve | ✅ |
| Mermaid blocks parse via `mmdc` | ✅ (21 diagrams verified on creation) |

**Structural Score:** 100/100 (A+) — *file/naming/link/Mermaid checks only.*

---

## Content Audit Tracker

| Audit | Scope | Status |
|-------|-------|--------|
| ERD ↔ feature parity | Tables in ERDs cover every persistent entity in `../01-features/` | ⏳ pending |
| Naming conventions | PascalCase singular tables, `{TableName}Id` PKs, snake_case forbidden | ⏳ pending |
| Split-DB integrity | Root-DB vs App-DB boundary respected (no cross-DB FKs) | ⏳ pending |
| Index coverage | Every documented query in `06-indexes.md` traces to a feature-spec query | ⏳ pending |
| Migration order | `07-migrations.md` dependency graph topologically sorts cleanly | ✅ verified on creation |

---

## Related

- [`00-overview.md`](./00-overview.md) — DB diagram master index
- [`../../04-database-conventions/00-overview.md`](../../04-database-conventions/00-overview.md) — naming + envelope SSOT
- [`../06-endpoints/00-overview.md`](../06-endpoints/00-overview.md) — endpoints that read/write these tables
