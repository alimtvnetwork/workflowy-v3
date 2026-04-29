# Ledger — `G-00-AT-FIX-COMPANION-SHAPE` Baseline Allow-list

> **Version:** 1.0.0
> **Created:** 2026-04-29 (UTC+8)
> **Status:** ACTIVE — gate runs in **WARN-only** mode until drained
> **TTL:** 14 days (matures **2026-05-13**); after drain, flip runner to hard-fail
> **Gate:** `G-00-AT-FIX-COMPANION-SHAPE` (CI, currently WARN-only)
> **Runner:** [`scripts/spec-hygiene/58-check-at-fix-companion-shape.mjs`](../scripts/spec-hygiene/58-check-at-fix-companion-shape.mjs)
> **Authority:** [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](./01-spec-authoring-guide/19-acceptance-criteria-io-table.md) §"Companion-file pattern"
> **Closes (when drained):** F-AUDIT-32 follow-up (#28); precedent: `_LEDGER-G-00-ADR-CONSEQUENCES-XLINK-BASELINE.md` (drained same-day)

---

## Why this ledger exists

The companion-file shape rules (`## Scope`, `## Verification`, `## Related`, front-matter with `Format SSOT` + `Closes`, parent backlink) were formalised on 2026-04-29 in `spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md` (closing F-AUDIT-32 from re-audit v3). 19 sibling companion files predate this formal shape and use earlier, looser conventions inherited from the P2a–P2g sweep (which adopted Pattern Catalogues rather than §N clusters).

Hard-failing CI on day 1 would block the entire workflow on legacy content. Following the pattern set by `G-00-ADR-CONSEQUENCES-XLINK` (which drained 28→0 same-day), this gate runs in **WARN-only** mode while a drain plan executes. Each waived path is enumerated below; new companions added after 2026-04-29 are NOT eligible for waivers and will surface as warnings until the gate flips to hard-fail.

---

## Allow-listed paths (19 entries, 90-day max TTL)

> Format: each row's first cell holds a path substring. The runner waives any violation whose error message contains that substring. To remove a waiver, delete the row and let the gate re-surface the issue.

| pathFragment | reason | addedOn |
|--------------|--------|---------|
| `02-coding-guidelines/97a-acceptance-criteria-fixtures.md` | Pre-dates shape spec; uses Pattern 2 (Lint-shape) inline catalogue | 2026-04-29 |
| `02-coding-guidelines/97-acceptance-criteria.md` | Discoverability backlink not yet added | 2026-04-29 |
| `03-error-manage/97a-acceptance-criteria-fixtures.md` | Pre-dates shape spec; Pattern 2 (Error-envelope) inline catalogue | 2026-04-29 |
| `03-error-manage/97-acceptance-criteria.md` | Discoverability backlink not yet added | 2026-04-29 |
| `04-database-conventions/97a-acceptance-criteria-fixtures.md` | Pre-dates shape spec; PascalCase Golden Rule inline catalogue | 2026-04-29 |
| `04-database-conventions/97-acceptance-criteria.md` | Discoverability backlink not yet added | 2026-04-29 |
| `05-split-db-architecture/97a-acceptance-criteria-fixtures.md` | Orphan companion (no sibling 97-AC); P2g sweep artifact, candidate for deletion or pairing | 2026-04-29 |
| `06-seedable-config-architecture/97a-acceptance-criteria-fixtures.md` | Orphan companion (no sibling 97-AC); P2g sweep artifact | 2026-04-29 |
| `07-design-system/97a-acceptance-criteria-fixtures.md` | Pre-dates shape spec; UI-gesture inline catalogue | 2026-04-29 |
| `07-design-system/97-acceptance-criteria.md` | Discoverability backlink not yet added | 2026-04-29 |
| `10-powershell-integration/97a-acceptance-criteria-fixtures.md` | Pre-dates shape spec; Linter-script inline catalogue | 2026-04-29 |
| `13-cicd-pipeline-workflows/97a-acceptance-criteria-fixtures.md` | Pre-dates shape spec; CI-job inline catalogue | 2026-04-29 |
| `14-self-update-app-update/97a-acceptance-criteria-fixtures.md` | Pre-dates shape spec; Release-flow inline catalogue | 2026-04-29 |
| `16-generic-cli/97a-acceptance-criteria-fixtures.md` | Pre-dates shape spec; Linter-script inline catalogue | 2026-04-29 |
| `17-generic-update/97a-acceptance-criteria-fixtures.md` | Pre-dates shape spec; Release-flow inline catalogue | 2026-04-29 |
| `18-spec-issues/97a-acceptance-criteria-fixtures.md` | Pre-dates shape spec; Doc-shape inline catalogue | 2026-04-29 |
| `18-spec-issues/97-acceptance-criteria.md` | Discoverability backlink not yet added | 2026-04-29 |
| `31-app/97a-acceptance-criteria-fixtures.md` | Pre-dates shape spec; missing `## Scope`/`## Verification`/`## Related` H2s | 2026-04-29 |
| `31-app/97-acceptance-criteria.md` | Discoverability backlink not yet added | 2026-04-29 |
| `32-ui-design/97a-acceptance-criteria-fixtures.md` | Pre-dates shape spec; UI gesture canonical | 2026-04-29 |
| `32-ui-design/97-acceptance-criteria.md` | Discoverability backlink not yet added | 2026-04-29 |
| `33-feedback-report/97a-acceptance-criteria-fixtures.md` | Pre-dates shape spec | 2026-04-29 |
| `33-feedback-report/97-acceptance-criteria.md` | Discoverability backlink not yet added | 2026-04-29 |
| `34-activity-feed/97a-acceptance-criteria-fixtures.md` | Pre-dates shape spec | 2026-04-29 |
| `34-activity-feed/97-acceptance-criteria.md` | Discoverability backlink not yet added | 2026-04-29 |
| `35-enforcement-rules/97a-acceptance-criteria-fixtures.md` | Pre-dates shape spec | 2026-04-29 |
| `35-enforcement-rules/97-acceptance-criteria.md` | Discoverability backlink not yet added | 2026-04-29 |
| `36-user-management/97a-acceptance-criteria-fixtures.md` | Pre-dates shape spec | 2026-04-29 |
| `36-user-management/97-acceptance-criteria.md` | Discoverability backlink not yet added | 2026-04-29 |

---

## Drain plan

| Phase | Action | Owner | Completion criterion |
|-------|--------|-------|----------------------|
| **P1** | Add front-matter `Format SSOT` + `Closes` to all 17 pre-existing companions (mechanical sed pass) | next `next ledger-drain` task | Re-run gate #58 → S3 violations 0 |
| **P2** | Add `## Scope` H2 (or rename existing equivalent like `## Pattern catalogue` to satisfy the literal H2) to all 17 | next `next ledger-drain` task | S4 violations 0 |
| **P3** | Author one-line backlink `- Sibling I/O fixtures for … → 97a-acceptance-criteria-fixtures.md` in the 13 parent `97-AC` `## Related` sections | next `next ledger-drain` task | S7 violations 0 |
| **P4** | Resolve 2 orphan companions (`05-split-db-architecture/`, `06-seedable-config-architecture/`): either author missing `97-acceptance-criteria.md` or move content to corpus-wide sweep file | manual triage | S1 violations 0 |
| **P5** | Delete this ledger; flip runner to hard-fail by removing `process.exit(0)` waiver in WARN branch | drain commit | Gate #58 reports `0 waived; X shape-valid` |

---

## Related

- [`scripts/spec-hygiene/58-check-at-fix-companion-shape.mjs`](../scripts/spec-hygiene/58-check-at-fix-companion-shape.mjs) — the runner
- [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](./01-spec-authoring-guide/19-acceptance-criteria-io-table.md) §"Companion-file pattern" — the shape spec being enforced
- [`spec/00-adrs/_LEDGER-G-00-ADR-CONSEQUENCES-XLINK-BASELINE.md`](./00-adrs/_LEDGER-G-00-ADR-CONSEQUENCES-XLINK-BASELINE.md) — drain-pattern precedent (28 → 0 same-day)
- [`spec/_AUDIT-EXEMPTIONS.md`](./_AUDIT-EXEMPTIONS.md) — orthogonal audit-heuristic ledger; this ledger is gate-specific and time-boxed
- F-AUDIT-32 (`/mnt/documents/spec-ai-implementability-audit-v3.json`) — the audit finding this gate closes when drained
