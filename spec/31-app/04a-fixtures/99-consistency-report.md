# Consistency Report — 04-fixtures

> **Version:** 1.0.0  
> **Updated:** 2026-04-27

---

## Module Health

| Criterion | Status |
|-----------|--------|
| `00-overview.md` present | ✅ |
| `99-consistency-report.md` present | ✅ |
| Lowercase kebab-case naming | ✅ |
| Unique numeric sequence prefixes | ✅ |
| `## Related` block in overview | ✅ |
| Deterministic generator (seed pinned) | ✅ |
| Fixture matches Item DDL columns | ✅ ([`../07-db-diagram/sql/02-app-schema.sql`](../07-db-diagram/sql/02-app-schema.sql)) |
| 12 / 12 ItemTypes covered | ✅ |
| Total items ≤ 250 (per-view cap) | ✅ (217) |

**Health Score:** 100/100 (A+)

---

## File Inventory

| # | File | Status |
|---|------|--------|
| 00 | `00-overview.md` | ✅ Present |
| — | `generate.py` | ✅ Present (deterministic, seed `20260427`) |
| — | `item-tree-217.json` | ✅ Present (~120 KB, 217 items, depth 5) |
| 99 | `99-consistency-report.md` | ✅ Present |

**Total:** 4 files

---

## Cross-Module Consistency

| Reference | Target | Status |
|-----------|--------|--------|
| Item DDL columns | [`../07-db-diagram/sql/02-app-schema.sql`](../07-db-diagram/sql/02-app-schema.sql) | ✅ All 14 SQL columns represented |
| ItemType enum (12) | [`../../20-enums-index.md`](../../20-enums-index.md) §3.5 | ✅ All 12 values appear ≥1× |
| Audit closure | [`../../18-spec-issues/12-ai-readiness-audit-round-4-2026-04-27.md`](../../18-spec-issues/12-ai-readiness-audit-round-4-2026-04-27.md) §AUDIT-AI-04 | ✅ Closed (with 217-item amendment vs original 1MB ask) |

---

## Known Drift

None. The Round-4 audit asked for a 1 MB+ fixture; the 120 KB / 217-item decision is documented and accepted in `00-overview.md` §"Why ~120 KB and not 1 MB+" because larger fixtures would exceed the 250-item per-view cap and stress no real code path.

---

## Related

- Parent: [`./00-overview.md`](./00-overview.md)
- Sibling consistency reports: [`../01-features/99-consistency-report.md`](../01-features/99-consistency-report.md), [`../03-edge-cases/99-consistency-report.md`](../03-edge-cases/99-consistency-report.md)
