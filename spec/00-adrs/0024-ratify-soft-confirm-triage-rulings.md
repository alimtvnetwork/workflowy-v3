# ADR-0024: Ratify 3 soft-confirm triage rulings (#01, #03, #17)

## Status

`Accepted` — 2026-04-28

## Context

The NO-QUESTIONS-MODE batch (expired 2026-04-27) produced 48 ambiguities,
triaged in `.lovable/question-and-ambiguity/00-triage-summary.md`. 44
self-resolved, 1 hard-confirm (#02 → `AT-MPG-`) closed, leaving 3
soft-confirms still classified as "default-accept unless objected":

- **#01** — Audit 100/100 score: B1–B4 addendums footnote-only, score
  untouched.
- **#03** — DDL stays singular (`Item`, `Title`); spec aliases bridge the
  plural prose terms (`Items`, `Content`).
- **#17** — Favorites lives at table-level; no shell endpoint owns it.

P37 promoted all three rulings into spec text, but they remain
classified as "soft" in triage. Without explicit ratification a future
AI may legitimately re-open them — particularly #03, whose blast radius
(every SQL file + migration + endpoint name) makes accidental reversal
catastrophic.

This ADR converts the three rulings from **soft-confirm defaults** into
**load-bearing decisions** with gate IDs, removing the "could be
overridden" status.

## Decision

**D1 — Ratify #01 (audit dimension scope) (MUST).** The 100/100 audit
score MUST NOT be recomputed to absorb post-100 addendums (B1–B4 or any
future Bn). Post-100 work MUST be recorded as a "Related spec-completeness
work" footnote to the audit, never as a new dimension. Reopening requires
a superseding ADR.

**D2 — Ratify #03 (DDL singular vs spec plural) (MUST).** DDL identifiers
MUST remain **singular** (`Item`, `Title`, `Owner`, etc.) per ADR-0001
and ADR-0006. Spec prose MAY use plural natural-language terms (`Items`,
`Content`). The Spec↔DDL Alias Bridge in
`spec/04-database-conventions/00-overview.md` is the **sole** translation
authority. Renaming DDL to plural is **forbidden** without superseding
ADR-0001, ADR-0006, **and** this ADR.

**D3 — Ratify #17 (Favorites placement) (MUST).** Favorites MUST be a
**table-level** concern (column/flag on the canonical item table). No
shell endpoint (`EP-FAVORITES-*`) may own it. Any future request to
introduce `EP-FAVORITES-LIST` or a dedicated `Favorite` table MUST first
supersede ADR-0001 (per its Worked Example) **and** this ADR.

**D4 — Triage classification update (MUST).** The three items MUST be
re-labelled in `.lovable/question-and-ambiguity/00-triage-summary.md`
(see §D1) from 🟡 **Soft-confirm** to ✅ **Ratified by ADR-0024**. The
triage file remains an audit trail; the ADR is now the load-bearing
source. **Status (2026-04-28):** banner update applied at file head;
per-item section headers (§§ #01, #03, #17) MAY retain their original
🟡 markers for historical fidelity — the banner is authoritative.

## Consequences

**Positive**
- Eliminates the last "default-accept unless objected" category — every
  open ambiguity is now either resolved or explicitly ADR-locked.
- #03's catastrophic-reversal risk is now gated by ADR-0024 + ADR-0001 +
  ADR-0006 (triple lock).
- Future AI sessions can cite a single ADR instead of digging through
  triage notes.

**Negative**
- Removes a low-friction override path. Reversing any of the three now
  requires a full ADR cycle (Proposed → Accepted + supersede).
- Adds 3 more gate IDs to the CI matrix.

## Alternatives Considered

1. **Leave as soft-confirm indefinitely.** Rejected — soft-confirm was
   designed as a temporary classification; leaving it open invites
   silent drift, particularly on #03.
2. **One ADR per ruling (three ADRs).** Rejected — the three rulings
   share a common origin (NO-QUESTIONS-MODE triage) and a common
   ratification trigger; bundling preserves auditability.
3. **Edit the original ADRs (0001, 0006) to absorb #03.** Rejected —
   ADRs are append-only after `Accepted` (per `00-overview.md` Worked
   Example anti-patterns).

## Gates Touched

- `G-24-AUDIT-SCORE-FROZEN` — 100/100 audit score MUST NOT be
  recomputed for post-100 addendums; footnote-only.
- `G-24-DDL-SINGULAR-LOCKED` — DDL identifiers MUST be singular;
  alias-bridge is sole translation authority.
- `G-24-FAVORITES-TABLE-ONLY` — Favorites MUST be table-level; no
  `EP-FAVORITES-*` endpoints permitted.

## Supersedes / Superseded-By

- Supersedes: (none — promotes prior soft-confirm rulings)
- Superseded-By: (none)
- Composes with: ADR-0001 (singular DDL vs plural prose),
  ADR-0006 (migrate spec SQL to singular DDL).
