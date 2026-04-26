# Consistency Report — 06-endpoints

> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8)
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## 🛑 Read this first — what this report does NOT cover

> **The two-score model.** This report measures *structural hygiene* only — file presence, kebab-case naming, unique numeric prefixes, broken Markdown links. It does **not** measure *content alignment* (whether endpoint contracts match the underlying feature specs in `../01-features/`).
>
> **Content audits live elsewhere.** Endpoint-vs-feature drift is tracked in the Content Audit Tracker below. A 100/100 structural score does NOT imply contract correctness.

---

## Module Health — Structural

| Criterion | Status |
|-----------|--------|
| `00-overview.md` present | ✅ |
| `99-consistency-report.md` present | ✅ |
| `97-acceptance-criteria.md` present | ✅ (auto-stub) |
| Lowercase kebab-case naming | ✅ |
| Unique numeric sequence prefixes | ✅ (00, 01..15) |
| Markdown links resolve | ✅ |
| One file per `01-features/` sibling (1:1 mirror) | ✅ |

**Structural Score:** 100/100 (A+) — *file/naming/link checks only.*

---

## Content Audit Tracker

| Audit | Scope | Status |
|-------|-------|--------|
| Endpoint ↔ feature parity | Each `NN-*.md` here matches the feature of the same name in `../01-features/` | ⏳ pending — initial pass on creation 2026-04-26 |
| Envelope conformance | All endpoint examples use the PascalCase universal envelope (`Status`, `Attributes`, `Results`) | ⏳ pending |
| `Auth::hasRole` coverage | Every protected endpoint cites the role check | ⏳ pending |
| SSE side-effect coverage | Every mutating endpoint lists the `item.*` event(s) it emits | ⏳ pending |
| AT-APP cross-link | Every endpoint cites at least one `AT-APP-*` acceptance criterion | ⏳ pending |

---

## Related

- [`00-overview.md`](./00-overview.md) — endpoint master index
- [`../01-features/99-consistency-report.md`](../01-features/99-consistency-report.md) — feature-side parity report
- [`../97-acceptance-criteria.md`](../97-acceptance-criteria.md) — App-level rollup
