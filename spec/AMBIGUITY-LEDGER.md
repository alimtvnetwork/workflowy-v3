# AMBIGUITY-LEDGER — Unbacked Normative Clauses

**Generated:** GAP-AMB-01 (2026-04-30) by `scripts/spec-hygiene/ambiguity_audit.py`
**Heuristic:** A `MUST` / `SHALL` / `MUST NOT` / `SHALL NOT` / `REQUIRED` clause is *backed* if an `AT-…` ID OR a `G-NN-…` gate ID OR a `gate G-…` reference appears within ±5 lines (same paragraph window).

## Corpus totals

| Metric | Count | % |
|---|---|---|
| Files containing normative clauses | 476 | — |
| Total normative clauses | 2944 | 100% |
| Backed (AT- or G- within ±5 lines) | 2025 | 68.8% |
| **Unbacked** | **919** | **31.2%** |
| — Exempt registry/ledger prose | 140 | 4.8% |
| — **Actionable (true findings)** | **779** | **26.5%** |

## Mediocre-AI implementability impact

At the user-set bar ('mediocre AI, zero follow-up, 100% intent match'), every actionable unbacked clause is a coin-flip: a strong AI infers correctly, a mediocre AI may diverge. With **26.5% actionable-unbacked**, mediocre-AI score is bounded by `(100 − actionable_unbacked_pct)` ≈ **74/100** before any other factor — well below the v7 strong-AI baseline of 95.

## Actionable findings — top 30 (by unbacked count, exempts removed)

