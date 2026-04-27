# G-29 Endpoint ↔ Matrix Coverage Gate — Algorithm Spec

> **Version:** 1.0.0
> **Updated:** 2026-04-27 (UTC+8)
> **Parent:** [00-overview.md](./00-overview.md)
> **Reserved Gate ID:** G-29 (per [`02-ci-quality-gates.md`](./02-ci-quality-gates.md) catalogue)
> **Origin:** Promised in `spec/31-app/06-endpoints/16-endpoint-at-matrix.md` v1.1.0: "If you add a new endpoint, this matrix MUST be updated in the same PR." This file + the runner close that promise.

---

## Overview

G-29 is the **eleventh** drift-detector in the CI cluster. It enforces **bidirectional parity** between two surfaces:

1. **Endpoint declarations** — every `EP-*` symbol in any `spec/31-app/06-endpoints/*.md` file (other than the matrix itself).
2. **Matrix rows** — every row of `spec/31-app/06-endpoints/16-endpoint-at-matrix.md` whose first cell matches `^| \d+ | \`EP-[A-Z0-9-]+\``.

Without G-29, two regressions could silently merge:

- A new endpoint file ships without a matrix row → no AT coverage trail, no CI gate enforcement.
- A matrix row references a deleted/renamed endpoint → false coverage signal, audit drift.

G-29 also asserts that **every matrix row cites ≥1 AT ID** (matching `AT-[A-Z0-9-]+-?\d+` anywhere in the row). A row with zero ATs is meaningless.

---

## User Story

As a reviewer of any PR that adds, renames, or deletes an endpoint, I want CI to fail unless `16-endpoint-at-matrix.md` has been updated in the same PR with a corresponding row that cites at least one acceptance test, so that the endpoint→AT traceability surface promised by AUDIT-AI-05 cannot silently rot.

---

## Inputs

| Input | Type | Source | Notes |
|-------|------|--------|-------|
| Endpoint file glob | Filesystem scan | `spec/31-app/06-endpoints/*.md` | EXCLUDES `16-endpoint-at-matrix.md`, `00-overview.md`, `97-acceptance-criteria.md`, `99-consistency-report.md` |
| Endpoint declaration pattern | Inline regex | This script | `/EP-[A-Z][A-Z0-9-]+/g` matched against summary tables (rows starting with `\| EP-…`) and section headers (lines starting with `## EP-…`) |
| Matrix file | File read | `spec/31-app/06-endpoints/16-endpoint-at-matrix.md` | Markdown table parser scans rows under the `## Matrix` heading |
| Matrix row pattern | Inline regex | This script | `/^\|\s*[\w.]+\s*\|\s*`EP-[A-Z0-9-]+`/` — first column is row tag (digits or alphanumeric like `15b`), second is endpoint ID in backticks |
| AT citation pattern | Inline regex | This script | `/`AT-[A-Z][A-Z0-9-]*-?\d+`/` matched in the matrix row body |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| Per-violation line | ❌ | stdout | Format: `❌ G-29: <axis> <endpoint-id> <reason>` (matches G-22..G-28 drift format) |
| Final summary | ❌ | stdout | `✅ G-29: <D> declared, <M> matrixed, all paired with ≥1 AT` or `❌ G-29: <V> violation(s)` |
| Exit code | ❌ | Process exit | `0` clean, `1` violation, `2` runner error |

---

## Algorithm

