# Spec Audit — Heuristic Exemptions Manifest

> **Version:** 1.0.0
> **Created:** 2026-04-29 (UTC+8) — answer to F-AUDIT-02 false-positive on `spec/12-consolidated-guidelines/`.
> **Status:** Active — read by metrics scripts and AI auditors before classifying files as "placeholder/stub".
> **Parent:** [`spec-index.md`](./spec-index.md)

---

## Purpose

The 2026-04-29 Gemini-2.5-Pro audit (`/mnt/documents/spec-ai-implementability-audit.md`) flagged 204 placeholder/stub files corpus-wide using a coarse heuristic:

```
size < 600 bytes  OR  matches /placeholder|stub|to be defined|coming soon/i
```

This heuristic generates **false positives** for two intentional patterns ratified by prior ADRs and audit closures:

1. **Redirect-only stubs** — by-design 55-line forwarders that close drift-prevention findings (e.g. AUD-C-01 closed 2026-04-19 created the entire `spec/12-consolidated-guidelines/` redirect pattern).
2. **`.gitkeep` companions and `97a-…-fixtures.md` short stubs** in folders that pivot to fixture-as-spec.

This manifest declares those exemptions so audit scripts and AI auditors can deduct them from the placeholder count before scoring.

---

## Exemption rows

