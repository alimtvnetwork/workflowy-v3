# ADR-0029 — Per-(Gate, Path) Ledger Consumers MUST Use the Shared Library

> **Status:** Accepted
> **Date:** 2026-04-29
> **Supersedes:** —
> **Superseded by:** —
> **Related:** ADR-0007 (Strict TypeScript R-DRY), ADR-0021 (Undo cap / offline queue unbounded — example of bounded vs unbounded ledger semantics), `G-13-LEDGER-PER-GATE-PATH` (the originating CI gate)
> **Closes:** Trilogy-pattern duplication risk — locks in the proven G-30 / G-31 / G-32 refactor as an architectural rule for all future ledger consumers.

---

## 1. Context

Three hygiene runners — `30-check-at-citation-validity.mjs` (G-30),
`31-check-workflow-xref-reciprocity.mjs` (G-31), and
`32-check-ddl-unique-coverage.mjs` (G-32) — each migrated from
in-source `Set`-based exemption allow-lists to a markdown
**per-(gate, path) ledger** (one file per gate under
`spec/<area>/_LEDGER-<GATE>-EXEMPTIONS.md`).

During the Phase-3 refactor (registry v1.6.4) we extracted the four
primitives common to all three runners into
`scripts/spec-hygiene/_lib/per-gate-path-ledger.mjs`:

1. `globToRegExp(glob)` — POSIX glob → `RegExp` (≤15 logic lines).
2. `stripBackticks(s)` — markdown-table cell normaliser.
3. `walkLedger({ filePath })` — generator that yields `{ gate, pathGlob, entry, rationale, addedOn }` rows from the canonical `## Entries` table.
4. `buildGlobMap(rows, keyOf)` — groups rows by a runner-supplied key into `Map<key, RegExp[]>`.
5. `isExempt({ map, key, host })` — answers "is this `host` file exempted under this `key`?"

**Net effect:** −83 lines of duplicate code across the three runners; each
is now ~15 lines of gate-specific glue (the `parseGateCell()` function)
plus library calls.

Without an architectural rule, the next runner to adopt a ledger will
copy-paste the parser inline (the path of least resistance), re-introducing
the exact duplication this refactor eliminated and silently diverging
glob semantics across runners.

---

## 2. Decision

### D1 — Single canonical implementation

All hygiene runners that consume a per-(gate, path) markdown ledger
**MUST** import their parsing, glob compilation, and per-key
exemption check from
`scripts/spec-hygiene/_lib/per-gate-path-ledger.mjs`.

Re-implementing **any** of the five primitives inline in a runner is
**forbidden** — even "just for one gate," even "just temporarily."

### D2 — What stays in the runner

Each runner owns exactly one piece of gate-specific glue:

```js
// runner-specific shape — what the in-source Set was keyed by
function parseGateCell(gateCell) {
  // returns whatever the runner needs (e.g. { scopeId, category })
}
```

The runner then calls `walkLedger()` → `buildGlobMap(rows, parseGateCell)`
→ `isExempt({ map, key: parseGateCell(...), host })`. Nothing else.

### D3 — Canonical ledger schema (frozen)

Every ledger file MUST conform to:

- Filename: `spec/<area>/_LEDGER-<GATE-NAME>-EXEMPTIONS.md`
- Required H2: `## Entries` (not `## Exemption rows`, not `## Allow-list`)
- Table columns (in order): `gate | pathGlob | entry | rationale | addedOn`
- Cells may be wrapped in backticks (the lib strips them).
- `pathGlob` MUST be a POSIX glob rooted at the repo (e.g. `spec/31-app/**/*.md`); bare paths are matched literally.

### D4 — Forbidden inline patterns

Hygiene gate `G-13-LEDGER-USES-SHARED-LIB` (CI, new — see §3) flags any
runner under `scripts/spec-hygiene/` that:

1. Defines a function literally named `globToRegExp` outside `_lib/`.
2. Defines a function literally named `walkLedger` outside `_lib/`.
3. Reads a `_LEDGER-G-*-EXEMPTIONS.md` file via `fs.readFileSync` /
   `fs.readFile` directly (it MUST flow through `walkLedger()`).

