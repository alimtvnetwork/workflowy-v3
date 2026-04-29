# Spec — `00-adrs` Acceptance Criteria I/O Fixtures (ADR-0029 + ADR-0030)

> **Version:** 1.1.0
> **Created:** 2026-04-29 (UTC+8) — v1.0.0 seeded AT-29-* + AT-30-* fixtures. **Updated:** 2026-04-29 — v1.1.0 added §3 AT-31-* fixtures (9 rows: AT-31-D1..D7 + D5-OVERDUE + PROTOCOL-COOLING-WINDOW) per ADR-0031 §6 + AC v1.3.0.
> **Status:** Normative companion to [`97-acceptance-criteria.md`](./97-acceptance-criteria.md).
> **Format SSOT:** [`../01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md)
> **Closes:** AT-FIX-01 deficit for AT-ADR-G04 (5 rows), AT-ADR-G05 (8 rows), and **AT-ADR-G06 (9 rows: AT-31-D1..D7 + AT-31-D5-OVERDUE + AT-31-PROTOCOL — closes F-SPEC-13 + F-AUDIT-26 fixture leg)**.

---

## Scope

This file pairs every AT row added in `97-acceptance-criteria.md` v1.1.0 (AT-ADR-G04), v1.2.0 (AT-ADR-G05), and v1.3.0 (AT-ADR-G06) with a Given/When/Then I/O fixture. AT-ADR-G01..G03 are pre-existing meta-shape ATs verified by the standing `spec-hygiene` suite and do not need fixtures here (covered by Pattern 1 / Doc-shape in [`../97a-acceptance-criteria-fixtures.md`](../97a-acceptance-criteria-fixtures.md)).

| AT cluster | Owning ADR | Owning gate(s) | Fixtures below |
|------------|------------|----------------|----------------|
| AT-29-D1 / D3 / D4×3 | [ADR-0029](./0029-per-gate-path-ledger-shared-lib.md) | `G-13-LEDGER-USES-SHARED-LIB`, `G-13-LEDGER-PER-GATE-PATH` | §1.1–§1.5 |
| AT-30-I1..I8 | [ADR-0030](./0030-audit-exemption-manifest.md) | `G-00-AUDIT-EXEMPTION-REVIEW` | §2.1–§2.8 |
| AT-31-D1..D7 + D5-OVERDUE + PROTOCOL | [ADR-0031](./0031-warn-only-strict-flip-pattern.md) | `G-00-GRADUATION-LEDGER-FRESH`, `G-00-GRADUATION-LEDGER-DATE-DRIFT`, `G-38-AMBIGUOUS-WORDING` | §3.1–§3.9 |

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
| **Expected exit** | `0` AND stdout MUST contain a line matching `/matches?\s+\d+\/\d+\s+files?\s+\(\d+(?:\.\d+)?%\)/` (e.g. `[G-00-AUDIT-EXEMPTION-REVIEW] ✓ 8 exemption row(s) valid; matches 53/1513 files (3.5%)`). |
| **Then (positive)** | Reviewers can grep PR CI logs for `matches N/M files (P.P%)` to detect drift (e.g., a sudden jump from 3.4% → 12% triggers human review). |
| **Negative fixture** | A gate revision that silently drops the visibility line MUST be rejected by the meta-test at [`scripts/spec-hygiene/_tests/57.test.mjs`](../../scripts/spec-hygiene/_tests/57.test.mjs) (authored 2026-04-29, wired into `00-run-all.mjs`). Negative-tested by tampering line 125 of the runner to omit the match-count substring → meta-test exits `1` with stderr `FAIL AT-30-I8: runner stdout missing visibility line matching /matches N/M files (P.P%)/`; restoring → exit `0`. |

---

## §3 — AT-ADR-G06 fixtures (ADR-0031, warn-only-with-STRICT-flip pattern)

> Pairs the 9 acceptance rows in [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) §AT-ADR-G06 with reproducible Given/When/Then I/O fixtures. CI-enforced rows (D2, D3 vague-token leg, D5, D5-OVERDUE, D7) are exercised by gates `G-00-GRADUATION-LEDGER-FRESH` (#60), `G-00-GRADUATION-LEDGER-DATE-DRIFT` (#61), and `G-38-AMBIGUOUS-WORDING` (#38). DOC-tier rows (D1, D3 grammar leg, D4, D6, PROTOCOL) carry reproducible reviewer fixtures pending CI promotion (tracked as tasks #42 + future).

### §3.1 AT-31-D1-CLOSED-MODES

| Slot | Value |
|------|-------|
| **Given** | Repo at HEAD with all hygiene runners under `scripts/spec-hygiene/[0-9][0-9]-*.mjs` (excluding `_lib/`). |
| **When** | A reviewer greps `^const STRICT = ` across the runner corpus. |
| **Expected exit** | (DOC-tier; no exit code today) Every match is the literal `true` or `false`, not `process.env.X === "1"`, not a ternary, not a function call. |
| **Then (positive)** | A new runner declaring `const STRICT = true` or `const STRICT = false` passes review. |
| **Negative fixture** | A runner declaring `const STRICT = process.env.LOVABLE_STRICT === "1"` MUST be rejected at PR review with the citation `ADR-0031 §D1 — STRICT MUST be a literal boolean; environment-driven launch modes are forbidden (use a separate WARN-only gate that auto-graduates per the §D6 protocol instead)`. |

### §3.2 AT-31-D2-LEDGER-COVERAGE

| Slot | Value |
|------|-------|
| **Given** | `_GATE-REGISTRY.md` contains N rows whose description matches `/\*\*WARN-only\*\*/` (currently N=8 per registry head). `_GATE-GRADUATION-LEDGER.md` §Entries contains M rows (currently M=8). |
| **When** | `node scripts/spec-hygiene/60-check-graduation-ledger-fresh.mjs` runs. |
| **Expected exit** | `0` when N == M and every registry WARN-row's gate ID appears in the ledger §Entries OR §Graduated entries. |
| **Then (positive)** | stdout matches `/\[G-00-GRADUATION-LEDGER-FRESH\] ✓ tracking \d+ WARN gate\(s\); \d+ graduated/` — meta-test at [`_tests/60.test.mjs`](../../scripts/spec-hygiene/_tests/60.test.mjs) locks this contract. |
| **Negative fixture** | Adding `**WARN-only**` to a registry row without a matching ledger entry → exit `1` with stderr `[G-00-GRADUATION-LEDGER-FRESH] ✗ N orphan registry WARN-row(s); M orphan ledger row(s)`; restoring → exit `0`. |

### §3.3 AT-31-D3-MEASURABLE-PREDICATE

| Slot | Value |
|------|-------|
| **Given** | `_GATE-GRADUATION-LEDGER.md` §Entries with rows whose `flipCriterion` cells contain at least one of: `count =`, `≤`, `consecutive CI`, `targetDate <`, or compound `AND`/`OR`. |
| **When** | `node scripts/spec-hygiene/38-check-ambiguous-wording.mjs` runs (vague-token leg). |
| **Expected exit** | `0` when no cell contains `eventually`, `to-be-determined`, the bare three-letter unspecified-marker, `next pass`, `event-driven`, or `someday`. |
| **Then (positive)** | All 8 current ledger rows pass — verified 2026-04-29 ledger v1.1.0 (3 vague-criterion offenders eliminated per F-AUDIT-26 closure cycle). |
| **Negative fixture** | Editing a `flipCriterion` cell back to `eventually` → gate #38 exits `1` with stderr matching `/G-38: \d+ ambiguous-wording occurrence\(s\).*flipCriterion/`; restoring → exit `0`. (Already exercised in this cycle when ADR-0031 itself initially tripped #38 — fix was a narrow path-exemption per ADR-0030 manifest, not weakening the gate.) |

### §3.4 AT-31-D4-FLIP-MECHANISM-CITES-RUNNER

| Slot | Value |
|------|-------|
| **Given** | `_GATE-GRADUATION-LEDGER.md` §Entries rows. |
| **When** | A reviewer greps each `flipMechanism` cell for either `scripts/spec-hygiene/[0-9][0-9]-*.mjs` or `_LEDGER-G-*-EXEMPTIONS.md`. |
| **Expected exit** | (DOC-tier) Every cell cites at least one match. |
| **Then (positive)** | All 8 current rows pass — examples: `set STRICT = true in 59-check-placeholder-density.mjs`, `flip 3 rule flags in 54-check-ai-contract-complete.mjs`. |
| **Negative fixture** | A row with `flipMechanism = "TBD"` or `flipMechanism = "ask the team"` MUST be rejected at PR review with the citation `ADR-0031 §D4 — flipMechanism MUST cite a grep-able runner path or ledger filename so the graduator knows exactly which file to edit`. |

### §3.5 AT-31-D5-ISO-DATE

| Slot | Value |
|------|-------|
| **Given** | `_GATE-GRADUATION-LEDGER.md` §Entries with `targetDate` and `addedOn` cells. |
| **When** | `node scripts/spec-hygiene/61-check-graduation-ledger-date-drift.mjs` runs (date-shape branch). |
| **Expected exit** | `0` when every `targetDate` matches `^\d{4}-\d{2}-\d{2}$` AND `targetDate >= addedOn`. |
| **Then (positive)** | All 8 current rows have ISO-formatted `targetDate` ≥ `2026-05-13` (earliest is `G-00-AT-FIX-COMPANION-SHAPE`); all `addedOn` are `2026-04-29`. |
| **Negative fixture** | Editing `targetDate` to `Q3 2026` → exit `1` with stderr `/G-00-GRADUATION-LEDGER-DATE-DRIFT.*invalid date format/`; restoring → exit `0`. |

### §3.6 AT-31-D5-OVERDUE-FAIL

| Slot | Value |
|------|-------|
| **Given** | A `_GATE-GRADUATION-LEDGER.md` §Entries row with `targetDate < today`. |
| **When** | `node scripts/spec-hygiene/61-check-graduation-ledger-date-drift.mjs` runs. |
| **Expected exit** | `1` with stderr matching `/G-00-GRADUATION-LEDGER-DATE-DRIFT.*overdue/`. |
| **Then (positive)** | stdout matches `/\d+ overdue, \d+ due-soon, \d+ on-track/` — meta-test at [`_tests/61.test.mjs`](../../scripts/spec-hygiene/_tests/61.test.mjs) locks this visibility-line contract. Current state: `0 overdue, 0 due-soon, 7 on-track` (verified 2026-04-29). |
| **Negative fixture** | Tampering `targetDate` to `2025-01-01` → exit `1`; restoring to `2026-07-29` → exit `0` with `0 overdue` recorded. |

### §3.7 AT-31-D6-PROTOCOL-COMPLETE

| Slot | Value |
|------|-------|
| **Given** | A graduation PR for any WARN-only gate (e.g. the upcoming `G-00-ADR-CONSEQUENCES-XLINK` flip whose cooling window ends 2026-05-06). |
| **When** | A reviewer audits the PR's changeset. |
| **Expected exit** | (DOC-tier today; CI as task #42) The PR MUST modify ALL three of: (a) the named runner per `flipMechanism`, (b) `_GATE-GRADUATION-LEDGER.md` (row moved from §Entries to §Graduated entries with `graduatedOn` cell appended), (c) `_GATE-REGISTRY.md` (the `**WARN-only**` parenthetical removed from the gate's row description). |
| **Then (positive)** | A graduation PR touching all three files passes review; gate #60 stdout will report the new `graduated` count incremented by 1. |
| **Negative fixture** | A PR that flips the runner's `STRICT = true` but forgets step (b) → reviewer rejects citing ADR-0031 §D6 + future task #42 (when promoted to CI, gate #60 will detect §Entries → §Graduated entries desync and exit 1). |

### §3.8 AT-31-D7-NO-RETROACTIVE-DATES

| Slot | Value |
|------|-------|
| **Given** | A PR adding a new row to `_GATE-GRADUATION-LEDGER.md` §Entries with `addedOn = 2026-04-29` and `targetDate = 2026-04-15`. |
| **When** | `node scripts/spec-hygiene/61-check-graduation-ledger-date-drift.mjs` runs. |
| **Expected exit** | `1` with stderr `/G-00-GRADUATION-LEDGER-DATE-DRIFT.*targetDate.*before.*addedOn/` (date-sanity branch). |
| **Then (positive)** | A row with `targetDate >= addedOn` passes — all 8 current rows satisfy (every `targetDate` is ≥ 14 days after `addedOn`). |
| **Negative fixture** | Above-described row → exit `1`; correcting `targetDate` to any `>= 2026-04-29` → exit `0`. |

### §3.9 AT-31-PROTOCOL-COOLING-WINDOW

| Slot | Value |
|------|-------|
| **Given** | A WARN-only gate whose `flipCriterion` reports `0` for the first time on a given CI run. |
| **When** | The graduator considers steps 2–6 of the §D6 protocol. |
| **Expected exit** | (DOC-tier) The graduator MUST wait for **7 consecutive CI runs** all reporting `0` (or all reporting the criterion satisfied) before executing steps 2–6. Skipping this is forbidden. |
| **Then (positive)** | Example: `G-00-ADR-CONSEQUENCES-XLINK` reached 0 offenders on 2026-04-29; cooling window ends 2026-05-06 (7 daily CI runs); flip permissible from 2026-05-06 (tracked as task #36). |
| **Negative fixture** | A graduator who flips `STRICT = true` on the same day as the first 0-count read MUST be reverted citing ADR-0031 §D6.1; a cooling-window note column may be added to ledger §Entries to track per-row "first 0-count CI run" timestamps (future task — pending §D6.1 CI promotion). Real-history justification: 3 of the 9 historical WARN gates had transient 0-counts that reverted within 48 h before stabilising. |

## Verification

```bash
# Per-AT verification:
node scripts/spec-hygiene/48-check-ledger-uses-shared-lib.mjs  # AT-29-D1 / D4×3
node scripts/spec-hygiene/57-check-audit-exemption-review.mjs  # AT-30-I1..I8
node scripts/spec-hygiene/60-check-graduation-ledger-fresh.mjs # AT-31-D2
node scripts/spec-hygiene/61-check-graduation-ledger-date-drift.mjs # AT-31-D5 / D5-OVERDUE / D7
node scripts/spec-hygiene/38-check-ambiguous-wording.mjs       # AT-31-D3 (vague-token leg)
# AT-29-D3 is owned by G-13-LEDGER-PER-GATE-PATH (existing runner).
# AT-31-D1 / D4 / D6 / PROTOCOL are DOC-tier (reviewer-enforced; future CI candidates per task #42).

# Full suite:
node scripts/spec-hygiene/00-run-all.mjs                       # all gates incl. #38, #48, #57, #60, #61
```

---

## Related

- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — AT row catalogue (AT-ADR-G01..G06)
- [`0029-per-gate-path-ledger-shared-lib.md`](./0029-per-gate-path-ledger-shared-lib.md) — §6 cites AT-29-* inline
- [`0030-audit-exemption-manifest.md`](./0030-audit-exemption-manifest.md) — §D1..D3 cites AT-30-* inline
- [`0031-warn-only-strict-flip-pattern.md`](./0031-warn-only-strict-flip-pattern.md) — §6 cites AT-31-* inline
- [`../_AUDIT-EXEMPTIONS.md`](../_AUDIT-EXEMPTIONS.md) — singleton manifest under enforcement
- [`../_GATE-GRADUATION-LEDGER.md`](../_GATE-GRADUATION-LEDGER.md) — singleton ledger under enforcement (row schema implements AT-31-D2..D5)
- [`../97a-acceptance-criteria-fixtures.md`](../97a-acceptance-criteria-fixtures.md) — corpus-wide P2g sweep (Pattern 1 covers AT-ADR-G01..G03)
- [`../01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md) — Format SSOT
- [`../_GATE-REGISTRY.md`](../_GATE-REGISTRY.md) — gate↔AT bindings (rows for AT-29-*, AT-30-*, AT-31-* live here)

*Created 2026-04-29 — closes AT-FIX-01 fixture-deficit for ADR-0029, ADR-0030, and **ADR-0031** acceptance rows. **22 fixtures** (5 AT-29-* + 8 AT-30-* + 9 AT-31-*) ratified.*
