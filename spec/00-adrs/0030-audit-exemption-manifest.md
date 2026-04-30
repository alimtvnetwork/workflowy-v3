# ADR-0030 — Audit Exemption Manifest is the Sole False-Positive Channel

> **Status:** Accepted
> **Date:** 2026-04-29
> **Supersedes:** —
> **Superseded by:** —
> **Related:** ADR-0029 (per-(gate, path) ledger shared library — sibling pattern), `G-00-AUDIT-EXEMPTION-REVIEW` (the enforcing CI gate), F-AUDIT-31 (the originating finding from re-audit v2)
> **Closes:** F-AUDIT-31 (LOW) — "Exemption Manifest Maintenance Risk"

---

## 1. Context

The 2026-04-29 Gemini-2.5-Pro spec audit (v1, score 65/100) flagged 206
"placeholder/stub" files using a coarse heuristic (`size < 600 bytes` OR
`/placeholder|stub|to be defined|coming soon/i`). It generated 34 false
positives — most notably the entire `spec/12-consolidated-guidelines/` scope,
whose 26 numbered files are deliberate 55-line redirect stubs that close audit
finding **AUD-C-01** (2026-04-19) by replacing duplicated rules with redirects
to canonical sources.

To correct the audit without weakening it, we introduced
`spec/_AUDIT-EXEMPTIONS.md`: a path-globbed manifest declaring 8 patterns
where the heuristic is wrong by design. Re-audit v2 with the manifest applied
returned **67/100** (Δ +2, RISKY → RISKY tier-stable, with
`12-consolidated-guidelines` lifting **15 → 80** BLOCKING → STRONG).

The re-audit *itself* surfaced a new LOW finding (**F-AUDIT-31**): without an
enforcement gate, future authors could silently widen the manifest's globs
(e.g. `spec/**/*.md`) to mask real abandoned stubs behind a one-line edit.
Manifests that quietly mask gaps are worse than no manifest at all.

This ADR codifies the manifest-plus-gate pattern as the single sanctioned
channel for audit-heuristic exemptions, mirroring the ADR-0029 codification
of the per-(gate, path) ledger pattern for runner exemptions.

---

## 2. Decision

### D1 — Single canonical location for audit exemptions

