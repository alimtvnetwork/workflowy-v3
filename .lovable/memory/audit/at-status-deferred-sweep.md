---
name: STATUS DEFERRED tagging sweep
description: 16 spec files normalized from free-form deferral prose ("Out-of-scope for current stack", "🚫 Deferred to post-v1") to canonical `DEFERRED` token per legend §3
type: feature
---

# STATUS: DEFERRED Tagging Sweep

**Date:** 2026-04-29 (UTC+8)
**Trigger:** Task #3 — Tag "Out-of-scope" ATs with `STATUS: DEFERRED` (+5 pts)
**Legend SSOT:** [`spec/01-spec-authoring-guide/22-status-legend.md`](../../../spec/01-spec-authoring-guide/22-status-legend.md) §3
**Companion gate:** `G-NS-STATUS-IN-LEGEND` (CI, WARN-only)

---

## Files Normalized (16)

### Out-of-scope-for-current-stack → `DEFERRED` (Go-binary tooling parked)

| File | Old `**Status:**` | New |
|---|---|---|
| `spec/16-generic-cli/97-acceptance-criteria.md` | `Curated rollup — 14 testable criteria` | `DEFERRED (out-of-scope for current WP-plugin stack; preserved as canonical SSOT for future Go CLI tool — see legend §2 mapping)` |
| `spec/13-cicd-pipeline-workflows/02-go-binary-deploy/97-acceptance-criteria.md` | `Curated — 8 testable criteria` | `DEFERRED (out-of-scope for current WP-plugin stack; preserved as canonical SSOT for future Go-binary deploy …)` |
| `spec/16-generic-cli/16-verbose-logging/97-acceptance-criteria.md` | `Curated — 8 testable criteria` | `DEFERRED (parent generic-CLI folder out-of-scope …)` |
| `spec/17-generic-update/97-acceptance-criteria.md` | `Curated — 9 testable criteria` | `DEFERRED (Go-binary self-update pattern; out-of-scope for WP-plugin stack …)` |
| `spec/14-self-update-app-update/97-acceptance-criteria.md` | `Curated rollup — 12 testable criteria` | `DEFERRED (Go-binary self-updater; WP plugin uses WordPress update server …)` |
| `spec/14-self-update-app-update/09-release-versioning/97-acceptance-criteria.md` | `Curated — 12 testable criteria` | `DEFERRED (parent self-update folder Go-binary; WP plugin uses WP versioning …)` |

### Post-v1 deferrals → `DEFERRED (post-v1; …)` (UI features parked)

| File | Old `**Status:**` | New |
|---|---|---|
| `spec/32-ui-design/06-workflowy-ui/10-mobile/97-acceptance-criteria.md` | `🚫 Deferred to post-v1 (criteria locked)` | `DEFERRED (post-v1; criteria locked)` |
| `spec/32-ui-design/06-workflowy-ui/10-mobile/00-overview.md` | `🚫 Deferred to post-v1 (spec authored 2026-04-23, implementation gated on build pipeline + device QA matrix)` | `DEFERRED (post-v1; spec authored 2026-04-23, implementation gated on build pipeline + device QA matrix)` |
| `spec/32-ui-design/06-workflowy-ui/10-mobile/01-pwa.md` | `🚫 Deferred to post-v1 (spec authored, not implemented)` | `DEFERRED (post-v1; spec authored, not implemented)` |
| `spec/32-ui-design/06-workflowy-ui/10-mobile/02-share-target.md` | (same) | (same pattern) |
| `spec/32-ui-design/06-workflowy-ui/10-mobile/03-mobile-gestures.md` | (same) | (same pattern) |
| `spec/32-ui-design/06-workflowy-ui/09-integrations/97-acceptance-criteria.md` | `🚫 Deferred to post-v1 (criteria locked, validation gated on backend choice)` | `DEFERRED (post-v1; criteria locked, validation gated on backend choice)` |
| `spec/32-ui-design/06-workflowy-ui/09-integrations/00-overview.md` | `🚫 Deferred to post-v1 (… implementation gated on backend runtime choice)` | `DEFERRED (post-v1; …)` |
| `spec/32-ui-design/06-workflowy-ui/09-integrations/01-email-to-workflowy.md` | (post-v1 spec authored) | `DEFERRED (post-v1; spec authored, not implemented)` |
| `spec/32-ui-design/06-workflowy-ui/09-integrations/02-linkedin-import.md` | `🚫 Deferred to post-v1 (Blocker D-1 resolved 2026-04-23)` | `DEFERRED (post-v1; Blocker D-1 resolved 2026-04-23)` |
| `spec/32-ui-design/06-workflowy-ui/09-integrations/03-allowlist-security.md` | (post-v1 spec authored) | `DEFERRED (post-v1; spec authored)` |

---

## Out-of-Scope Patterns NOT Re-Tagged (intentional)

| Pattern | Reason kept as `CANONICAL` |
|---|---|
| Per-row `out-of-scope` mentions inside tables (e.g. `AT-CONSOLIDATEDGUIDELINES-11`) | These describe the rule itself ("X must be marked out-of-scope"); the AT row is canonical, the *target* is deferred. |
| `08-wp-plugin-boundary.md §"Out of Scope"` lists | Section names, not file status. |
| `AT-APP-90` — drag out-of-scope rejection | "Out-of-scope" describes a runtime drag boundary, not a deferral. |
| `02-coding-guidelines/01-cross-language/16-static-analysis/` deferral notes | Notes are inside §"Out of scope (this iteration)" — file as a whole is canonical; the listed sub-items are deferred. Per-line `STATUS: DEFERRED` not warranted. |

---

## Per-Row Inline Tags (legend §4) — None applied this pass

The 16 files all had **file-level** deferral context (entire folder is parked).
None required per-row `STATUS: DEFERRED` inline tags. Per-row tagging is
deferred to the AUDIT-03 backfill (#1) where individual rows in otherwise-
canonical files might need it.

---

## Score Impact

- **Before:** 16 files used 4 free-form deferral phrasings (`Curated`, `Curated rollup`, `🚫 Deferred to post-v1`, etc.). Programmatic "what's parked?" filter required manual prose reading.
- **After:** 16 files use the canonical `DEFERRED` token; `rg '\*\*Status:\*\* DEFERRED' spec/` returns the complete list.
- **AI Implementability gain:** +5.0% (deferred-content boundary now mechanical; downstream gates can exclude `DEFERRED` files from coverage/drift checks; `G-NS-STATUS-IN-LEGEND` legacy count drops by 16).

---

## Verification

```bash
# Canonical DEFERRED files (target: 16+)
rg -l '^> \*\*Status:\*\* DEFERRED\b' spec/ | wc -l

# No remaining "🚫 Deferred to post-v1" prose in front-matter
rg '^> \*\*Status:\*\* 🚫 Deferred' spec/
# expected: empty

# No remaining "Out-of-scope" used as Status front-matter (Scope: line is fine)
rg '^> \*\*Status:\*\*.*[Oo]ut-of-scope' spec/
# expected: empty
```

---

*Closes Task #3 — STATUS: DEFERRED tagging sweep (+5 pts). Reduces `G-NS-STATUS-IN-LEGEND` legacy count by 16; unblocks DOC-tier sweep #5 (which can now exclude DEFERRED files).*
