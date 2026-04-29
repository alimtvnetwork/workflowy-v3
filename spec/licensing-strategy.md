# Licensing Strategy

> **Version:** 1.2.0
> **Updated:** 2026-04-29 (UTC+8) — v1.2.0: ADR-0032 authored (`Proposed`); Q1–Q5 ratified pending migration steps 1–6. v1.1.0 (prior) carried Q1–Q5 as Open.
> **Status:** Awaiting graduation — ratified by [ADR-0032](./00-adrs/0032-license-decision.md) (`Proposed`); flips to `Accepted` after migration steps 1–6.
> **Parent:** [`spec-index.md`](./spec-index.md)
> **Owner:** Project lead (no delegated stewardship until ADR-0032 → `Accepted`).

---

## Purpose

This file is the SSOT for the project's licensing posture. It records:

1. **What is licensed** — the WordPress plugin (PHP 8.1+ + SQLite + REST), its
   companion React/TypeScript frontend, the spec corpus under `spec/`, and the
   hygiene-gate scripts under `scripts/`.
2. **Under which terms** — to be ratified by ADR-0032 (see "Open questions").
3. **Who may redistribute** — bound by the chosen license, mirrored in
   `package.json#license` and the WordPress plugin header.

---

## Current posture (interim)

Until ADR-0032 lands:

- **Source code (frontend + plugin + scripts):** treated as **All Rights
  Reserved** by default. No redistribution rights are granted.
- **Specification corpus (`spec/`):** internal working draft, not licensed for
  external use.
- **Third-party dependencies:** retain their upstream licenses (see
  `package.json` and the WordPress plugin's `composer.json` once added);
  this file does not relicense them.

---

## Open questions (ratified by ADR-0032 — pending migration)

ADR-0032 (`Proposed`, 2026-04-29) ratifies all five questions below. They
remain listed here verbatim for audit-trail continuity; the resolution
column was added in v1.2.0. Final closure (rewrite to v2.0.0 with this
section deleted) happens at migration step 5 — see ADR-0032 §Consequences.

| # | Question | Constraint | Resolution (ADR-0032) |
|---|---|---|---|
| Q1 | Open-source license for the plugin? (Candidates: GPL-2.0-or-later for WP-ecosystem compatibility, MIT for permissiveness, AGPL-3.0 for SaaS-protective copyleft.) | WP plugin distribution requires GPL-compatible license per WordPress.org guidelines. | **GPL-2.0-or-later** |
| Q2 | Same license for the frontend, or split? | If split, the boundary must be a hard module boundary (separate package, separate repo, or separate `LICENSE` file with explicit scope). | **Same license, no split** (frontend ships embedded in plugin's `assets/`) |
| Q3 | License for the spec corpus? (Candidates: CC-BY-4.0, CC-BY-SA-4.0, proprietary.) | Must be compatible with quoting fixtures verbatim in derived AT documentation. | **CC-BY-4.0** for `spec/`; **GPL-2.0-or-later** for `scripts/` |
| Q4 | Contributor License Agreement (CLA) required? | If yes, must use a published template (e.g. Apache ICLA) — no ad-hoc text. | **No CLA** (inbound = outbound per GitHub ToS §D.6) |
| Q5 | Trademark policy for the project name? | Separate from copyright license; defaults to "all rights reserved" until explicitly granted. | **Common-law trademark reserved**; `TRADEMARK.md` required at flip time |

---

## Acceptance criteria

When ADR-0032 lands, this file MUST:

- Replace the "Current posture (interim)" section with the ratified terms.
- Cite ADR-0032 in the front-matter.
- Link to the canonical `LICENSE` file at the repository root.
- Reflect the chosen license in `package.json#license` and the WP plugin header
  (`License:` and `License URI:` fields).

---

## Related

- [`spec/00-adrs/0031-warn-only-strict-flip-pattern.md`](./00-adrs/0031-warn-only-strict-flip-pattern.md) — predicate-quality rule that ADR-0032's flip criteria must satisfy.
- [`spec/_AUDIT-EXEMPTIONS.md`](./_AUDIT-EXEMPTIONS.md) — this file is intentionally NOT exempted; F-AUDIT-15 task #32 thickened it instead.
- WordPress.org plugin guidelines — external reference for Q1 constraint.
