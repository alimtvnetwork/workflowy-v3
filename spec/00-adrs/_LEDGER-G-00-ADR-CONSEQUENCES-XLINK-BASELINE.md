# Ledger — `G-00-ADR-CONSEQUENCES-XLINK` Baseline Allow-list

> **Version:** 2.0.0 — DRAINED
> **Created:** 2026-04-29 (UTC+8)
> **Drained:** 2026-04-29 (same-day; 28/28 ADRs enriched with `**Spec impact**` paragraph in Consequences)
> **Status:** EMPTY — gate `G-00-ADR-CONSEQUENCES-XLINK` promoted to hard-fail unconditionally
> **Gate:** `G-00-ADR-CONSEQUENCES-XLINK` (CI, hard-fail)
> **Runner:** [`scripts/spec-hygiene/52-check-adr-consequences-xlink.mjs`](../../scripts/spec-hygiene/52-check-adr-consequences-xlink.mjs)
> **AT:** [`AT-ADR-009`](./97-acceptance-criteria.md)

---

## Status

**DRAINED.** All 28 ADRs now carry at least one downstream `spec/` markdown link in their `## Consequences` section (or `## N. Consequences` for numbered ADRs 0027/0028). The runner reports `28/28; 0 allow-listed`.

Two side-effect fixes landed during the drain:
1. **Runner regex bug** — `52-check-adr-consequences-xlink.mjs` SECTION regex used the literal `\Z` (which JS regex treats as `Z`), causing premature body truncation at any line starting with `Z` (e.g. "Zero new infra" in ADR-0027). Fixed to `\n^## |$(?![\s\S])` for proper EOF anchoring.
2. **Numbered-section support** — initial drainer regex only matched `^##\s+Consequences\s*$`. Extended to `^##\s+(?:\d+\.\s+)?Consequences\s*$` to cover ADR-0027 (`## 3. Consequences`) and ADR-0028 (same).

Drain method: appended a single `**Spec impact** — Downstream sections affected by this decision: [link](...).` paragraph at the end of each ADR's Consequences section. Targets pulled from the original baseline-ledger "Suggested xlink target" column.

## Allow-listed ADRs

**(empty)** — 28 → 0 same-day.

## Historical baseline

The original 28-row baseline table is preserved in version-control history (this file's v1.0.0 revision dated 2026-04-29). Restore from git history if needed for forensic review.

## Verification

```bash
node scripts/spec-hygiene/52-check-adr-consequences-xlink.mjs
# expected: ✅ G-00-ADR-CONSEQUENCES-XLINK: all ADRs cite downstream scope (28/28; 0 allow-listed)

# Re-confirm zero entries:
grep -cE '^\| ADR-[0-9]+' spec/00-adrs/_LEDGER-G-00-ADR-CONSEQUENCES-XLINK-BASELINE.md
# expected: 0
```
