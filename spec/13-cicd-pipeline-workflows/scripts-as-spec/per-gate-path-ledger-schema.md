# Fixture-as-spec — `per-gate-path-ledger-schema`

> **Type:** Fixture-as-spec (executable specification).
> **Status:** Frozen 2026-04-29. Reference schema for
> [`G-13-LEDGER-PER-GATE-PATH`](../../_GATE-REGISTRY.md) (planned).
> **SPEC-ONLY classification:** describes a ledger-row schema; no runtime code.
> When the gate is mechanized under `scripts/spec-hygiene/`, the
> implementation MUST (gate G-13-LEDGER-IMPL-PARITY) validate the same input → output behaviour as
> this fixture against the canonical sample rows below.

---

## Purpose

Today's ledgers (`spec/00-adrs/_LEDGER-G-00-ADR-CONSEQUENCES-XLINK-BASELINE.md`,
`spec/00-adrs/_LEDGER-G-00-ADR-XLINK-SYMMETRY-BASELINE.md`) and
allow-lists (`REDUNDANCY_ALLOWLIST` in `30-check-at-citation-validity.mjs`)
grant **global** exemptions: an entry silences a violation everywhere it
appears. This is too coarse — a prefix legitimately reserved for
`spec/01-features/` should NOT silence the same violation in
`spec/02-workflows/`. The per-(gate, path) ledger schema introduces
**path-scoped** exemption rows so each waiver is bounded to the
(gate-id × file-path-glob) pair where it is justified.

## Inputs

- **Ledger file** — markdown table at `spec/**/_LEDGER-*.md` matching
  the schema below.
- **Hygiene runner** — any runner that consults the ledger MUST (gate G-13-LEDGER-RUNNER-FILTER) iterate
  over rows and apply each row's `gate` + `pathGlob` filter before
  silencing a violation.

## Outputs

- **stdout (success):** `<gate>: N path-scoped exemptions applied; all rows valid.`
- **stdout (failure):** one line per malformed row in the form
  `<ledger-path>:<line>: <reason>` and exit `1`.
- **exit code:** `0` on clean, `1` on any malformed row OR any row
  whose `pathGlob` matches zero files (stale-row detection).

## Canonical row schema

Each ledger MUST contain a markdown table with EXACTLY these 5 columns
in this order:

| `gate` | `pathGlob` | `entry` | `rationale` | `addedOn` |
|---|---|---|---|---|

| Column | Required | Format | Example |
|---|---|---|---|
| `gate` | yes | `G-NN-NAME` (must exist in `spec/_GATE-REGISTRY.md`) | `G-30-AT-CITATION-VALIDITY` |
| `pathGlob` | yes | POSIX glob, repo-rooted, no `..` | `spec/01-features/**/*.md` |
| `entry` | yes | the literal token being exempted (prefix, AT-ID, file-path, etc.) | `AT-INFO-` |
| `rationale` | yes | one-sentence justification, `≤120 chars`, no markdown links | `Closed via F15 alias to AT-INFOMODEL-NN; row kept as convention doc.` |
| `addedOn` | yes | `YYYY-MM-DD` (ISO 8601) | `2026-04-29` |

## Validation rules

1. **Schema-shape rule:** the table header MUST match the canonical
   5-column form exactly (case-sensitive).
2. **Gate-existence rule:** `gate` value MUST appear as a row in
   `spec/_GATE-REGISTRY.md` §3.
3. **Glob-non-empty rule:** `pathGlob` MUST resolve to ≥1 file in the
   repo at audit time (else "stale row" violation — drain or update).
4. **No-overlap rule (informational):** two rows with the same `gate` +
   `entry` MAY have non-overlapping `pathGlob`s; if their globs DO
   overlap, the runner emits an INFO advisory (not a failure) so the
   author can collapse them.
5. **Rationale-prose rule:** `rationale` MUST NOT contain markdown
   links `[…](…)` (forces atomic, ledger-local justification — for
   pointers, use a `See also` paragraph below the table).
6. **Date-monotonicity rule (informational):** within a single ledger,
   `addedOn` SHOULD be non-decreasing top-to-bottom (drift surfaces
   manual reordering as an INFO advisory).

## Migration mechanism (existing global allow-lists → per-(gate, path))

For each entry currently in a global `Set([…])` allow-list inside a
runner (`30-…mjs`, `31-…mjs`, `32-…mjs`):

