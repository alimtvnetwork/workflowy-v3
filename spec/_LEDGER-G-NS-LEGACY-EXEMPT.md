# Ledger — `G-NS-NO-DEPRECATED-ALIAS` Legacy Exemptions

> **Version:** 1.0.0
> **Created:** 2026-04-29 (UTC+8)
> **Status:** Active — dated allow-list (max 90-day TTL per `scripts/spec-hygiene/34-check-allow-list-age.mjs`)
> **Gate:** `G-NS-NO-DEPRECATED-ALIAS` (CI, hard-fail)
> **SSOT for canonical/alias mapping:** [`.lovable/memory/audit/at-namespace-synonym-audit.md`](../.lovable/memory/audit/at-namespace-synonym-audit.md)

---

## Purpose

This ledger lists every existing AT row that uses one of the 17 deprecated
namespace aliases as of 2026-04-29. The gate `G-NS-NO-DEPRECATED-ALIAS`
exempts these rows so it can land immediately without a flag-day rename.

The P3 namespace consolidation sweep (future task) will migrate each row to
its canonical namespace. Each migration removes one entry from this ledger.
When the ledger is empty, the gate becomes 100% enforceable with zero
exemptions and this file can be deleted.

---

## TTL

- **Created:** 2026-04-29
- **Expiry warning at:** 2026-07-28 (90 days)
- **Hard-fail at:** 2026-07-28 — `34-check-allow-list-age.mjs` will fail CI if any entry remains past TTL without explicit renewal.
- **Renewal protocol:** Bump the `Created:` date and add a one-line justification per the script's expected format.

---

## Exempt Entries (per alias)

> ⚠️ Initial population is **deferred** to the P3 sweep prep step. Until then,
> the gate runs in **WARN-only** mode (`--warn-only` flag). Once the P3 sweep
> populates this ledger from the audit run, the `--warn-only` flag is removed
> and the gate becomes hard-fail.

### `AT-DESIGNSYSTEM-` (canonical: `AT-DESIGNSYS-`)
- *(none — sweep already migrated 34 IDs on 2026-04-29)*

### `AT-UIDS-` (canonical: `AT-UIDESIGN-`)
- *(populate in P3 prep)*

### `AT-MIRRORS-` (canonical: `AT-MIRROR-`)
- *(populate in P3 prep)*

### `AT-WORKFLOW-` (canonical: `AT-WORKFLOWS-`)
- *(populate in P3 prep)*

### `AT-CODINGGUIDELINES-` / `AT-MASTERCODINGGUIDELINES-` (canonical: `AT-CG-`)
- *(populate in P3 prep — expected highest entry count)*

### `AT-ERRORMANAGE-` (canonical: `AT-ERRMANAGE-`)
- *(populate in P3 prep)*

### `AT-RESTAPICONVENTIONS-` (canonical: `AT-RESTAPIFORMAT-`)
- *(populate in P3 prep)*

### `AT-TYPESCRIPT-` (canonical: `AT-TYPESCRIPTSTANDARDSREFERENCE-`)
- *(populate in P3 prep)*

### `AT-GOLANG-` (canonical: `AT-GOLANGSTANDARDSREFERENCE-`)
- *(populate in P3 prep)*

### `AT-PHP-` (canonical: `AT-PHPSTANDARDSREFERENCE-`)
- *(populate in P3 prep)*

### `AT-ENUMSPECIFICATION-` (canonical: `AT-ENUMS-`)
- *(populate in P3 prep)*

### `AT-OPERATORRUNBOOKS-` (canonical: `AT-RUNBOOK-`)
- *(populate in P3 prep)*

### `AT-RATE-` (canonical: `AT-RATELIMIT-`)
- *(populate in P3 prep)*

### `AT-VISUALRENDER-` (canonical: `AT-VISUALRENDERINGGUIDE-`)
- *(populate in P3 prep)*

### `AT-CONSOLIDATEDREVIEWGUIDE-` (canonical: `AT-CONSOLIDATEDGUIDELINES-`)
- *(populate in P3 prep)*

---

## Verification

```bash
# Count remaining exemptions (target: 0)
grep -cE '^- `AT-[A-Z0-9-]+`' spec/_LEDGER-G-NS-LEGACY-EXEMPT.md

# Allow-list age check
node scripts/spec-hygiene/34-check-allow-list-age.mjs spec/_LEDGER-G-NS-LEGACY-EXEMPT.md
```

---

*Companion to gate `G-NS-NO-DEPRECATED-ALIAS` and audit `.lovable/memory/audit/at-namespace-synonym-audit.md`.*
