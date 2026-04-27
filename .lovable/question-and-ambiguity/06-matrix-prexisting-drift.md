---
task: F8 — implement G-29 endpoint↔matrix coverage gate
date: 2026-04-27
status: inferred-and-proceeded
---

# Ambiguity: matrix row pre-existing drift (3 ID renames + 1 missing row)

## Context
Implementing the G-29 runner revealed **pre-existing drift** in `16-endpoint-at-matrix.md` v1.1.0 that none of the previous gates had caught:

| Matrix had | Endpoint file declared | Action taken |
|------------|----------------------|--------------|
| `EP-ITEMS-TURN` | `EP-ITEMS-TURN-INTO` | Renamed in matrix to match SSOT file |
| `EP-TRASH-PURGE` | `EP-TRASH-PURGE-ONE` + `EP-TRASH-PURGE-ALL` | Renamed `EP-TRASH-PURGE`→`EP-TRASH-PURGE-ONE`; added new row `15b` for `EP-TRASH-PURGE-ALL` |
| `EP-PERSONAS-ME` | `EP-ME` | Renamed in matrix to match SSOT file |

## Conflict
The matrix is the AT-traceability SSOT (per AUDIT-AI-05) but the endpoint feature files are the contract SSOT. Two SSOTs claiming the same identifier in different shapes is by definition drift.

## Decision (inferred)
Endpoint feature files win — they define the actual REST contract (path, method, request/response shape). The matrix is a derivative cross-reference and must conform to the contracts it references. Renamed the matrix rows rather than renaming the endpoint files.

Used row tag `15b` for the second purge variant so existing row numbers (`16..47`) didn't have to be renumbered. Adjusted the gate's row-tag regex from `\d+` to `[\w.]+` to permit alphanumeric tags like `15b`.

## What the user should review
- Whether the row-tag convention `15b` should be normalised by renumbering the matrix end-to-end (would make every subsequent row +1).
- Whether `EP-TRASH-PURGE-ALL` deserves its own AT (`AT-TRASH-07` was added speculatively to satisfy the "≥1 AT per row" rule; that AT does not yet exist in `97-acceptance-criteria.md`). Likely needs to be registered in a follow-up task.