| # | Unbacked | File | Top example (line) |
|---|---|---|---|
| 1 | 30 | `AMBIGUITY-LEDGER.md` | L4: **Heuristic:** A `MUST` / `SHALL` / `MUST NOT` / `SHALL NOT` / `REQUIRED` clause is *backed* if an `AT-…` ID OR a `G-NN- |
| 2 | 12 | `31-app/06-endpoints/97b-endpoint-envelope-fixtures.md` | L293: \| Fixture DB \| An in-memory SQLite database seeded by `spec/31-app/04a-fixtures/generate.py` (the 217-item DDL-mirror  |
| 3 | 11 | `00-adrs/0014-sharing-public-vs-invited-permission-model.md` | L10: product. Every read, every write, every mirror traversal MUST be |
| 4 | 10 | `00-adrs/0020-branded-itemid-ownerid.md` | L34: in the TypeScript codebase MUST be a branded string, never a raw |
| 5 | 10 | `03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md` | L17: \| `HttpStatus` \| int (4xx / 5xx / 0) \| Status the WP-plugin REST handler MUST return when emitting this code; `0` for |
| 6 | 10 | `03-error-manage/02-error-architecture/07-logging-and-diagnostics/01-react-execution-logger.md` | L33: \| F1 \| Track function executions with arguments \| MUST \| |
| 7 | 10 | `03-error-manage/02-error-architecture/07-logging-and-diagnostics/02-session-based-logging/01-requirements.md` | L9: \| F1 \| Every API request must be assigned a unique session ID \| MUST \| |
| 8 | 9 | `00-adrs/0008-unified-item-node-interface.md` | L43: Every item in the system MUST be representable as a single |
| 9 | 9 | `00-adrs/0021-undo-100-offline-queue-unbounded.md` | L39: - Storage: in-memory only (React/Zustand state); MUST NOT persist |
| 10 | 9 | `31-app/05-conventions/14-backup-and-dr-policy.md` | L102: Daily/Weekly/Monthly/Yearly backups MUST land in **at least two geographically separate regions** (e.g., `eu-west-1` AND |
| 11 | 8 | `00-adrs/0007-strict-typescript-rules.md` | L38: The literal type `any` MUST NOT appear in source. Use `unknown` + |
| 12 | 8 | `00-adrs/0024-ratify-soft-confirm-triage-rulings.md` | L32: **D1 — Ratify [#01](../../.lovable/question-and-ambiguity/00-triage-summary.md#01--audit-100100-score-should-b1b4-addend |
| 13 | 8 | `31-app/01-features/15-roles-and-permissions.md` | L206: Every action that mutates state MUST pass the following check (pseudocode) [gate: G-USER-HASROLE-CENTRAL]: |
| 14 | 8 | `15-wp-plugin-how-to/13-admin-ui-patterns/11-misc-and-rules.md` | L100: Every partial MUST document its required and optional variables in a docblock (gate `G-AUI-PARTIAL-DOCBLOCK`): |
| 15 | 7 | `00-adrs/0005-mirror-as-peer-group.md` | L39: A "mirror" in WorkFlowy **MUST** be implemented as a **peer-group |
| 16 | 7 | `00-adrs/0015-twelve-itemtypes-enum.md` | L24: values**. It MUST be defined identically in all three SSOTs and consumed |
| 17 | 7 | `00-adrs/0016-fractional-index-sortorder.md` | L36: `mem://features/editor-core` is hereby **superseded** and MUST be |
| 18 | 7 | `09-code-block-system/11-highlighter-dependency-pin.md` | L33: \| Resolved version (lockfile) \| Pinned in `bun.lock` \| Runtime regeneration MUST NOT cross majors (gate `G-HLPIN-LOCK |
| 19 | 7 | `31-app/00b-numbering-policy.md` | L23: - A sub-feature MUST cite its parent in the front-matter header: `> **Parent feature:** [...](./NN-parent.md)`. |
| 20 | 7 | `31-app/01-features/03-layout-structure.md` | L24: - The app MUST consist of two main zones: **NavBar** (fixed top bar) and **Page** (scrollable content area below) (gate  |
| 21 | 7 | `15-wp-plugin-how-to/23-operator-runbooks/01-disaster-recovery-restore.md` | L46: ### Pre-flight checks (all MUST pass before step 2) `[gate: G-BACKUP]` |
| 22 | 6 | `00-adrs/0017-eight-error-boundaries-ui-virtualization.md` | L30: MUST mount exactly eight independent React error boundaries, each |
| 23 | 6 | `00-adrs/0030-audit-exemption-manifest.md` | L44: this match") **MUST** live in exactly one file: |
| 24 | 6 | `32-ui-design/05-quality/01-accessibility.md` | L4: > **Updated:** 2026-04-30 — Bound all 5 prose-MUSTs to new `G-A11Y-*` namespace gates (batch-34). Non-MUST capability ro |
| 25 | 6 | `31-app/05-conventions/18-g25-token-lifecycle-coverage-gate.md` | L16: 2. **Issuance audit pairing** — every `Auth::issueAccessToken()` call MUST be preceded (within the same scope, ≤30 lines |
| 26 | 6 | `31-app/05-conventions/20-g27-export-coverage-gate.md` | L15: 1. **Export-route hardening** — every `register_rest_route` declaring an `/export/*` path MUST call BOTH `Mfa::requireFr |
| 27 | 6 | `13-cicd-pipeline-workflows/18-wp-plugin-deploy/00-overview.md` | L62: \| **P2** \| The compiled `dist/` MUST be copied into the plugin's `assets/dist/` directory inside the ZIP `[gate: G-WPD |
| 28 | 5 | `00-adrs/0004-rest-envelope-pascalcase.md` | L37: Every REST response served by the WordPress plugin **MUST** be a |
| 29 | 5 | `00-adrs/0022-shadcn-radix-component-base.md` | L40: underlying primitive layer.** Components MUST come from one of: |
| 30 | 5 | `02-coding-guidelines/97a-acceptance-criteria-fixtures.md` | L17: Authoring 363 near-identical fixture blocks would be noise. Instead this file declares **one canonical template** + one  |

## Exempt registry/ledger files (legitimate prose, no AT needed)

- `_GATE-REGISTRY.md` — 85 clauses (registry/ledger meta-prose)
- `AUDIT-FINDINGS-LEDGER.md` — 17 clauses (registry/ledger meta-prose)
- `01-spec-authoring-guide/97-acceptance-criteria.md` — 14 clauses (registry/ledger meta-prose)
- `00-adrs/_INDEX_AUTOMATION.md` — 9 clauses (registry/ledger meta-prose)
- `_LEDGER-G-NS-ADR-COVERAGE.md` — 5 clauses (registry/ledger meta-prose)
- `_LEDGER-G-NS-CORE-MEMORY-COVERAGE.md` — 4 clauses (registry/ledger meta-prose)
- `_GATE-GRADUATION-LEDGER.md` — 3 clauses (registry/ledger meta-prose)
- `_LEDGER-G-13-BACKLINK-EXEMPT.md` — 2 clauses (registry/ledger meta-prose)
- `_AUDIT-EXEMPTIONS.md` — 1 clauses (registry/ledger meta-prose)

## By scope

| Scope | Unbacked | Files |
|---|---|---|
| `31-app/` | 220 | 72 |
| `(root)/` | 155 | 15 |
| `00-adrs/` | 138 | 27 |
| `02-coding-guidelines/` | 93 | 54 |
| `15-wp-plugin-how-to/` | 67 | 37 |
| `03-error-manage/` | 51 | 20 |
| `01-spec-authoring-guide/` | 37 | 12 |
| `13-cicd-pipeline-workflows/` | 34 | 16 |
| `12-consolidated-guidelines/` | 25 | 24 |
| `32-ui-design/` | 23 | 13 |
| `04-database-conventions/` | 14 | 6 |
| `09-code-block-system/` | 9 | 2 |
| `14-self-update-app-update/` | 9 | 6 |
| `17-generic-update/` | 8 | 4 |
| `16-generic-cli/` | 5 | 3 |

## Resolution protocol

1. **Findings GAP-AMB-01-NN** are auto-generated, one per actionable file in the ranked table above.
2. Each finding requires either: (a) adding adjacent `AT-`/`G-` IDs to the existing clause, OR (b) demoting the prose `MUST` to `SHOULD`/`MAY` if non-normative was intended, OR (c) marking the file in `LEGIT_PROSE` exemption set with justification.
3. Burn-down target: actionable-unbacked → **<5%** of corpus to claim mediocre-AI EXCELLENT (matches v7 strong-AI score).
4. Re-run `scripts/spec-hygiene/ambiguity_audit.py` after each batch.

## Next tasks (auto-derived)

- **GAP-AMB-01-01..30** — bind top-30 actionable files (ranked above)
- **GAP-AMB-02** — vague-modifier sweep (queued)
- **GAP-AMB-03** — undefined-term audit against `spec/19-glossary.md` (queued)
