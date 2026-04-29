# ADR-0031 — Warn-Only-with-STRICT-Flip is the Sole Gate-Graduation Pattern

> **Status:** Accepted
> **Date:** 2026-04-29
> **Supersedes:** —
> **Superseded by:** —
> **Related:** ADR-0029 (per-(gate, path) ledger shared lib), ADR-0030 (audit-exemption manifest), `G-00-GRADUATION-LEDGER-FRESH` (gate #60 — freshness enforcer), `G-00-GRADUATION-LEDGER-DATE-DRIFT` (gate #61 — overdue/due-soon enforcer), `_GATE-GRADUATION-LEDGER.md` (the singleton ledger), F-AUDIT-26 (the originating finding from re-audit v4)
> **Closes:** F-SPEC-13 (MED) — "ADR-0031 still pending" (per spec-vs-impl audit 2026-04-29) and the `(pending)` placeholder cited in `_GATE-GRADUATION-LEDGER.md` line 7

---

## 1. Context

Hygiene gates land in two flavours: **born-strict** (e.g. `G-00-ADR-NUMBERING` — exit 1 from day 1) and **born-warn** (a soft signal that surfaces drift but does not block CI until the corpus is clean enough to flip). The latter is the only humane way to add a new constraint to a corpus with thousands of pre-existing files: ship the gate at WARN, drive the offender count to zero (often via a per-(gate, path) ledger per ADR-0029), then graduate to HARD-FAIL.

Between 2026-04-26 and 2026-04-29 the project shipped **9 gates** following this lifecycle without a documented pattern:

1. `G-NS-STATUS-IN-LEGEND` (legacy-status drain → 0)
2. `G-NS-ADR-MUST-HAS-AT` (ADR coverage drain → 0)
3. `G-01-DOD-CONDENSED-MIRRORS-OVERVIEW` (DoD-hash mirror clean ≥7 CI runs)
4. `G-00-OVERVIEW-AI-CONTRACT-PRESENT` (sub-tier WARN; top-tier already HARD)
5. `G-00-OVERVIEW-AI-CONTRACT-COMPLETE` (rules 3–5 WARN; rules 1–2 HARD)
6. `G-00-OVERVIEW-SCORING-TABLE-COMPLETE` (rule 3 WARN → flipped 2026-04-29)
7. `G-00-ADR-CONSEQUENCES-XLINK` (drained → flip-eligible 2026-05-06)
8. `G-00-AT-FIX-COMPANION-SHAPE` (companion-shape drain → 0)
9. `G-00-PLACEHOLDER-DENSITY` (global ≤8% AND no scope >15%)

Each shipped with its own bespoke flip rule — buried in the runner's `STRICT` constant, the registry-row prose, or a baseline ledger. The 2026-04-29 cycle introduced `_GATE-GRADUATION-LEDGER.md` as the single source of truth for those rules and shipped two enforcer gates (`G-00-GRADUATION-LEDGER-FRESH`, `G-00-GRADUATION-LEDGER-DATE-DRIFT`) so the ledger cannot itself rot.

What was still missing: a normative ADR codifying the pattern so that a tenth gate authored next month is not free to invent a tenth variant. F-AUDIT-26 (2026-04-29 audit v4) flagged the gap at MED severity and cited ADR-0031 as `pending` in the ledger header. This ADR closes that gap.

---

## 2. Decision

### D1 — Closed enumeration of gate launch modes

A new hygiene gate MUST launch in exactly one of two modes:

- **HARD-FAIL** (`STRICT = true`) — the corpus is already clean for this invariant at PR time, OR the invariant is so load-bearing that no migration window is acceptable.
- **WARN-only** (`STRICT = false`) — the corpus has known offenders; the runner emits stderr but exits 0 until graduated.

Inventing a third mode (e.g. "WARN that times-out", "HARD-FAIL with allow-list of N skips") is forbidden. Allow-lists belong in per-(gate, path) ledgers per ADR-0029; exemptions belong in `_AUDIT-EXEMPTIONS.md` per ADR-0030.

### D2 — Every WARN-only gate MUST register in the singleton ledger

Within the same change that adds the gate, the author MUST append a row to `spec/_GATE-GRADUATION-LEDGER.md` §Entries. The row MUST satisfy the schema in §Schema of that file (`gate`, `mode`, `flipCriterion`, `flipMechanism`, `targetDate`, `addedOn`, `linkedTask`).

A WARN-only gate without a ledger row is forbidden — `G-00-GRADUATION-LEDGER-FRESH` (gate #60) emits an alert when registry-WARN-count ≠ ledger-row-count, and the meta-test at `_tests/60.test.mjs` locks the visibility-line contract.

### D3 — `flipCriterion` MUST be a measurable predicate

The cell MUST be parseable as one of:

- **Count predicate**: `<thing> count = 0` (e.g. `legacy-status count = 0 (current: 46)`).
- **Ratio/density predicate**: `<metric> ≤ N%` (e.g. `global density ≤8%`).
- **Compound predicate**: `<count> AND <count>` joined by uppercase `AND`/`OR`.
- **Cooling window**: `clean for ≥N consecutive CI runs` — pairs with one of the above.
- **Date predicate**: `targetDate < today` (used by gate #61's drift detection, not by authors).

Forbidden tokens (enforced by `G-38-AMBIGUOUS-WORDING`): `eventually`, `to-be-determined`, `TBD`, `next pass`, `event-driven`, `someday`. The 2026-04-29 ledger v1.1.0 cycle eliminated the last 3 vague-criterion offenders (rows for `G-01-DOD-CONDENSED-MIRRORS-OVERVIEW`, `G-00-OVERVIEW-AI-CONTRACT-PRESENT` sub-tier, `G-00-OVERVIEW-AI-CONTRACT-COMPLETE` rules 3–5) per F-AUDIT-26.

### D4 — `flipMechanism` MUST name the single edit

A reviewer MUST be able to grep for the edit named in `flipMechanism` and find exactly one location. Canonical phrasings:

- `set STRICT = true in <runner-path>` (most common)
- `delete WARN branch in <runner-path>` (when the warn branch is structurally separate)
- `flip <N> rule flag(s) in <runner-path>` (multi-rule runners like #54)

`flipMechanism` MUST cite the runner file, not just the gate ID.

### D5 — `targetDate` is an SLA cap, not a guess

The cell MUST be ISO `YYYY-MM-DD`. Semantics:

- If the gate is criterion-driven (D3 count = 0), `targetDate` is the **upper bound** by which the criterion MUST be met OR an explicit decision to retire the gate MUST be made.
- An overdue `targetDate` (`< today`) trips `G-00-GRADUATION-LEDGER-DATE-DRIFT` HARD-FAIL.
- A `targetDate` within 14 days of today emits a WARN (due-soon shelf).

### D6 — The 6-step flip protocol (graduation procedure)

When `flipCriterion` becomes true, the graduator MUST execute, in order:

1. **Verify cleanly for 7 consecutive CI runs.** Prevents spurious flip on transient wins. Documented in `_GATE-GRADUATION-LEDGER.md` §"Flip protocol".
2. **Edit the runner per `flipMechanism`.** Usually a single boolean flip.
3. **Re-run full hygiene suite.** MUST stay green; if any other gate goes red, abort and root-cause.
4. **Update the ledger.** Move the row from §Entries to §"Graduated entries" with a `graduatedOn` ISO date column appended.
5. **Update `_GATE-REGISTRY.md`.** Remove the `**WARN-only**` parenthetical from the gate's row description.
6. **Negative-test.** Deliberately violate the gate's invariant on a throwaway branch — MUST exit 1. If it doesn't, the WARN branch wasn't fully removed; revert and retry.

Skipping step 1 (cooling window) or step 6 (negative test) is forbidden — both have been the source of past silent regressions in sibling repos.

### D7 — Forbidden additions

- A new gate that ships WARN-only without a ledger row in the same change.
- A `flipCriterion` cell containing prose without a measurable predicate (D3 violation).
- A `flipMechanism` cell pointing to a non-existent runner path.
- A `targetDate` already in the past at row-add time.
- Graduating a gate (steps 4 + 5) without executing steps 1, 3, 6.

---

## 3. Consequences

### Positive

- **Single audit-truth.** A reviewer reading any new WARN-only gate has exactly one place (`_GATE-GRADUATION-LEDGER.md`) to learn when and how it will graduate.
- **Drift-resistant by construction.** Gates #60 + #61 mechanically catch ledger desync and overdue dates respectively; their meta-tests (`_tests/60.test.mjs`, `_tests/61.test.mjs`) lock the visibility-line contracts.
- **Forces measurable thinking.** D3's closed predicate grammar makes "we'll fix this someday" un-writable.
- **Cheap to extend.** Adding the 10th WARN-only gate is one runner + one ledger row. No script changes required.
- **Closes F-SPEC-13 + F-AUDIT-26.** Both findings cited the missing ADR by ID; this resolves them.

### Negative

- **One more ADR to author per WARN-only gate cycle?** No — this ADR is one-time; subsequent WARN-only gates simply cite ADR-0031 in their registry-row description. No new ADR required per gate.
- **Ledger can become long.** At v1.1.0 it carries 8 active rows; once gates start graduating, §"Graduated entries" grows in parallel. Mitigation: gate #60's freshness check + future task #42 (graduated-entries L10 validation).

### Neutral

- The pattern is not novel — it generalises the per-(gate, path) ledger thinking (ADR-0029) and the manifest-plus-gate thinking (ADR-0030) up one level to the gate-lifecycle axis. ADR-0031 is the lifecycle sibling.

### Downstream xlinks (spec/ scopes locked by this ADR)

- [`../_GATE-GRADUATION-LEDGER.md`](../_GATE-GRADUATION-LEDGER.md) — the singleton ledger under enforcement; row-schema in its §Schema implements D2/D3/D4/D5.
- [`../_GATE-REGISTRY.md`](../_GATE-REGISTRY.md) — every WARN-only registry row MUST be reachable from the ledger (gate #60).
- [`./97-acceptance-criteria.md`](./97-acceptance-criteria.md) — AT-ADR-G06 cluster (8 rows: AT-31-D1..D7 + AT-31-PROTOCOL).
- [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md) §3 — AT-31-* I/O fixtures.

---

## 4. Alternatives considered

| Alternative | Why rejected |
|---|---|
| Keep the pattern undocumented; rely on tribal knowledge | Already failed once (F-AUDIT-26 cited 3 vague flipCriteria + 3 missing linkedTasks). Each new gate author re-invented the wheel. |
| Encode the pattern in the spec authoring guide (`spec/01-spec-authoring-guide/`) only | The authoring guide is a how-to; this is a load-bearing architectural decision affecting 9 (and growing) gates. Belongs in ADRs. |
| Allow a third launch mode "WARN-with-time-bomb" (auto-flips on date) | Conflates the criterion (D3) with the SLA (D5). Auto-flip without verifying the criterion is the silent-regression failure mode D6.6 (negative-test) explicitly guards against. |
| One ADR per WARN-only gate | 9 ADRs for one pattern is precisely the duplication ADR-0029 was created to solve. |
| Skip the cooling window (D6.1); flip immediately when criterion hits 0 | Real history: 3 of the 9 gates above had transient 0-counts that reverted within 48 h before stabilising. The 7-CI window catches this cheaply. |

---

## 5. Compliance gates

| Gate | Tier | Enforces |
|---|---|---|
| `G-00-GRADUATION-LEDGER-FRESH` | **CI** | §D2 — every WARN-only registry row MUST appear in the ledger; ledger MUST NOT carry orphan rows. Runner: `scripts/spec-hygiene/60-check-graduation-ledger-fresh.mjs`. |
| `G-00-GRADUATION-LEDGER-DATE-DRIFT` | **CI** | §D5 — overdue `targetDate` HARD-FAIL; due-soon WARN. Runner: `scripts/spec-hygiene/61-check-graduation-ledger-date-drift.mjs`. |
| `G-38-AMBIGUOUS-WORDING` | **CI** | §D3 — forbidden vague tokens (`eventually`, `TBD`, `event-driven`, etc.). Pre-existing; this ADR formalises its application to ledger cells. |
| `G-00-GRADUATION-LEDGER-CRITERION-SHAPE` | **DOC** (reviewer; future CI) | §D3 — measurable-predicate grammar. Reviewer-enforced at v1; promote to CI runner once a 4th predicate variant emerges (avoids over-fitting). |

---

## 6. Acceptance tests

The 8 acceptance tests below mirror D1–D7 plus the protocol. All are tagged `AT-ADR-G06` and filed in [`./97-acceptance-criteria.md`](./97-acceptance-criteria.md) v1.3.0 (pending). I/O fixtures in [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md) §3 (pending).

- **AT-31-D1-CLOSED-MODES** — Every hygiene runner under `scripts/spec-hygiene/[0-9][0-9]-*.mjs` whose top-level docstring declares a `STRICT` constant MUST set it to literal `true` or `false` — no expressions, no `process.env` reads. Enforced via `G-13-RUNNER-NO-INVALID-REGEX-ANCHORS` cousin check (future).
- **AT-31-D2-LEDGER-COVERAGE** — Every `_GATE-REGISTRY.md` row whose description contains the literal `**WARN-only**` MUST appear as a row in `_GATE-GRADUATION-LEDGER.md` §Entries (or §Graduated entries). Enforced by `G-00-GRADUATION-LEDGER-FRESH`.
- **AT-31-D3-MEASURABLE-PREDICATE** — Every §Entries row's `flipCriterion` cell MUST match one of the 5 grammars in §D3 OR contain the literal substring `count =`, `≤`, `consecutive CI`, or `targetDate <`. Enforced by `G-38-AMBIGUOUS-WORDING` + `G-00-GRADUATION-LEDGER-CRITERION-SHAPE` (DOC).
- **AT-31-D4-FLIP-MECHANISM-CITES-RUNNER** — Every §Entries row's `flipMechanism` cell MUST cite a runner path matching `scripts/spec-hygiene/[0-9][0-9]-*.mjs` OR the literal `_LEDGER-G-*-EXEMPTIONS.md` for ledger-driven gates. Reviewer-enforced; promote to CI when 4th gate uses non-runner mechanism.
- **AT-31-D5-ISO-DATE** — Every §Entries row's `targetDate` MUST match `YYYY-MM-DD` AND MUST NOT be `< addedOn`. Enforced by `G-00-GRADUATION-LEDGER-DATE-DRIFT`.
- **AT-31-D5-OVERDUE-FAIL** — When `targetDate < today` for any §Entries row, gate #61 MUST exit 1 with stderr matching `/G-00-GRADUATION-LEDGER-DATE-DRIFT.*overdue/`. Enforced; meta-test at `_tests/61.test.mjs`.
- **AT-31-D6-PROTOCOL-COMPLETE** — A graduation PR MUST modify all 3 of: (a) the runner per `flipMechanism`, (b) `_GATE-GRADUATION-LEDGER.md` (row moved to §Graduated entries with `graduatedOn` cell), (c) `_GATE-REGISTRY.md` (WARN-only parenthetical removed). PRs missing any of the 3 MUST be rejected. Reviewer-enforced; future CI candidate (task #42).
- **AT-31-D7-NO-RETROACTIVE-DATES** — A new §Entries row whose `targetDate < addedOn` MUST be rejected at PR time. Enforced by gate #61's date-sanity branch.

---

## 7. Migration / rollout

- **Already complete.** The ledger (`_GATE-GRADUATION-LEDGER.md`) was authored 2026-04-29 v1.0.0 with 8 rows; v1.1.0 (same day) tightened 3 vague flipCriteria per F-AUDIT-26. Gates #60 + #61 with meta-tests landed in the same cycle.
- **Negative-tested**: tampering a `flipCriterion` cell to `eventually` correctly trips `G-38-AMBIGUOUS-WORDING`; setting `targetDate` to a past date trips gate #61; deleting a registry WARN-only row without removing its ledger entry trips gate #60.
- **Ledger header xref**: line 7 of `_GATE-GRADUATION-LEDGER.md` currently reads `Authoritative pattern: ADR-0031 (pending)`. A follow-up edit (in this ADR's landing PR) MUST drop the `(pending)` qualifier — that edit is part of this ADR's own rollout, not a future task.
- **Future scripts:** the 10th WARN-only gate MUST cite ADR-0031 in its `_GATE-REGISTRY.md` row description (replacing the prior practice of inlining flip prose) AND append a row to the ledger. No new ADR per gate.
