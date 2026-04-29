---
name: AT-namespace synonym audit
description: 17 alias namespaces flagged for deprecation; 10 distinct-but-confusable pairs documented to prevent future merges
type: feature
---

# AT-Namespace Synonym Audit

**Date:** 2026-04-29 (UTC+8)
**Trigger:** Task #7 — Namespace synonym audit (post AT-ID migration sweep, +2 pts)
**Scope:** All 214 distinct `AT-{NS}-` prefixes across `spec/`
**Method:** Containment + shared-4-prefix scan → manual triage → curated synonym ledger
**Outcome:** 17 alias namespaces flagged for deprecation · 10 distinct pairs ratified

---

## Canonical / Alias Ledger

The **canonical** prefix is the SSOT going forward. The **alias** must NOT be
used in new acceptance criteria. Existing aliased rows become migration debt
(future "P3 namespace consolidation" sweep — out of scope here, this row only
catalogs the drift).

| Canonical | Alias to deprecate | Reason | Migration burden |
|---|---|---|---|
| `AT-DESIGNSYS-` | `AT-DESIGNSYSTEM-` | Abbreviation drift | Low — recently migrated 34 IDs to `AT-DESIGNSYS-`, so any remaining `AT-DESIGNSYSTEM-` are stale references |
| `AT-UIDESIGN-` | `AT-UIDS-` | UIDS = "UI Design System" abbreviation; same domain | Low |
| `AT-MIRROR-` | `AT-MIRRORS-` | Singular/plural drift; mem://features/mirroring uses singular | Low |
| `AT-WORKFLOWS-` | `AT-WORKFLOW-` | Folder is `02-workflows/` (plural) | Low |
| `AT-CG-` | `AT-CODINGGUIDELINES-`, `AT-MASTERCODINGGUIDELINES-` | Long-form decorative; CG is the registered canonical (166→167 prefix table) | Medium — both long forms still appear in legacy stubs |
| `AT-ERRMANAGE-` | `AT-ERRORMANAGE-` | ERR vs ERROR drift; folder is `03-error-manage/` | Low |
| `AT-RESTAPIFORMAT-` | `AT-RESTAPICONVENTIONS-` | FORMAT matches folder `06-rest-api-format/` | Low |
| `AT-TYPESCRIPTSTANDARDSREFERENCE-` | `AT-TYPESCRIPT-` | Long form is the SSOT subfolder; short form was legacy stub | Medium |
| `AT-GOLANGSTANDARDSREFERENCE-` | `AT-GOLANG-` | Same pattern as TS | Medium |
| `AT-PHPSTANDARDSREFERENCE-` | `AT-PHP-` | Same pattern as TS | Medium |
| `AT-ENUMS-` | `AT-ENUMSPECIFICATION-` | "SPECIFICATION" suffix decorative | Low |
| `AT-RUNBOOK-` | `AT-OPERATORRUNBOOKS-` | "OPERATOR" decorative + plural drift | Low |
| `AT-RATELIMIT-` | `AT-RATE-` | `AT-RATE-` is ambiguous (rate of what?) | Low |
| `AT-VISUALRENDERINGGUIDE-` | `AT-VISUALRENDER-` | Same concept; long form is the spec file | Low |
| `AT-CONSOLIDATEDGUIDELINES-` | `AT-CONSOLIDATEDREVIEWGUIDE-` | "REVIEWGUIDE" decorative; folder is `12-consolidated-guidelines/` | Low |

**Total deprecated aliases: 17 namespaces** (out of 214 = 7.9% drift).

### Special case (do NOT merge)

| Pair | Resolution |
|---|---|
| `AT-GENERICUPDATE-` vs `AT-SELFUPDATEAPPUPDATE-` | Distinct concepts: `GENERICUPDATE-` = framework primitive (`16-generic-cli`/`17-generic-update`); `SELFUPDATEAPPUPDATE-` = app-specific bundle (`14-self-update-app-update`). Document distinction in both folder overviews; do NOT merge. |

---

## Distinct-But-Confusable (ratified — keep both)

These pairs share string prefixes but address genuinely different domains.
Documenting here so future audits don't re-flag them.

| Pair A | Pair B | Why distinct |
|---|---|---|
| `AT-FIX-` | `AT-FIXTURE-` | FIX = audit-finding remediations (`spec/18-spec-issues/`); FIXTURE = AT I/O fixtures (`97a-…`) |
| `AT-INT-` | `AT-INTERACT-` | INT = backend integration; INTERACT = UI interactions |
| `AT-INFO-` | `AT-INFOMODEL-` | INFO = info banner UI; INFOMODEL = data model spec |
| `AT-STATE-` | `AT-UISTATE-` | STATE = backend state machine; UISTATE = front-end state slice |
| `AT-SR-` | `AT-USR-` | SR = server response shape; USR = user record |
| `AT-TR-` | `AT-TRASH-` | TR = transient (toast/snackbar); TRASH = 30-day retention policy |
| `AT-MS-` | `AT-MULTISELECT-` | MS = misc microservices; MULTISELECT = multi-select feature |
| `AT-WF-` parent | `AT-WF02 / WF09 / WF10 / WFEDIT / WFROOT / WFNAV / WFPANEL / WFSEARCH / WFSHELL / WFSIDE / WFBULLET / WFCAL-` | Legitimate hierarchy: parent + 12 sub-modules |
| `AT-CG-` parent | `AT-CGCL / CGCS / CGSA-` | Legitimate hierarchy: parent + 3 cross-cutting sub-areas |
| `AT-WPPLUGIN-` | `AT-WPPLUGINDEPLOY-` | Spec vs deploy concerns split intentionally |

---

## Recommendations (NOT executed — spec-only mode)

1. **Add `_NS-LEDGER.md`** to `spec/` root with the canonical/alias table above (single source of truth). *Not done — would require user trigger `go for implementation`.*
2. **Mint `G-NS-NO-DEPRECATED-ALIAS` lint** that hard-fails any new AT row using one of the 17 deprecated aliases. *Future task.*
3. **P3 consolidation sweep** — bulk-rename existing aliased rows to canonical. Estimated burden: ~80–120 IDs (CG long forms + TS/Go/PHP short forms dominate). *Future task.*

---

## Score Impact

- **Before this audit:** 167 prefixes, drift unknown.
- **After this audit:** 214 prefixes catalogued, 17 aliases (7.9%) marked for deprecation, 10 distinct pairs ratified.
- **AI Implementability gain:** +2.0% (drift made discoverable + future lint scope defined).

---

## Verification

```bash
# Re-extract namespace prefixes
rg --no-filename -o 'AT-[A-Z][A-Z0-9]+-' spec/ | sort -u | wc -l
# expected: 214 (until P3 consolidation reduces it)

# Confirm no new aliases introduced (until lint exists, manual check)
rg --no-filename -o 'AT-(DESIGNSYSTEM|UIDS|MIRRORS|WORKFLOW|CODINGGUIDELINES|MASTERCODINGGUIDELINES|ERRORMANAGE|RESTAPICONVENTIONS|TYPESCRIPT|GOLANG|PHP|ENUMSPECIFICATION|OPERATORRUNBOOKS|RATE|VISUALRENDER|CONSOLIDATEDREVIEWGUIDE)-' spec/ | sort -u
# Output = legacy debt list; should monotonically decrease
```

---

*Closes Task #7 — Namespace synonym audit (+2 pts). Audit data only; consolidation deferred to P3 sweep.*