1. Determine the narrowest `pathGlob` that covers every legitimate
   call-site of that entry (typically the owning feature folder or
   `**/*.md` if truly cross-cutting).
2. Append a row to the runner's sibling ledger
   `spec/<area>/_LEDGER-<GATE-ID>-EXEMPTIONS.md` (create if absent)
   using the canonical schema.
3. Remove the entry from the in-runner `Set([…])`.
4. Update the runner to read the ledger via the shared helper
   `loadPerGatePathLedger(ledgerPath)` (specified next).

## Shared helper contract (`loadPerGatePathLedger`)

Pseudo-code (frozen reference, ≤15 lines of logic per ADR-0007 R3):

```
function loadPerGatePathLedger(ledgerPath, repoRoot) {
  const text = readFileSync(ledgerPath, 'utf8');
  const rows = parseMarkdownTable(text, EXPECTED_HEADER);
  rows.forEach((r, i) => validateRow(r, i, ledgerPath));
  const exemptions = new Map(); // key: `${gate}::${entry}` → pathGlob[]
  for (const r of rows) {
    const key = `${r.gate}::${r.entry}`;
    if (!exemptions.has(key)) exemptions.set(key, []);
    exemptions.get(key).push(r.pathGlob);
  }
  return {
    isExempt: (gate, entry, filePath) => {
      const globs = exemptions.get(`${gate}::${entry}`) ?? [];
      return globs.some((g) => micromatch.isMatch(filePath, g));
    },
  };
}
```

## Test fixtures (golden inputs)

The canonical happy-path ledger is the 4-row baseline in
[`spec/00-adrs/_LEDGER-G-00-ADR-XLINK-SYMMETRY-BASELINE.md`](../../00-adrs/_LEDGER-G-00-ADR-XLINK-SYMMETRY-BASELINE.md)
once migrated to this schema. Until then, use the worked example below:

```markdown
| gate                          | pathGlob                        | entry         | rationale                                                  | addedOn    |
|-------------------------------|---------------------------------|---------------|------------------------------------------------------------|------------|
| G-30-AT-CITATION-VALIDITY     | spec/01-features/**/*.md        | AT-INFO-      | Closed via F15 alias to AT-INFOMODEL-NN; doc convention.   | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY     | spec/02-workflows/**/*.md       | AT-WF-CREATE- | → AT-APP-58/59/62/66/67 per 09-mirror-create-flow.md.       | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY     | spec/01-features/**/*.md        | AT-FOO-       | Doc-example placeholder cited only by 02-ci-quality-gates. | 2026-04-29 |
```

A correct runner MUST report `Checked 3 rows; 0 violations; exit 0`.

## Strictness roadmap

- **Phase 1 (this fixture):** schema spec'd; sample rows validated;
  runner stub `scripts/spec-hygiene/57-check-per-gate-path-ledger.mjs`
  authored as DOC-NORM (warns only).
- **Phase 2:** migrate `REDUNDANCY_ALLOWLIST` (16 rows) from
  `30-check-at-citation-validity.mjs` to a new ledger
  `spec/01-features/_LEDGER-G-30-EXEMPTIONS.md` using this schema.
- **Phase 3:** promote `G-13-LEDGER-PER-GATE-PATH` to CI hard-fail
  once all three meta-checked runners (G-30 / G-31 / G-32) consume
  ledgers via `loadPerGatePathLedger` and zero rows fail validation.

## See also

- [`spec/_GATE-REGISTRY.md`](../../_GATE-REGISTRY.md) — Meta-13 row.
- [`spec/00-adrs/_LEDGER-G-00-ADR-CONSEQUENCES-XLINK-BASELINE.md`](../../00-adrs/_LEDGER-G-00-ADR-CONSEQUENCES-XLINK-BASELINE.md)
  — Phase-1 ledger candidate for migration.
- [`spec/00-adrs/_LEDGER-G-00-ADR-XLINK-SYMMETRY-BASELINE.md`](../../00-adrs/_LEDGER-G-00-ADR-XLINK-SYMMETRY-BASELINE.md)
  — Phase-1 ledger candidate for migration.
- [`scripts/spec-hygiene/30-check-at-citation-validity.mjs`](../../../scripts/spec-hygiene/30-check-at-citation-validity.mjs)
  — Phase-2 migration target (`REDUNDANCY_ALLOWLIST` Set, 16 rows).
- [`../00-overview.md`](../00-overview.md) — P13 CI/CD overview (Related → Fixtures-as-spec block).
