# Spec — `00-adrs` Acceptance Criteria I/O Fixtures (ADR-0029 + ADR-0030)

> **Version:** 1.0.0
> **Created:** 2026-04-29 (UTC+8)
> **Status:** Normative companion to [`97-acceptance-criteria.md`](./97-acceptance-criteria.md).
> **Format SSOT:** [`../01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md)
> **Closes:** AT-FIX-01 deficit for AT-ADR-G04 (5 rows: AT-29-D1/D3/D4×3) and AT-ADR-G05 (8 rows: AT-30-I1..I8). Ratifies fixtures-as-spec for ADR-0029 and ADR-0030.

---

## Scope

This file pairs every AT row added in `97-acceptance-criteria.md` v1.1.0 (AT-ADR-G04) and v1.2.0 (AT-ADR-G05) with a Given/When/Then I/O fixture. AT-ADR-G01..G03 are pre-existing meta-shape ATs verified by the standing `spec-hygiene` suite and do not need fixtures here (covered by Pattern 1 / Doc-shape in [`../97a-acceptance-criteria-fixtures.md`](../97a-acceptance-criteria-fixtures.md)).

| AT cluster | Owning ADR | Owning gate(s) | Fixtures below |
|------------|------------|----------------|----------------|
| AT-29-D1 / D3 / D4×3 | [ADR-0029](./0029-per-gate-path-ledger-shared-lib.md) | `G-13-LEDGER-USES-SHARED-LIB`, `G-13-LEDGER-PER-GATE-PATH` | §1.1–§1.5 |
| AT-30-I1..I8 | [ADR-0030](./0030-audit-exemption-manifest.md) | `G-00-AUDIT-EXEMPTION-REVIEW` | §2.1–§2.8 |

---

## §1 — AT-ADR-G04 fixtures (ADR-0029, per-(gate, path) ledger shared lib)

### §1.1 AT-29-D1-IMPORT-PRESENT

| Slot | Value |
|------|-------|
| **Given** | Repo at HEAD with `scripts/spec-hygiene/_lib/per-gate-path-ledger.mjs` exporting `walkLedger`, `globToRegExp`. |
| **When** | `node scripts/spec-hygiene/48-check-ledger-uses-shared-lib.mjs` runs over every `*.mjs` under `scripts/spec-hygiene/` (excluding `_lib/`) that contains the literal string `_LEDGER-G-` and `-EXEMPTIONS.md`. |
| **Expected exit** | `0` |
| **Then (positive)** | Each such runner contains `import … from '…/_lib/per-gate-path-ledger.mjs'` (or relative equivalent). |
| **Negative fixture** | A new runner `scripts/spec-hygiene/99-check-foo.mjs` that references `_LEDGER-G-99-FOO-EXEMPTIONS.md` but omits the import MUST cause exit `1` with stderr: `G-13-LEDGER-USES-SHARED-LIB FAIL 99-check-foo.mjs: references ledger but does not import _lib/per-gate-path-ledger.mjs`. |

### §1.2 AT-29-D3-SCHEMA-FROZEN

| Slot | Value |
|------|-------|
| **Given** | Any file matching `spec/**/_LEDGER-G-*-EXEMPTIONS.md`. |
| **When** | `G-13-LEDGER-PER-GATE-PATH` walker parses the file. |
| **Expected exit** | `0` only when the file contains exactly one `## Entries` H2 followed by a Markdown table whose header row is **exactly** `\| gate \| pathGlob \| entry \| rationale \| addedOn \|` (case-sensitive, in order). |
| **Then (positive)** | A canonical fixture file with header row `\| gate \| pathGlob \| entry \| rationale \| addedOn \|` and ≥1 data row passes. |
| **Negative fixtures** | (a) Two `## Entries` H2s → FAIL `multiple-entries-h2`. (b) Header re-ordered to `\| pathGlob \| gate \| … \|` → FAIL `header-shape-mismatch`. (c) 4-column table → FAIL `column-count-mismatch`. (d) Lowercase `## entries` → FAIL `missing-entries-h2`. |

### §1.3 AT-29-D4-NO-INLINE-GLOBTOREGEXP

| Slot | Value |
|------|-------|
| **Given** | All `.mjs` files under `scripts/spec-hygiene/` except `_lib/`. |
| **When** | Gate scans for the regex `/(function\s+globToRegExp|const\s+globToRegExp\s*=)/`. |
| **Expected exit** | `0` (no matches outside `_lib/`). |
| **Negative fixture** | Adding `function globToRegExp(g){…}` to `scripts/spec-hygiene/30-check-foo.mjs` MUST cause exit `1` with stderr: `G-13-LEDGER-USES-SHARED-LIB FAIL 30-check-foo.mjs:LL: inline globToRegExp forbidden — import from _lib/per-gate-path-ledger.mjs`. |

### §1.4 AT-29-D4-NO-INLINE-WALKLEDGER

| Slot | Value |
|------|-------|
| **Given** | All `.mjs` files under `scripts/spec-hygiene/` except `_lib/`. |
| **When** | Gate scans for `/(function\s+\*?\s*walkLedger|const\s+walkLedger\s*=)/`. |
| **Expected exit** | `0`. |
| **Negative fixture** | Adding `function* walkLedger(){…}` to any non-`_lib/` runner MUST cause exit `1` with stderr cite `inline walkLedger forbidden`. |

### §1.5 AT-29-D4-NO-DIRECT-LEDGER-READ

| Slot | Value |
|------|-------|
| **Given** | All `.mjs` files under `scripts/spec-hygiene/` except `_lib/`. |
| **When** | Gate AST/regex-scans for any `fs.readFile(`/`fs.readFileSync(` whose first string argument matches `/_LEDGER-G-[A-Z0-9_-]+-EXEMPTIONS\.md/`. |
| **Expected exit** | `0` — all ledger I/O flows through `walkLedger()`. |
| **Negative fixture** | `fs.readFileSync('spec/04-db/_LEDGER-G-04-DDL-EXEMPTIONS.md','utf8')` in a non-`_lib/` runner MUST cause exit `1` with stderr cite `direct ledger read forbidden — use walkLedger()`. |

---

## §2 — AT-ADR-G05 fixtures (ADR-0030, audit exemption manifest)

> All eight invariants are enforced by `G-00-AUDIT-EXEMPTION-REVIEW` ([`scripts/spec-hygiene/57-check-audit-exemption-review.mjs`](../../scripts/spec-hygiene/57-check-audit-exemption-review.mjs)) over the singleton manifest [`spec/_AUDIT-EXEMPTIONS.md`](../_AUDIT-EXEMPTIONS.md).

### §2.1 AT-30-I1-MANIFEST-EXISTS

| Slot | Value |
|------|-------|
| **Given** | Repo at HEAD. |
| **When** | Gate `#57` resolves the path `spec/_AUDIT-EXEMPTIONS.md`. |
| **Expected exit** | `0` when the file exists and is readable. |
| **Negative fixture** | Deleting `spec/_AUDIT-EXEMPTIONS.md` MUST cause exit `1` with stderr: `G-00-AUDIT-EXEMPTION-REVIEW FAIL I1: manifest missing at spec/_AUDIT-EXEMPTIONS.md`. |

### §2.2 AT-30-I2-SINGLE-H2

| Slot | Value |
|------|-------|
| **Given** | Manifest file present. |
| **When** | Gate counts `^## Exemption rows$` headings. |
| **Expected exit** | `0` only when count === 1. |
| **Negative fixtures** | (a) Zero `## Exemption rows` → FAIL `I2: missing canonical H2 '## Exemption rows'`. (b) Two `## Exemption rows` H2s → FAIL `I2: duplicate canonical H2 (found 2)`. |

### §2.3 AT-30-I3-HEADER-SHAPE

| Slot | Value |
|------|-------|
| **Given** | Manifest contains the canonical H2. |
| **When** | Gate parses the table header row immediately under `## Exemption rows`. |
| **Expected exit** | `0` only when header equals `\| pathGlob \| category \| rationale \| closes \| addedOn \|` (case-sensitive, in order). |
| **Negative fixtures** | (a) Re-ordered to `\| category \| pathGlob \| … \|` → FAIL `I3: header shape mismatch`. (b) Renamed `closes` → `Closes` → FAIL `I3: case-sensitive cell mismatch`. (c) 4 columns → FAIL `I3: column count 4, expected 5`. |

### §2.4 AT-30-I4-SPEC-ROOTED

| Slot | Value |
|------|-------|
| **Given** | Header valid, ≥1 data row. |
| **When** | Gate iterates each row, asserting `row.pathGlob.startsWith('spec/')`. |
| **Expected exit** | `0`. |
| **Negative fixture** | Row with `pathGlob = scripts/**/*.mjs` MUST cause exit `1` with stderr: `G-00-AUDIT-EXEMPTION-REVIEW FAIL I4 row N: pathGlob must start with 'spec/'`. |

### §2.5 AT-30-I5-NO-BLANK-CHEQUE

| Slot | Value |
|------|-------|
| **Given** | Header valid, ≥1 data row. |
| **When** | Gate checks `row.pathGlob` against the closed deny-list `{spec/**, spec/**/*, spec/**/*.md, spec/*, **/*}`. |
| **Expected exit** | `0`. |
| **Negative fixtures** | (a) `spec/**` → FAIL `I5: corpus-wide glob forbidden`. (b) `spec/**/*` → FAIL same. (c) `**/*` → FAIL same. **Allowed:** scoped globs such as `spec/12-consolidated-guidelines/00-overview.md` or `spec/03-error-manage/**/_LEDGER-*.md`. |

### §2.6 AT-30-I6-CITED

| Slot | Value |
|------|-------|
| **Given** | Header valid, ≥1 data row. |
| **When** | Gate matches `row.closes` against `/^(AUD-[A-Z0-9_-]+\|F-AUDIT-\d+\|F-AUD\w+-\d+\|ADR-\d{4}\|n\/a)(\s*,\s*\.\.\.)?$/` (or list of such tokens). |
| **Expected exit** | `0` — every row cites at least one valid token. |
| **Negative fixtures** | (a) `closes = TODO` → FAIL `I6: citation token unrecognised`. (b) `closes = ` (blank) → FAIL `I6: citation cell empty`. (c) `closes = P22 plan` → FAIL `I6: citation token unrecognised` (this exact defect was caught and fixed by the gate's first run on 2026-04-29). |

### §2.7 AT-30-I7-ISO-DATE

| Slot | Value |
|------|-------|
| **Given** | Header valid, ≥1 data row. |
| **When** | Gate matches `row.addedOn` against `/^\d{4}-\d{2}-\d{2}$/` and validates as a real calendar date. |
| **Expected exit** | `0`. |
| **Negative fixtures** | (a) `2026/04/29` → FAIL `I7: addedOn must be ISO YYYY-MM-DD`. (b) `April 29 2026` → FAIL same. (c) `2026-13-01` → FAIL `I7: invalid calendar date`. |

### §2.8 AT-30-I8-VISIBILITY

| Slot | Value |
|------|-------|
| **Given** | Manifest passes I1–I7. |
| **When** | Gate `#57` runs in a CI environment. |
| **Expected exit** | `0` AND stdout MUST contain a line matching `/G-00-AUDIT-EXEMPTION-REVIEW PASS \d+\/\d+ rows? \(\d+\.\d+% of corpus matched\)/`. |
| **Then (positive)** | Reviewers can grep PR CI logs for `% of corpus matched` to detect drift (e.g., a sudden jump from 3.4% → 12% triggers human review). |
| **Negative fixture** | A gate revision that silently drops the visibility line MUST be rejected by a meta-test at `scripts/spec-hygiene/_tests/57.test.mjs` (planned follow-up; absence of the test file is in scope for AT-29-style sweeps). Until that file exists, AT-30-I8 is enforced indirectly by reviewer convention: PR templates require pasting the matched-rows line. |

---

## Verification

```bash
# Per-AT verification:
node scripts/spec-hygiene/48-check-ledger-uses-shared-lib.mjs  # AT-29-D1 / D4×3
node scripts/spec-hygiene/57-check-audit-exemption-review.mjs  # AT-30-I1..I8
# AT-29-D3 is owned by G-13-LEDGER-PER-GATE-PATH (existing runner).

# Full suite:
node scripts/spec-hygiene/00-run-all.mjs                       # all gates incl. #48 + #57
```

---

## Related

- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — AT row catalogue (AT-ADR-G01..G05)
- [`0029-per-gate-path-ledger-shared-lib.md`](./0029-per-gate-path-ledger-shared-lib.md) — §6 cites AT-29-* inline
- [`0030-audit-exemption-manifest.md`](./0030-audit-exemption-manifest.md) — §D1..D3 cites AT-30-* inline
- [`../_AUDIT-EXEMPTIONS.md`](../_AUDIT-EXEMPTIONS.md) — singleton manifest under enforcement
- [`../97a-acceptance-criteria-fixtures.md`](../97a-acceptance-criteria-fixtures.md) — corpus-wide P2g sweep (Pattern 1 covers AT-ADR-G01..G03)
- [`../01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md) — Format SSOT
- [`../_GATE-REGISTRY.md`](../_GATE-REGISTRY.md) — gate↔AT bindings (rows for AT-29-* and AT-30-* live here)

*Created 2026-04-29 — closes AT-FIX-01 fixture-deficit for ADR-0029 and ADR-0030 acceptance rows. 13 fixtures (5 AT-29-* + 8 AT-30-*) ratified.*