Exemption: the lib itself (`_lib/per-gate-path-ledger.mjs`) and its
unit-test fixture, if added later.

---

## 3. Consequences

### Positive

- **DRY by construction.** Glob semantics can never silently diverge across runners — there is exactly one regex compiler.
- **Cheap new consumers.** Future ledger-driven gates cost ~15 lines of glue, not ~50.
- **Schema lock-in.** The `## Entries` heading + 5-column shape is now ratified in this ADR; ledger authors have a single source of truth.
- **Audit-friendly.** A grep for `import .* per-gate-path-ledger` enumerates every ledger consumer in one shot.

### Negative

- **Lib evolution requires care.** Changes to `walkLedger()`'s yielded shape ripple to all consumers. Mitigation: the schema is frozen by D3; the lib's exported signatures are part of the ADR contract and changing them requires a successor ADR.
- **One-line glue is tempting to skip.** A new runner author may inline `globToRegExp` "just for a quick check." `G-13-LEDGER-USES-SHARED-LIB` (D4) prevents this mechanically.

### Neutral

- The five primitives (each ≤15 logic lines) satisfy ADR-0007 R3 individually, so the lib stays within the strict-TS budget.

---

## 4. Alternatives considered

| Alternative | Why rejected |
|---|---|
| Keep per-runner inline parsers (status quo before refactor) | Violates ADR-0007 R-DRY; three identical 50-line blocks; glob-semantics drift risk. |
| Extract only `globToRegExp()`, leave parser inline | Half-measure; the parser is the larger duplication and the schema-divergence risk lives there (the G-30 ledger originally used `## Exemption rows` while G-31/G-32 used `## Entries`). |
| Move ledger consumption into a generic gate framework | Over-engineering; only three runners use ledgers today. The lib is the right granularity. |
| TypeScript port of the lib | The hygiene runners are `.mjs` (no build step) for fast CI startup; introducing TS here would require a runner-build pipeline. Reconsider when the runner count exceeds 60. |

---

## 5. Compliance gates

| Gate | Tier | Enforces |
|---|---|---|
| `G-13-LEDGER-PER-GATE-PATH` | **CI** | (Existing, promoted v1.6.4) Schema validity of every `_LEDGER-G-*-EXEMPTIONS.md` file. |
| `G-13-LEDGER-USES-SHARED-LIB` | **CI** | (New, this ADR §D4) No runner under `scripts/spec-hygiene/` re-implements lib primitives or reads ledgers without `walkLedger()`. |

---

## 6. Acceptance tests

- **AT-29-D1-IMPORT-PRESENT** — Every runner that references `_LEDGER-G-*-EXEMPTIONS.md` (anywhere in source) MUST also import from `scripts/spec-hygiene/_lib/per-gate-path-ledger.mjs`. Verified by `G-13-LEDGER-USES-SHARED-LIB`.
- **AT-29-D3-SCHEMA-FROZEN** — Every ledger file MUST contain exactly one `## Entries` heading and a 5-column table whose header row matches `gate | pathGlob | entry | rationale | addedOn` (case-sensitive). Verified by `G-13-LEDGER-PER-GATE-PATH`.
- **AT-29-D4-NO-INLINE-GLOBTOREGEXP** — No file under `scripts/spec-hygiene/` outside `_lib/` may define `function globToRegExp` or `const globToRegExp =`. Verified by `G-13-LEDGER-USES-SHARED-LIB`.
- **AT-29-D4-NO-INLINE-WALKLEDGER** — Same as above for `walkLedger`.
- **AT-29-D4-NO-DIRECT-LEDGER-READ** — No file under `scripts/spec-hygiene/` outside `_lib/` may pass a path matching `_LEDGER-G-*-EXEMPTIONS.md` to `readFile` / `readFileSync` directly. Verified by `G-13-LEDGER-USES-SHARED-LIB`.

---

## 7. Migration / rollout

- **Already complete.** All three current consumers (G-30, G-31, G-32) were migrated in registry v1.6.4 ahead of this ADR (the refactor proved the pattern works before codifying it).
- **Future runners:** add `import { walkLedger, buildGlobMap, isExempt } from './_lib/per-gate-path-ledger.mjs'` and a runner-local `parseGateCell()`. That is the entire integration.