All audit-heuristic exemptions (any rule that tells an audit script "ignore
this match") **MUST** live in exactly one file (gate G-00-AUDIT-EXEMPTION-REVIEW):
`spec/_AUDIT-EXEMPTIONS.md`. Inline exemption arrays in audit/metrics scripts
are forbidden. Per-scope `_AUDIT-EXEMPT-*.md` files are forbidden.

### D2 — Frozen manifest schema

The manifest MUST contain (gate G-00-AUDIT-EXEMPTION-REVIEW):

- A single H2 `## Exemption rows` (case-sensitive, exactly one occurrence).
- A 5-column table whose header row is, in order:
  `pathGlob | category | rationale | closes | addedOn`.
- One row per exemption pattern. Cells may be wrapped in backticks.

### D3 — Per-row invariants (enforced by `G-00-AUDIT-EXEMPTION-REVIEW`)

- **I4 (path safety):** `pathGlob` MUST start with `spec/`. No repo-root
  escapes (`../`, `/etc/...`).
- **I5 (no blank cheques):** `pathGlob` MUST NOT be a corpus-wide pattern (gate G-00-AUDIT-EXEMPTION-REVIEW)
  (`spec/**`, `spec/**/*`, `spec/**/*.md`, `spec/*`, `**/*`).
- **I6 (citation):** `closes` MUST cite at least one of: `AUD-*`, (gate G-00-AUDIT-EXEMPTION-REVIEW)
  `F-AUDIT-NN`, `F-AUDxx-NN`, `ADR-NNNN`, or the literal `n/a` (explicit
  acknowledgement that no audit ratifies the row).
- **I7 (date format):** `addedOn` MUST be ISO `YYYY-MM-DD` (gate G-00-AUDIT-EXEMPTION-REVIEW).
- **I8 (visibility):** Every CI run MUST print the total file count matched (gate G-00-AUDIT-EXEMPTION-REVIEW)
  by the union of all globs, so reviewers see drift on every PR.

### D4 — Reviewer attention threshold

If matched-file-count ÷ total-spec-files exceeds **10%**, the gate emits a
warning (non-blocking) recommending reviewer attention. The threshold is
deliberately conservative — at 3.4% in the inaugural manifest (52/1511
files), we have 6.6 percentage points of headroom before alarm.

### D5 — Forbidden additions

- New audit/metrics scripts that read exemption data from anywhere other
  than `_AUDIT-EXEMPTIONS.md` (D1 violation).
- Manifest rows whose `closes` cell cites a file/PR that does not exist
  (no caller can verify the rationale).
- Globs that match zero files at the time of addition (dead-letter
  exemptions accumulate noise; remove them in the same PR that obsoletes
  the pattern).

---

## 3. Consequences

### Positive

- **Single audit-truth.** Any AI auditor (or human reviewer) reading the
  spec corpus can look in exactly one place to learn which "missing"
  files are actually intentional.
- **Drift-resistant by construction.** D3.I5 makes it mechanically
  impossible to silently mask large swathes of the corpus.
- **Self-documenting.** Every row carries its own rationale + audit
  citation; no out-of-band tribal knowledge.
- **Cheap to extend.** Adding a new exemption is a single table row plus a
  linter pass; no script changes required.

### Negative

- **One more file to maintain.** Net new SSOT in `spec/`.
- **Manifest can become dead-letter list** if rows aren't pruned when
  underlying patterns disappear. Mitigation: D5.3 (zero-match rows
  forbidden); reviewer pass quarterly.

### Neutral

- The gate itself is a mid-size runner (~140 lines) but mostly mechanical
  (header parse + 8 invariants + glob walk). Within ADR-0007 strict-TS
  budget when ported (currently `.mjs`).

### Downstream xlinks (spec/ scopes locked by this ADR)

- [`../_AUDIT-EXEMPTIONS.md`](../_AUDIT-EXEMPTIONS.md) — the singleton manifest under enforcement.
- [`../_GATE-REGISTRY.md`](../_GATE-REGISTRY.md) — `G-00-AUDIT-EXEMPTION-REVIEW` binding.
- [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md) §2 — AT-30-I1..I8 I/O fixtures.

---

## 4. Alternatives considered

| Alternative | Why rejected |
|---|---|
| Per-script inline exemption arrays (status quo before manifest) | Each script owns its own definition of "intentional"; no cross-tool consistency; trivially silent-widened by anyone editing a script. |
| One exemption file per audit script | Multiplies the SSOT problem (n manifests vs 1); reviewers must hunt across files to understand corpus-wide masking. |
| Per-scope `_EXEMPT.md` files (mirroring per-gate ledgers from ADR-0029) | Audit heuristics are corpus-wide, not gate-scoped; per-scope fragmentation has no upside here. |
| No exemption mechanism — fix the heuristic to be smarter | Tried first. Heuristic complexity grows unboundedly (every false-positive class needs its own rule). Manifest is the simpler interface. |

---

## 5. Compliance gates

| Gate | Tier | Enforces |
|---|---|---|
| `G-00-AUDIT-EXEMPTION-REVIEW` | **CI** | (New, this ADR) §D2/§D3 invariants on `_AUDIT-EXEMPTIONS.md`. Warns on §D4 threshold breach. Runner: `scripts/spec-hygiene/57-check-audit-exemption-review.mjs`. |

---

## 6. Acceptance tests

The 8 acceptance tests below mirror the I1-I8 invariants in the runner
docstring. All are enforced by `G-00-AUDIT-EXEMPTION-REVIEW`.

- **AT-30-I1-MANIFEST-EXISTS** — `spec/_AUDIT-EXEMPTIONS.md` MUST exist at the canonical path.
- **AT-30-I2-SINGLE-H2** — The manifest MUST contain exactly one `## Exemption rows` H2 (case-sensitive).
- **AT-30-I3-HEADER-SHAPE** — The table header row MUST be `pathGlob | category | rationale | closes | addedOn` (case-sensitive, in order).
- **AT-30-I4-SPEC-ROOTED** — Every row's `pathGlob` MUST start with `spec/`.
- **AT-30-I5-NO-BLANK-CHEQUE** — Every row's `pathGlob` MUST NOT be a corpus-wide pattern (`spec/**`, `spec/**/*`, `spec/**/*.md`, `spec/*`, `**/*`).
- **AT-30-I6-CITED** — Every row's `closes` cell MUST cite `AUD-*`, `F-AUDIT-NN`, `F-AUDxx-NN`, `ADR-NNNN`, or the literal `n/a`.
- **AT-30-I7-ISO-DATE** — Every row's `addedOn` MUST match `YYYY-MM-DD`.
- **AT-30-I8-VISIBILITY** — Every CI run MUST print `matched/total (pct%)` so reviewers can detect drift in PR output.

---

## 7. Migration / rollout

- **Already complete.** Inaugural manifest authored 2026-04-29 with 8 rows
  (52/1511 files matched, 3.4%). Gate `G-00-AUDIT-EXEMPTION-REVIEW`
  authored 2026-04-29 in `scripts/spec-hygiene/57-check-audit-exemption-review.mjs`,
  wired into `00-run-all.mjs` (slot 34).
- **Negative-tested**: tampering a row to `spec/**` correctly trips I5;
  restoring passes; gate caught a real citation defect (`P22 plan` →
  `n/a`) on its first run.
- **Future scripts:** import nothing — read `_AUDIT-EXEMPTIONS.md`
  directly with the same parser pattern as gate #57 (or factor into a
  shared `_lib/audit-exemptions.mjs` if a 2nd consumer appears, per
  ADR-0029's DRY trigger).