```text
function auditEndpointMatrixCoverage(EndpointsDir, MatrixFile) -> int:
    DeclaredEndpoints := Set<string>()      # EP-* IDs found in endpoint feature files
    DeclaredOrigins   := Map<string, File>() # for diagnostics
    MatrixedEndpoints := Set<string>()      # EP-* IDs found as matrix rows
    MatrixRows        := Map<string, RowText>()  # for AT-citation check
    Violations        := []

    # === Axis A — collect DECLARED endpoints ===
    for each File in glob(EndpointsDir + "/*.md"):
        if basename(File) in ["00-overview.md", "16-endpoint-at-matrix.md",
                              "97-acceptance-criteria.md", "99-consistency-report.md"]:
            continue
        Content := readFile(File)
        # Two declaration sites count: summary-table rows and section headers
        for each Match in Content.matchAll(/^\|\s*(EP-[A-Z][A-Z0-9-]+)\s*\|/gm):
            DeclaredEndpoints.add(Match[1])
            DeclaredOrigins.set(Match[1], File) if not present
        for each Match in Content.matchAll(/^##\s+(EP-[A-Z][A-Z0-9-]+)\b/gm):
            DeclaredEndpoints.add(Match[1])
            DeclaredOrigins.set(Match[1], File) if not present

    # === Axis B — collect MATRIXED endpoints ===
    Matrix := readFile(MatrixFile)
    InMatrixSection := false
    for each (LineNum, Line) in Matrix.lines():
        if Line.startsWith("## Matrix"): InMatrixSection := true; continue
        if InMatrixSection and Line.startsWith("## ") and not Line.startsWith("## Matrix"):
            InMatrixSection := false
        if not InMatrixSection: continue
        Match := Line.match(/^\|\s*\d+\s*\|\s*`(EP-[A-Z][A-Z0-9-]+)`/)
        if Match:
            EpId := Match[1]
            if MatrixedEndpoints.has(EpId):
                Violations.push({axis: "duplicate-row", id: EpId,
                                 reason: `duplicate matrix row at line ${LineNum}`})
            MatrixedEndpoints.add(EpId)
            MatrixRows.set(EpId, Line)

    # === Axis C — bidirectional parity ===
    for each EpId in DeclaredEndpoints:
        if not MatrixedEndpoints.has(EpId):
            Violations.push({axis: "orphan-endpoint", id: EpId,
                             reason: `declared in ${DeclaredOrigins.get(EpId)} but missing from ${MatrixFile}`})

    for each EpId in MatrixedEndpoints:
        if not DeclaredEndpoints.has(EpId):
            Violations.push({axis: "phantom-row", id: EpId,
                             reason: `matrix row exists but no endpoint file declares ${EpId}`})

    # === Axis D — every matrix row cites ≥1 AT ===
    for each (EpId, Row) in MatrixRows:
        AtMatches := Row.matchAll(/`AT-[A-Z][A-Z0-9-]*-?\d+`/g)
        if AtMatches.length == 0:
            Violations.push({axis: "missing-at-citation", id: EpId,
                             reason: `matrix row cites zero AT IDs — every endpoint must have at least one acceptance test`})

    # === Report ===
    if Violations.length == 0:
        print(`✅ G-29: ${DeclaredEndpoints.size} declared, ${MatrixedEndpoints.size} matrixed, all paired with ≥1 AT`)
        return 0
    for each V in Violations:
        print(`❌ G-29: ${V.axis} ${V.id} ${V.reason}`)
    print(`❌ G-29: ${Violations.length} violation(s)`)
    return 1
```

---

## Test Vectors

| Scenario | Setup | Expected exit | Expected message |
|----------|-------|--------------:|------------------|
| Clean state | Every `EP-*` in endpoint files appears as a matrix row with ≥1 AT | `0` | `✅ G-29: N declared, N matrixed, all paired with ≥1 AT` |
| Orphan endpoint | New endpoint file declares `EP-FOO-BAR`; matrix not updated | `1` | `❌ G-29: orphan-endpoint EP-FOO-BAR declared in 17-foo.md but missing from 16-endpoint-at-matrix.md` |
| Phantom row | Matrix row for `EP-DELETED-OLD` but no endpoint file declares it | `1` | `❌ G-29: phantom-row EP-DELETED-OLD matrix row exists but no endpoint file declares EP-DELETED-OLD` |
| Missing AT citation | Matrix row for `EP-NEW-THING` cites zero ATs | `1` | `❌ G-29: missing-at-citation EP-NEW-THING matrix row cites zero AT IDs …` |
| Duplicate matrix row | Same endpoint appears twice in the matrix | `1` | `❌ G-29: duplicate-row EP-FOO-BAR duplicate matrix row at line 47` |

---

## Cross-References

| Topic | Link |
|-------|------|
| Endpoint catalogue | [`../06-endpoints/00-overview.md`](../06-endpoints/00-overview.md) |
| Matrix SSOT | [`../06-endpoints/16-endpoint-at-matrix.md`](../06-endpoints/16-endpoint-at-matrix.md) |
| Gate catalogue | [`./02-ci-quality-gates.md`](./02-ci-quality-gates.md) |
| AUDIT-AI-05 (matrix origin) | [`../../18-spec-issues/12-ai-readiness-audit-round-4-2026-04-27.md`](../../18-spec-issues/12-ai-readiness-audit-round-4-2026-04-27.md) |