| pathGlob | category | rationale | closes | addedOn |
|---|---|---|---|---|
| `spec/12-consolidated-guidelines/*.md` | redirect-stub | Every numbered file is a deliberate 55-line redirect to its canonical source folder. The folder is an *index*, not a content folder. (Exception: `00-overview.md`, `97-acceptance-criteria.md`, `99-consistency-report.md` are real content but pass the size check anyway, so the broader glob is safe.) | AUD-C-01 (2026-04-19); F-AUD30-09 (2026-04-26); F-AUDIT-02-FALSE-POSITIVE (2026-04-29) | 2026-04-29 |
| `spec/**/.gitkeep` | scaffold-marker | Empty git-tracking files for new scopes; not spec content. | n/a | 2026-04-29 |
| `spec/**/97a-acceptance-criteria-fixtures.md` | fixture-stub-allowed | Initial fixture files seeded in P22; expected to grow file-by-file as ATs are authored. | n/a | 2026-04-29 |
| `spec/11-research/.gitkeep` | research-placeholder | `11-research/` is intentionally near-empty; it holds future-scoped research notes only. | n/a | 2026-04-29 |
| `spec/33-feedback-report/.gitkeep` | scope-bootstrap | Recently spawned scopes; non-stub content already lives in `97-…` and `97a-…` files. | n/a | 2026-04-29 |
| `spec/34-activity-feed/.gitkeep` | scope-bootstrap | Same as above. | n/a | 2026-04-29 |
| `spec/35-enforcement-rules/.gitkeep` | scope-bootstrap | Same as above. | n/a | 2026-04-29 |
| `spec/36-user-management/.gitkeep` | scope-bootstrap | Same as above. | n/a | 2026-04-29 |
| `spec/01-spec-authoring-guide/00-overview.md` | policy-definition | The placeholder-hygiene rule itself is documented here. Three `_TODO(P1)_` token mentions appear inside backticked code spans on lines 15/25/38 as the literal token being forbidden. Counting them as placeholders is a category error. | F-AUDIT-24-FALSE-POSITIVE (2026-04-29) | 2026-04-29 |
| `spec/01-spec-authoring-guide/18-ai-contract-template.md` | policy-definition | Two `TODO(P1)` mentions on lines 100/101 define the convention itself ("Placeholder lines start with `_TODO(P1):_`…"). | F-AUDIT-24-FALSE-POSITIVE (2026-04-29) | 2026-04-29 |
| `spec/01-spec-authoring-guide/20-rfc-2119-wording-policy.md` | policy-definition | Four mentions on lines 32/33/49/83 catalogue the forbidden tokens (`to-be-determined` / `fix-this` / `unknown-marker` / `TODO`) and their resolution rules — this is the SSOT for the rule itself. | F-AUDIT-24-FALSE-POSITIVE (2026-04-29) | 2026-04-29 |
| `spec/02-coding-guidelines/01-cross-language/04-code-style/06-comments-and-documentation.md` | policy-definition | One mention on line 83 inside a code-span example showing the allowed `// TODO(PROJ-123)` form. | F-AUDIT-24-FALSE-POSITIVE (2026-04-29) | 2026-04-29 |
| `spec/00-adrs/0031-warn-only-strict-flip-pattern.md` | policy-definition | Two mentions (lines 61 + 150) catalogue the forbidden vague-criterion tokens (`eventually`, `to-be-determined`, the three-letter unspecified-marker, `next pass`, `event-driven`, `someday`) that this ADR's §D3 codifies — the ADR IS the SSOT for the rule that G-38 enforces; counting its definitions as offenders is a category error. | F-SPEC-13-CLOSURE (2026-04-29); F-AUDIT-26-CLOSURE (2026-04-29) | 2026-04-29 |
| `spec/00-adrs/97a-acceptance-criteria-fixtures.md` | policy-definition | §3.4 AT-31-D4 negative fixture demonstrates the forbidden `flipMechanism = "<three-letter-unspecified-marker>"` PR-rejection case by name — required to make the fixture concretely reviewable. Same category-error carve-out as ADR-0031 sibling row above. | ADR-0031 | 2026-04-29 |
| `spec/_AUDIT-EXEMPTIONS.md` | data-catalog | This manifest itself catalogs the forbidden tokens it exempts (e.g. row rationale text on lines 39–44 quotes `TBD`, `stub`, `placeholder` as the literal data being declared). Self-referential category error: the SSOT for the exemption rule cannot be its own offender. | F-AUDIT-15 follow-up (task #32) | 2026-04-29 |
| `spec/_GATE-GRADUATION-LEDGER.md` | data-catalog | Gate-graduation ledger catalogs flip predicates that quote forbidden vague tokens (`TBD`, `stub`) as the literal criteria being rejected. Same SSOT carve-out as `_AUDIT-EXEMPTIONS.md`. | F-AUDIT-15 follow-up (task #32) | 2026-04-29 |
| `spec/_GATE-REGISTRY.md` | data-catalog | The 569-line registry of all 60+ hygiene gates necessarily catalogs gate-IDs and rationales mentioning `stub`, `TBD`, `placeholder` as the literal tokens those gates detect. Counting gate-detection vocabulary as offenders is a category error. | F-AUDIT-15 follow-up (task #32) | 2026-04-29 |
| `spec/99-consistency-report.md` | data-catalog | Cross-corpus consistency report enumerates `TBD` / `stub` references found elsewhere as audit findings — listing them is its purpose. | F-AUDIT-15 follow-up (task #32) | 2026-04-29 |
| `spec/23-ai-build-walkthrough.md` | policy-definition | Walkthrough explains the placeholder-hygiene convention (`_TODO(P1)_`, `TBD`) to AI builders by quoting the forbidden tokens. Same category as the `01-spec-authoring-guide` policy-definition rows. | F-AUDIT-15 follow-up (task #32) | 2026-04-29 |
| `spec/spec-index.md` | data-catalog | Corpus catalog of 1,651 lines lists file titles such as "Redirect Stub" / "Legacy Stub" / "Color Theme & Design Token Reference (Legacy Stub)" as the canonical names of cataloged files. Counting cataloged-file titles as placeholders is a category error. | F-AUDIT-15 follow-up (task #32) | 2026-04-29 |
| `spec/13-cicd-pipeline-workflows/02-go-binary-deploy/*.md` | dead-runtime | Direct-children of the legacy Go-binary deploy subdir — explicitly forbidden by the 2026-04-25 backend decision (Core memory: "WordPress plugin (PHP 8.1+ + SQLite + REST). … Go all forbidden"). Files retained as historical reference; live deploy lives under `18-wp-plugin-deploy/`. Sibling glob `**/*.md` below covers nested files. | F-AUDIT-25 burndown (task #44b, 2026-04-29); cites mem://constraints/backend-runtime-deferred | 2026-04-29 |
| `spec/13-cicd-pipeline-workflows/02-go-binary-deploy/**/*.md` | dead-runtime | Nested files under the legacy Go-binary deploy subdir (e.g. fixture / sub-pipeline files). Same forbidden-runtime carve-out as direct-children glob above. | F-AUDIT-25 burndown (task #44b, 2026-04-29); cites mem://constraints/backend-runtime-deferred | 2026-04-29 |
| `spec/13-cicd-pipeline-workflows/04-install-script-generation.md` | dead-runtime | Documents POSIX/PowerShell install-script generation for Go CLI binaries. WordPress plugin distribution uses standard WP plugin .zip + admin upload; install scripts are inapplicable. Same forbidden-runtime carve-out as the `02-go-binary-deploy/` row. | F-AUDIT-25 burndown (task #44b, 2026-04-29) | 2026-04-29 |
| `spec/13-cicd-pipeline-workflows/06-self-update-mechanism.md` | dead-runtime | Self-update mechanism for Go CLI binaries (download new binary, swap in place). WordPress plugins update via the WP admin dashboard's plugin updater — not applicable. | F-AUDIT-25 burndown (task #44b, 2026-04-29) | 2026-04-29 |
| `spec/13-cicd-pipeline-workflows/09-binary-icon-branding.md` | dead-runtime | Windows binary icon embedding via `go-winres` for Go CLI binaries. Inapplicable to a PHP plugin shipped as .zip. | F-AUDIT-25 burndown (task #44b, 2026-04-29) | 2026-04-29 |
| `spec/13-cicd-pipeline-workflows/11-release-pipeline.md` | dead-runtime | Cross-compiled Go binary release pipeline for `release/**` branches. The live WP-plugin release pipeline lives in `18-wp-plugin-deploy/02-github-actions-workflow.md`. | F-AUDIT-25 burndown (task #44b, 2026-04-29) | 2026-04-29 |
| `spec/13-cicd-pipeline-workflows/16-shared-conventions.md` | dead-runtime | Shared conventions across Go CLI binary pipelines (env var contracts, error codes for binary tools). Conventions for the WP-plugin pipeline are documented in `18-wp-plugin-deploy/`. | F-AUDIT-25 burndown (task #44b, 2026-04-29) | 2026-04-29 |
| `spec/13-cicd-pipeline-workflows/scripts-as-spec/_TEST-CORPUS/PHASE-3-FAIL-*.md` | by-design-failing-fixture | Files prefixed `PHASE-N-FAIL-` are deliberately-failing fixtures consumed by the scripts-as-spec verifier; their bodies describe the gate-failure they reproduce, which by definition mentions `stub`/`placeholder`. Counting them as offenders defeats the test corpus's purpose. | F-AUDIT-25 burndown (task #44b, 2026-04-29) | 2026-04-29 |
| `spec/13-cicd-pipeline-workflows/scripts-as-spec/*-audit.md` | data-catalog | Audit-result catalogs (`fixture-as-spec-shape-audit.md`, `placeholder-token-parity-audit.md`, `per-gate-path-ledger-schema.md`) enumerate `stub`/`placeholder`/`TBD` tokens as the literal data being audited — same SSOT carve-out as the corpus-level `99-consistency-report.md` row above. | F-AUDIT-25 burndown (task #44b, 2026-04-29) | 2026-04-29 |

---

## Audit re-baseline (with exemptions applied)

Verified 2026-04-29 by re-running `/tmp/build_audit_input_v2.mjs` (exemption-aware metrics builder):

| Metric | Before exemptions | After exemptions | Δ |
|---|---:|---:|---:|
| Total placeholder files (corpus) | 206 | **172** | **−34** |
| Corpus placeholder rate | 14.2% | **11.8%** | −2.4 pts |
| `12-consolidated-guidelines/` placeholders | 26 | **0** | −26 (full clearance) |
| `12-consolidated-guidelines/` audit score (projected) | 15/100 BLOCKING | **~75/100 VIABLE** | +60 (awaits AI re-audit confirmation) |
| `.gitkeep` false-positives cleared | — | 8 | scope-bootstrap exemption |
| **F-AUDIT-24 false-positive (2026-04-29 cycle 2)** | 24 corpus TODOs | **0 real-debt TODOs** | grep-verified: only 4 token-mentions corpus-wide, all in code-span policy definitions; 4 narrow `policy-definition` exemptions added |

This declaration set is projected to lift the global audit score from **65 → ~70** (closing F-AUDIT-24 in addition to F-AUDIT-02). F-AUDIT-15 (172 placeholders) and F-AUDIT-21 (ADR AT:MUST) remain open and require substantive backfill.

---

## Rule for adding new rows

Before adding a row to this manifest:

1. Confirm the pattern is **intentional** (cite the ADR, audit finding, or P-task that ratified it).
2. Use the narrowest possible `pathGlob` — never `spec/**/*.md`.
3. Re-run the AI audit (`python /tmp/lovable_ai.py @/tmp/audit-prompt.txt --model google/gemini-2.5-pro --json --output /mnt/documents/spec-ai-implementability-audit.json`) within 24 h to re-baseline.
4. Update the "Audit re-baseline" table above.

---

## Related

- Audit artifact (out-of-repo): `/mnt/documents/spec-ai-implementability-audit.md` — the audit this manifest answers (also v2/v3 JSON siblings)
- [`spec/00-adrs/0029-per-gate-path-ledger-shared-lib.md`](./00-adrs/0029-per-gate-path-ledger-shared-lib.md) — pattern reference for path-globbed exemptions
- [`spec/12-consolidated-guidelines/00-overview.md`](./12-consolidated-guidelines/00-overview.md) — the canonical declaration this manifest cites
- [`mem://preferences/spec-implementability-percentage`](mem://preferences/spec-implementability-percentage) — formula that consumes the corrected placeholder count
