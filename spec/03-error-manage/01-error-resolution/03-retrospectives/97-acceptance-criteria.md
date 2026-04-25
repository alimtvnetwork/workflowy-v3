# Retrospectives — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 10 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-RETROSPECTIVES-01` … `AT-RETROSPECTIVES-10`

---

## Criteria

### Format conformance

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RETROSPECTIVES-01 | Every retrospective file follows the standard structure: **Symptom → Root Cause → Detection → Fix → Prevention → Lessons Learned** sections, in that order. | [`00-overview.md`](./00-overview.md), all retro files |
| AT-RETROSPECTIVES-02 | Every retrospective references at least one error code from the registry and links to the `apperror` policy section that governs the failure. | [`spec/03-error-manage/03-error-code-registry/97-acceptance-criteria.md`](../../03-error-code-registry/97-acceptance-criteria.md), [`spec/03-error-manage/02-error-architecture/06-apperror-package/01-apperror-reference/97-acceptance-criteria.md`](../../02-error-architecture/06-apperror-package/01-apperror-reference/97-acceptance-criteria.md) |
| AT-RETROSPECTIVES-03 | Each retrospective ends with a **Prevention** section that names the specific spec/test/lint check added (or to be added) so the failure cannot recur silently. | All retro files |

### Per-incident anchors

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RETROSPECTIVES-04 | **R-01 Health-endpoint mismatch** — encodes the rule that frontend & backend share one canonical health-endpoint contract validated by the response-envelope schema on every release. | [`01-health-endpoint-mismatch.md`](./01-health-endpoint-mismatch.md) |
| AT-RETROSPECTIVES-05 | **R-02 Retry/debounce/dedup fixes** — encodes the rule that retry policy, debounce window, and request-deduplication key strategy are co-located and tested together to avoid duplicate-storm regressions. | [`02-retry-debounce-dedup-fixes/00-overview.md`](./02-retry-debounce-dedup-fixes/00-overview.md) |
| AT-RETROSPECTIVES-06 | **R-03 ZIP finalization before return** — encodes the rule that any stream/file producer MUST flush + close before the function returns the path/size; integration tests assert non-zero file size. | [`03-zip-finalization-before-return.md`](./03-zip-finalization-before-return.md) |
| AT-RETROSPECTIVES-07 | **R-04 Activation-endpoint mismatch** — encodes the rule that endpoint contracts (path + method + envelope) are SSOT-controlled and any frontend ↔ backend drift is caught by an automated contract test. | [`04-activation-endpoint-mismatch.md`](./04-activation-endpoint-mismatch.md) |

### Process & links

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RETROSPECTIVES-08 | Every retrospective has a stable `R-NN` ID that survives folder reorganization; renames keep the original ID as an alias in the file header. | All retro files |
| AT-RETROSPECTIVES-09 | The retrospectives index (`00-overview.md`) lists every retro with one-line summary; orphans (file present but not indexed) are caught by the cross-reference hygiene script. | [`00-overview.md`](./00-overview.md), [`scripts/spec-hygiene/09-check-xrefs.mjs`](../../../../scripts/spec-hygiene/09-check-xrefs.mjs) |
| AT-RETROSPECTIVES-10 | Subfolder retros (e.g., `02-retry-debounce-dedup-fixes/`) follow the same six-section structure inside their `00-overview.md` and are subject to the same coverage rules. | [`02-retry-debounce-dedup-fixes/00-overview.md`](./02-retry-debounce-dedup-fixes/00-overview.md) |

---

## Verification

```bash
# Verify each retro has the required sections
for f in spec/03-error-manage/01-error-resolution/03-retrospectives/0*.md \
         spec/03-error-manage/01-error-resolution/03-retrospectives/*/00-overview.md; do
  for s in Symptom 'Root Cause' Detection Fix Prevention 'Lessons Learned'; do
    grep -q "^## $s" "$f" || echo "MISSING [$s] in $f"
  done
done

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`spec/03-error-manage/02-error-architecture/01-error-handling-reference/97-acceptance-criteria.md`](../../02-error-architecture/01-error-handling-reference/97-acceptance-criteria.md) — Cross-stack error handling
- [`spec/03-error-manage/03-error-code-registry/97-acceptance-criteria.md`](../../03-error-code-registry/97-acceptance-criteria.md) — Error code registry
- [`spec/19-glossary.md`](../../../19-glossary.md) — Terminology SSOT

---

*Curated 2026-04-25 — closes A-17 (batch 6).*
