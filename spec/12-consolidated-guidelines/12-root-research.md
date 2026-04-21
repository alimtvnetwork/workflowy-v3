# Root-Level Research — Redirect Stub

> **Version:** 2.0.0  
> **Updated:** 2026-04-19  
> **Status:** Redirect

---

## Keywords

`redirect` · `single-source-of-truth` · `consolidated-guidelines`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| `00-overview.md` present | ✅ |
| AI Confidence assigned | ✅ |
| Ambiguity assigned | ✅ |
| Keywords present | ✅ |
| Scoring table present | ✅ |

**AI Confidence:** Production-Ready  
**Ambiguity:** None

---

## Purpose

This file used to duplicate the canonical Root-Level Research rules. To eliminate drift (closes audit issue **AUD-C-01**), all rules now live in **one place only**:

> 📄 **[../11-research/00-overview.md](../11-research/00-overview.md)** — single source of truth.


---

## Why this redirect exists

Maintaining duplicated rules in `spec/12-consolidated-guidelines/` caused the two copies to drift apart, making it impossible for AI agents to know which version to follow. The audit (`spec/18-spec-issues/03-ai-readiness-audit-2026-04-19.md`) flagged this as a Critical issue.

**Rule:** `spec/12-consolidated-guidelines/` files are now **redirect-only stubs**. They MUST NOT contain rules, examples, or schemas. All authoritative content lives in the canonical source folders.

---

## Cross-References

- [../11-research/00-overview.md](../11-research/00-overview.md) — canonical source
- [`./00-overview.md`](./00-overview.md) — index of all consolidated redirects
- [`../18-spec-issues/03-ai-readiness-audit-2026-04-19.md`](../18-spec-issues/03-ai-readiness-audit-2026-04-19.md) — AUD-C-01 source

---

*Redirect stub v2.0.0 — closes AUD-C-01 — 2026-04-19*
