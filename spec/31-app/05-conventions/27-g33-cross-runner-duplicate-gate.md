---
slug: g33-cross-runner-duplicate-gate
version: 1.0.0
updated: 2026-04-27
parent: ./02-ci-quality-gates.md
status: active
---

# G-33 — Cross-Runner Allow-List Duplicate Detector


> **Parent:** [`./00-overview.md`](./00-overview.md) — added 2026-04-30 (AUD-REMEDIATE-CRIT-7, F-AUD42-08 closure).

**Runner:** [`scripts/spec-hygiene/33-check-cross-runner-duplicates.mjs`](../../../scripts/spec-hygiene/33-check-cross-runner-duplicates.mjs)
**Companion reporter:** [G-35](./26-allow-list-inventory.md)
**Companion meta-gates:** [G-30.3](./23-g30-at-citation-validity-gate.md), [G-31.5](./24-g31-workflow-xref-reciprocity-gate.md), [G-32.4](./25-g32-ddl-unique-coverage-gate.md)

## Why

The G-30/G-31/G-32 family of hygiene gates each carry one or more
`*_EXEMPT` allow-lists. The companion meta sub-checks
(**G-30.3 / G-31.5 / G-32.4**) ensure every exemption carries a rationale
comment **within its own runner** — but they cannot see across runners.

When the **same string value** (an AT prefix, file path, table name…)
ends up in allow-lists belonging to **two different gates**, the same
artifact is being exempted from **two unrelated invariants**. This is a
smell because:

1. **Rationale fragmentation.** The *why* lives in two source files. They
   will drift. One side will be deleted; the other will quietly outlive it.
2. **Hidden coupling.** Two gates now share a dependency on the artifact's
   continued existence with no link between them.
3. **Bypass laundering.** Adding an exemption to "the other gate" becomes
   a too-easy way to silence cross-cutting failures.

## What it checks

For every value that appears in **2+ allow-lists**:

| Case | Classification | Action |
|---|---|---|
| All memberships in lists belonging to the **same gate** | INFO | Allowed by design (orthogonal scopes within one gate). Suppressed by default; show with `--info`. |
| Memberships span **2+ different gates** | ERROR | Flagged. Exit 1 unless the composite key is in `CROSS_GATE_EXEMPT`. |

## Algorithm

1. Reuse the allow-list parser from G-35 (verbatim copy — see §"Why no
   shared module" below).
2. Walk the runner inventory, collecting every entry as
   `{value, gate, list, subcheck, line, rationale}`.
3. Bucket by `value`.
4. For each bucket of size ≥ 2, classify by the count of distinct gates.
5. For each ERROR row, check `CROSS_GATE_EXEMPT` against the composite
   key `"<value>::<GATE-A>::<GATE-B>"` (gates sorted alphabetically).
6. Print details and exit 0 / 1 / 2 per the standard gate contract.

## CLI

```sh
node scripts/spec-hygiene/33-check-cross-runner-duplicates.mjs        # default
node scripts/spec-hygiene/33-check-cross-runner-duplicates.mjs --info # also show same-gate INFO rows
```

## Exit codes

| Code | Meaning |
|---:|---|
| 0 | No cross-gate duplicates, **or** all are in `CROSS_GATE_EXEMPT`. |
| 1 | One or more cross-gate duplicates flagged. |
| 2 | Runner error (cannot read source / parse failure). |

## The G-33 allow-list

```
const CROSS_GATE_EXEMPT = new Set([
  // (initially empty)
  // To add: "<value>::<GATE-A>::<GATE-B>" with rationale comment.
]);
```

Composite-key format: `"<value>::<gate-1>::<gate-2>[::<gate-N>]"` with
gates sorted alphabetically. Example:

```
const CROSS_GATE_EXEMPT = new Set([
  // Doc-example placeholder used in two CI registry rows; intentionally
  // exempted from both G-30 redundancy and G-32 coverage. Owner: spec/05.
  "AT-FOO-::G-30::G-32",
]);
```

## Why no shared module (parser duplication)

The G-33 runner copies `parseAllowList` and `extractAboveRationale`
verbatim from G-35 rather than importing them. Cross-runner imports
between hygiene scripts would themselves create the kind of coupling
these gates are designed to surface, and would mean a bug in one parser
silently corrupts every meta-check. The duplication is intentional.

If both copies drift, the **G-33 negative test** (inject a known
duplicate, expect exit 1) will catch it — see §"Verification" below.

## Verification

**Green path** (clean state):

```sh
node scripts/spec-hygiene/33-check-cross-runner-duplicates.mjs
# → G-33: ✅ no cross-gate duplicates across 3 runners.
# → exit 0
```

**Negative path** (inject `"AT-FOO-"` into G-32's `COVERAGE_EXEMPT`):

```sh
node scripts/spec-hygiene/33-check-cross-runner-duplicates.mjs
# → G-33: ❌ 1 cross-gate duplicate(s) flagged
# → ✗ "AT-FOO-"
# →     [G-30 / G-30.2] REDUNDANCY_ALLOWLIST:113  — Doc-example placeholder…
# →     [G-32 / G-32.1] COVERAGE_EXEMPT:85  — G-33 negative-test injection…
# →     → To exempt: add "AT-FOO-::G-30::G-32" to CROSS_GATE_EXEMPT (with rationale).
# → exit 1
```

## Maintenance

When a new gate runner is added (e.g. G-36):

1. Register its lists in `RUNNERS` of `33-check-cross-runner-duplicates.mjs`.
2. Register the same lists in `35-allow-list-inventory.mjs` (G-35).
3. Run G-33 once; resolve any newly-detected cross-gate collisions.

## Change history

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-04-27 | Initial release. Green on first run (0 cross-gate duplicates across G-30/G-31/G-32). |

## Related

- [`02-ci-quality-gates.md`](./02-ci-quality-gates.md) — gate registry
- [`23-g30-at-citation-validity-gate.md`](./23-g30-at-citation-validity-gate.md) — G-30 + G-30.3 meta
- [`24-g31-workflow-xref-reciprocity-gate.md`](./24-g31-workflow-xref-reciprocity-gate.md) — G-31 + G-31.5 meta
- [`25-g32-ddl-unique-coverage-gate.md`](./25-g32-ddl-unique-coverage-gate.md) — G-32 + G-32.4 meta
- [`26-allow-list-inventory.md`](./26-allow-list-inventory.md) — G-35 reporter (shares runner inventory)
