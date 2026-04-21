# Spec-Hygiene Gate: Required Files

> **Version:** 1.0.0
> **Updated:** 2026-04-21
> **Status:** ✅ Active in CI
> **Implements:** [S04](../../.lovable/memory/suggestions/04-ci-gate-overview-and-consistency.md)

---

## Purpose

Every editable `spec/` folder (numbered ≥18) **must** contain:

1. `00-overview.md` — module entry point
2. `99-consistency-report.md` — file inventory + cross-ref health

Subfolders inside an editable folder are checked recursively.
Folders 01–17 are READ-ONLY and skipped.

---

## Enforcement

**Script:** [`scripts/spec-hygiene/12-check-required-files.mjs`](../../scripts/spec-hygiene/12-check-required-files.mjs)

**CI wiring:** Listed in [`scripts/spec-hygiene/00-run-all.mjs`](../../scripts/spec-hygiene/00-run-all.mjs).

Local run:

```bash
node scripts/spec-hygiene/12-check-required-files.mjs
# exits 1 with one line per missing file if any are absent
```

---

## Authoring Rule

When you create a new folder under `spec/` (numbered ≥18), you **must** ship:

- `00-overview.md` describing the folder's purpose, scope, and child files
- `99-consistency-report.md` listing the file inventory + summary

The consistency report can be a stub (use the templates in existing reports
under `spec/32-ui-design/06-workflowy-ui/*/99-consistency-report.md` as
references). The CI gate only checks **presence**, not content depth.

---

## History

| Date | Event |
|------|-------|
| 2026-04-21 | Gate authored as part of S04. Sweep added 11 missing reports under `spec/32-ui-design/06-workflowy-ui/` (Phases 1–10). |

---

## Related

- [S04 suggestion](../../.lovable/memory/suggestions/04-ci-gate-overview-and-consistency.md)
- [S05 suggestion](../../.lovable/memory/suggestions/05-ci-gate-broken-relative-links.md) — companion gate (broken links)

*Created 2026-04-21 (S04).*
