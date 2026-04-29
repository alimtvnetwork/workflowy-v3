# ADR-0032: License decision and ratification

## Status

`Proposed` — 2026-04-29

<!-- Will flip to `Accepted` once `LICENSE` lands at repo root and
     `package.json#license` + WP-plugin header are populated to match.
     See "Consequences → Migration steps" below. -->

## Context

`spec/licensing-strategy.md` v1.1.0 has carried five Open questions
(Q1–Q5: code license, frontend split, spec-corpus license, CLA, trademark)
under an interim "All Rights Reserved" posture. The plan file has tracked
this as task #52 since the post-v6 audit cycle, and `F-AUDIT-31` resolution
(via ADR-0030 audit-exemption manifest) explicitly excluded the licensing
file from exemption — meaning the deferral is visible to every audit but
unowned by any ADR. WordPress.org plugin distribution requires a
GPL-compatible license, so Q1 has a hard external constraint that will not
soften with time. Continuing to defer blocks: (a) any external contribution,
(b) WP-directory submission, (c) audit-v8+ score growth on the
"governance / load-bearing decisions ratified" axis.

## Decision

The project MUST adopt the following license posture, ratifying every Q1–Q5
question in `spec/licensing-strategy.md`:

- **Q1 — Plugin (PHP + SQLite + REST):** `GPL-2.0-or-later`. Mandated by
  WordPress.org guidelines; chosen over GPL-3.0 to maximise compatibility
  with the existing WP plugin ecosystem.
- **Q2 — Frontend (Vite + React + TS):** `GPL-2.0-or-later`. **No split.**
  The frontend ships as a build artifact embedded in the plugin's `assets/`
  directory and is functionally inseparable from the GPL backend; a license
  split would create a derived-work ambiguity the project MUST NOT carry.
- **Q3 — Spec corpus (`spec/`) and hygiene scripts (`scripts/`):**
  `CC-BY-4.0` for prose under `spec/`; `GPL-2.0-or-later` for executable
  scripts under `scripts/`. Acceptance-test fixtures (verbatim quotation)
  are explicitly permitted by CC-BY-4.0 §3(a)(1).
- **Q4 — Contributor License Agreement:** **Not required.** Inbound = outbound
  per the GitHub Terms-of-Service §D.6 default, sufficient for a project of
  this scope. A CLA MAY be revisited if a corporate contributor with a
  blanket-policy mandates one.
- **Q5 — Trademark policy:** The project name "WorkFlowy" and any future
  logo are reserved under common-law trademark. Code redistribution is
  permitted under the GPL, but **MUST NOT** imply endorsement, sponsorship,
  or affiliation with the upstream Workflowy product. A `TRADEMARK.md` file
  at repo root MUST accompany the `LICENSE` file at flip time.

A spec gate `G-32-LICENSE-FILES-PRESENT` MUST verify, on every CI run, that
`LICENSE`, `TRADEMARK.md`, `package.json#license = "GPL-2.0-or-later"`, and
the WP-plugin header `License:` / `License URI:` fields are all present and
consistent. The gate enters the registry as `warn` per ADR-0031 and
graduates to `strict` once the four files exist (mechanical predicate; no
subjective threshold).

## Consequences

**Positive**

- Q1–Q5 are no longer "open"; `spec/licensing-strategy.md` v1.1.0 can be
  rewritten to v2.0.0 with the interim section deleted.
- WordPress.org submission is unblocked.
- External contributions, redistributions, and forks have unambiguous terms.
- Audit-v8+ closes the only outstanding governance gap surfaced by the
  v6→v7 cycle — projected +1 to the "ratified load-bearing decisions"
  rubric axis.
- The CC-BY-4.0 / GPL split lets the spec corpus be quoted in academic /
  industry writing without infecting the plugin's GPL boundary.

**Negative**

- GPL-2.0-or-later is copyleft. Closed-source forks of the plugin or
  embedded frontend are not permitted; this MAY deter some commercial
  adopters. Accepted because the WP-ecosystem constraint forces it anyway.
