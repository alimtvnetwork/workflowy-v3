# Ledger — `G-NS-ADR-MUST-HAS-AT` Coverage Allow-list

> **Version:** 1.0.0
> **Created:** 2026-04-29 (UTC+8)
> **Status:** DEFERRED (allow-list active until P3 ADR-citation backfill closes; max 90-day TTL per `scripts/spec-hygiene/34-check-allow-list-age.mjs`)
> **Gate:** `G-NS-ADR-MUST-HAS-AT` (CI, WARN-only initial mode)
> **Audit ledger:** [`.lovable/memory/audit/at-prose-must-shall-sweep.md`](../.lovable/memory/audit/at-prose-must-shall-sweep.md)

---

## Purpose

This ledger lists ADRs that contain ≥5 `MUST`/`SHALL` prose rules but had
zero AT citations as of 2026-04-29. The gate `G-NS-ADR-MUST-HAS-AT` exempts
these ADRs so it can land immediately without a flag-day backfill.

The AUDIT-03 backfill (Task #1, +8 pts) will author at least one structured
AT row per allow-listed ADR. Each AT row added removes its target ADR from
this ledger. When the ledger is empty, the gate becomes hard-fail.

---

## TTL

- **Created:** 2026-04-29
- **Expiry warning at:** 2026-07-28 (90 days)
- **Hard-fail at:** 2026-07-28 — `34-check-allow-list-age.mjs` will fail CI if any entry remains past TTL without explicit renewal.

---

## Allow-listed ADRs (22 — was 23, ADR-0026 removed today)

| ADR | MUSTs | Status |
|---|---:|---|
| ADR-0004 — REST envelope PascalCase | 5 | uncited |
| ADR-0005 — Mirror as peer group | 6 | uncited |
| ADR-0007 — Strict TypeScript rules | 8 | uncited |
| ADR-0008 — Unified Item node interface | 11 | uncited |
| ADR-0009 — Trash 30-day retention | 13 | uncited |
| ADR-0010 — Offline FIFO replay queue | 15 | uncited |
| ADR-0011 — Axios-only HTTP client | 13 | uncited |
| ADR-0012 — Tailwind v4 theme block token registry | 21 | uncited |
| ADR-0013 — Search relevance-then-recency | 15 | uncited |
| ADR-0014 — Sharing public vs invited | 13 | uncited |
| ADR-0015 — Twelve ItemTypes enum | 9 | uncited |
| ADR-0016 — Fractional-index SortOrder | 10 | uncited |
| ADR-0018 — React Router v7 + lucide-react | 14 | uncited |
| ADR-0019 — REST envelope optional keys | 19 | uncited |
| ADR-0020 — Branded ItemId/OwnerId | 11 | uncited |
| ADR-0021 — Undo 100 / offline queue unbounded | 11 | uncited |
| ADR-0022 — shadcn/ui + Radix component base | 7 | uncited |
| ADR-0023 — Route loaders ↔ offline queue | 21 | uncited |
| ADR-0024 — Soft-confirm triage rulings | 11 | uncited |
| ADR-0025 — SSE realtime transport | 19 | uncited |
| ~~ADR-0026 — LWW canonical tiebreak~~ | ~~21~~ | **CITED 2026-04-29** (AT-APP-108..110) |
| ADR-0027 — SSE multi-worker shared ring | 9 | uncited |
| ADR-0028 — i18n locale strategy | 6 | uncited |

**Total orphaned MUSTs:** 264 (was 285; -21 closed by ADR-0026 citation today).

---

## Cited ADRs (gate-passing — for reference)

| ADR | MUSTs | Cited by |
|---|---:|---|
| ADR-0001 | 4 | (below threshold; exempt) |
| ADR-0002 | 2 | (below threshold; exempt) |
| ADR-0003 | 4 | (below threshold; exempt) |
| ADR-0006 | 1 | (below threshold; exempt) |
| ADR-0017 | 11 | `spec/31-app/97-acceptance-criteria.md` |
| ADR-0026 | 21 | `spec/31-app/97-acceptance-criteria.md` (`AT-APP-108`, `AT-APP-109`, `AT-APP-110`) — **closed today** |

---

## Verification

```bash
# Count remaining allow-list entries (target: 0)
grep -cE '^\| ADR-[0-9]+' spec/_LEDGER-G-NS-ADR-COVERAGE.md

# Re-run coverage matrix (audit ledger has the script)
python3 .lovable/memory/audit/at-prose-must-shall-sweep.md  # see embedded script
```

---

*Companion to `G-NS-ADR-MUST-HAS-AT` and `.lovable/memory/audit/at-prose-must-shall-sweep.md`.*
