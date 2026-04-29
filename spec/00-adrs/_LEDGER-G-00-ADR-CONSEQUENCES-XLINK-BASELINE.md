# Ledger — `G-00-ADR-CONSEQUENCES-XLINK` Baseline Allow-list

> **Version:** 1.0.0
> **Created:** 2026-04-29 (UTC+8)
> **Status:** DEFERRED (allow-list active until ADR Consequences-enrichment sweep closes; 90-day TTL per `scripts/spec-hygiene/34-check-allow-list-age.mjs`)
> **Gate:** `G-00-ADR-CONSEQUENCES-XLINK` (CI, WARN-only initial mode)
> **Runner:** [`scripts/spec-hygiene/47-check-adr-consequences-xlink.mjs`](../../scripts/spec-hygiene/47-check-adr-consequences-xlink.mjs)
> **AT:** [`AT-ADR-009`](./97-acceptance-criteria.md)

---

## Purpose

This ledger lists ADRs whose `## Consequences` section, as of 2026-04-29,
does not contain a markdown link pointing into a downstream `spec/` scope
(non-ADR target). The gate `G-00-ADR-CONSEQUENCES-XLINK` exempts these
ADRs so it can land immediately without a flag-day enrichment.

The Consequences-enrichment sweep will add at least one downstream xlink
per allow-listed ADR. Each ADR enriched removes its entry from this ledger.
When the ledger is empty, the gate becomes hard-fail (drop the WARN-only
flag in the runner).

---

## TTL

- **Created:** 2026-04-29
- **Hard-fail at:** 2026-07-28 (90 days) — `34-check-allow-list-age.mjs` will fail CI if any entry remains past TTL without explicit renewal.

---

## Allow-listed ADRs (28 — full baseline)

| ADR | Reason | Suggested xlink target |
|---|---|---|
| ADR-0001 | no downstream xlink in Consequences | `../04-database-conventions/` |
| ADR-0002 | no downstream xlink in Consequences | `../15-wp-plugin-how-to/` |
| ADR-0003 | no downstream xlink in Consequences | `../31-app/`, `../02-coding-guidelines/02-typescript/` |
| ADR-0004 | no downstream xlink in Consequences | `../04-database-conventions/06-rest-api-format/` |
| ADR-0005 | no downstream xlink in Consequences | `../31-app/` (mirror peer-group spec) |
| ADR-0006 | no downstream xlink in Consequences | `../04-database-conventions/` |
| ADR-0007 | no downstream xlink in Consequences | `../02-coding-guidelines/02-typescript/` |
| ADR-0008 | no downstream xlink in Consequences | `../31-app/` (Item interface) |
| ADR-0009 | no downstream xlink in Consequences | `../31-app/` (Trash logic) |
| ADR-0010 | no downstream xlink in Consequences | `../31-app/` (offline queue) |
| ADR-0011 | no downstream xlink in Consequences | `../02-coding-guidelines/02-typescript/`, `../31-app/` |
| ADR-0012 | no downstream xlink in Consequences | `../32-ui-design/`, `../07-design-system/` |
| ADR-0013 | no downstream xlink in Consequences | `../31-app/` (search) |
| ADR-0014 | no downstream xlink in Consequences | `../31-app/` (sharing) |
| ADR-0015 | no downstream xlink in Consequences | `../20-enums-index.md` |
| ADR-0016 | no downstream xlink in Consequences | `../31-app/` (SortOrder) |
| ADR-0017 | no downstream xlink in Consequences | `../31-app/`, `../32-ui-design/` |
| ADR-0018 | no downstream xlink in Consequences | `../31-app/`, `../32-ui-design/` |
| ADR-0019 | no downstream xlink in Consequences | `../04-database-conventions/06-rest-api-format/` |
| ADR-0020 | no downstream xlink in Consequences | `../31-app/`, `../02-coding-guidelines/02-typescript/` |
| ADR-0021 | no downstream xlink in Consequences | `../31-app/` (undo + offline queue) |
| ADR-0022 | no downstream xlink in Consequences | `../32-ui-design/` |
| ADR-0023 | no downstream xlink in Consequences | `../31-app/` (loaders ↔ queue) |
| ADR-0024 | no downstream xlink in Consequences | `../18-spec-issues/` |
| ADR-0025 | no downstream xlink in Consequences | `../31-app/06-endpoints/` (SSE) |
| ADR-0026 | no downstream xlink in Consequences | `../04-database-conventions/`, `../31-app/` |
| ADR-0027 | no downstream xlink in Consequences | `../31-app/06-endpoints/` |
| ADR-0028 | no downstream xlink in Consequences | `../32-ui-design/` (i18n locale) |

---

## Verification

```bash
# Re-run gate (warn-only outside CI; strict in CI)
node scripts/spec-hygiene/47-check-adr-consequences-xlink.mjs
CI=true node scripts/spec-hygiene/47-check-adr-consequences-xlink.mjs   # strict mode

# Count remaining allow-list entries (target: 0)
grep -cE '^\| ADR-[0-9]+' spec/00-adrs/_LEDGER-G-00-ADR-CONSEQUENCES-XLINK-BASELINE.md
```

---

*Companion to gate `G-00-ADR-CONSEQUENCES-XLINK`, runner `scripts/spec-hygiene/47-check-adr-consequences-xlink.mjs`, and AT-ADR-009.*