- `CC-BY-4.0` requires attribution on quoted spec fragments. Downstream
  AT-document generators MUST emit a one-line attribution block; tracked as
  a follow-up gate (`G-32b-CC-ATTRIBUTION-BLOCK`, deferred).
- "Inbound = outbound" without a CLA leaves no contributor identity record
  beyond Git history. Acceptable at current scale; revisit if a corporate
  contributor requires one.

**Migration steps (graduation predicate for `Proposed → Accepted`)**

1. Add `LICENSE` (verbatim FSF GPL-2.0-or-later text) at repo root.
2. Add `TRADEMARK.md` at repo root with the Q5 wording above.
3. Add `package.json` field `"license": "GPL-2.0-or-later"`.
4. Add WP-plugin header lines `License: GPL-2.0-or-later` and
   `License URI: https://www.gnu.org/licenses/gpl-2.0.html` to the
   plugin's main PHP file (deferred until plugin scaffold lands).
5. Rewrite `spec/licensing-strategy.md` to v2.0.0; delete the interim
   posture section; cite this ADR in the front-matter.
6. Promote `G-32-LICENSE-FILES-PRESENT` from `warn` to `strict` once
   steps 1–4 complete.

Steps 1–3 + 5 are **spec-only-safe** (do not touch `src/`); step 4 is
gated by `exit spec-only`. Until all 6 complete, this ADR remains
`Proposed` and downstream gates MUST NOT cite it as load-bearing per
ADR-0031 §D2.

## Alternatives Considered

1. **MIT / Apache-2.0 (permissive)** — rejected because WordPress.org plugin
   guidelines mandate GPL-compatibility *and* historically reject
   permissive-licensed plugins on submission. The compatibility could be
   argued, but the friction is real and avoidable.
2. **AGPL-3.0 (SaaS-protective copyleft)** — rejected because the plugin is
   distributed as a self-hosted artifact, not run as a service by the
   author; AGPL's network-clause adds redistribution friction without a
   matching threat model.
3. **Dual-license (e.g. GPL + commercial)** — rejected because no commercial
   licensing infrastructure (sales, contracts, key issuance) exists or is
   planned; carrying a phantom commercial offering would mislead users.
4. **Defer indefinitely (status-quo)** — rejected because Q1's WP.org
   constraint will not soften, and the plan file has carried task #52 for
   six audit cycles. Continued deferral is technical debt with negative
   compounding (audit-cycle re-explanation cost).
5. **Require a CLA (e.g. Apache ICLA)** — rejected at current scale per Q4
   reasoning; revisitable.

## Gates Touched

- **New gates:** `G-32-LICENSE-FILES-PRESENT` (warn → strict per ADR-0031
  predicate), `G-32b-CC-ATTRIBUTION-BLOCK` (deferred; tracked as follow-up).
- **Modified gates:** `(none)`
- **Endpoints locked:** `(none)`
- **DDL identifiers locked:** `(none)`

## Supersedes / Superseded-By

- **Supersedes:** `(none)`
- **Superseded-By:** `(none)`

## Related

- [`spec/licensing-strategy.md`](../licensing-strategy.md) — SSOT; will
  rewrite to v2.0.0 at flip time per migration step 5.
- [`spec/00-adrs/0030-audit-exemption-manifest.md`](./0030-audit-exemption-manifest.md)
  — confirmed the licensing file is NOT exempted, forcing this ADR.
- [`spec/00-adrs/0031-warn-only-strict-flip-pattern.md`](./0031-warn-only-strict-flip-pattern.md)
  — the warn→strict graduation predicate this ADR's gate must satisfy.
- [`spec/AUDIT-FINDINGS-LEDGER.md`](../AUDIT-FINDINGS-LEDGER.md) — F-AUDIT-31
  resolution (ADR-0030) explicitly excluded licensing from exemption,
  surfacing this ADR as the only remaining path to closure.
- WordPress.org plugin guidelines, §"License" — external constraint
  forcing Q1.
