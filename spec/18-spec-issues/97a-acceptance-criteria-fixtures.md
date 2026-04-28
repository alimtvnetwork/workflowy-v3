# Spec Issues — Acceptance Criteria I/O Fixtures

> **Version:** 1.0.0
> **Created:** 2026-04-28 (UTC+8)
> **Status:** Concrete companion to [`97-acceptance-criteria.md`](./97-acceptance-criteria.md). Replaces P20 stub seed (which only seeded `AT-APP-01`).
> **Format spec:** [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md)
> **Spawned by:** `.lovable/plans/00-active.md` § P22.

This folder is a **rolling audit log**, not a feature spec. Fixtures here bind
the meta-process: how audits are recorded, how findings are tracked, how
resolution-gates work. Concrete `AT-APP-NN` rows are owned by their respective
audit files (`05-audit-02a-…`, `07-audit-03-…`, etc.); this file binds the
**process invariants** that every audit must satisfy.

---

## `AT-SPECISSUES-01` — Every audit file follows canonical 5-section format

| Linter command | `for f in spec/18-spec-issues/0[1-9]-*.md spec/18-spec-issues/1[0-9]-*.md; do rg -L "^## (Summary\|Findings\|Severity\|Resolution Plan\|Related)" "$f"; done` |
|---|---|
| **Expected exit code** | `1` (every audit file contains all 5 sections). |
| **Negative** | An audit file missing any of the 5 sections MUST fail. |
| **Test name** | `at_specissues_01_audit_format` |

## `AT-SPECISSUES-02` — Findings carry a stable `F-AUDxx-NN` ID

| Linter command | `rg -hoE "^### F-AUD\d+-\d+" spec/18-spec-issues/ | sort | uniq -d` |
|---|---|
| **Expected** | Empty output (no duplicate IDs across the folder). |
| **Negative** | Two findings with the same `F-AUDxx-NN` ID MUST fail. |

## `AT-SPECISSUES-03` — Severity ∈ {LOW, MEDIUM, HIGH, CRITICAL}

| Linter command | `rg -hoE "\(LOW\|MEDIUM\|HIGH\|CRITICAL\)" spec/18-spec-issues/ | sort -u; rg -nP "^### F-AUD\d+-\d+ — .* \((?!LOW\|MEDIUM\|HIGH\|CRITICAL\)).*\)" spec/18-spec-issues/` |
|---|---|
| **Expected** | First command lists only the 4 allowed values; second command exit `1` (no out-of-vocabulary severities). |
| **Negative** | A finding tagged `(URGENT)` or `(SEV-2)` MUST fail. |

## `AT-SPECISSUES-04` — Every finding cites the failing AT or rule

| Given | A finding `### F-AUDxx-NN — <title> (<severity>)`. |
|---|---|
| **When** | Linter parses the finding body. |
| **Then** | Body MUST contain at least one citation matching `\bAT-[A-Z0-9]+-\d+\b` OR `\bG-\d+[a-z]?\b` (gate ID). |
| **Negative** | A finding with no AT/gate citation MUST fail. |

## `AT-SPECISSUES-05` — Resolved findings link to the resolution PR/commit

| Linter command | `rg -nP "^### F-AUD\d+-\d+ — .* \[(RESOLVED\|CLOSED)\]" spec/18-spec-issues/ | while read line; do rg -A 5 "$line" | rg -P "(PR #\d+\|[a-f0-9]{7,40})" >/dev/null \|\| { echo "missing link: $line"; exit 1; }; done` |
|---|---|
| **Expected exit code** | `0`. |
| **Negative** | A finding marked `[RESOLVED]` with no PR or commit link MUST fail. |

## `AT-SPECISSUES-06` — `AT-APP-NN` findings cross-link to spec/31-app

| Linter command | `rg -nP "AT-APP-\d+" spec/18-spec-issues/ | wc -l; rg -nP "spec/31-app/" spec/18-spec-issues/ | wc -l` |
|---|---|
| **Expected** | Both counts `≥ 5` (every `AT-APP-*` citation in this folder is paired with at least one back-link into `spec/31-app/`). |
| **Negative** | An audit that flags `AT-APP-37` without ever linking back to `spec/31-app/` MUST fail. |

## `AT-SPECISSUES-07` — Audit dates monotonic in filename

| Linter command | `ls spec/18-spec-issues/ | rg -oP "\d{4}-\d{2}-\d{2}" | sort -c` |
|---|---|
| **Expected exit code** | `0` (dates appear in non-decreasing order, matching directory listing order under numeric prefix). |
| **Negative** | An audit dated earlier than a lower-numbered file MUST fail the chronology gate. |

## `AT-SPECISSUES-08` — `AT-CONCURRENCY-*` findings include reproduction steps

| Given | A finding citing `AT-CONCURRENCY-NN`. |
|---|---|
| **When** | Linter parses the finding body. |
| **Then** | Body MUST contain a `## Reproduction` H2 with a numbered step list ≥3 entries. |
| **Negative** | A concurrency finding with no reproduction recipe MUST fail (concurrency bugs are unreproducible without one). |

## `AT-SPECISSUES-09` — `AT-HARNESS-*` findings cite the failing test file

| Given | A finding citing `AT-HARNESS-NN`. |
|---|---|
| **When** | Linter parses the finding body. |
| **Then** | Body MUST cite at least one path matching `(src\|spec)/.*\.(test\.[jt]s\|spec\.[jt]s)$` OR a Vitest/PHPUnit suite name. |
| **Negative** | A harness finding with no failing-test pointer MUST fail. |

## `AT-SPECISSUES-10` — Open findings counter in `00-overview.md`

| Linter command | `OPEN=$(rg -c "\[OPEN\]" spec/18-spec-issues/ --no-filename | awk '{s+=$1} END{print s}'); rg -nP "Open findings:\s*$OPEN\b" spec/18-spec-issues/00-overview.md` |
|---|---|
| **Expected exit code** | `0` (counter in overview matches actual `[OPEN]` count). |
| **Negative** | A drifted counter MUST fail (stale audit dashboard). |

---

## Verification

```bash
grep -c "^## \`AT-SPECISSUES-" spec/18-spec-issues/97a-acceptance-criteria-fixtures.md
# expected: 10
node scripts/spec-hygiene/00-run-all.mjs
```

## Related

- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Source AT prose
- [`00-overview.md`](./00-overview.md) — Audit dashboard
- [`spec/01-spec-authoring-guide/14-scoring-metrics.md`](../01-spec-authoring-guide/14-scoring-metrics.md) — Severity SSOT
